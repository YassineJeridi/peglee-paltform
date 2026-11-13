import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères."),
  email: z.string().trim().min(1, "L'e-mail est requis.").email("Format d'e-mail invalide."),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
  role: z.enum(['student', 'admin']),
});

export const editUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères."),
  email: z.string().trim().min(1, "L'e-mail est requis.").email("Format d'e-mail invalide."),
  role: z.enum(['student', 'admin']),
});
