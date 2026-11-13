import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { createBadge, deleteBadge, getBadgesForAdmin, updateBadge } from '../../api/badgesApi';
import { getModules } from '../../api/adminModulesApi';
import { extractServerErrors } from '../../api/handleApiError';

const CRITERIA_LABELS = {
  lessons_completed: 'Leçons terminées (nombre)',
  quizzes_passed: 'Quiz réussis (nombre)',
  exercises_completed: 'Exercices résolus (nombre)',
  submodules_completed: 'Sous-modules terminés (nombre)',
  module_completed: 'Module entier terminé',
  level_reached: 'Niveau atteint',
  xp_reached: 'XP atteints',
};

const EMPTY = { title: '', description: '', icon: '🏆', type: 'lessons_completed', value: 1, moduleSlug: '', isActive: true };

function describeCriteria(c, modules) {
  if (c.type === 'module_completed') {
    const m = modules.find((x) => x.slug === c.moduleSlug);
    return `Module « ${m?.title || c.moduleSlug} » terminé`;
  }
  return `${CRITERIA_LABELS[c.type]} ≥ ${c.value}`;
}

export default function Badges() {
  const [badges, setBadges] = useState(null);
  const [modules, setModules] = useState([]);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | badge
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const [b, m] = await Promise.all([getBadgesForAdmin(), getModules()]);
      setBadges(b);
      setModules(m);
    } catch {
      setError('Impossible de charger les badges.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openDialog(badge) {
    setFormError('');
    setEditing(badge || 'new');
    setForm(
      badge
        ? {
            title: badge.title,
            description: badge.description,
            icon: badge.icon,
            type: badge.criteria.type,
            value: badge.criteria.value,
            moduleSlug: badge.criteria.moduleSlug || '',
            isActive: badge.isActive,
          }
        : EMPTY
    );
  }

  async function handleSave() {
    setFormError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      icon: form.icon.trim() || '🏆',
      isActive: form.isActive,
      criteria: { type: form.type, value: Number(form.value) || 1, moduleSlug: form.moduleSlug },
    };
    if (!payload.title) return setFormError('Le titre est requis.');
    try {
      if (editing === 'new') {
        await createBadge(payload);
        setSnackbar('Badge créé.');
      } else {
        await updateBadge(editing._id, payload);
        setSnackbar('Badge modifié.');
      }
      setEditing(null);
      load();
    } catch (err) {
      setFormError(extractServerErrors(err));
    }
  }

  async function handleDelete() {
    try {
      await deleteBadge(toDelete._id);
      setSnackbar('Badge supprimé.');
      setToDelete(null);
      load();
    } catch (err) {
      setError(extractServerErrors(err));
      setToDelete(null);
    }
  }

  if (error && !badges) return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  if (!badges) return <LoadingSpinner label="Chargement des badges…" minHeight={300} />;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Badges
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Récompenses attribuées automatiquement quand un élève atteint le critère.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openDialog(null)}>
          Nouveau badge
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {badges.length === 0 ? (
        <EmptyState icon="🏆" title="Aucun badge" description="Créez votre premier badge." />
      ) : (
        <Stack spacing={1.5}>
          {badges.map((b) => (
            <Paper key={b._id} elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', opacity: b.isActive ? 1 : 0.6 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ fontSize: 32 }}>{b.icon}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>{b.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {b.description}
                  </Typography>
                  <Chip size="small" variant="outlined" label={describeCriteria(b.criteria, modules)} sx={{ mt: 0.5 }} />
                </Box>
                {!b.isActive && <Chip size="small" label="Désactivé" />}
                <IconButton aria-label="Modifier" onClick={() => openDialog(b)}>
                  <EditRoundedIcon />
                </IconButton>
                <IconButton aria-label="Supprimer" color="error" onClick={() => setToDelete(b)}>
                  <DeleteRoundedIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>{editing === 'new' ? 'Créer un badge' : 'Modifier le badge'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus fullWidth />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
            />
            <TextField label="Icône (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            <TextField select label="Critère" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(CRITERIA_LABELS).map(([k, label]) => (
                <MenuItem key={k} value={k}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            {form.type === 'module_completed' ? (
              <TextField select label="Module" value={form.moduleSlug} onChange={(e) => setForm({ ...form, moduleSlug: e.target.value })}>
                {modules.map((m) => (
                  <MenuItem key={m._id} value={m.slug}>
                    {m.title}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="Seuil"
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            )}
            <Stack direction="row" sx={{ alignItems: 'center' }}>
              <Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <Typography>Actif</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditing(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing === 'new' ? 'Créer' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce badge ?"
        description="Il sera retiré à tous les élèves qui l'ont obtenu."
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
