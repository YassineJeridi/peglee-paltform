const { Module, SubModule, Lesson, Quiz, Exercise } = require('../models');

const QUESTION_TYPES = ['single', 'multiple', 'boolean', 'short'];
const EXERCISE_TYPES = ['algorithme', 'python'];
const DIFFICULTIES = ['facile', 'moyen', 'difficile'];

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/**
 * Valide un paquet de contenu (cf. docs/IMPORT_FORMAT.md). Ne touche pas la base.
 * Renvoie { errors: [{path, message}], normalized }.
 */
function validatePackage(pkg, base = '') {
  const errors = [];
  const err = (path, message) => errors.push({ path: `${base}${path}`, message });

  if (!isObj(pkg)) return { errors: [{ path: base || '(racine)', message: 'Objet attendu.' }] };

  if (!isObj(pkg.module) || !isStr(pkg.module.slug)) err('module.slug', 'Le slug du module est requis.');
  if (!isObj(pkg.subModule) || !isStr(pkg.subModule.title)) {
    err('subModule.title', 'Le titre du sous-module est requis.');
  }
  if (!pkg.lesson && !pkg.quiz && !(Array.isArray(pkg.exercises) && pkg.exercises.length)) {
    err('', 'Le paquet doit contenir au moins une leçon, un quiz ou des exercices.');
  }

  const normalized = {
    module: pkg.module,
    subModule: pkg.subModule,
    lesson: null,
    quiz: null,
    exercises: [],
  };

  if (pkg.lesson !== undefined && pkg.lesson !== null) {
    if (!isObj(pkg.lesson)) err('lesson', 'Objet attendu.');
    else {
      if (!isStr(pkg.lesson.title)) err('lesson.title', 'Le titre est requis.');
      if (!isStr(pkg.lesson.content)) err('lesson.content', 'Le contenu (Markdown) est requis.');
      normalized.lesson = {
        title: pkg.lesson.title,
        content: pkg.lesson.content,
        videoUrl: pkg.lesson.videoUrl || '',
      };
    }
  }

  if (pkg.quiz !== undefined && pkg.quiz !== null) {
    const q = pkg.quiz;
    if (!isObj(q)) err('quiz', 'Objet attendu.');
    else {
      if (!isStr(q.title)) err('quiz.title', 'Le titre est requis.');
      const passingScore = q.passingScore === undefined ? 60 : q.passingScore;
      const maxAttempts = q.maxAttempts === undefined ? 0 : q.maxAttempts;
      if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100) {
        err('quiz.passingScore', 'Doit être un nombre entre 0 et 100.');
      }
      if (!Number.isInteger(maxAttempts) || maxAttempts < 0) {
        err('quiz.maxAttempts', 'Doit être un entier ≥ 0 (0 = illimité).');
      }
      const questions = [];
      if (!Array.isArray(q.questions) || q.questions.length === 0) {
        err('quiz.questions', 'Au moins une question est requise.');
      } else {
        q.questions.forEach((raw, i) => {
          const p = `quiz.questions[${i}].`;
          if (!isObj(raw)) return err(`quiz.questions[${i}]`, 'Objet attendu.');
          if (!isStr(raw.text)) err(`${p}text`, "L'énoncé est requis.");
          if (!QUESTION_TYPES.includes(raw.type)) {
            return err(`${p}type`, `Type invalide (attendu : ${QUESTION_TYPES.join(', ')}).`);
          }
          const points = raw.points === undefined ? 1 : raw.points;
          if (!Number.isFinite(points) || points < 0) err(`${p}points`, 'Nombre ≥ 0 attendu.');

          let options = Array.isArray(raw.options) ? raw.options.map(String) : [];
          let correct = raw.correctAnswers;

          if (raw.type === 'boolean') {
            options = ['Vrai', 'Faux'];
            if (typeof correct === 'boolean') correct = [correct ? 0 : 1];
            if (!Array.isArray(correct) || correct.length !== 1 || ![0, 1].includes(correct[0])) {
              err(`${p}correctAnswers`, 'Attendu : true/false ou [0] (Vrai) / [1] (Faux).');
            }
          } else if (raw.type === 'short') {
            if (!isStr(correct) && !(Array.isArray(correct) && correct.length && correct.every(isStr))) {
              err(`${p}correctAnswers`, 'Texte (ou liste de textes acceptés) attendu.');
            }
          } else {
            if (options.length < 2 || options.length > 8 || !options.every(isStr)) {
              err(`${p}options`, 'Entre 2 et 8 options non vides attendues.');
            }
            const validIdx = (n) => Number.isInteger(n) && n >= 0 && n < options.length;
            if (!Array.isArray(correct) || correct.length === 0 || !correct.every(validIdx)) {
              err(`${p}correctAnswers`, "Liste d'indices (à partir de 0) valides dans options attendue.");
            } else if (raw.type === 'single' && correct.length !== 1) {
              err(`${p}correctAnswers`, 'Une seule bonne réponse pour le type single.');
            }
          }
          questions.push({
            text: raw.text,
            type: raw.type,
            options,
            correctAnswers: correct,
            explanation: raw.explanation || '',
            points,
          });
        });
      }
      normalized.quiz = { title: q.title, passingScore, maxAttempts, questions };
    }
  }

  if (pkg.exercises !== undefined && pkg.exercises !== null) {
    if (!Array.isArray(pkg.exercises)) err('exercises', 'Liste attendue.');
    else {
      const seen = new Set();
      pkg.exercises.forEach((ex, i) => {
        const p = `exercises[${i}].`;
        if (!isObj(ex)) return err(`exercises[${i}]`, 'Objet attendu.');
        if (!isStr(ex.title)) err(`${p}title`, 'Le titre est requis.');
        else if (seen.has(ex.title.trim())) err(`${p}title`, 'Titre en double dans le fichier.');
        else seen.add(ex.title.trim());
        if (!isStr(ex.statement)) err(`${p}statement`, "L'énoncé est requis.");
        if (!EXERCISE_TYPES.includes(ex.type)) {
          err(`${p}type`, `Type invalide (attendu : ${EXERCISE_TYPES.join(', ')}).`);
        }
        if (ex.difficulty !== undefined && !DIFFICULTIES.includes(ex.difficulty)) {
          err(`${p}difficulty`, `Difficulté invalide (attendu : ${DIFFICULTIES.join(', ')}).`);
        }
        if (!isStr(ex.solution)) err(`${p}solution`, 'La solution de référence est requise.');
        let tests = [];
        if (ex.tests !== undefined) {
          if (!Array.isArray(ex.tests)) err(`${p}tests`, 'Liste attendue.');
          else if (ex.type !== 'python' && ex.tests.length) {
            err(`${p}tests`, "Les cas de test ne sont acceptés que pour le type 'python'.");
          } else {
            tests = ex.tests.map((t, j) => {
              if (!isObj(t) || typeof t.expectedOutput !== 'string') {
                err(`${p}tests[${j}]`, 'Attendu : { "input": "...", "expectedOutput": "..." }.');
              }
              return { input: String(t?.input ?? ''), expectedOutput: String(t?.expectedOutput ?? '') };
            });
          }
        }
        normalized.exercises.push({
          title: ex.title?.trim(),
          statement: ex.statement,
          type: ex.type,
          difficulty: ex.difficulty || 'moyen',
          order: Number.isInteger(ex.order) ? ex.order : i + 1,
          starterCode: ex.starterCode || '',
          solution: ex.solution,
          tests,
        });
      });
    }
  }

  return { errors, normalized };
}

