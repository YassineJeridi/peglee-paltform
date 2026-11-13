function notFound(req, res, next) {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
}

module.exports = notFound;
