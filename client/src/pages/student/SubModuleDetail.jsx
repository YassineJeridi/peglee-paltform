import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Tab, Tabs, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { getModules, getSubModules } from '../../api/coursApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import LessonTab from '../../components/student/LessonTab';
import QuizTab from '../../components/student/QuizTab';
import ExercisesTab from '../../components/student/ExercisesTab';

// Un Tooltip MUI ne se déclenche pas sur le contenu d'un onglet désactivé
// (les événements pointer n'atteignent pas ses descendants) ; l'attribut
// `title` natif, lui, fonctionne même désactivé — d'où ce choix plutôt
// qu'un <Tooltip> pour l'explication au survol (§12.4).
function LockableTab({ value, label, unlocked, lockedHint }) {
  return (
    <Tab
      value={value}
      disabled={!unlocked}
      title={unlocked ? undefined : lockedHint}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {label}
          {!unlocked && <LockRoundedIcon sx={{ fontSize: 16 }} />}
        </Box>
      }
    />
  );
}

export default function SubModuleDetail() {
  const { module: moduleSlug, subModuleId } = useParams();

  const [moduleInfo, setModuleInfo] = useState(null);
  const [subModuleInfo, setSubModuleInfo] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('lesson');

  useEffect(() => {
    let cancelled = false;
    setModuleInfo(null);
    setSubModuleInfo(null);
    setError('');
    setTab('lesson');

    getModules()
      .then((modules) => {
        const found = modules.find((m) => m.slug === moduleSlug);
        if (!found) {
          if (!cancelled) setError('Module introuvable.');
          return null;
        }
        if (!cancelled) setModuleInfo(found);
        return getSubModules(found._id);
      })
      .then((subModules) => {
        if (!subModules || cancelled) return;
        const found = subModules.find((sm) => sm._id === subModuleId);
        if (!found) {
          setError('Sous-module introuvable.');
          return;
        }
        setSubModuleInfo(found);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger ce sous-module pour le moment.');
      });

    return () => {
      cancelled = true;
    };
  }, [moduleSlug, subModuleId]);

  if (error) {
    return <EmptyState icon="⚠️" title="Une erreur est survenue" description={error} />;
  }

  if (!moduleInfo || !subModuleInfo) {
    return <LoadingSpinner label="Chargement…" minHeight={300} />;
  }

  // Rappel de sécurité (§11.6, §6.2.3) : ces booléens ne pilotent que l'UX
  // (grisé onglet, cadenas). La vraie protection est côté serveur —
  // ExercisesTab gère le 403 explicitement en cas de désynchronisation ; le
  // Quiz, lui, n'a pas de garde serveur bloquant sa lecture/soumission
  // (tâches 2.3/2.5), seul l'onglet est visuellement verrouillé ici.
  const quizUnlocked = subModuleInfo.lessonCompleted === true;
  const exercisesUnlocked = subModuleInfo.quizPassed === true;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/cours" underline="hover" color="text.secondary">
          Cours
        </Link>
        <Link component={RouterLink} to={`/app/cours/${moduleSlug}`} underline="hover" color="text.secondary">
          {moduleInfo.title}
        </Link>
        <Typography color="text.primary">{subModuleInfo.title}</Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {subModuleInfo.title}
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="lesson" label="Leçon" />
        <LockableTab
          value="quiz"
          label="Quiz"
          unlocked={quizUnlocked}
          lockedHint="Terminez la leçon pour débloquer le quiz"
        />
        <LockableTab
          value="exercises"
          label="Exercices"
          unlocked={exercisesUnlocked}
          lockedHint="Réussissez le quiz pour débloquer les exercices"
        />
      </Tabs>

      {tab === 'lesson' && (
        <LessonTab
          subModuleId={subModuleId}
          lessonCompleted={subModuleInfo.lessonCompleted}
          onLessonCompleted={() =>
            setSubModuleInfo((prev) => ({
              ...prev,
              lessonCompleted: true,
              status: prev.status === 'locked' ? 'in_progress' : prev.status,
            }))
          }
        />
      )}

      {tab === 'quiz' &&
        (quizUnlocked ? (
          <QuizTab
            subModuleId={subModuleId}
            onQuizPassed={(bestScore) =>
              setSubModuleInfo((prev) => ({ ...prev, quizPassed: true, quizBestScore: bestScore }))
            }
          />
        ) : (
          <EmptyState
            icon="🔒"
            title="Quiz verrouillé"
            description="Terminez la leçon de ce sous-module pour débloquer le quiz."
          />
        ))}

      {tab === 'exercises' &&
        (exercisesUnlocked ? (
          <ExercisesTab
            subModuleId={subModuleId}
            onExerciseCompleted={(data) =>
              setSubModuleInfo((prev) => ({
                ...prev,
                exercisesCompleted: data.exercisesCompleted,
                status: data.status,
              }))
            }
          />
        ) : (
          <EmptyState
            icon="🔒"
            title="Exercices verrouillés"
            description="Réussissez le quiz de ce sous-module pour débloquer les exercices."
          />
        ))}
    </Box>
  );
}
