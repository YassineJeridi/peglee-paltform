import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, MenuItem, Paper, Snackbar, Stack, Tab, Tabs, Typography } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { getModules, getSubModules } from '../../api/adminModulesApi';
import { getLessonBySubModule, createLesson, updateLesson, deleteLesson } from '../../api/adminLessonsApi';
import { lessonSchema } from '../../validation/adminLessonSchemas';
import { extractServerErrors } from '../../api/handleApiError';
import FormTextField from '../../components/form/FormTextField';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import LessonEditor from '../../components/admin/LessonEditor';
import LessonPreview from '../../components/admin/LessonPreview';

const KNOWN_FIELDS = ['title', 'content', 'videoUrl'];
const EMPTY_FORM = { title: '', content: '', videoUrl: '' };

export default function Lecons() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState(null);
  const [subModulesByModule, setSubModulesByModule] = useState({});
  const [selectedSubModuleId, setSelectedSubModuleId] = useState(searchParams.get('subModuleId') || '');
  // undefined = chargement en cours, null = aucune leçon (mode création), objet = leçon existante
  const [existingLesson, setExistingLesson] = useState(null);
  const [tab, setTab] = useState('edit');
  const [error, setError] = useState('');
  const [globalFormError, setGlobalFormError] = useState(null);
  const [snackbar, setSnackbar] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    getModules()
      .then(async (mods) => {
        setModules(mods);
        const entries = await Promise.all(mods.map(async (m) => [m._id, await getSubModules(m._id)]));
        setSubModulesByModule(Object.fromEntries(entries));
      })
      .catch(() => setError('Impossible de charger les modules pour le moment.'));
  }, []);

  useEffect(() => {
    if (!selectedSubModuleId) {
      setExistingLesson(null);
      reset(EMPTY_FORM);
      return undefined;
    }

    let cancelled = false;
    setExistingLesson(undefined);
    setSearchParams({ subModuleId: selectedSubModuleId });

    getLessonBySubModule(selectedSubModuleId)
      .then((lesson) => {
        if (cancelled) return;
        setExistingLesson(lesson);
        reset({ title: lesson.title, content: lesson.content, videoUrl: lesson.videoUrl || '' });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setExistingLesson(null);
          reset(EMPTY_FORM);
        } else {
          setError('Impossible de charger la leçon pour le moment.');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubModuleId]);

  async function onSubmit(values) {
    setGlobalFormError(null);
    try {
      if (existingLesson) {
        const updated = await updateLesson(existingLesson._id, values);
        setExistingLesson(updated);
        setSnackbar('Leçon mise à jour.');
      } else {
        const created = await createLesson({ ...values, subModuleId: selectedSubModuleId });
        setExistingLesson(created);
        setSnackbar('Leçon créée.');
      }
    } catch (err) {
      setGlobalFormError(extractServerErrors(err, { setError: setFormError, knownFields: KNOWN_FIELDS }));
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteLesson(existingLesson._id);
      setExistingLesson(null);
      reset(EMPTY_FORM);
      setDeleteConfirmOpen(false);
      setSnackbar('Leçon supprimée.');
    } catch (err) {
      setError(err?.response?.data?.message || 'La suppression a échoué.');
    } finally {
      setDeleting(false);
    }
  }

  const liveValues = watch();

  if (error && !modules) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!modules) {
    return <LoadingSpinner label="Chargement…" minHeight={300} />;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Leçons
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Rédigez le contenu pédagogique d'un sous-module.
      </Typography>

      <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', mb: 3 }}>
        <FormTextField
          label="Sous-module"
          select
          value={selectedSubModuleId}
          onChange={(e) => setSelectedSubModuleId(e.target.value)}
        >
          <MenuItem value="">— Choisir un sous-module —</MenuItem>
          {modules.flatMap((m) => [
            <MenuItem key={`mod-${m._id}`} disabled sx={{ fontWeight: 700, opacity: '1 !important' }}>
              {m.title}
            </MenuItem>,
            ...(subModulesByModule[m._id] || []).map((sm) => (
              <MenuItem key={sm._id} value={sm._id} sx={{ pl: 4 }}>
                {sm.title}
              </MenuItem>
            )),
          ])}
        </FormTextField>
      </Paper>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {!selectedSubModuleId ? (
        <EmptyState
          icon="📖"
          title="Choisissez un sous-module"
          description="Sélectionnez un sous-module ci-dessus pour rédiger ou modifier sa leçon."
        />
      ) : existingLesson === undefined ? (
        <LoadingSpinner label="Chargement de la leçon…" minHeight={200} />
      ) : (
        <Box>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab value="edit" label="Édition" />
            <Tab value="preview" label="Prévisualisation" />
          </Tabs>

          {tab === 'edit' ? (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {globalFormError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGlobalFormError(null)}>
                  {globalFormError}
                </Alert>
              )}
              <FormTextField label="Titre" registration={register('title')} error={errors.title} />
              <FormTextField label="URL vidéo (optionnel)" registration={register('videoUrl')} error={errors.videoUrl} />

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
                Contenu
              </Typography>
              <Controller
                name="content"
                control={control}
                render={({ field }) => <LessonEditor value={field.value} onChange={field.onChange} error={errors.content} />}
              />

              <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'space-between' }}>
                {existingLesson && (
                  <Button
                    color="error"
                    startIcon={<DeleteRoundedIcon />}
                    onClick={() => setDeleteConfirmOpen(true)}
                    disabled={isSubmitting}
                  >
                    Supprimer la leçon
                  </Button>
                )}
                <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ ml: 'auto' }}>
                  {existingLesson ? 'Enregistrer' : 'Créer la leçon'}
                </Button>
              </Stack>
            </Box>
          ) : (
            <LessonPreview title={liveValues.title} content={liveValues.content} />
          )}
        </Box>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Supprimer cette leçon ?"
        description="Cette leçon sera définitivement supprimée."
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
