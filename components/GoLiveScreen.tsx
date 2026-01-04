import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, MicIcon, CloseIcon, ChevronRightIcon, MagicIcon, SettingsIcon, CopyIcon, ChevronDownIcon } from './icons';
import { Streamer, User, ToastType } from '../types';
import { useTranslation } from '../i18n';
import { api } from '../services/api';
import BeautyEffectsPanel from './live/BeautyEffectsPanel';

interface GoLiveScreenProps {
  onClose: () => void;
  onStartStream: (streamData: Partial<Streamer>) => void;
  addToast: (type: ToastType, message: string) => void;
}

const GoLiveScreen: React.FC<GoLiveScreenProps> = ({ onClose, onStartStream, addToast }) => {
  const { t } = useTranslation();
  
  const [step, setStep] = useState<'permission_request' | 'setup'>('permission_request');
  const [permissionStep, setPermissionStep] = useState<'camera' | 'mic'>('camera');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isInitializing = useRef(false);

  const [activeTab, setActiveTab] = useState<'WebRTC' | 'RTMP' | 'SRT'>('WebRTC');
  const [isPKEnabled, setIsPKEnabled] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState('Popular');
  const [isCleanMode, setIsCleanMode] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBeautyPanelOpen, setIsBeautyPanelOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const liveCategories = [
    { id: 'Popular', label: 'Popular' },
    { id: 'Seguido', label: 'Seguido' },
    { id: 'Perto', label: 'Perto' },
    { id: 'PK', label: 'PK' },
    { id: 'Novo', label: 'Novo' },
    { id: 'Música', label: 'Música' },
    { id: 'Dança', label: 'Dança' },
    { id: 'Festa', label: 'Festa' },
    { id: 'Privada', label: 'Privada' },
  ];

  useEffect(() => {
    api.users.me().then(setCurrentUser);
  }, []);

  // Inicialização da Câmera
  useEffect(() => {
    let isActive = true;

    const initCamera = async () => {
        if (step !== 'setup' || isInitializing.current) return;
        isInitializing.current = true;

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' }, 
                audio: true 
            });

            if (!isActive) {
                mediaStream.getTracks().forEach(track => track.stop());
                return;
            }

            setStream(mediaStream);
        } catch (err) {
            console.error("Camera Init Error:", err);
            addToast(ToastType.Error, "Erro ao acessar a câmera.");
        } finally {
            isInitializing.current = false;
        }
    };

    initCamera();

    return () => {
        isActive = false;
    };
  }, [step]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
        if (video.srcObject !== stream) {
            video.srcObject = stream;
        }
        video.onloadedmetadata = () => {
            video.play().catch(e => console.warn("Video auto-play blocked:", e));
        };
    }
  }, [stream, step]);

  useEffect(() => {
      return () => {
          if (stream) {
              stream.getTracks().forEach(track => track.stop());
          }
      };
  }, [stream]);

  const handlePermissionAction = (action: 'allow' | 'once' | 'deny') => {
      if (action === 'deny') {
          onClose();
          return;
      }
      if (permissionStep === 'camera') {
          setPermissionStep('mic');
      } else {
          setStep('setup');
      }
  };

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);

    const streamData = {
        hostId: currentUser?.id || 'me',
        name: `${currentUser?.name || 'Minha'} Live`,
        avatar: currentUser?.avatarUrl || 'https://picsum.photos/200',
        thumbnail: 'https://picsum.photos/seed/live/400/600',
        isPrivate: isPrivate,
        category: isPrivate ? 'Privada' : category, // Garante que a categoria seja privada se marcado
        description: `Live de ${currentUser?.name || 'usuário'}`,
        location: currentUser?.location || 'Brasil'
    };

    try {
        const newStream = await api.streams.create(streamData);
        onStartStream(newStream);
        // CRITICAL FIX: Close the modal after redirection starts
        onClose(); 
    } catch (error) {
        addToast(ToastType.Error, "Erro ao iniciar a transmissão.");
        setIsStarting(false);
    }
  };

  const handleTogglePrivate = () => {
      const nextValue = !isPrivate;
      setIsPrivate(nextValue);
      if (nextValue) {
          setCategory('Privada');
      } else if (category === 'Privada') {
          setCategory('Popular');
      }
  };

  const handleSaveCover = () => {
      addToast(ToastType.Success, "Capa salva!");
  };

  const renderPermissionModal = () => {
    const isCamera = permissionStep === 'camera';
    const icon = isCamera ? <CameraIcon className="w-8 h-8 text-gray-300" /> : <MicIcon className="w-8 h-8 text-gray-300" />;
    const title = isCamera ? "Permitir que o app LiveGo tire fotos e grave vídeos?" : "Permitir que o app LiveGo grave áudio?";
    
    return (
      <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
        <div className="absolute inset-0 bg-transparent" onClick={onClose}></div>
        <div className="relative w-full max-w-[380px] bg-[#232323] rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col items-center text-center pt-2 pb-6">
            <div className="mb-4 text-gray-400">{icon}</div>
            <h2 className="text-white text-lg font-semibold px-4">{title}</h2>
          </div>
          <div className="flex flex-col w-full space-y-3 pb-4">
            <button onClick={() => handlePermissionAction('allow')} className="w-full py-3.5 bg-[#007AFF] rounded-full text-white font-semibold">Durante o uso do app</button>
            <button onClick={() => handlePermissionAction('once')} className="w-full py-3.5 bg-[#353535] rounded-full text-white font-semibold">Apenas esta vez</button>
            <button onClick={() => handlePermissionAction('deny')} className="w-full py-3.5 bg-[#353535] rounded-full text-white font-semibold">Não permitir</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryModal = () => (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" onClick={() => setIsCategoryModalOpen(false)}>
        <div className="absolute inset-0 bg-transparent"></div>
        <div className="w-full sm:max-w-md bg-[#1C1C1E] rounded-t-3xl p-5 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-lg font-bold">Selecionar Categoria</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-gray-400"><CloseIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {liveCategories.map((cat) => (
                    <button key={cat.id} onClick={() => { setCategory(cat.id); setIsPrivate(cat.id === 'Privada'); setIsCategoryModalOpen(false); }} className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${category === cat.id ? 'bg-[#A855F7] text-white' : 'bg-[#2C2C2E] text-gray-300'}`}>{cat.label}</button>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 flex flex-col font-sans ${step === 'setup' ? 'bg-black' : 'bg-transparent'}`}>
      {step === 'setup' && (
          <div className="absolute inset-0 bg-black" onClick={() => isCleanMode && setIsCleanMode(false)}>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} 
            />
            <div className={`absolute inset-0 bg-black/20 pointer-events-none transition-opacity duration-500 ${isCleanMode ? 'opacity-0' : 'opacity-100'}`}></div>
          </div>
      )}

      {step === 'permission_request' && renderPermissionModal()}

      {step === 'setup' && currentUser && (
        <div className="relative z-10 flex flex-col h-full safe-area-top safe-area-bottom">
            <div className="flex justify-between items-start pt-6 px-4">
                 <div className={`flex items-center gap-3 transition-all duration-300 ${isCleanMode ? 'opacity-0 translate-y-[-20px] pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                     <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
                         <img src={currentUser.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                     </div>
                     <div className="flex flex-col">
                         <h2 className="text-white font-bold text-lg drop-shadow-md">Live de {currentUser.name}</h2>
                         <button onClick={() => setIsCategoryModalOpen(true)} className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs text-white flex items-center gap-1 w-fit"># {category} <ChevronRightIcon className="w-3 h-3" /></button>
                     </div>
                     <button onClick={handleSaveCover} className="text-[#00E676] font-bold text-sm ml-2 drop-shadow-md">Salvar</button>
                 </div>
                 <div className="flex items-center gap-3">
                     <button onClick={() => setIsCleanMode(!isCleanMode)} className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${isCleanMode ? 'bg-white text-black' : 'bg-black/30 text-white'}`}><SettingsIcon className="w-5 h-5" /></button>
                     <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"><CloseIcon className="w-5 h-5" /></button>
                 </div>
            </div>

            <div className={`px-4 mt-8 transition-all duration-500 ${isCleanMode ? 'opacity-0 translate-y-10 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>
                <div className="bg-[#1e1e1e]/90 backdrop-blur-xl rounded-2xl p-1 border border-white/10 shadow-2xl">
                    <div className="flex p-1 bg-[#121212]/50 rounded-xl mb-2">
                        {['WebRTC', 'RTMP', 'SRT'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-gray-400'}`}>{tab}</button>
                        ))}
                    </div>
                    <div className="px-2 pb-2 space-y-1">
                        <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><div className="w-3 h-3 border-2 border-blue-400 rounded-[1px]"></div></div><span className="text-white text-sm font-bold">Manual de Transmissão</span></div><ChevronRightIcon className="w-4 h-4 text-gray-500" /></button>
                        <button onClick={() => setIsBeautyPanelOpen(true)} className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center"><MagicIcon className="w-3 h-3 text-pink-400" /></div><span className="text-white text-sm font-bold">Efeitos de Beleza</span></div><ChevronRightIcon className="w-4 h-4 text-gray-500" /></button>
                        <div className="w-full flex items-center justify-between p-3"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center"><span className="text-[10px] font-black text-orange-400">PK</span></div><span className="text-white text-sm font-bold">Batalha PK</span></div><div onClick={() => setIsPKEnabled(!isPKEnabled)} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isPKEnabled ? 'bg-green-500' : 'bg-gray-600'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPKEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div></div></div>
                        <div className="w-full flex items-center justify-between p-3"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center"><div className="w-3 h-3 border border-purple-400 rounded-sm"></div></div><span className="text-white text-sm font-bold">Sala Privada</span></div><div onClick={handleTogglePrivate} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isPrivate ? 'bg-green-500' : 'bg-gray-600'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPrivate ? 'translate-x-4' : 'translate-x-0'}`}></div></div></div>
                    </div>
                </div>
            </div>

            <div className="flex-1" onClick={() => isCleanMode && setIsCleanMode(false)}></div>

            <div className={`p-6 pb-8 transition-all duration-300 transform ${isCleanMode ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                <button onClick={handleStart} disabled={isStarting} className={`w-full bg-[#00E676] text-black font-black text-lg py-4 rounded-full shadow-lg shadow-green-500/20 active:scale-95 transition-all ${isStarting ? 'opacity-50 cursor-not-allowed' : ''}`}>{isStarting ? 'Conectando ao Servidor...' : 'Iniciar Transmissão'}</button>
            </div>
        </div>
      )}

      {isCategoryModalOpen && renderCategoryModal()}
      {isBeautyPanelOpen && <BeautyEffectsPanel onClose={() => setIsBeautyPanelOpen(false)} addToast={addToast} />}
    </div>
  );
};

export default GoLiveScreen;