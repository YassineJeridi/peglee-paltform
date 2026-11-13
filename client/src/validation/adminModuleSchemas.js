import { z } from 'zod';

export const moduleSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis.').max(80, 'Le titre ne peut pas dépasser 80 caractères.'),
  description: z.string().trim().max(500, 'La description ne peut pas dépasser 500 caractères.').optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const subModuleSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis.').max(80, 'Le titre ne peut pas dépasser 80 caractères.'),
  description: z.string().trim().max(500, 'La description ne peut pas dépasser 500 caractères.').optional(),
  estimatedDuration: z.coerce.number().int().min(0, 'La durée doit être positive.').optional(),
});
