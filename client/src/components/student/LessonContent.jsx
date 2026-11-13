import { Box, Chip, Paper, Typography } from '@mui/material';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CODE_LANGUAGE_LABELS = { algorithme: 'Algorithme', python: 'Python' };

// react-markdown (v10) ne fournit plus de flag `inline` : un bloc de code
// annoté (```algorithme / ```python) a une className `language-xxx`, un code
// en ligne n'en a pas — c'est ce qui distingue les deux ici.
function CodeBlock({ className, children }) {
  const language = /language-(\w+)/.exec(className || '')?.[1];
  const label = CODE_LANGUAGE_LABELS[language];

  return (
    <Box
      sx={{
        position: 'relative',
        my: 2,
        p: 2,
        pt: label ? 4 : 2,
        borderRadius: 1.5,
        bgcolor: '#0A0918',
        color: '#E2E8F0',
        overflowX: 'auto',
        fontSize: '0.85rem',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        whiteSpace: 'pre',
      }}
    >
      {label && (
        <Chip
          label={label}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: language === 'python' ? 'secondary.main' : 'primary.main',
            color: '#fff',
            fontWeight: 600,
          }}
        />
      )}
      {children}
    </Box>
  );
}

function InlineCode({ children }) {
  return (
    <Box
      component="code"
      sx={{
        px: 0.6,
        py: 0.15,
        borderRadius: 0.75,
        bgcolor: 'action.hover',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.9em',
      }}
    >
      {children}
    </Box>
  );
}

const markdownComponents = {
  // Le fenced code block est déjà enveloppé dans <pre> par `code` ci-dessous
  // via CodeBlock ; on neutralise le <pre> par défaut pour éviter l'imbrication.
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) =>
    className ? <CodeBlock className={className}>{children}</CodeBlock> : <InlineCode>{children}</InlineCode>,
};

// Rendu Markdown canonique d'une leçon — partagé par LessonTab (élève,
// tâche 2.7) et LessonPreview (admin, tâche 4.5) pour garantir un rendu
// strictement identique entre édition et affichage réel (pas deux
// implémentations séparées, cf. règle métier de la tâche 4.5).
function LessonContent({ lesson }) {
  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, border: 1, borderColor: 'divider' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {lesson.title}
      </Typography>
      <Box
        sx={{
          '& p': { lineHeight: 1.75, mb: 1.5 },
          '& table': { borderCollapse: 'collapse', width: '100%', my: 2 },
          '& th, & td': { border: '1px solid', borderColor: 'divider', p: 1, textAlign: 'left' },
          '& ul, & ol': { pl: 3, mb: 1.5 },
        }}
      >
        <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {lesson.content}
        </Markdown>
      </Box>
    </Paper>
  );
}

export default LessonContent;
