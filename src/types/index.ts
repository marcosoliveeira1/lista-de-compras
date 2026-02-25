import { z } from "zod";

export const ShopListItemSchema = z.object({
  id: z.uuid(),
  label: z.string().min(1, "Nome do item obrigatório"),
  checked: z.boolean().default(false)
});

export type ShoppingItem = z.infer<typeof ShopListItemSchema>;

export type ShopListResponse = ShoppingItem[];