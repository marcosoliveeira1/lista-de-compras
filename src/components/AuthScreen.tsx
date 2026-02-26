import { useState } from 'react';
import { toast } from 'sonner';

interface AuthScreenProps {
  onLogin: (key: string) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [showInput, setShowInput] = useState(false);
  const [manualKey, setManualKey] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = manualKey.trim();
    if (!key) return;
    
    onLogin(key);
    toast.success('Chave configurada com sucesso!');
  };

  return (
    <div className="flex h-[100dvh] items-center justify-center p-4 text-center bg-slate-50 selection:bg-blue-200">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-sm w-full">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-slate-900">Acesso Restrito</h1>
        <p className="text-slate-500 mb-6 text-sm">
          Por favor, abra o aplicativo pelo link de acesso exclusivo enviado no WhatsApp.
        </p>

        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors py-2 px-4 rounded-lg hover:bg-blue-50 active:scale-95"
          >
            Inserir chave manualmente
          </button>
        ) : (
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder="Cole sua chave aqui..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm text-center"
              autoFocus
            />
            <button
              type="submit"
              disabled={!manualKey.trim()}
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-95"
            >
              Acessar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}