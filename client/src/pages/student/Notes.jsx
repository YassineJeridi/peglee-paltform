import { useEffect, useState } from 'react';
import { Alert, Box, Button, Snackbar, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { getNotes, createNote, updateNote, deleteNote } from '../../api/notesApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StickyNoteCard from '../../components/student/StickyNoteCard';
import { NOTE_COLOR_OPTIONS } from '../../constants/noteColors';

const DEFAULT_COLOR = NOTE_COLOR_OPTIONS[0];

// Tri appliqué localement après chaque mutation pour refléter immédiatement
// l'épinglage (§6.4 : épinglées en premier, puis les plus récentes).
function sortNotes(list) {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

export default function Notes() {
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    let cancelled = false;

    getNotes()
      .then((data) => {
        if (!cancelled) setNotes(data);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger vos notes pour le moment.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate() {
    try {
      const created = await createNote({ content: '', color: DEFAULT_COLOR });
      setNotes((prev) => sortNotes([...(prev || []), created]));
      setSnackbar('Note créée.');
    } catch {
      setError("Impossible de créer la note pour le moment.");
    }
  }

  // Pas de snackbar ici : `handleUpdate` est appelé très fréquemment (perte de
  // focus du texte, bascule d'épingle, changement de couleur) — un toast à
  // chaque sauvegarde auto serait envahissant. L'erreur reste affichée si
  // besoin, la réussite est silencieuse (comme un enregistrement automatique).
  async function handleUpdate(id, patch) {
    try {
      const updated = await updateNote(id, patch);
      setNotes((prev) => sortNotes(prev.map((n) => (n._id === id ? updated : n))));
    } catch {
      setError('Impossible de mettre à jour la note pour le moment.');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setSnackbar('Note supprimée.');
    } catch {
      setError('Impossible de supprimer la note pour le moment.');
    }
  }

  if (error && !notes) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!notes) {
    return <LoadingSpinner label="Chargement de vos notes…" minHeight={300} />;
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Votre mur de post-it personnel.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreate}>
          Nouvelle note
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {notes.length === 0 ? (
        <EmptyState
          icon="🗒️"
          title="Aucune note pour l'instant"
          description="Créez votre première note pour ne rien oublier."
          action={
            <Button variant="contained" onClick={handleCreate}>
              Créer une note
            </Button>
          }
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          }}
        >
          {notes.map((note) => (
            <StickyNoteCard key={note._id} note={note} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </Box>
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
