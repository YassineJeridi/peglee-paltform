import { createContext, useCallback, useContext, useState } from 'react';

const LevelUpContext = createContext(null);

// Signal global "niveau supérieur" (tâche 5.1) : LessonTab / QuizTab /
// ExerciseCard sont trois points d'entrée distincts et sans parent commun
// direct (cf. SubModuleDetail) — plutôt que de faire remonter `leveledUp` à
// travers 2-3 niveaux de callbacks jusqu'à un état local, chacun notifie
// directement ce contexte, monté une fois dans DashboardLayout (LevelUpToast).
export function LevelUpProvider({ children }) {
  const [pulse, setPulse] = useState(0);

  const notifyLevelUp = useCallback(() => {
    setPulse((p) => p + 1);
  }, []);

  return <LevelUpContext.Provider value={{ pulse, notifyLevelUp }}>{children}</LevelUpContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLevelUp() {
  const ctx = useContext(LevelUpContext);
  if (!ctx) {
    throw new Error("useLevelUp doit être utilisé à l'intérieur d'un <LevelUpProvider>.");
  }
  return ctx;
}
