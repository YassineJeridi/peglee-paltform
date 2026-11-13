import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, MenuItem, Paper, Snackbar, Stack, Tab, Tabs, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { getModules, getSubModules } from '../../api/adminModulesApi';
import { getQuizForAdmin, createQuiz, updateQuiz, deleteQuiz } from '../../api/adminQuizApi';
import { quizFieldsSchema } from '../../validation/adminQuizSchemas';
import { extractServerErrors } from '../../api/handleApiError';
import FormTextField from '../../components/form/FormTextField';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import QuestionEditor from '../../components/admin/QuestionEditor';
import QuizPreview from '../../components/admin/QuizPreview';

const KNOWN_FIELDS = ['title', 'passingScore', 'maxAttempts', 'subModuleId'];
const EMPTY_FORM = { title: '', passingScore: 60, maxAttempts: 0 };

function newQuestion() {
  return { text: '', type: 'single', options: ['', ''], correctAnswers: [], explanation: '', points: 1 };
}

export default function Quiz() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState(null);
  const [subModulesByModule, setSubModulesByModule] = useState({});
  const [selectedSubModuleId, setSelectedSubModuleId] = useState(searchParams.get('subModuleId') || '');
  // undefined = chargement, null = aucun quiz (mode création), objet = quiz existant
  const [existingQuiz, setExistingQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [tab, setTab] = useState('edit');
  const [error, setError] = useState('');
  const [globalFormError, setGlobalFormError] = useState(null);
  const [snackbar, setSnackbar] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError: setFormError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quizFieldsSchema),
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
      setExistingQuiz(null);
      setQuestions([]);
      reset(EMPTY_FORM);
      return undefined;
    }

    let cancelled = false;
    setExistingQuiz(undefined);
    setSearchParams({ subModuleId: selectedSubModuleId });

    getQuizForAdmin(selectedSubModuleId)
      .then((quiz) => {
        if (cancelled) return;
        setExistingQuiz(quiz);
        setQuestions(quiz.questions.map((q) => ({ ...q })));
        reset({ title: quiz.title, passingScore: quiz.passingScore, maxAttempts: quiz.maxAttempts });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setExistingQuiz(null);
          setQuestions([]);
          reset(EMPTY_FORM);
        } else {
          setError('Impossible de charger le quiz pour le moment.');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubModuleId]);

  function updateQuestion(index, next) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? next : q)));
  }

  function removeQuestion(index) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function moveQuestion(index, direction) {
    setQuestions((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function onSubmit(values) {
    setGlobalFormError(null);
    setSaving(true);
    try {
      const payload = { ...values, questions };
      if (existingQuiz) {
        const updated = await updateQuiz(existingQuiz._id, payload);
        setExistingQuiz(updated);
        setQuestions(updated.questions.map((q) => ({ ...q })));
        setSnackbar('Quiz mis à jour.');
      } else {
        const created = await createQuiz({ ...payload, subModuleId: selectedSubModuleId });
        setExistingQuiz(created);
        setQuestions(created.questions.map((q) => ({ ...q })));
        setSnackbar('Quiz créé.');
      }
    } catch (err) {
      setGlobalFormError(extractServerErrors(err, { setError: setFormError, knownFields: KNOWN_FIELDS }));
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteQuiz(existingQuiz._id);
      setExistingQuiz(null);
      setQuestions([]);
      reset(EMPTY_FORM);
      setDeleteConfirmOpen(false);
      setSnackbar('Quiz supprimé.');
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
        Quiz
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configurez le quiz d'un sous-module et ses questions.
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
          icon="❓"
          title="Choisissez un sous-module"
          description="Sélectionnez un sous-module ci-dessus pour configurer son quiz."
        />
      ) : existingQuiz === undefined ? (
        <LoadingSpinner label="Chargement du quiz…" minHeight={200} />
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

              <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', mb: 3 }}>
                <FormTextField label="Titre du quiz" registration={register('title')} error={errors.title} />
                <Stack direction="row" spacing={2}>
                  <FormTextField
                    label="Seuil de réussite (%)"
                    type="number"
                    registration={register('passingScore', { valueAsNumber: true })}
                    error={errors.passingScore}
                  />
                  <FormTextField
                    label="Tentatives max (0 = illimité)"
                    type="number"
                    registration={register('maxAttempts', { valueAsNumber: true })}
                    error={errors.maxAttempts}
                  />
                </Stack>
              </Paper>

              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Questions
                </Typography>
                <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setQuestions((prev) => [...prev, newQuestion()])}>
                  Ajouter une question
                </Button>
              </Stack>

              {questions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Aucune question pour l'instant.
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ mb: 2 }}>
                  {questions.map((q, index) => (
                    <QuestionEditor
                      key={q._id || index}
                      question={q}
                      index={index}
                      total={questions.length}
                      onChange={(next) => updateQuestion(index, next)}
                      onRemove={() => removeQuestion(index)}
                      onMoveUp={() => moveQuestion(index, 'up')}
                      onMoveDown={() => moveQuestion(index, 'down')}
                    />
                  ))}
                </Stack>
              )}

              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
                {existingQuiz && (
                  <Button
                    color="error"
                    startIcon={<DeleteRoundedIcon />}
                    onClick={() => setDeleteConfirmOpen(true)}
                    disabled={saving}
                  >
                    Supprimer le quiz
                  </Button>
                )}
                <Button type="submit" variant="contained" disabled={saving} sx={{ ml: 'auto' }}>
                  {existingQuiz ? 'Enregistrer' : 'Créer le quiz'}
                </Button>
              </Stack>
            </Box>
          ) : (
            <QuizPreview
              title={liveValues.title}
              passingScore={liveValues.passingScore}
              maxAttempts={liveValues.maxAttempts}
              questions={questions}
            />
          )}
        </Box>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Supprimer ce quiz ?"
        description="Ce quiz sera définitivement supprimé. L'historique des tentatives des élèves est conservé."
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
