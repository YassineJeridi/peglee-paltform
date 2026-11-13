const multer = require('multer');
const ApiError = require('../utils/ApiError');

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Stockage en mémoire (pas sur disque) : la vérification de la signature
// binaire réelle (utils/fileSignature.js) doit pouvoir rejeter le fichier
// avant qu'il ne touche le disque (§15).
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new ApiError(400, 'Seuls les fichiers JPG, PNG et WEBP sont acceptés.'));
    return;
  }
  cb(null, true);
}

const uploadAvatar = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
}).single('avatar');

module.exports = uploadAvatar;
