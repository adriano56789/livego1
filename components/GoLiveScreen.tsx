
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
  
  // Steps: 'permission_request' -> 'setup'
  const [step, setStep] = useState<'permission_request' | 'setup'>('permission_request');
  const [permissionStep, setPermissionStep] = useState<'camera' | 'mic'>('camera');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Ref to hold stream for cleanup without re-renders
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Guard for camera initialization to prevent concurrent calls
  const isInitializing = useRef(false);

  // Setup State
  const [activeTab, setActiveTab] = useState<'WebRTC' | 'RTMP' | 'SRT'>('WebRTC');
  const [isPKEnabled, setIsPKEnabled] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState('Popular');
  
  // Clean Mode State (Hide UI)
  const [isCleanMode, setIsCleanMode] = useState(false);
  
  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Beauty Panel State
  const [isBeautyPanelOpen, setIsBeautyPanelOpen] = useState(false);
  
  // Loading state for start button
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
    api.getCurrentUser().then(setCurrentUser);
  }, []);

  // Robust Camera Initialization
  useEffect(() => {
    let isActive = true; // Guard: tracks if this effect instance is still active

    const initCamera = async () => {
        if (step !== 'setup') return;

        // Guard: Prevent multiple simultaneous initialization attempts
        if (isInitializing.current) return;

        // Cleanup any existing stream in ref before starting new one (just in case)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setStream(null);
        }

        isInitializing.current = true;

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' }, 
                audio: true 
            });

            // If component unmounted or dependency changed while we were waiting
            if (!isActive || step !== 'setup') {
                mediaStream.getTracks().forEach(track => track.stop());
                return;
            }

            streamRef.current = mediaStream;
            setStream(mediaStream); // Trigger re-render to update UI and video element
        } catch (err) {
            console.error("Camera Init Error:", err);
            if (isActive) {
                addToast(ToastType.Error, "Erro ao acessar a câmera. Verifique as permissões.");
            }
        } finally {
            isInitializing.current = false;
        }
    };

    if (step === 'setup') {
        initCamera();
    }

    // Cleanup function: runs on unmount or before re-running effect
    return () => {
        isActive = false;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setStream(null);
        isInitializing.current = false;
    };
  }, [step]); // Only re-run if 'step' changes

  // Bind stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
                videoRef.current.play().catch(e => console.warn("Video auto-play blocked:", e));
            }
        };
    }
  }, [stream]);

  const handlePermissionAction = (action: 'allow' | 'once' | 'deny') => {
      if (action === 'deny') {
          onClose();
          return;
      }

      if (permissionStep === 'camera') {
          setPermissionStep('mic');
      } else {
          // Mic granted, proceed to setup (which triggers effect)
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
        category: category,
        description: `Live de ${currentUser?.name || 'usuário'}`,
        location: currentUser?.location || 'Brasil'
    };

    try {
        const newStream = await api.createStream(streamData);
        onStartStream(newStream);
    } catch (error) {
        console.error("Failed to create stream:", error);
        addToast(ToastType.Error, "Erro ao iniciar a transmissão. Tente novamente.");
        setIsStarting(false);
    }
  };

  const handleSaveCover = () => {
      addToast(ToastType.Success, "Capa salva com sucesso!");
  };

  const handleTogglePrivate = () => {
      const newState = !isPrivate;
      setIsPrivate(newState);
      // Sync Category with Private Toggle
      if (newState) {
          setCategory('Privada');
      } else {
          if (category === 'Privada') {
              setCategory('Popular');
          }
      }
  };

  // --- Render Permission Modal (Bottom Sheet Style) ---
  const renderPermissionModal = () => {
    const isCamera = permissionStep === 'camera';
    const icon = isCamera ? <CameraIcon className="w-8 h-8 text-gray-300" strokeWidth={1.5} /> : <MicIcon className="w-8 h-8 text-gray-300" strokeWidth={1.5} />;
    const title = isCamera 
        ? "Permitir que o app LiveGo tire fotos e grave vídeos?" 
        : "Permitir que o app LiveGo grave áudio?";
    
    return (
      <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
        {/* Backdrop - Transparent */}
        <div className="absolute inset-0 bg-transparent" onClick={onClose}></div>

        {/* Modal Card */}
        <div className="relative w-full max-w-[380px] sm:max-w-md bg-[#232323] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 mx-0 sm:mx-4 mb-0 sm:mb-auto">
          <div className="flex flex-col items-center text-center pt-2 pb-6">
            <div className="mb-4 text-gray-400">
                {icon}
            </div>
            <h2 className="text-white text-lg font-semibold leading-relaxed px-4">
              {title}
            </h2>
          </div>

          <div className="flex flex-col w-full space-y-3 font-medium pb-4">
            <button 
                onClick={() => handlePermissionAction('allow')}
                className="w-full py-3.5 bg-[#007AFF] hover:bg-[#006bdd] active:scale-[0.98] rounded-full text-white text-[15px] font-semibold transition-all"
            >
                Durante o uso do app
            </button>
            <button 
                onClick={() => handlePermissionAction('once')}
                className="w-full py-3.5 bg-[#353535] hover:bg-[#404040] active:scale-[0.98] rounded-full text-white text-[15px] font-semibold transition-all"
            >
                Apenas esta vez
            </button>
            <button 
                onClick={() => handlePermissionAction('deny')}
                className="w-full py-3.5 bg-[#353535] hover:bg-[#404040] active:scale-[0.98] rounded-full text-white text-[15px] font-semibold transition-all"
            >
                Não permitir
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryModal = () => (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" onClick={() => setIsCategoryModalOpen(false)}>
        {/* Backdrop - Transparent */}
        <div className="absolute inset-0 bg-transparent"></div>
        <div 
            className="w-full sm:max-w-md bg-[#1C1C1E] rounded-t-3xl sm:rounded-2xl p-5 animate-in slide-in-from-bottom duration-300 relative"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-lg font-bold">Selecionar Categoria</h3>
                <button 
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                {liveCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setCategory(cat.id);
                            // Sync Private Toggle with Category
                            if (cat.id === 'Privada') {
                                setIsPrivate(true);
                            } else if (isPrivate) {
                                setIsPrivate(false);
                            }
                            setIsCategoryModalOpen(false);
                        }}
                        className={`
                            py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95
                            ${category === cat.id 
                                ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-900/40' 
                                : 'bg-[#2C2C2E] text-gray-300 hover:bg-[#3A3A3C]'
                            }
                        `}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
            <div className="h-4 sm:h-0"></div> {/* Safe area spacer */}
        </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 flex flex-col font-sans ${step === 'setup' ? 'bg-black' : 'bg-transparent'}`}>
      
      {/* 1. Camera Layer (Only visible in setup) */}
      {step === 'setup' && (
          <div className="absolute inset-0 bg-black" onClick={() => isCleanMode && setIsCleanMode(false)}>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover mirror-mode"
                style={{ transform: 'scaleX(-1)' }} 
            />
            {/* Dark overlay for text readability */}
            <div className={`absolute inset-0 bg-black/20 pointer-events-none transition-opacity duration-500 ${isCleanMode ? 'opacity-0' : 'opacity-100'}`}></div>
          </div>
      )}

      {/* 2. Permission Modal Layer */}
      {step === 'permission_request' && renderPermissionModal()}

      {/* 3. Setup Interface Layer */}
      {step === 'setup' && currentUser && (
        <div className="relative z-10 flex flex-col h-full safe-area-top safe-area-bottom pointer-events-auto">
            
            {/* Header: User Info & Close */}
            <div className="flex justify-between items-start pt-6 px-4">
                 {/* User Profile Block */}
                 <div className={`flex items-center gap-3 transition-all duration-300 ${isCleanMode ? 'opacity-0 translate-y-[-20px] pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                     <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg relative">
                         <img src={currentUser.avatarUrl} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex flex-col">
                         <h2 className="text-white font-bold text-lg leading-tight shadow-black drop-shadow-md">Live de {currentUser.name}</h2>
                         <p className="text-white/80 text-sm mb-1 shadow-black drop-shadow-md">Venha me ver!</p>
                         <button 
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs text-white flex items-center gap-1 w-fit hover:bg-white/30 transition-colors"
                         >
                             # {category} <ChevronRightIcon className="w-3 h-3" />
                         </button>
                     </div>
                     {/* Save Button */}
                     <button 
                        onClick={handleSaveCover}
                        className="text-[#00E676] font-bold text-sm ml-2 hover:text-[#00C853] transition-colors shadow-black drop-shadow-md"
                     >
                        Salvar
                     </button>
                 </div>

                 {/* Top Right Actions */}
                 <div className="flex items-center gap-3">
                     <button 
                        onClick={() => setIsCleanMode(!isCleanMode)} 
                        className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${isCleanMode ? 'bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black/30 text-white hover:bg-black/50'}`}
                     >
                        <SettingsIcon className="w-5 h-5" />
                     </button>
                     <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50">
                        <CloseIcon className="w-5 h-5" />
                     </button>
                 </div>
            </div>

            {/* Middle Controls (The "Bolivia" Room Settings Card) */}
            <div className={`px-4 mt-8 transition-all duration-500 ease-in-out ${isCleanMode ? 'opacity-0 translate-y-10 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>
                <div className="bg-[#1e1e1e]/90 backdrop-blur-xl rounded-2xl p-1 overflow-hidden border border-white/10 shadow-2xl">
                    {/* Tabs */}
                    <div className="flex p-1 bg-[#121212]/50 rounded-xl mb-2">
                        {['WebRTC', 'RTMP', 'SRT'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    activeTab === tab 
                                    ? 'bg-white text-black shadow-sm' 
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content List */}
                    <div className="px-2 pb-2 space-y-1">
                        {activeTab === 'SRT' && (
                             <div className="bg-[#2a2a2a] rounded-lg p-2 mb-2 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400 truncate max-w-[200px]">srt://localhost:1935/live</span>
                                <CopyIcon className="w-3 h-3 text-gray-400" />
                             </div>
                        )}

                        <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <div className="w-3 h-3 border-2 border-blue-400 rounded-[1px]"></div>
                                </div>
                                <span className="text-white text-sm font-bold">Manual de Transmissão ao Vivo</span>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                        </button>

                        <button 
                            onClick={() => setIsBeautyPanelOpen(true)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center">
                                    <MagicIcon className="w-3 h-3 text-pink-400" />
                                </div>
                                <span className="text-white text-sm font-bold">Efeitos de Beleza</span>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                        </button>

                        <div className="w-full flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <span className="text-[10px] font-black text-orange-400">PK</span>
                                </div>
                                <span className="text-white text-sm font-bold">Batalha PK</span>
                            </div>
                            <div 
                                onClick={() => setIsPKEnabled(!isPKEnabled)}
                                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isPKEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPKEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <div className="w-3 h-3 border border-purple-400 rounded-sm"></div>
                                </div>
                                <span className="text-white text-sm font-bold">Sala Privada</span>
                            </div>
                            <div 
                                onClick={handleTogglePrivate}
                                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isPrivate ? 'bg-green-500' : 'bg-gray-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPrivate ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div 
                className="flex-1"
                onClick={() => isCleanMode && setIsCleanMode(false)}
            >
                {/* Clickable empty space to exit clean mode easily */}
            </div>

            {/* Footer Button */}
            <div className={`p-6 pb-8 transition-all duration-300 transform ${isCleanMode ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                <button 
                    onClick={handleStart}
                    disabled={isStarting}
                    className={`w-full bg-[#00E676] hover:bg-[#00C853] text-black font-black text-lg py-4 rounded-full shadow-lg shadow-green-500/20 active:scale-95 transition-all tracking-wide ${isStarting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isStarting ? 'Iniciando...' : 'Iniciar Transmissão'}
                </button>
            </div>
        </div>
      )}

      {/* 4. Category Selection Modal */}
      {isCategoryModalOpen && renderCategoryModal()}

      {/* 5. Beauty Effects Panel */}
      {isBeautyPanelOpen && (
        <BeautyEffectsPanel 
            onClose={() => setIsBeautyPanelOpen(false)} 
            currentUser={currentUser} 
            addToast={addToast} 
        />
      )}

    </div>
  );
};

export default GoLiveScreen;
