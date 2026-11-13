import { useRef, useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { importContentFile, downloadImportTemplate } from '../../api/adminImportApi';
import { extractServerErrors } from '../../api/handleApiError';

// Import de contenu par fichier JSON (format : docs/IMPORT_FORMAT.md).
// Étape 1 : « Valider » (aperçu, rien d'enregistré). Étape 2 : « Importer ».
export default function Import() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null); // résultat du dernier appel
  const [validated, setValidated] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function pick(e) {
    setFile(e.target.files?.[0] || null);
    setReport(null);
    setValidated(false);
    setDone(false);
    setError('');
  }

  async function run(dryRun) {
    setBusy(true);
    setError('');
    try {
      const data = await importContentFile(file, { dryRun });
      setReport(data);
      setValidated(dryRun && data.ok);
      setDone(!dryRun && data.ok);
    } catch (err) {
      setReport(null);
      setError(extractServerErrors(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Import de contenu
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Importez la leçon, le quiz et les exercices d'un sous-module depuis un fichier JSON.
        Téléchargez le modèle, remplissez-le, puis déposez-le ici. Le guide complet est dans
        <code> docs/IMPORT_FORMAT.md</code>.
      </Typography>

      <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', mb: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
          <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={downloadImportTemplate}>
            Télécharger le modèle
          </Button>
          <input ref={inputRef} type="file" accept=".json,application/json" hidden onChange={pick} />
          <Button variant="outlined" startIcon={<UploadFileRoundedIcon />} onClick={() => inputRef.current?.click()}>
            Choisir un fichier .json
          </Button>
          {file && <Chip label={file.name} onDelete={() => { setFile(null); setReport(null); inputRef.current.value = ''; }} />}
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button variant="contained" disabled={!file || busy} onClick={() => run(true)}>
            {busy && !validated ? 'Validation…' : '1. Valider (aperçu)'}
          </Button>
          <Button variant="contained" color="success" disabled={!validated || busy || done} onClick={() => run(false)}>
            2. Importer
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {report && !report.ok && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>{report.message}</strong>
          <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5 }}>
            {report.errors.map((e, i) => (
              <li key={i}>
                <code>{e.path}</code> — {e.message}
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {report?.ok && (
        <Alert severity={done ? 'success' : 'info'} sx={{ mb: 2 }}>
          <strong>{done ? 'Import terminé.' : 'Fichier valide. Voici ce qui sera enregistré :'}</strong>
          <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5 }}>
            {report.summary.map((s, i) => (
              <li key={i}>
                {s.module} › <strong>{s.subModule}</strong> : {s.actions.join(', ') || 'aucun changement'}
              </li>
            ))}
          </Box>
        </Alert>
      )}
    </Box>
  );
}
