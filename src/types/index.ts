import { z } from "zod";

export const ShopListItemSchema = z.object({
  id: z.uuid(),
  label: z.string().min(1, "Nome do item obrigatório"),
  checked: z.boolean().default(false),
  maxValue: z.number().positive().optional(),
  order: z.number().optional(),
  // 1 = prioritário, 0 = neutro, -1 = pode esperar
  priority: z.union([z.literal(1), z.literal(0), z.literal(-1)]).optional(),
  createdAt: z.string().optional()
});

export type ShoppingItem = z.infer<typeof ShopListItemSchema>;

export type ShopListResponse = ShoppingItem[];