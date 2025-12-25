import React, { useState, useEffect } from 'react';
import { GoogleIcon, FacebookIcon } from './icons';
import { useTranslation } from '../i18n';
import { api } from '../services/api';

interface LoginScreenProps {
  onLogin: (user: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'register' | 'login' | 'forgotPassword' | 'resetPassword'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;
    
    setLoading(true);
    setStatusMessage({ text: '', type: '' });

    try {
      const { success, user } = await api.login({ email, password });
      if (success && user) {
        onLogin(user);
      }
    } catch (error: any) {
      setStatusMessage({ text: error.message || 'Erro ao entrar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || loading) return;

    setLoading(true);
    setStatusMessage({ text: '', type: '' });

    try {
      const { success, user } = await api.register({ name, email, password });
      if (success && user) {
        setStatusMessage({ text: 'Conta criada com sucesso! Faça login.', type: 'success' });
        setViewMode('login');
      }
    } catch (error: any) {
      setStatusMessage({ text: error.message || 'Erro ao registrar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-cover bg-center font-sans" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2070&auto=format&fit=crop')" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/90"></div>

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-6 py-8 overflow-hidden">
        
        <div className="w-full text-center mt-12 mb-4">
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">LiveGo</h1>
            <p className="text-gray-200 text-sm font-medium tracking-wide">Top Streamers, Boas Vibrações!</p>
        </div>

        <div className="w-full max-w-sm flex flex-col space-y-4">
            {statusMessage.text && (
                 <div className={`p-3 rounded-lg text-sm text-center ${statusMessage.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                    {statusMessage.text}
                 </div>
            )}

            {viewMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4 w-full">
                     <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-3.5">
                        <input 
                            className="bg-transparent w-full text-white placeholder-gray-400 outline-none text-sm" 
                            placeholder="Nome" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                        />
                     </div>
                     <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-3.5">
                        <input 
                            type="email" 
                            className="bg-transparent w-full text-white placeholder-gray-400 outline-none text-sm" 
                            placeholder="E-mail" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                        />
                     </div>
                     <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-3.5">
                        <input 
                            type="password" 
                            className="bg-transparent w-full text-white placeholder-gray-400 outline-none text-sm" 
                            placeholder="Senha" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                        />
                     </div>
                     
                     <button type="submit" disabled={loading} className="w-full bg-[#240046] hover:bg-[#320062] text-white font-bold py-3.5 rounded-full mt-2 transition-colors shadow-lg disabled:opacity-50">
                        {loading ? 'Criando...' : 'Criar conta'}
                     </button>
                </form>
            )}

            {viewMode === 'login' && (
                <form onSubmit={handleEmailLogin} className="space-y-4 w-full">
                     <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-3.5">
                        <input 
                            type="email" 
                            className="bg-transparent w-full text-white placeholder-gray-400 outline-none text-sm" 
                            placeholder="E-mail" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                        />
                     </div>
                     <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-3.5">
                        <input 
                            type="password" 
                            className="bg-transparent w-full text-white placeholder-gray-400 outline-none text-sm" 
                            placeholder="Senha" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                        />
                     </div>
                     
                     <button type="submit" disabled={loading} className="w-full bg-[#240046] hover:bg-[#320062] text-white font-bold py-3.5 rounded-full mt-2 transition-colors shadow-lg disabled:opacity-50">
                        {loading ? 'Entrando...' : 'Entrar'}
                     </button>
                </form>
            )}

            <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-gray-600/50"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs">ou</span>
                <div className="flex-grow border-t border-gray-600/50"></div>
            </div>
            
            <button type="button" className="w-full bg-white text-black font-bold py-3.5 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg">
                <GoogleIcon className="w-5 h-5 mr-3" />
                <span className="text-sm">Entrar com o Google</span>
            </button>
        </div>

        <div className="w-full max-w-sm mt-8">
            <p className="text-center text-gray-400 text-sm mb-3">
                {viewMode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button 
                onClick={() => setViewMode(viewMode === 'login' ? 'register' : 'login')}
                className="w-full bg-[#1a0b2e]/90 hover:bg-[#240046] text-white font-bold py-3.5 rounded-full transition-colors border border-purple-500/20 shadow-lg"
            >
                {viewMode === 'login' ? 'Crie uma' : 'Entrar'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
