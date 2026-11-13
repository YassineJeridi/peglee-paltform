const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { hashPassword } = require('../utils/password');
const { User } = require('../models');
const { computeLevel } = require('../services/xpService');

// Script ponctuel (hors seed principal) pour peupler la base de comptes élève
// de démonstration — utile pour tester `/admin/utilisateurs` (pagination,
// recherche, filtres) et les graphiques admin avec un volume de données
// réaliste plutôt qu'un seul compte de test.

const TEST_PASSWORD = 'Etudiant2026!';

const STUDENTS = [
  { username: 'yassine.jeridi', email: 'yassine.jeridi@example.com' },
  { username: 'amira.trabelsi', email: 'amira.trabelsi@example.com' },
  { username: 'mohamed.gharbi', email: 'mohamed.gharbi@example.com' },
  { username: 'sarra.ben_ali', email: 'sarra.ben.ali@example.com' },
  { username: 'omar.khemiri', email: 'omar.khemiri@example.com' },
  { username: 'nour.bouazizi', email: 'nour.bouazizi@example.com' },
  { username: 'ahmed.sassi', email: 'ahmed.sassi@example.com' },
  { username: 'ines.mansouri', email: 'ines.mansouri@example.com' },
  { username: 'karim.jendoubi', email: 'karim.jendoubi@example.com' },
  { username: 'rania.hammami', email: 'rania.hammami@example.com' },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  await connectDB();
  const passwordHash = await hashPassword(TEST_PASSWORD);

  let created = 0;
  let skipped = 0;

  for (const student of STUDENTS) {
    const existing = await User.findOne({
      $or: [{ email: student.email }, { username: student.username }],
    });
    if (existing) {
      skipped += 1;
      console.log(`[seed:users] Déjà présent, ignoré : ${student.email}`);
      continue;
    }

    // XP aléatoire réaliste (0 à 2000) ; le niveau est dérivé via la même
    // formule que le reste de l'app (xpService.computeLevel) pour ne jamais
    // désynchroniser xp/level (règle métier, tâche 5.1).
    const xp = randomInt(0, 2000);
    const { level } = computeLevel(xp);

    await User.create({
      username: student.username,
      email: student.email,
      passwordHash,
      role: 'student',
      isActive: Math.random() > 0.15, // ~15% de comptes désactivés, pour tester ce filtre admin
      xp,
      level,
    });
    created += 1;
    console.log(`[seed:users] Créé : ${student.email} (xp=${xp}, level=${level})`);
  }

  console.log(`\n[seed:users] Terminé — ${created} créé(s), ${skipped} déjà présent(s).`);
  if (created > 0) {
    console.log(`[seed:users] Mot de passe commun (comptes de test) : ${TEST_PASSWORD}`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('[seed:users] Échec :', err);
  await mongoose.connection.close();
  process.exit(1);
});
