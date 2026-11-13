import { lazy, Suspense, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FormTextField from '../form/FormTextField';
import LoadingSpinner from '../LoadingSpinner';
import { exerciseSchema } from '../../validation/adminExerciseSchemas';
import { extractServerErrors } from '../../api/handleApiError';
import { runExerciseSolution } from '../../api/adminExercisesApi';

// Monaco (~1 Mo gzippé) ne doit être téléchargé que quand ce formulaire
// s'ouvre réellement, jamais au chargement de la page admin — même principe
// que ExerciseCard côté élève (tâche 2.8).
const CodeEditor = lazy(() => import('../CodeEditor'));

const KNOWN_FIELDS = ['title', 'statement', 'type', 'starterCode', 'solution', 'difficulty', 'order'];
const EMPTY_FORM = {
  title: '',
  statement: '',
  type: 'algorithme',
  starterCode: '',
  solution: '',
  difficulty: 'moyen',
  order: 0,
};

function ExerciseFormDialog({ open, exercise, onClose, onSubmit }) {
  const isEdit = Boolean(exercise);
  const [globalError, setGlobalError] = useState(null);
  const [tests, setTests] = useState([]);
  const [verify, setVerify] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(exerciseSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!open) return;
    setGlobalError(null);
    setVerify(null);
    setTests((exercise?.tests || []).map((t) => ({ input: t.input, expectedOutput: t.expectedOutput })));
    reset({
      title: exercise?.title || '',
      statement: exercise?.statement || '',
      type: exercise?.type || 'algorithme',
      starterCode: exercise?.starterCode || '',
      solution: exercise?.solution || '',
      difficulty: exercise?.difficulty || 'moyen',
      order: exercise?.order ?? 0,
    });
  }, [open, exercise, reset]);

  const type = watch('type');

  async function submit(values) {
    setGlobalError(null);
    try {
      await onSubmit({ ...values, tests: values.type === 'python' ? tests : [] });
    } catch (err) {
      setGlobalError(extractServerErrors(err, { setError, knownFields: KNOWN_FIELDS }));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEdit ? "Modifier l'exercice" : 'Créer un exercice'}
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
        <DialogContent dividers>
          {globalError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGlobalError(null)}>
              {globalError}
            </Alert>
          )}

          <FormTextField label="Titre" registration={register('title')} error={errors.title} autoFocus />
          <FormTextField
            label="Énoncé"
            registration={register('statement')}
            error={errors.statement}
            multiline
            minRows={3}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormTextField label="Type" select registration={field} error={errors.type} sx={{ minWidth: 160 }}>
                  <MenuItem value="algorithme">Algorithme</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                </FormTextField>
              )}
            />
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <FormTextField label="Difficulté" select registration={field} error={errors.difficulty} sx={{ minWidth: 160 }}>
                  <MenuItem value="facile">Facile</MenuItem>
                  <MenuItem value="moyen">Moyen</MenuItem>
                  <MenuItem value="difficile">Difficile</MenuItem>
                </FormTextField>
              )}
            />
            <FormTextField
              label="Ordre"
              type="number"
              registration={register('order', { valueAsNumber: true })}
              error={errors.order}
            />
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
            Code de départ (optionnel)
          </Typography>
          <Controller
            name="starterCode"
            control={control}
            render={({ field }) => (
              <Suspense fallback={<LoadingSpinner minHeight={160} />}>
                <CodeEditor mode={type} value={field.value} onChange={field.onChange} height={160} />
              </Suspense>
            )}
          />

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
            Solution de référence
          </Typography>
          <Controller
            name="solution"
            control={control}
            render={({ field }) => (
              <Suspense fallback={<LoadingSpinner minHeight={200} />}>
                <CodeEditor mode={type} value={field.value} onChange={field.onChange} height={200} />
              </Suspense>
            )}
          />
          {errors.solution && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
              {errors.solution.message}
            </Typography>
          )}

          {type === 'python' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Cas de test (vérification automatique)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Le code de l'élève est exécuté avec chaque entrée ; sa sortie doit être identique à la sortie attendue.
              </Typography>
              <Stack spacing={1}>
                {tests.map((t, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <TextField
                      size="small"
                      label="Entrée (stdin)"
                      value={t.input}
                      multiline
                      onChange={(e) => setTests(tests.map((x, j) => (j === i ? { ...x, input: e.target.value } : x)))}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      label="Sortie attendue"
                      value={t.expectedOutput}
                      multiline
                      onChange={(e) =>
                        setTests(tests.map((x, j) => (j === i ? { ...x, expectedOutput: e.target.value } : x)))
                      }
                      sx={{ flex: 1 }}
                    />
                    <IconButton aria-label="Supprimer le test" onClick={() => setTests(tests.filter((_, j) => j !== i))}>
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" onClick={() => setTests([...tests, { input: '', expectedOutput: '' }])}>
                  Ajouter un test
                </Button>
                {isEdit && tests.length > 0 && (
                  <Button
                    size="small"
                    onClick={async () => {
                      setVerify({ loading: true });
                      try {
                        setVerify(await runExerciseSolution(exercise._id));
                      } catch (err) {
                        setVerify({ error: extractServerErrors(err) });
                      }
                    }}
                  >
                    Tester la solution (enregistrée)
                  </Button>
                )}
              </Stack>
              {verify && !verify.loading && (
                <Alert severity={verify.error ? 'error' : verify.allPassed ? 'success' : 'warning'} sx={{ mt: 1 }}>
                  {verify.error ||
                    (verify.allPassed
                      ? 'La solution de référence passe tous les tests.'
                      : `${verify.results.filter((r) => !r.passed).length} test(s) en échec avec la solution de référence.`)}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ExerciseFormDialog;
