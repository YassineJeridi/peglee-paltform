import { useEffect, useState } from 'react';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import { getMyBadges } from '../../api/badgesApi';

// Badges obtenus + badges « à débloquer » en grisé (§13.3 évolution).
function BadgesSection() {
  const [badges, setBadges] = useState(null);

  useEffect(() => {
    getMyBadges()
      .then(setBadges)
      .catch(() => setBadges([]));
  }, []);

  if (!badges || badges.length === 0) return null;
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Badges
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {earnedCount} / {badges.length} débloqués
      </Typography>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}>
        {badges.map((b) => (
          <Tooltip
            key={b._id}
            title={
              b.earned
                ? `${b.description} — obtenu le ${new Date(b.earnedAt).toLocaleDateString('fr-FR')}`
                : `À débloquer : ${b.description}`
            }
          >
            <Box
              sx={{
                textAlign: 'center',
                p: 1,
                borderRadius: 2,
                border: 1,
                borderColor: b.earned ? 'primary.main' : 'divider',
                opacity: b.earned ? 1 : 0.45,
                filter: b.earned ? 'none' : 'grayscale(1)',
              }}
            >
              <Box sx={{ fontSize: 32, lineHeight: 1.2 }}>{b.icon}</Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                {b.title}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
}

export default BadgesSection;
