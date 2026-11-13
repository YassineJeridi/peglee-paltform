import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import { getMyProgress } from '../../api/progressApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import KpiCard from '../../components/student/KpiCard';
import PerformanceChart from '../../components/student/PerformanceChart';
import LevelProgress from '../../components/student/LevelProgress';
import ModuleProgressList from '../../components/student/ModuleProgressList';
import UpcomingEvents from '../../components/student/UpcomingEvents';
import RecentActivity from '../../components/student/RecentActivity';
import BadgesSection from '../../components/student/BadgesSection';

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getMyProgress()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger votre vue d\'ensemble pour le moment.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!overview) {
    return <LoadingSpinner label="Chargement de votre progression…" minHeight={300} />;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Vue d'ensemble
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Un aperçu de votre progression et de votre activité récente.
      </Typography>

      {/* 1. Cartes de KPI (§6.1) */}
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          mb: 3,
        }}
      >
        <KpiCard
          icon={TrendingUpRoundedIcon}
          label="Progression globale"
          value={`${overview.overallProgressPercent}%`}
          color="#9D4EDD"
        />
        <KpiCard
          icon={DoneAllRoundedIcon}
          label="Sous-modules terminés"
          value={`${overview.subModulesCompleted} / ${overview.subModulesTotal}`}
          color="#4CC9F0"
        />
        <KpiCard
          icon={QuizRoundedIcon}
          label="Quiz réussis"
          value={overview.quizzesPassed}
          sublabel={`Score moyen : ${overview.averageQuizScore}%`}
          color="#FF9E00"
        />
        <KpiCard
          icon={FitnessCenterRoundedIcon}
          label="Exercices résolus"
          value={overview.exercisesCompletedTotal}
          color="#F72585"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          alignItems: 'start',
        }}
      >
        {/* 2. Graphique de performance + 4. Progression par module */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <PerformanceChart />
          <ModuleProgressList modules={overview.modules} />
          <BadgesSection />
        </Box>

        {/* 3. Niveau + 5. Prochaines échéances + 6. Activité récente */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <LevelProgress
            level={overview.level}
            xp={overview.xp}
            xpIntoLevel={overview.xpIntoLevel}
            xpForNextLevel={overview.xpForNextLevel}
          />
          <UpcomingEvents />
          <RecentActivity activity={overview.recentActivity} />
        </Box>
      </Box>
    </Box>
  );
}
