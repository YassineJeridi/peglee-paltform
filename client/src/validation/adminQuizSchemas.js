import { z } from 'zod';

export const quizFieldsSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis.').max(150, 'Le titre ne peut pas dépasser 150 caractères.'),
  passingScore: z.coerce.number().min(0, 'Doit être entre 0 et 100.').max(100, 'Doit être entre 0 et 100.'),
  maxAttempts: z.coerce.number().min(0, 'Doit être positif ou nul.'),
});
