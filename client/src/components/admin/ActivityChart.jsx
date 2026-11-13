import { BarChart } from '@mui/x-charts/BarChart';
import { Paper, Typography } from '@mui/material';

function formatDateLabel(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function ActivityChart({ series }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Activité — tentatives de quiz (30 derniers jours)
      </Typography>
      <BarChart
        dataset={series}
        xAxis={[{ dataKey: 'date', scaleType: 'band', valueFormatter: formatDateLabel }]}
        series={[{ dataKey: 'count', label: 'Tentatives', color: '#4CC9F0' }]}
        height={260}
        margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
      />
    </Paper>
  );
}

export default ActivityChart;
