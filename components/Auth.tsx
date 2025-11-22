
import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, User as UserIcon } from 'lucide-react';

export const Auth: React.FC = () => {
  const login = useStore((state) => state.login);
  
  // Form State
  const [email, setEmail] = useState(''); // Usado como Identificação (User)
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        await login(email, password);
    } catch (err: any) {
        setError(err.message || 'Acesso negado. Verifique suas credenciais.');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
      
      {/* Abstract Tech Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-100 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 opacity-70" />
        <div className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute top-[20%] -left-[10%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Header Branding */}
          <div className="pt-10 pb-6 px-8 text-center">
             <div className="inline-flex items-center justify-center p-4 bg-slate-900 dark:bg-slate-800 rounded-2xl mb-6 shadow-lg">
                <ShieldCheck size={40} className="text-white dark:text-blue-400" strokeWidth={1.5} />
             </div>
             <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
                Trellix
             </h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium uppercase tracking-wider">
                Sistema Integrado
             </p>
          </div>

          <div className="px-8 pb-10">
            
            {/* Error Notification */}
            {error && (
                <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute top-9 left-3 text-slate-400 z-10">
                            <UserIcon size={18} />
                        </div>
                        <Input
                            label="Identificação"
                            type="text"
                            placeholder="ID do Usuário (Ex: APCP)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 font-medium tracking-wide"
                            required
                            autoComplete="off"
                            autoFocus
                        />
                    </div>
                    
                    <div className="relative">
                        <div className="absolute top-9 left-3 text-slate-400 z-10">
                            <Lock size={18} />
                        </div>
                        <Input
                            label="Senha de Acesso"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        fullWidth 
                        disabled={loading}
                        size="lg"
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all h-12 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="tracking-wide text-sm">Autenticando...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <span>Acessar Sistema</span>
                            <ArrowRight size={18} />
                        </div>
                    )}
                    </Button>
                </div>
            </form>
          </div>
          
          {/* Footer / Decorative */}
          <div className="bg-slate-50 dark:bg-slate-800/50 py-3 px-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              <span>Secure Connection</span>
              <span>v2.4.0</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
             <p className="text-slate-400 dark:text-slate-600 text-xs font-medium">
                 Acesso restrito a pessoal autorizado.
             </p>
        </div>
      </div>
    </div>
  );
};
