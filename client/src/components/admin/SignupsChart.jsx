import { LineChart } from '@mui/x-charts/LineChart';
import { Paper, Typography } from '@mui/material';

function formatDateLabel(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function SignupsChart({ series }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Inscriptions (30 derniers jours)
      </Typography>
      <LineChart
        dataset={series}
        xAxis={[{ dataKey: 'date', scaleType: 'point', valueFormatter: formatDateLabel }]}
        series={[{ dataKey: 'count', label: 'Inscriptions', color: '#9D4EDD' }]}
        height={260}
        margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
      />
    </Paper>
  );
}

export default SignupsChart;
