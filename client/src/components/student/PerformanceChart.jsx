import { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { getMyActivity } from '../../api/progressApi';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';

function formatDateLabel(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// Source : GET /api/progress/me/activity?period=week|month (tâche 2.5/2.9,
// étendue pour cette page — une série temporelle de scores n'a pas sa place
// dans une agrégation côté client à partir de progress/me).
export default function PerformanceChart() {
  const [period, setPeriod] = useState('week');
  const [series, setSeries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSeries(null);
    setError('');

    getMyActivity(period)
      .then((data) => {
        if (!cancelled) setSeries(data.series);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger le graphique pour le moment.');
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  const hasData = series && series.some((s) => s.attemptsCount > 0);

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Performance
        </Typography>
        <ToggleButtonGroup value={period} exclusive size="small" onChange={(_, next) => next && setPeriod(next)}>
          <ToggleButton value="week">Semaine</ToggleButton>
          <ToggleButton value="month">Mois</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {error && <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} minHeight={200} />}

      {!error && !series && <LoadingSpinner label="Chargement du graphique…" minHeight={240} />}

      {!error && series && !hasData && (
        <EmptyState
          icon="📈"
          title="Pas encore d'activité"
          description="Passez un quiz pour voir votre évolution apparaître ici."
          minHeight={200}
        />
      )}

      {!error && series && hasData && (
        <LineChart
          dataset={series}
          xAxis={[{ dataKey: 'date', scaleType: 'point', valueFormatter: formatDateLabel }]}
          series={[{ dataKey: 'averageScore', label: 'Score moyen (%)', connectNulls: true }]}
          height={260}
          margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
        />
      )}
    </Paper>
  );
}
