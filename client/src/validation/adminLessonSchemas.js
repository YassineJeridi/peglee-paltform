import { z } from 'zod';

export const lessonSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis.').max(150, 'Le titre ne peut pas dépasser 150 caractères.'),
  content: z.string().trim().min(1, 'Le contenu est requis.'),
  videoUrl: z.string().trim().url('URL invalide.').optional().or(z.literal('')),
});
