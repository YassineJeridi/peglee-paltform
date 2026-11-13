import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack, Typography } from '@mui/material';
import { getModules, getSubModules } from '../../api/coursApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import SubModuleListItem from '../../components/student/SubModuleListItem';

export default function ModuleDetail() {
  const { module: moduleSlug } = useParams();
  const navigate = useNavigate();

  const [moduleInfo, setModuleInfo] = useState(null);
  const [subModules, setSubModules] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setModuleInfo(null);
    setSubModules(null);
    setError('');

    getModules()
      .then((modules) => {
        const found = modules.find((m) => m.slug === moduleSlug);
        if (!found) {
          if (!cancelled) setError('Module introuvable.');
          return null;
        }
        if (!cancelled) setModuleInfo(found);
        return getSubModules(found._id);
      })
      .then((data) => {
        if (data && !cancelled) setSubModules(data);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger ce module pour le moment.');
      });

    return () => {
      cancelled = true;
    };
  }, [moduleSlug]);

  if (error) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!moduleInfo || subModules === null) {
    return <LoadingSpinner label="Chargement du module…" minHeight={300} />;
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/cours" underline="hover" color="text.secondary">
          Cours
        </Link>
        <Typography color="text.primary">{moduleInfo.title}</Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {moduleInfo.title}
      </Typography>
      {moduleInfo.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {moduleInfo.description}
        </Typography>
      )}

      {subModules.length === 0 ? (
        <EmptyState
          icon="📘"
          title="Aucun sous-module disponible"
          description="Le contenu de ce module n'a pas encore été publié."
        />
      ) : (
        <Stack spacing={2}>
          {subModules.map((sm) => (
            <SubModuleListItem
              key={sm._id}
              subModule={sm}
              onOpen={(subModule) => navigate(`/app/cours/${moduleSlug}/${subModule._id}`)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
