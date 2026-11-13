import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { getModules } from '../../api/coursApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ModuleCard from '../../components/student/ModuleCard';

export default function Cours() {
  const navigate = useNavigate();
  const [modules, setModules] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getModules()
      .then((data) => {
        if (!cancelled) setModules(data);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les modules pour le moment.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (modules === null && !error) {
    return <LoadingSpinner label="Chargement des cours…" minHeight={300} />;
  }

  if (error) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (modules.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="Aucun module disponible"
        description="Le contenu pédagogique n'a pas encore été publié. Revenez bientôt !"
      />
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Cours
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choisissez un module pour continuer votre progression.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
        }}
      >
        {modules.map((m) => (
          <ModuleCard key={m._id} module={m} onOpen={(mod) => navigate(`/app/cours/${mod.slug}`)} />
        ))}
      </Box>
    </Box>
  );
}
