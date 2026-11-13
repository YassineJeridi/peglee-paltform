import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { getStats } from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import KpiCard from '../../components/student/KpiCard';
import SignupsChart from '../../components/admin/SignupsChart';
import ActivityChart from '../../components/admin/ActivityChart';
import ModuleDistributionChart from '../../components/admin/ModuleDistributionChart';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger les statistiques pour le moment.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!stats) {
    return <LoadingSpinner label="Chargement des statistiques…" minHeight={300} />;
  }

  const { totals, rates } = stats;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Vue d'ensemble
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Statistiques globales de la plateforme.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
          mb: 3,
        }}
      >
        <KpiCard
          icon={GroupRoundedIcon}
          label="Utilisateurs"
          value={totals.users}
          sublabel={`+${totals.newUsersThisMonth} ce mois-ci`}
          color="#9D4EDD"
        />
        <KpiCard
          icon={MenuBookRoundedIcon}
          label="Contenu pédagogique"
          value={totals.modules}
          sublabel={`${totals.subModules} sous-modules · ${totals.lessons} leçons · ${totals.quizzes} quiz · ${totals.exercises} exercices`}
          color="#4CC9F0"
        />
        <KpiCard
          icon={QuizRoundedIcon}
          label="Taux de réussite quiz"
          value={`${rates.quizPassRate}%`}
          color="#FF9E00"
        />
        <KpiCard
          icon={TrendingUpRoundedIcon}
          label="Progression moyenne"
          value={`${rates.averageProgressPercent}%`}
          color="#480CA8"
        />
        <KpiCard
          icon={BoltRoundedIcon}
          label="Élèves actifs"
          value={rates.activeStudents}
          sublabel="30 derniers jours"
          color="#F72585"
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
        <SignupsChart series={stats.timeSeries.registrations} />
        <ActivityChart series={stats.timeSeries.activity} />
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <ModuleDistributionChart data={stats.studentsByModule} />
      </Box>
    </Box>
  );
}
