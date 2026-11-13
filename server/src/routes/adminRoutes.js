const express = require('express');
const { getStats } = require('../controllers/adminStatsController');
const { getSettings, updateSettings } = require('../controllers/adminSettingsController');
const { importContent, downloadTemplate } = require('../controllers/adminImportController');
const uploadImport = require('../middlewares/uploadImport');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

const router = express.Router();

router.get('/stats', auth, role('admin'), getStats);

router.get('/settings', auth, role('admin'), getSettings);
router.put('/settings', auth, role('admin'), updateSettings);

router.get('/import/template', auth, role('admin'), downloadTemplate);
router.post('/import', auth, role('admin'), uploadImport, importContent);

module.exports = router;
