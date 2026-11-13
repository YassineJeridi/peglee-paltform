import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Paper, Stack, TextField, Tooltip } from '@mui/material';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import NoteColorPicker from './NoteColorPicker';

const DELETE_CONFIRM_TIMEOUT = 3000;

// Une note étant peu critique (§6.4), la suppression utilise une confirmation
// discrète en deux clics plutôt qu'un dialogue modal comme pour le Kanban.
function StickyNoteCard({ note, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const confirmTimeoutRef = useRef(null);

  useEffect(() => {
    if (!editing) setContent(note.content);
  }, [note.content, editing]);

  useEffect(() => () => clearTimeout(confirmTimeoutRef.current), []);

  function handleBlurSave() {
    setEditing(false);
    const trimmed = content.trim();
    if (trimmed !== note.content) {
      onUpdate(note._id, { content: trimmed });
    }
  }

  function handleDeleteClick() {
    if (confirmingDelete) {
      clearTimeout(confirmTimeoutRef.current);
      onDelete(note._id);
      return;
    }
    setConfirmingDelete(true);
    confirmTimeoutRef.current = setTimeout(() => setConfirmingDelete(false), DELETE_CONFIRM_TIMEOUT);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minHeight: 170,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        bgcolor: note.color || '#F3E8FF',
        border: 1,
        borderColor: 'rgba(0,0,0,0.08)',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.25 }}>
        <Tooltip title={note.pinned ? 'Désépingler' : 'Épingler'}>
          <IconButton size="small" onClick={() => onUpdate(note._id, { pinned: !note.pinned })}>
            {note.pinned ? <PushPinRoundedIcon sx={{ fontSize: 18 }} /> : <PushPinOutlinedIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Tooltip>
        <Tooltip title={confirmingDelete ? 'Cliquer à nouveau pour confirmer' : 'Supprimer'}>
          <IconButton size="small" onClick={handleDeleteClick} color={confirmingDelete ? 'error' : 'default'}>
            <DeleteRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {editing ? (
        <TextField
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlurSave}
          autoFocus
          multiline
          variant="standard"
          slotProps={{ input: { disableUnderline: true } }}
          sx={{ flexGrow: 1, '& textarea': { fontSize: '0.9rem', color: 'rgba(0,0,0,0.85)' } }}
        />
      ) : (
        <Box
          onClick={() => setEditing(true)}
          sx={{
            flexGrow: 1,
            whiteSpace: 'pre-wrap',
            fontSize: '0.9rem',
            cursor: 'text',
            color: note.content ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.45)',
          }}
        >
          {note.content || 'Cliquez pour écrire…'}
        </Box>
      )}

      <NoteColorPicker value={note.color} onChange={(c) => onUpdate(note._id, { color: c })} />
    </Paper>
  );
}

export default StickyNoteCard;
