const mongoose = require('mongoose');
const { Module, SubModule } = require('../models');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');
const { attachModulesProgress, attachSubModulesStatus } = require('../services/progressService');

async function getModules(req, res, next) {
  try {
    const modules = await Module.find().sort({ order: 1 });
    const modulesWithProgress = await attachModulesProgress(req.user.id, modules);
    res.json(modulesWithProgress);
  } catch (err) {
    next(err);
  }
}

async function getSubModules(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de module invalide.');
    }

    const module = await Module.findById(id);
    if (!module) {
      throw new ApiError(404, 'Module introuvable.');
    }

    const subModules = await attachSubModulesStatus(req.user.id, id);
    res.json(subModules);
  } catch (err) {
    next(err);
  }
}

async function generateUniqueSlug(title, excludeId) {
  const base = slugify(title) || 'module';
  let slug = base;
  let suffix = 2;
  // Nombre de modules attendu très faible (dizaines) : une boucle simple est
  // largement suffisante, pas besoin d'une requête d'agrégation dédiée.
  // eslint-disable-next-line no-await-in-loop
  while (await Module.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

async function createModule(req, res, next) {
  try {
    const { title, description, icon, color, order } = req.body;
    let { slug } = req.body;

    if (!title) {
      throw new ApiError(400, 'Le titre est requis.');
    }

    if (slug) {
      slug = slugify(slug);
      const existing = await Module.findOne({ slug });
      if (existing) {
        throw new ApiError(409, 'Ce slug est déjà utilisé.', [{ field: 'slug', message: 'Ce slug est déjà utilisé.' }]);
      }
    } else {
      slug = await generateUniqueSlug(title);
    }

    const module = await Module.create({ title, slug, description, icon, color, order });
    res.status(201).json(module);
  } catch (err) {
    next(err);
  }
}

async function updateModule(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de module invalide.');
    }

    const module = await Module.findById(id);
    if (!module) {
      throw new ApiError(404, 'Module introuvable.');
    }

    const { title, description, icon, color, order } = req.body;
    let { slug } = req.body;

    if (slug !== undefined) {
      slug = slugify(slug);
      if (slug !== module.slug) {
        const existing = await Module.findOne({ slug, _id: { $ne: id } });
        if (existing) {
          throw new ApiError(409, 'Ce slug est déjà utilisé.', [
            { field: 'slug', message: 'Ce slug est déjà utilisé.' },
          ]);
        }
        module.slug = slug;
      }
    }

    if (title !== undefined) module.title = title;
    if (description !== undefined) module.description = description;
    if (icon !== undefined) module.icon = icon;
    if (color !== undefined) module.color = color;
    if (order !== undefined) module.order = order;

    await module.save();
    res.json(module);
  } catch (err) {
    next(err);
  }
}

async function deleteModule(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de module invalide.');
    }

    const module = await Module.findById(id);
    if (!module) {
      throw new ApiError(404, 'Module introuvable.');
    }

    // Garde-fou documenté (§ règles métier) : un module contenant encore des
    // sous-modules ne peut pas être supprimé directement — évite la perte
    // accidentelle d'un pan entier de contenu pédagogique. L'admin doit
    // d'abord vider le module (supprimer ou déplacer ses sous-modules).
    const subModuleCount = await SubModule.countDocuments({ moduleId: id });
    if (subModuleCount > 0) {
      throw new ApiError(
        409,
        `Impossible de supprimer ce module : il contient encore ${subModuleCount} sous-module(s). Supprimez-les d'abord.`
      );
    }

    await module.deleteOne();
    res.json({ message: 'Module supprimé.' });
  } catch (err) {
    next(err);
  }
}

async function reorderModules(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Une liste { id, order } est requise.');
    }

    const invalid = items.find((it) => !mongoose.isValidObjectId(it.id) || typeof it.order !== 'number');
    if (invalid) {
      throw new ApiError(400, 'Format invalide : chaque élément doit avoir un id valide et un order numérique.');
    }

    await Promise.all(items.map((it) => Module.updateOne({ _id: it.id }, { $set: { order: it.order } })));

    res.json({ message: 'Ordre mis à jour.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getModules,
  getSubModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
};
