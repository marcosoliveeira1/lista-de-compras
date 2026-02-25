import { useEffect, useState } from 'react';
import { AUTH_KEY } from '../lib/api';
import { toast } from 'sonner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyFromUrl = urlParams.get('key');
    const storedKey = localStorage.getItem(AUTH_KEY);

    if (keyFromUrl) {
      localStorage.setItem(AUTH_KEY, keyFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsAuthenticated(true);
    } else if (storedKey) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    const handleUnauthorized = () => {
      localStorage.removeItem(AUTH_KEY);
      setIsAuthenticated(false);
      toast.error('Sessão expirada ou token inválido. Você foi desconectado.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex h-[100dvh] items-center justify-center p-4 text-center bg-slate-50 selection:bg-blue-200">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-slate-900">Acesso Restrito</h1>
          <p className="text-slate-500 mb-2">
            Por favor, abra o aplicativo pelo link de acesso exclusivo enviado no WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}