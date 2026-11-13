const { getAdminStats } = require('../services/statsService');

async function getStats(req, res, next) {
  try {
    const stats = await getAdminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
