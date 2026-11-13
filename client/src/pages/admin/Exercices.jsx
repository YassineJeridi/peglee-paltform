import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, IconButton, MenuItem, Paper, Snackbar, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { getModules, getSubModules } from '../../api/adminModulesApi';
import { getExercisesForAdmin, createExercise, updateExercise, deleteExercise } from '../../api/adminExercisesApi';
import FormTextField from '../../components/form/FormTextField';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import ExerciseFormDialog from '../../components/admin/ExerciseFormDialog';

const MIN_RECOMMENDED_EXERCISES = 2;
const DIFFICULTY_COLORS = { facile: 'success', moyen: 'warning', difficile: 'error' };
const TYPE_LABELS = { algorithme: 'Algorithme', python: 'Python' };

export default function Exercices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState(null);
  const [subModulesByModule, setSubModulesByModule] = useState({});
  const [selectedSubModuleId, setSelectedSubModuleId] = useState(searchParams.get('subModuleId') || '');
  // null = aucun sous-module choisi, undefined = chargement, tableau = chargé
  const [exercises, setExercises] = useState(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getModules()
      .then(async (mods) => {
        setModules(mods);
        const entries = await Promise.all(mods.map(async (m) => [m._id, await getSubModules(m._id)]));
        setSubModulesByModule(Object.fromEntries(entries));
      })
      .catch(() => setError('Impossible de charger les modules pour le moment.'));
  }, []);

  function fetchExercises(subModuleId) {
    getExercisesForAdmin(subModuleId)
      .then((data) => setExercises([...data].sort((a, b) => a.order - b.order)))
      .catch(() => setError('Impossible de charger les exercices pour le moment.'));
  }

  useEffect(() => {
    if (!selectedSubModuleId) {
      setExercises(null);
      return;
    }
    setExercises(undefined);
    setSearchParams({ subModuleId: selectedSubModuleId });
    fetchExercises(selectedSubModuleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubModuleId]);

  async function handleFormSubmit(values) {
    if (editingExercise) {
      await updateExercise(editingExercise._id, values);
      setSnackbar('Exercice modifié.');
    } else {
      await createExercise({ ...values, subModuleId: selectedSubModuleId });
      setSnackbar('Exercice créé.');
    }
    setFormOpen(false);
    setEditingExercise(null);
    fetchExercises(selectedSubModuleId);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteExercise(exerciseToDelete._id);
      setExerciseToDelete(null);
      setSnackbar('Exercice supprimé.');
      fetchExercises(selectedSubModuleId);
    } catch (err) {
      setError(err?.response?.data?.message || 'La suppression a échoué.');
    } finally {
      setDeleting(false);
    }
  }

  async function moveExercise(exercise, direction) {
    const index = exercises.findIndex((e) => e._id === exercise._id);
    const swapWith = direction === 'up' ? exercises[index - 1] : exercises[index + 1];
    if (!swapWith) return;

    try {
      await Promise.all([
        updateExercise(exercise._id, { order: swapWith.order }),
        updateExercise(swapWith._id, { order: exercise.order }),
      ]);
      fetchExercises(selectedSubModuleId);
    } catch {
      setError('Le réordonnancement a échoué.');
    }
  }

  if (error && !modules) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!modules) {
    return <LoadingSpinner label="Chargement…" minHeight={300} />;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Exercices
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gérez les exercices pratiques d'un sous-module (2 ou plus recommandé).
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!selectedSubModuleId ? (
        <EmptyState
          icon="🧩"
          title="Choisissez un sous-module"
          description="Sélectionnez un sous-module ci-dessus pour gérer ses exercices."
        />
      ) : exercises === undefined ? (
        <LoadingSpinner label="Chargement des exercices…" minHeight={200} />
      ) : (
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Exercices ({exercises.length})
              </Typography>
              {exercises.length < MIN_RECOMMENDED_EXERCISES && (
                <Chip
                  icon={<WarningAmberRoundedIcon />}
                  label={`Minimum recommandé : ${MIN_RECOMMENDED_EXERCISES}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Stack>
            <Button
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setEditingExercise(null);
                setFormOpen(true);
              }}
            >
              Ajouter un exercice
            </Button>
          </Stack>

          {exercises.length === 0 ? (
            <EmptyState icon="🧩" title="Aucun exercice" description="Ajoutez au moins deux exercices pour ce sous-module." />
          ) : (
            <Stack spacing={1.5}>
              {exercises.map((ex, index) => (
                <Paper
                  key={ex._id}
                  elevation={0}
                  sx={{ p: 2, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 160 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ex.title}
                    </Typography>
                  </Box>
                  <Chip label={TYPE_LABELS[ex.type]} size="small" variant="outlined" />
                  <Chip label={ex.difficulty} size="small" color={DIFFICULTY_COLORS[ex.difficulty]} />
                  <IconButton size="small" onClick={() => moveExercise(ex, 'up')} disabled={index === 0}>
                    <ArrowUpwardRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => moveExercise(ex, 'down')} disabled={index === exercises.length - 1}>
                    <ArrowDownwardRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingExercise(ex);
                      setFormOpen(true);
                    }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setExerciseToDelete(ex)}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      )}

      <ExerciseFormDialog
        open={formOpen}
        exercise={editingExercise}
        onClose={() => {
          setFormOpen(false);
          setEditingExercise(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(exerciseToDelete)}
        title="Supprimer cet exercice ?"
        description={exerciseToDelete ? `« ${exerciseToDelete.title} » sera définitivement supprimé.` : ''}
        onCancel={() => setExerciseToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
