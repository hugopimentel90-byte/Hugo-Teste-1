
import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Layout, AlertCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export const Auth: React.FC = () => {
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);
  
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isRegistering) {
            await register(name, email, password);
        } else {
            await login(email, password);
        }
    } catch (err: any) {
        setError(err.message || 'Erro de autenticação.');
    } finally {
        setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError('');
      setName('');
      setEmail('');
      setPassword('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-600/10 to-transparent dark:from-primary-900/20 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 text-center border-b border-slate-100 dark:border-slate-800">
           <div className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/20 text-white mb-4 transform transition-transform hover:scale-110">
             <Layout size={32} strokeWidth={2} />
           </div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Trellix</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm">
             {isRegistering ? 'Crie sua conta para começar' : 'Gerencie seus projetos com agilidade'}
           </p>
        </div>

        <div className="p-8">
            {/* Error Alert */}
            {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 border border-red-100 dark:border-red-900/30">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className={`space-y-4 transition-all duration-300 ${isRegistering ? 'translate-x-0' : ''}`}>
                {isRegistering && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <Input
                            label="Nome Completo"
                            type="text"
                            placeholder="Ex: João Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={isRegistering}
                        />
                    </div>
                )}
                
                <Input
                    label="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                
                <Input
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div className="pt-4">
                <Button 
                    type="submit" 
                    fullWidth 
                    disabled={loading}
                    size="lg"
                    className="h-12 font-semibold text-base shadow-lg shadow-primary-600/20 group"
                >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processando...</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        {isRegistering ? 'Criar Conta' : 'Entrar no Sistema'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                )}
                </Button>
            </div>
            </form>

            {/* Toggle Mode */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                    {isRegistering ? 'Já tem uma conta?' : 'Novo no Trellix?'}
                </p>
                <button 
                    onClick={toggleMode}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400 transition-colors px-4 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                    {isRegistering ? (
                        <>
                            <LogIn size={16} /> Voltar para Login
                        </>
                    ) : (
                        <>
                            <UserPlus size={16} /> Criar Nova Conta
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-center w-full">
        <p className="text-xs text-slate-400 dark:text-slate-600 font-medium">
           &copy; {new Date().getFullYear()} Trellix System
        </p>
      </div>
    </div>
  );
};
