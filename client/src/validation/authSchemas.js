import { z } from 'zod';

// Schémas de validation client. Ils DOUBLENT la validation serveur (tâche 1.1) :
// ils offrent un retour immédiat à l'utilisateur mais ne la remplacent jamais.
// Les messages sont en français (§5.2).

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères.')
      .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères.'),
    email: z
      .string()
      .trim()
      .min(1, 'L\'e-mail est requis.')
      .email('Format d\'e-mail invalide.'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'L\'e-mail est requis.')
    .email('Format d\'e-mail invalide.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'L\'e-mail est requis.').email('Format d\'e-mail invalide.'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
    confirmNewPassword: z.string().min(1, 'Veuillez confirmer le mot de passe.'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmNewPassword'],
  });
