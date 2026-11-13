import { z } from 'zod';

export const exerciseSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis.').max(150, 'Le titre ne peut pas dépasser 150 caractères.'),
  statement: z.string().trim().min(1, "L'énoncé est requis."),
  type: z.enum(['algorithme', 'python']),
  starterCode: z.string().optional(),
  solution: z.string().trim().min(1, 'La solution de référence est requise.'),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  order: z.coerce.number().int().optional(),
});
