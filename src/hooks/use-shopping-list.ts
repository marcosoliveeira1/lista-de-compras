import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { request } from '../lib/api';
import type { ShoppingItem, ShopListResponse } from '../types/index';

const QUERY_KEY = ['shopping-list'];
const COMPLETED_KEY = ['completed-list'];
const LOCAL_COMPLETED_STORAGE_KEY = 'shoplist_completed_items';

const getLocalCompleted = (): ShoppingItem[] => {
  try {
    const data = localStorage.getItem(LOCAL_COMPLETED_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocalCompleted = (items: ShoppingItem[]) => {
  localStorage.setItem(LOCAL_COMPLETED_STORAGE_KEY, JSON.stringify(items));
};

export const useShoppingList = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => request<ShopListResponse>('GET', 'shoplist'),
  });
};

export const useCompletedItems = () => {
  return useQuery({
    queryKey: COMPLETED_KEY,
    queryFn: getLocalCompleted,
    initialData: getLocalCompleted,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useAddItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (label: string) => {
      const newItem: ShoppingItem = {
        id: uuidv4(),
        label,
        checked: false
      };
      return request('POST', 'shoplist', newItem);
    },
    onMutate: async (newLabel) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousList = queryClient.getQueryData<ShoppingItem[]>(QUERY_KEY);

      queryClient.setQueryData<ShoppingItem[]>(QUERY_KEY, (old) => {
        const item: ShoppingItem = {
          id: uuidv4(),
          label: newLabel,
          checked: false,
        };
        return old ? [...old, item] : [item];
      });

      return { previousList };
    },
    onError: (_err, _newLabel, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(QUERY_KEY, context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useToggleItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedItem: ShoppingItem) =>
      request('PUT', `shoplist/${updatedItem.id}`, updatedItem),

    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: COMPLETED_KEY });

      const previousPending = queryClient.getQueryData<ShoppingItem[]>(QUERY_KEY) || [];
      const previousCompleted = queryClient.getQueryData<ShoppingItem[]>(COMPLETED_KEY) || getLocalCompleted();

      if (updatedItem.checked) {
        const newPending = previousPending.filter((i) => i.id !== updatedItem.id);
        const newCompleted = [updatedItem, ...previousCompleted];

        queryClient.setQueryData(QUERY_KEY, newPending);
        queryClient.setQueryData(COMPLETED_KEY, newCompleted);
        setLocalCompleted(newCompleted);
      } else {
        const newCompleted = previousCompleted.filter((i) => i.id !== updatedItem.id);
        const newPending = [...previousPending, updatedItem];

        queryClient.setQueryData(COMPLETED_KEY, newCompleted);
        queryClient.setQueryData(QUERY_KEY, newPending);
        setLocalCompleted(newCompleted);
      }

      return { previousPending, previousCompleted };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPending) queryClient.setQueryData(QUERY_KEY, context.previousPending);
      if (context?.previousCompleted) {
        queryClient.setQueryData(COMPLETED_KEY, context.previousCompleted);
        setLocalCompleted(context.previousCompleted);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => request('DELETE', `shoplist/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: COMPLETED_KEY });

      const previousPending = queryClient.getQueryData<ShoppingItem[]>(QUERY_KEY) || [];
      const previousCompleted = queryClient.getQueryData<ShoppingItem[]>(COMPLETED_KEY) || getLocalCompleted();

      queryClient.setQueryData<ShoppingItem[]>(QUERY_KEY, (old) => old?.filter((i) => i.id !== id));
      queryClient.setQueryData<ShoppingItem[]>(COMPLETED_KEY, (old) => {
        const newCompleted = old?.filter((i) => i.id !== id) || [];
        setLocalCompleted(newCompleted);
        return newCompleted;
      });

      return { previousPending, previousCompleted };
    },
    onError: (_err, _id, context) => {
      if (context?.previousPending) queryClient.setQueryData(QUERY_KEY, context.previousPending);
      if (context?.previousCompleted) {
        queryClient.setQueryData(COMPLETED_KEY, context.previousCompleted);
        setLocalCompleted(context.previousCompleted);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};