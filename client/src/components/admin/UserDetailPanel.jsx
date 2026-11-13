import { useEffect, useState } from 'react';
import { Avatar, Box, Chip, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { getUserDetail } from '../../api/adminUsersApi';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import KpiCard from '../student/KpiCard';
import ModuleProgressList from '../student/ModuleProgressList';

// Réutilise KpiCard et ModuleProgressList (tâche 2.9) en lecture seule, pour
// un userId arbitraire choisi par l'admin plutôt que l'élève connecté.
function UserDetailPanel({ userId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setDetail(null);
    setError('');

    getUserDetail(userId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger le détail pour le moment.');
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Dialog open={Boolean(userId)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Détail utilisateur
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />}
        {!error && !detail && <LoadingSpinner label="Chargement…" minHeight={200} />}
        {!error && detail && (
          <Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
              <Avatar src={detail.profilePicture || undefined} sx={{ width: 56, height: 56 }}>
                {detail.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {detail.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail.email}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                <Chip label={detail.role === 'admin' ? 'Administrateur' : 'Élève'} size="small" />
                <Chip
                  label={detail.isActive ? 'Actif' : 'Désactivé'}
                  size="small"
                  color={detail.isActive ? 'success' : 'default'}
                />
              </Stack>
            </Stack>

            {detail.progress ? (
              <>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, mb: 3 }}>
                  <KpiCard
                    icon={TrendingUpRoundedIcon}
                    label="Progression"
                    value={`${detail.progress.overallProgressPercent}%`}
                    color="#9D4EDD"
                  />
                  <KpiCard
                    icon={DoneAllRoundedIcon}
                    label="Sous-modules"
                    value={`${detail.progress.subModulesCompleted}/${detail.progress.subModulesTotal}`}
                    color="#4CC9F0"
                  />
                  <KpiCard
                    icon={QuizRoundedIcon}
                    label="Quiz réussis"
                    value={detail.progress.quizzesPassed}
                    sublabel={`Moy. ${detail.progress.averageQuizScore}%`}
                    color="#FF9E00"
                  />
                  <KpiCard
                    icon={FitnessCenterRoundedIcon}
                    label="Exercices"
                    value={detail.progress.exercisesCompletedTotal}
                    color="#F72585"
                  />
                </Box>
                <ModuleProgressList modules={detail.progress.modules} />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Ce compte est un administrateur — aucune progression pédagogique à afficher.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UserDetailPanel;
