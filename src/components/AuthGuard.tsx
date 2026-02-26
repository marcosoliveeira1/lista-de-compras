import { useAuth } from '../hooks/use-auth';
import { AuthScreen } from './AuthScreen';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={login} />;
  }

  return <>{children}</>;
}