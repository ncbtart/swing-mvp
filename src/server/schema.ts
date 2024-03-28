import { z } from "zod";

export const paginationSchema = z.object({
  skip: z.number().min(0).default(0), // Nombre d'éléments à sauter (pour la pagination)
  take: z.number().min(1).max(100).default(10), // Nombre d'éléments à prendre (taille de page)
});
