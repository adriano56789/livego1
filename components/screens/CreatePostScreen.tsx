
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CloseIcon, RefreshIcon, ChevronLeftIcon, SendIcon } from '../icons';
import { ToastType, User } from '../../types';
import { api } from '../../services/api';

interface CreatePostScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onPostComplete: (updatedUser: User) => void;
  addToast: (type: ToastType, message: string) => void;
  currentUser: User;
  initialMusic: any; // Mantido na interface para compatibilidade, mas ignorado
}

const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ isOpen, onClose, onPostComplete, addToast }) => {
  const [isPosting, setIsPosting] = useState(false);
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  const [mode, setMode] = useState<'photo' | 'video'>('video');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video'; blob: Blob } | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);

  // Inicialização da Câmera
  const startCamera = useCallback(async () => {
    if (!isOpen) return;

    // Se já existe stream e está ativo, não recria a menos que necessário
    if (mediaStreamRef.current && mediaStreamRef.current.active) {
        const currentVideoTrack = mediaStreamRef.current.getVideoTracks()[0];
        const currentSettings = currentVideoTrack?.getSettings();
        // Se o modo da câmera (frente/trás) não mudou, reutiliza
        if (currentSettings && currentSettings.facingMode === facingMode) {
            if (videoRef.current && !videoRef.current.srcObject) {
                videoRef.current.srcObject = mediaStreamRef.current;
            }
            return;
        }
    }

    // Limpa stream anterior se existir (troca de câmera)
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsStreamReady(false);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true 
        });
        
        mediaStreamRef.current = stream;

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Aguarda metadados para evitar telas pretas/piscadas
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(e => console.log("Play error", e));
                setIsStreamReady(true);
            };
        }
    } catch (err) {
        console.error("[Camera] Error:", err);
        addToast(ToastType.Error, "Erro ao acessar câmera.");
    }
  }, [isOpen, facingMode, addToast]);

  // Gerencia ciclo de vida da câmera
  useEffect(() => {
    if (isOpen) {
        startCamera();
    } else {
        // Cleanup completo ao fechar o modal
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setMediaPreview(null);
        setIsRecording(false);
        setIsStreamReady(false);
    }
  }, [isOpen, startCamera]);

  const handleFlipCamera = () => {
    if (isRecording) return;
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !isStreamReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
        if(blob) {
            setMediaPreview({ url: URL.createObjectURL(blob), type: 'image', blob });
        }
    }, 'image/jpeg', 0.8);
  };

  const startRecording = () => {
    if (!mediaStreamRef.current || !isStreamReady) return;
    setIsRecording(true);
    recordedChunksRef.current = [];
    
    try {
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
            ? 'video/webm;codecs=vp9' 
            : 'video/webm';

        mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, { 
            mimeType,
            videoBitsPerSecond: 2500000 
        });
        
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };
        
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            setMediaPreview({ url: URL.createObjectURL(blob), type: 'video', blob });
        };
        
        mediaRecorderRef.current.start(100); 
    } catch (e) {
        console.error("Recording error:", e);
        setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleCapture = () => {
    if (!isStreamReady) return;
    if (mode === 'photo') {
      takePhoto();
    } else {
      if (isRecording) stopRecording();
      else startRecording();
    }
  };

  const handlePost = async () => {
    if (isPosting || !mediaPreview) return;
    setIsPosting(true);

    try {
      // Converte para base64 para envio (simulado)
      const mediaDataUrl = await blobToBase64(mediaPreview.blob);
      
      const payload = {
        mediaData: mediaDataUrl,
        type: mediaPreview.type,
        description: "Novo post da câmera", // Descrição automática ou vazia
      };

      const { success, user } = await api.createFeedPost(payload);
      if (success && user) {
        addToast(ToastType.Success, "Enviado com sucesso!");
        onPostComplete(user);
        onClose();
      } else {
        throw new Error("Falha no envio.");
      }
    } catch (error) {
      console.error(error);
      addToast(ToastType.Error, "Erro ao enviar.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleRetake = () => {
      setMediaPreview(null);
      // Reativa o vídeo se necessário (se não foi desmontado)
      if (videoRef.current && mediaStreamRef.current) {
          videoRef.current.play().catch(() => {});
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="relative flex-1 bg-black overflow-hidden">
        
        {/* Preview Mode */}
        {mediaPreview ? (
          <div className="relative w-full h-full flex flex-col">
            {mediaPreview.type === 'image' ? (
              <img src={mediaPreview.url} className="flex-1 w-full h-full object-contain bg-black" alt="Preview" />
            ) : (
              <video 
                src={mediaPreview.url} 
                autoPlay 
                loop 
                playsInline 
                className="flex-1 w-full h-full object-contain bg-black" 
                onError={(e) => console.log("Preview Error:", e.currentTarget.error?.message)}
              />
            )}
            
            {/* Actions Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
               <button onClick={handleRetake} className="text-white font-bold px-6 py-3 rounded-full bg-white/20 backdrop-blur-md">
                   Refazer
               </button>
               <button 
                 onClick={handlePost} 
                 disabled={isPosting}
                 className="flex items-center gap-2 bg-[#FE2C55] text-white font-bold px-8 py-3 rounded-full shadow-lg disabled:opacity-50"
               >
                   {isPosting ? 'Enviando...' : <>Enviar <SendIcon className="w-4 h-4" /></>}
               </button>
            </div>
          </div>
        ) : (
          // Capture Mode
          <>
            <video 
                ref={videoRef} 
                // Removed autoPlay to prevent error if source is missing. Play is called in onloadedmetadata.
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-opacity duration-300 ${isStreamReady ? 'opacity-100' : 'opacity-0'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                onError={(e) => console.log("Camera Video Error:", e.currentTarget.error?.message)}
            />
            
            {!isStreamReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                </div>
            )}

            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-6 flex justify-between z-20">
              <button onClick={onClose} className="w-10 h-10 bg-black/20 backdrop-blur rounded-full flex items-center justify-center text-white">
                  <CloseIcon className="w-6 h-6" />
              </button>
              <button onClick={handleFlipCamera} disabled={isRecording} className="w-10 h-10 bg-black/20 backdrop-blur rounded-full flex items-center justify-center text-white">
                  <RefreshIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 pb-12 pt-20 flex flex-col items-center bg-gradient-to-t from-black/60 to-transparent">
              {/* Mode Switcher */}
              <div className="flex gap-6 mb-8">
                <button 
                    onClick={() => !isRecording && setMode('photo')} 
                    className={`font-bold text-sm transition-colors ${mode === 'photo' ? 'text-white bg-white/20 px-3 py-1 rounded-full' : 'text-white/60'}`}
                >
                    FOTO
                </button>
                <button 
                    onClick={() => !isRecording && setMode('video')} 
                    className={`font-bold text-sm transition-colors ${mode === 'video' ? 'text-white bg-white/20 px-3 py-1 rounded-full' : 'text-white/60'}`}
                >
                    VÍDEO
                </button>
              </div>
              
              {/* Shutter Button */}
              <button 
                onClick={handleCapture}
                disabled={!isStreamReady}
                className={`
                    w-20 h-20 rounded-full border-[5px] border-white/40 flex items-center justify-center
                    transition-all duration-200 active:scale-95
                    ${!isStreamReady ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
                `}
              >
                <div className={`
                    rounded-full transition-all duration-300
                    ${mode === 'video' 
                        ? (isRecording ? 'w-8 h-8 bg-red-500 rounded-sm' : 'w-16 h-16 bg-red-500') 
                        : 'w-16 h-16 bg-white'
                    }
                `}></div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreatePostScreen;
