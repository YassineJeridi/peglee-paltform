import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis.').max(120, 'Le titre ne peut pas dépasser 120 caractères.'),
  description: z.string().trim().max(2000, 'La description ne peut pas dépasser 2000 caractères.').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  color: z.string().optional(),
});
