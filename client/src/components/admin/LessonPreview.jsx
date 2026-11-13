import LessonContent from '../student/LessonContent';

// Prévisualisation admin (tâche 4.5) : réutilise EXACTEMENT le même
// composant de rendu que côté élève (LessonContent), alimenté par le
// contenu en cours d'édition plutôt que par un appel API — garantit que la
// prévisualisation est fidèle au rendu réel (pas deux implémentations).
function LessonPreview({ title, content }) {
  return (
    <LessonContent
      lesson={{
        title: title || 'Sans titre',
        content: content || '*Aucun contenu pour l\'instant.*',
      }}
    />
  );
}

export default LessonPreview;
