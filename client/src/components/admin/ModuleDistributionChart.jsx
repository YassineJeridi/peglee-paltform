import { PieChart } from '@mui/x-charts/PieChart';
import { Paper, Typography } from '@mui/material';
import EmptyState from '../EmptyState';

const COLORS = ['#9D4EDD', '#4CC9F0', '#F72585', '#FF9E00', '#480CA8', '#22C55E'];

function ModuleDistributionChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.studentsCount, 0);

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Répartition des élèves par module
      </Typography>
      {total === 0 ? (
        <EmptyState
          icon="📊"
          title="Aucune donnée"
          description="Aucun élève n'a encore commencé de module."
          minHeight={200}
        />
      ) : (
        <PieChart
          series={[
            {
              data: data.map((d, i) => ({
                id: d.moduleId,
                value: d.studentsCount,
                label: d.title,
                color: COLORS[i % COLORS.length],
              })),
              innerRadius: 40,
              paddingAngle: 2,
            },
          ]}
          height={260}
        />
      )}
    </Paper>
  );
}

export default ModuleDistributionChart;
