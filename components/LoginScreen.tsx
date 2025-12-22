
import React, { useState, useEffect } from 'react';
import { GoogleIcon, FacebookIcon } from './icons';
import { useTranslation } from '../i18n';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'register' | 'login' | 'forgotPassword' | 'resetPassword'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  // Verifica se o dispositivo está bloqueado ao carregar o componente
  useEffect(() => {
    const checkDeviceStatus = () => {
      if (typeof window !== 'undefined') {
        // Verifica se há um parâmetro 'blocked' na URL
        const urlParams = new URLSearchParams(window.location.search);
        const isBlockedParam = urlParams.get('blocked') === 'true';
        
        const blockedData = localStorage.getItem('device_blocked');
        if (blockedData) {
          try {
            const { reason } = JSON.parse(blockedData);
            setBlockReason(reason || 'Dispositivo bloqueado por violação dos termos de serviço');
            setIsBlocked(true);
            
            // Se veio do redirecionamento de bloqueio, exibe mensagem
            if (isBlockedParam) {
              setStatusMessage({ 
                text: 'Este dispositivo está bloqueado. Entre em contato com o suporte para mais informações.', 
                type: 'error' 
              });
            }
          } catch (e) {
            console.error('Erro ao verificar status do dispositivo:', e);
          }
        } else if (isBlockedParam) {
          // Se o parâmetro está presente mas não há bloqueio, remove o parâmetro
          const url = new URL(window.location.href);
          url.searchParams.delete('blocked');
          window.history.replaceState({}, '', url.toString());
        }
      }
    };
    
    checkDeviceStatus();
    
    // Limpa mensagens quando a view muda
    if (viewMode !== 'login') {
      setStatusMessage({ text: '', type: '' });
    }
  }, [viewMode]);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBlocked) {
      setStatusMessage({ 
        text: 'Este dispositivo está bloqueado. Entre em contato com o suporte para mais informações.', 
        type: 'error' 
      });
      return;
    }
    
    if (email && password) {
      onLogin();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      setStatusMessage({ 
        text: 'Este dispositivo está bloqueado. Não é possível criar uma nova conta.', 
        type: 'error' 
      });
      return;
    }
    
    if (name && email && password) {
      setStatusMessage({ text: t('register.success'), type: 'success' });
      setViewMode('login');
      setName('');
      setPassword('');
    }
  };

  const handleForgotPasswordRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatusMessage({ text: t('forgotPassword.emailSent'), type: 'info' });
    setTimeout(() => {
      setStatusMessage({ text: '', type: '' });
      setViewMode('resetPassword');
    }, 2500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatusMessage({ text: t('forgotPassword.passwordTooShort'), type: 'error' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setStatusMessage({ text: t('forgotPassword.passwordMismatch'), type: 'error' });
      return;
    }
    setStatusMessage({ text: t('forgotPassword.resetSuccess'), type: 'success' });
    setViewMode('login');
    setPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSocialLogin = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onLogin();
  };

  // Se o dispositivo estiver bloqueado, mostra apenas a mensagem de bloqueio
  if (isBlocked) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="text-red-500 text-5xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Acesso Bloqueado</h1>
        <p className="text-gray-300 mb-6">{blockReason}</p>
        <button
          onClick={() => window.location.href = 'mailto:suporte@livego.com?subject=Dispositivo Bloqueado'}
          className="bg-red-600 text-white py-2 px-6 rounded-full hover:bg-red-700 transition-colors"
        >
          Entrar em Contato com o Suporte
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-cover bg-center font-sans" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2070&auto=format&fit=crop')" }}>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/90"></div>

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-6 py-8 overflow-hidden">
        
        {/* Header */}
        <div className="w-full text-center mt-12 mb-4">
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">LiveGo</h1>
            <p className="text-gray-200 text-sm font-medium tracking-wide">Top Streamers, Boas Vibrações!</p>
        </div>

        {/* Content */}
        <div className="w-full max-w-sm flex flex-col space-y-4">
            {/* Status Message */}
            {statusMessage.text && (
                 <div className={`p-3 rounded-lg text-sm text-center ${statusMessage.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                    {statusMessage.text}
                 </div>
            )}

            {/* REGISTER FORM */}
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
                     
                     <button type="submit" className="w-full bg-[#240046] hover:bg-[#320062] text-white font-bold py-3.5 rounded-full mt-2 transition-colors shadow-lg">
                        Criar conta
                     </button>
                </form>
            )}

            {/* LOGIN FORM */}
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
                     
                     <div className="flex justify-end pr-2">
                        <button type="button" onClick={() => setViewMode('forgotPassword')} className="text-xs text-white hover:text-gray-200 font-medium">
                            Esqueceu a senha?
                        </button>
                     </div>

                     <button type="submit" className="w-full bg-[#240046] hover:bg-[#320062] text-white font-bold py-3.5 rounded-full mt-2 transition-colors shadow-lg">
                        Entrar
                     </button>
                </form>
            )}
            
            {/* FORGOT PASSWORD FORM */}
            {viewMode === 'forgotPassword' && (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4 w-full">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-white mb-2">Redefinir senha</h2>
                        <p className="text-gray-300 text-xs">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
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

                     <button type="submit" className="w-full bg-[#240046] hover:bg-[#320062] text-white font-bold py-3.5 rounded-full mt-2 transition-colors shadow-lg">
                        Enviar link de redefinição
                     </button>

                     <button type="button" onClick={() => setViewMode('login')} className="w-full text-center text-white mt-4 text-sm font-semibold hover:underline">
                        Voltar para o login
                     </button>
                </form>
            )}

            {/* RESET PASSWORD FORM */}
             {viewMode === 'resetPassword' && (
                <form onSubmit={handleResetPassword} className="space-y-4 w-full">
                    <div className="mb-4">
                         <h2 className="text-xl font-bold text-white mb-2">Nova Senha</h2>
                         <p className="text-gray-300 text-xs">Crie uma nova senha para sua conta.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-3.5">
                        <input 
                            type="password" 
                            className="bg-transparent w-full text-white placeholder-gray-400 outline-none text-sm" 
                            placeholder="Nova senha" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                        />
                     </div>
                     <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-3.5">
                        <input 
                            type="password" 
                            className="bg-transparent w-full text-white placeholder-gray-400 outline-none text-sm" 
                            placeholder="Confirmar senha" 
                            value={confirmNewPassword} 
                            onChange={e => setConfirmNewPassword(e.target.value)} 
                        />
                     </div>

                     <button type="submit" className="w-full bg-[#240046] hover:bg-[#320062] text-white font-bold py-3.5 rounded-full mt-2 transition-colors shadow-lg">
                        Salvar Nova Senha
                     </button>
                </form>
            )}

            {/* Social Login Section */}
            {(viewMode === 'login' || viewMode === 'register') && (
                <>
                    <div className="relative flex py-4 items-center">
                        <div className="flex-grow border-t border-gray-600/50"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-xs">ou</span>
                        <div className="flex-grow border-t border-gray-600/50"></div>
                    </div>
                    
                    <button type="button" onClick={handleSocialLogin} className="w-full bg-white text-black font-bold py-3.5 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg">
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        <span className="text-sm">Entrar com o Google</span>
                    </button>

                    <div className="flex justify-center mt-4">
                        <button type="button" onClick={handleSocialLogin} className="bg-[#3b5998] p-3 rounded-full shadow-lg transition-transform active:scale-95 hover:bg-[#2d4373]">
                            <FacebookIcon className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </>
            )}
        </div>

        {/* Footer Switcher */}
        <div className="w-full max-w-sm mt-8">
            {(viewMode === 'login' || viewMode === 'register') && (
                <>
                    <p className="text-center text-gray-400 text-sm mb-3">
                        {viewMode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    </p>
                    <button 
                        onClick={() => setViewMode(viewMode === 'login' ? 'register' : 'login')}
                        className="w-full bg-[#1a0b2e]/90 hover:bg-[#240046] text-white font-bold py-3.5 rounded-full transition-colors border border-purple-500/20 shadow-lg"
                    >
                        {viewMode === 'login' ? 'Crie uma' : 'Entrar'}
                    </button>
                </>
            )}
            
            <p className="text-[10px] text-gray-500 text-center mt-6 px-4 leading-relaxed">
                Login/registro significa que você leu e concorda com o <a href="#" className="underline hover:text-gray-400">Contrato do Usuário</a> e a <a href="#" className="underline hover:text-gray-400">Política de Privacidade</a>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
