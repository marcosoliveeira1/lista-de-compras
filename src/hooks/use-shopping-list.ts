import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { request } from '../lib/api';
import type { ShoppingItem, ShopListResponse } from '../types/index';
import { useHaptics } from './use-haptics';
import { toast } from 'sonner';
import type { ShopListId } from '../config/shoplists';

const getQueryKey = (shoplistId: ShopListId) => ['shopping-list', shoplistId] as const;
const COMPLETED_KEY = ['completed-list'];

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

export const useShoppingList = (shoplistId: ShopListId) => {
  return useQuery({
    queryKey: getQueryKey(shoplistId),
    queryFn: () => request<ShopListResponse>('GET', 'shoplist', undefined, { shoplistId }),
    staleTime: 0,
  });
};

export const useCompletedItems = () => {
  return useQuery({
    queryKey: COMPLETED_KEY,
    queryFn: async () => [] as ShoppingItem[],
    staleTime: TWENTY_FOUR_HOURS,
    gcTime: TWENTY_FOUR_HOURS,
  });
};

export const useReorderItems = (shoplistId: ShopListId) => {
  const queryClient = useQueryClient();
  const { trigger } = useHaptics();
  const queryKey = getQueryKey(shoplistId);

  return useMutation({
    mutationFn: (ids: string[]) =>
      request('PUT', 'shoplist/reorder', { ids }, { shoplistId }),
    onSuccess: () => {
      trigger('success');
    },
    onError: () => {
      trigger('error');
      toast.error('Falha ao salvar nova ordem no servidor.');
      queryClient.invalidateQueries({ queryKey });
    }
  });
};

export const useAddItem = (shoplistId: ShopListId) => {
  const queryClient = useQueryClient();
  const { trigger } = useHaptics();
  const queryKey = getQueryKey(shoplistId);

  return useMutation({
    mutationFn: (label: string) => {
      const newItem: ShoppingItem = {
        id: uuidv4(),
        label,
        checked: false
      };
      return request('POST', 'shoplist', newItem, { shoplistId });
    },
    onMutate: async (newLabel) => {
      trigger('success');
      await queryClient.cancelQueries({ queryKey });
      const previousList = queryClient.getQueryData<ShoppingItem[]>(queryKey);

      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => {
        const item: ShoppingItem = {
          id: uuidv4(),
          label: newLabel,
          checked: false,
        };
        return old ? [item, ...old] : [item];
      });

      return { previousList };
    },
    onError: (_err, _newLabel, context) => {
      trigger('error');
      toast.error('Erro ao adicionar item');
      if (context?.previousList) {
        queryClient.setQueryData(queryKey, context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useToggleItem = (shoplistId: ShopListId) => {
  const queryClient = useQueryClient();
  const { trigger } = useHaptics();
  const queryKey = getQueryKey(shoplistId);

  return useMutation({
    mutationFn: (updatedItem: ShoppingItem) =>
      request('PUT', `shoplist/${updatedItem.id}`, updatedItem, { shoplistId }),

    onMutate: async (updatedItem) => {
      trigger('nudge');
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: COMPLETED_KEY });

      const previousPending = queryClient.getQueryData<ShoppingItem[]>(queryKey) || [];
      const previousCompleted = queryClient.getQueryData<ShoppingItem[]>(COMPLETED_KEY) || [];

      if (updatedItem.checked) {
        const newPending = previousPending.filter((i) => i.id !== updatedItem.id);
        const newCompleted = [updatedItem, ...previousCompleted];

        queryClient.setQueryData(queryKey, newPending);
        queryClient.setQueryData(COMPLETED_KEY, newCompleted);
      } else {
        const newCompleted = previousCompleted.filter((i) => i.id !== updatedItem.id);
        const newPending = [updatedItem, ...previousPending];

        queryClient.setQueryData(COMPLETED_KEY, newCompleted);
        queryClient.setQueryData(queryKey, newPending);
      }

      return { previousPending, previousCompleted };
    },
    onError: (_err, _variables, context) => {
      trigger('error');
      toast.error('Erro ao atualizar item');
      if (context?.previousPending) queryClient.setQueryData(queryKey, context.previousPending);
      if (context?.previousCompleted) queryClient.setQueryData(COMPLETED_KEY, context.previousCompleted);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useDeleteItem = (shoplistId: ShopListId) => {
  const queryClient = useQueryClient();
  const { trigger } = useHaptics();
  const queryKey = getQueryKey(shoplistId);

  return useMutation({
    mutationFn: (id: string) => request('DELETE', `shoplist/${id}`, undefined, { shoplistId }),
    onMutate: async (id) => {
      trigger('nudge');
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: COMPLETED_KEY });

      const previousPending = queryClient.getQueryData<ShoppingItem[]>(queryKey) || [];
      const previousCompleted = queryClient.getQueryData<ShoppingItem[]>(COMPLETED_KEY) || [];

      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => old?.filter((i) => i.id !== id));
      queryClient.setQueryData<ShoppingItem[]>(COMPLETED_KEY, (old) => old?.filter((i) => i.id !== id));

      return { previousPending, previousCompleted };
    },
    onError: (_err, _id, context) => {
      trigger('error');
      if (context?.previousPending) queryClient.setQueryData(queryKey, context.previousPending);
      if (context?.previousCompleted) queryClient.setQueryData(COMPLETED_KEY, context.previousCompleted);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};