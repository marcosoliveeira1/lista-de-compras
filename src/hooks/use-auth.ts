import { useEffect, useState, useCallback } from 'react';
import { authStorage } from '../lib/api';
import { toast } from 'sonner';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = useCallback((key: string) => {
    if (!key.trim()) return;
    authStorage.setToken(key.trim());
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authStorage.removeToken();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyFromUrl = urlParams.get('key');
    const storedKey = authStorage.getToken();

    if (keyFromUrl) {
      login(keyFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (storedKey) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);

    const handleUnauthorized = () => {
      logout();
      toast.error('Sessão expirada ou token inválido. Você foi desconectado.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [login, logout]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}