import { z } from 'zod';

export const settingsSchema = z.object({
  defaultPassingScore: z.coerce.number().min(0, 'Doit être entre 0 et 100.').max(100, 'Doit être entre 0 et 100.'),
  defaultMaxAttempts: z.coerce.number().min(0, 'Doit être positif ou nul.'),
});
