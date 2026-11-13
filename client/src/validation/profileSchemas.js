import { z } from 'zod';

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères."),
  email: z.string().trim().min(1, "L'e-mail est requis.").email("Format d'e-mail invalide."),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis.'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères.'),
    confirmNewPassword: z.string().min(1, 'Veuillez confirmer le nouveau mot de passe.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmNewPassword'],
  });
