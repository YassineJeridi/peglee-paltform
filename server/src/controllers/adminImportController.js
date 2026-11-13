const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');
const { importDocument } = require('../services/importService');

const TEMPLATE_PATH = path.resolve(__dirname, '../../../docs/templates/content-template.json');

async function importContent(req, res, next) {
  try {
    if (!req.file) throw new ApiError(400, 'Aucun fichier reçu (champ « file »).');

    let doc;
    try {
      doc = JSON.parse(req.file.buffer.toString('utf8').replace(/^﻿/, ''));
    } catch (e) {
      throw new ApiError(422, `JSON invalide : ${e.message}`);
    }

    const dryRun = req.query.dryRun === 'true' || req.body.dryRun === 'true';
    const result = await importDocument(doc, { dryRun });
    res.status(result.ok ? 200 : 422).json({
      message: result.ok
        ? dryRun
          ? 'Fichier valide (aperçu, rien n\'a été enregistré).'
          : 'Import réussi.'
        : "Le fichier contient des erreurs. Rien n'a été enregistré.",
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

function downloadTemplate(req, res, next) {
  res.download(TEMPLATE_PATH, 'modele-import-contenu.json', (err) => err && next(err));
}

module.exports = { importContent, downloadTemplate };
