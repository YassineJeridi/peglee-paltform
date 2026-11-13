import { Box, Stack } from '@mui/material';
import { NOTE_COLOR_OPTIONS } from '../../constants/noteColors';

function NoteColorPicker({ value, onChange }) {
  return (
    <Stack direction="row" spacing={1}>
      {NOTE_COLOR_OPTIONS.map((c) => (
        <Box
          key={c}
          onClick={() => onChange(c)}
          role="button"
          aria-label={`Couleur ${c}`}
          sx={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            cursor: 'pointer',
            bgcolor: c,
            border: 2,
            borderColor: value === c ? 'rgba(0,0,0,0.6)' : 'transparent',
            outline: '1px solid',
            outlineColor: 'rgba(0,0,0,0.15)',
          }}
        />
      ))}
    </Stack>
  );
}

export default NoteColorPicker;
