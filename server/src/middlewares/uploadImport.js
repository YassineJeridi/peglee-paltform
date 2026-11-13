const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Fichier JSON d'import (docs/IMPORT_FORMAT.md) : 2 Mo max, en mémoire.
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter(req, file, cb) {
    if (!/\.json$/i.test(file.originalname)) {
      return cb(new ApiError(400, 'Seuls les fichiers .json sont acceptés.'));
    }
    cb(null, true);
  },
}).single('file');
