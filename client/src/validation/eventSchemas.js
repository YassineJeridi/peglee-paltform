import { z } from 'zod';

export const eventSchema = z
  .object({
    title: z.string().trim().min(1, 'Le titre est requis.').max(120, 'Le titre ne peut pas dépasser 120 caractères.'),
    description: z.string().trim().max(2000, 'La description ne peut pas dépasser 2000 caractères.').optional(),
    start: z.string().min(1, 'La date de début est requise.'),
    end: z.string().min(1, 'La date de fin est requise.'),
    type: z.enum(['revision', 'quiz', 'examen', 'personnel']),
    color: z.string().optional(),
  })
  .refine((data) => new Date(data.end) >= new Date(data.start), {
    message: 'La date de fin doit être postérieure ou égale à la date de début.',
    path: ['end'],
  });
