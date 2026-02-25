import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { get, set, del } from 'idb-keyval'
import axios from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403 || error.response?.status === 401) {
            return false;
          }
        }
        return failureCount < 3;
      },
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    }
  },
})

const idbPersister = {
  persistClient: async (client: any) => {
    await set('reactQueryClient', client)
  },
  restoreClient: async () => {
    return await get('reactQueryClient')
  },
  removeClient: async () => {
    await del('reactQueryClient')
  },
} as any;

export const setupPersistence = () => {
  return persistQueryClient({
    queryClient,
    persister: idbPersister,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
}