/** Extrait la liste de paquets d'un fichier (un paquet seul ou { packages: [...] }). */
function extractPackages(doc) {
  if (isObj(doc) && Array.isArray(doc.packages)) return doc.packages;
  return [doc];
}

/**
 * Valide tout le fichier puis (si !dryRun et aucune erreur) l'applique.
 * Sémantique : upsert. Module = doit exister (ou créé si `module.title` fourni) ;
 * sous-module retrouvé par (module, titre) ; leçon et quiz remplacés ; exercices
 * retrouvés par titre (mis à jour) sinon créés. Rien n'est écrit si une erreur existe.
 */
async function importDocument(doc, { dryRun = false } = {}) {
  if (!isObj(doc)) {
    return { ok: false, errors: [{ path: '(racine)', message: 'Le fichier doit contenir un objet JSON.' }], summary: [] };
  }
  if (doc.schemaVersion !== undefined && doc.schemaVersion !== 1) {
    return { ok: false, errors: [{ path: 'schemaVersion', message: 'Seule la version 1 est supportée.' }], summary: [] };
  }

  const packages = extractPackages(doc);
  if (packages.length === 0 || packages.length > 50) {
    return { ok: false, errors: [{ path: 'packages', message: 'Entre 1 et 50 paquets attendus.' }], summary: [] };
  }

  const errors = [];
  const validated = packages.map((pkg, i) => {
    const r = validatePackage(pkg, packages.length > 1 || doc.packages ? `packages[${i}].` : '');
    errors.push(...r.errors);
    return r.normalized;
  });

  // Vérification d'existence des modules (sans écriture).
  for (let i = 0; i < validated.length; i += 1) {
    const m = validated[i].module;
    if (!isObj(m) || !isStr(m.slug)) continue;
    const exists = await Module.exists({ slug: m.slug.trim() });
    if (!exists && !isStr(m.title)) {
      errors.push({
        path: `${packages.length > 1 || doc.packages ? `packages[${i}].` : ''}module.slug`,
        message: `Le module « ${m.slug} » n'existe pas. Créez-le d'abord ou fournissez module.title pour le créer.`,
      });
    }
  }

  if (errors.length > 0) return { ok: false, errors, summary: [] };

  const summary = [];
  for (const pkg of validated) {
    const slug = pkg.module.slug.trim();
    const item = { module: slug, subModule: pkg.subModule.title.trim(), actions: [] };

    let moduleDoc = await Module.findOne({ slug });
    if (!moduleDoc) {
      item.actions.push('module créé');
      if (!dryRun) {
        const count = await Module.countDocuments();
        moduleDoc = await Module.create({
          title: pkg.module.title.trim(),
          slug,
          description: pkg.module.description || '',
          icon: pkg.module.icon || 'Code',
          color: pkg.module.color || '#2F5BFF',
          order: count + 1,
        });
      }
    }

    let subDoc = moduleDoc
      ? await SubModule.findOne({ moduleId: moduleDoc._id, title: pkg.subModule.title.trim() })
      : null;
    if (!subDoc) {
      item.actions.push('sous-module créé');
      if (!dryRun) {
        const count = await SubModule.countDocuments({ moduleId: moduleDoc._id });
        subDoc = await SubModule.create({
          moduleId: moduleDoc._id,
          title: pkg.subModule.title.trim(),
          description: pkg.subModule.description || '',
          order: Number.isInteger(pkg.subModule.order) ? pkg.subModule.order : count + 1,
          estimatedDuration: pkg.subModule.estimatedDuration,
        });
      }
    } else if (!dryRun) {
      if (pkg.subModule.description !== undefined) subDoc.description = pkg.subModule.description;
      if (Number.isInteger(pkg.subModule.order)) subDoc.order = pkg.subModule.order;
      if (pkg.subModule.estimatedDuration !== undefined) {
        subDoc.estimatedDuration = pkg.subModule.estimatedDuration;
      }
      await subDoc.save();
    }

    if (pkg.lesson) {
      const exists = subDoc && (await Lesson.exists({ subModuleId: subDoc._id }));
      item.actions.push(exists ? 'leçon remplacée' : 'leçon créée');
      if (!dryRun) {
        await Lesson.findOneAndUpdate(
          { subModuleId: subDoc._id },
          { subModuleId: subDoc._id, ...pkg.lesson },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    if (pkg.quiz) {
      const exists = subDoc && (await Quiz.exists({ subModuleId: subDoc._id }));
      item.actions.push(
        `${exists ? 'quiz remplacé' : 'quiz créé'} (${pkg.quiz.questions.length} questions)`
      );
      if (!dryRun) {
        await Quiz.findOneAndUpdate(
          { subModuleId: subDoc._id },
          { subModuleId: subDoc._id, ...pkg.quiz },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    let created = 0;
    let updated = 0;
    for (const ex of pkg.exercises) {
      const existing = subDoc ? await Exercise.findOne({ subModuleId: subDoc._id, title: ex.title }) : null;
      if (existing) updated += 1;
      else created += 1;
      if (dryRun) continue;
      if (existing) {
        existing.set(ex);
        await existing.save();
      } else {
        await Exercise.create({ subModuleId: subDoc._id, ...ex });
      }
    }
    if (pkg.exercises.length) item.actions.push(`exercices : ${created} créé(s), ${updated} mis à jour`);

    summary.push(item);
  }

  return { ok: true, dryRun, errors: [], summary };
}

module.exports = { importDocument, validatePackage };
