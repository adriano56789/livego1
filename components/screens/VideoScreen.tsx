
import React, { useRef, useState, useEffect } from 'react';
import { HeartIcon, MessageIcon, ShareIcon, MusicIcon, CameraIcon, PlusIcon, CloseIcon, SendIcon, UserIcon, RefreshIcon } from '../icons';
import { useTranslation } from '../../i18n';

// Mock Data for Comments
const INITIAL_COMMENTS = [
  { id: 1, user: 'João Silva', text: 'Que lugar lindo! 😍', avatar: 'https://picsum.photos/seed/joao/100' },
  { id: 2, user: 'Ana Paula', text: 'Adorei o vídeo!', avatar: 'https://picsum.photos/seed/ana/100' },
];

const CommentModal = ({ isOpen, onClose, comments, onAddComment }: any) => {
    const [text, setText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAddComment(text);
            setText('');
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-end transition-colors duration-300 ${isOpen ? 'bg-transparent' : 'pointer-events-none bg-transparent'}`} 
            onClick={onClose}
        >
            <div 
                className={`bg-[#1C1C1E] w-full h-[60%] rounded-t-2xl flex flex-col relative z-10 transform transition-transform duration-300 ease-in-out shadow-2xl border-t border-white/5 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <div className="w-8"></div> {/* Spacer */}
                    <h3 className="text-white font-bold text-sm">{comments.length} Comentários</h3>
                    <button onClick={onClose} className="w-8 flex justify-end">
                        <CloseIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {comments.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <p className="text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
                        </div>
                    ) : (
                        comments.map((c: any) => (
                            <div key={c.id} className="flex items-start gap-3">
                                <img src={c.avatar} className="w-8 h-8 rounded-full object-cover border border-white/10" alt={c.user} />
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs font-bold mb-0.5">{c.user}</p>
                                    <p className="text-white text-sm leading-snug">{c.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Input */}
                <div className="p-3 border-t border-gray-800 bg-[#1C1C1E] safe-area-bottom">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder="Adicionar comentário..." 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="flex-1 bg-[#2C2C2E] text-white text-sm py-2.5 px-4 rounded-full outline-none placeholder-gray-500 focus:ring-1 focus:ring-gray-600 transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={!text.trim()}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${text.trim() ? 'bg-purple-600 text-white' : 'bg-[#2C2C2E] text-gray-500'}`}
                        >
                            <SendIcon className="w-4 h-4 ml-0.5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const CameraCaptureScreen = ({ onClose }: { onClose: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mode, setMode] = useState<'Foto' | 'Vídeo'>('Foto');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [stream, setStream] = useState<MediaStream | null>(null);
    
    // Refs for robust stream handling
    const streamRef = useRef<MediaStream | null>(null);
    const isInitializing = useRef(false);

    useEffect(() => {
        let isActive = true;

        const startCamera = async () => {
            // Guard: Prevent concurrent initializations
            if (isInitializing.current) return;

            // Cleanup any existing stream before starting
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
                setStream(null);
            }

            isInitializing.current = true;

            try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facingMode },
                    audio: mode === 'Vídeo'
                });

                // If component unmounted or dependencies changed during await
                if (!isActive) {
                    newStream.getTracks().forEach(t => t.stop());
                    return;
                }

                streamRef.current = newStream;
                setStream(newStream);
            } catch (err) {
                console.error("Camera error:", err);
            } finally {
                isInitializing.current = false;
            }
        };

        startCamera();

        return () => {
            isActive = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            setStream(null);
            isInitializing.current = false;
        };
    }, [facingMode, mode]);

    // Separate effect for binding video to prevent race conditions in rendering
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(e => console.log("Play error", e));
            };
        }
    }, [stream]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black font-sans animate-in slide-in-from-bottom duration-300">
            {/* Camera View - Full Screen */}
            <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            
            {/* Top Controls Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-colors">
                    <CloseIcon className="w-6 h-6 text-white drop-shadow-md" />
                </button>
                
                <button className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-white text-xs font-bold border border-white/10 hover:bg-black/50 transition-colors">
                    <MusicIcon className="w-3 h-3" />
                    <span>Adicionar música</span>
                </button>

                <div className="flex flex-col gap-4">
                    <button onClick={toggleCamera} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-colors">
                        <RefreshIcon className="w-5 h-5 text-white drop-shadow-md" />
                    </button>
                </div>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 text-white pb-8 pt-20 px-6 flex flex-col items-center justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                <div className="pointer-events-auto w-full flex flex-col items-center">
                    {/* Mode Selector */}
                    <div className="flex gap-8 mb-8 text-sm font-bold tracking-wide">
                        <button 
                            onClick={() => setMode('Foto')} 
                            className={`transition-colors drop-shadow-md ${mode === 'Foto' ? 'text-white scale-110' : 'text-white/60 hover:text-white/80'}`}
                        >
                            Foto
                        </button>
                        <button 
                            onClick={() => setMode('Vídeo')} 
                            className={`transition-colors drop-shadow-md ${mode === 'Vídeo' ? 'text-white scale-110' : 'text-white/60 hover:text-white/80'}`}
                        >
                            Vídeo
                        </button>
                    </div>

                    {/* Shutter Button */}
                    <button className="w-[72px] h-[72px] rounded-full border-[4px] border-white flex items-center justify-center active:scale-95 transition-transform mb-4 shadow-lg shadow-black/20">
                        <div className={`w-[60px] h-[60px] rounded-full transition-all duration-300 ${mode === 'Vídeo' ? 'bg-[#ff3b5c] scale-50 rounded-lg' : 'bg-white scale-90'}`}></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

const VideoScreen: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false); // Default to false to show play button if autoPlay fails
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [comments, setComments] = useState(INITIAL_COMMENTS);

    // Reliable video source (Google TV Sample)
    const videoSrc = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
    const posterSrc = "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg";

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                // State update handled by onPause event
            } else {
                videoRef.current.play().catch(e => console.error("Play error:", e));
                // State update handled by onPlay event
            }
        }
    };

    const handleAddComment = (text: string) => {
        const newComment = {
            id: Date.now(),
            user: 'Você',
            text,
            avatar: 'https://picsum.photos/seed/me/100'
        };
        setComments(prev => [...prev, newComment]);
    };

    // Auto-play on mount
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const attemptPlay = async () => {
            try {
                video.muted = true; // Ensure muted for autoplay compliance
                await video.play();
            } catch (error) {
                console.log("Autoplay blocked or failed:", error);
                setIsPlaying(false);
            }
        };

        // Try to play immediately if ready, or wait for event
        if (video.readyState >= 3) {
            attemptPlay();
        } else {
            video.addEventListener('canplay', attemptPlay, { once: true });
        }
    }, []);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden font-sans">
            {/* Camera Overlay */}
            {isCameraOpen && <CameraCaptureScreen onClose={() => setIsCameraOpen(false)} />}

            <style>
                {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-spin-slow {
                    animation: spin 5s linear infinite;
                }
                .animate-marquee {
                    display: inline-block;
                    white-space: nowrap;
                    animation: marquee 10s linear infinite;
                }
                `}
            </style>

            {/* Video Background Layer */}
            <div className="absolute inset-0 bg-gray-900" onClick={togglePlay}>
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={videoSrc}
                    poster={posterSrc}
                    loop
                    playsInline
                    muted
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onWaiting={() => console.log("Video buffering...")}
                    onError={(e) => console.log("Video loading error", e.currentTarget.error?.message)}
                />
                
                {/* Play/Pause Icon Overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-in zoom-in duration-200">
                            <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 pt-10 px-4 flex justify-between items-center z-20 pointer-events-none">
                <h1 className="text-white font-bold text-lg drop-shadow-md">Vídeos</h1>
                <button 
                    onClick={() => setIsCameraOpen(true)}
                    className="bg-white/10 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto active:bg-white/20 transition-colors"
                >
                    <CameraIcon className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Right Sidebar Actions */}
            <div className="absolute bottom-6 right-2 flex flex-col items-center gap-5 z-20 pointer-events-auto pb-4">
                {/* Avatar with Follow Button */}
                <div className="relative mb-3">
                    <div className="w-[50px] h-[50px] rounded-full p-[1.5px] bg-white shadow-lg overflow-hidden">
                        <img 
                            src="https://picsum.photos/seed/mirella/200" 
                            alt="Mirella" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#FE2C55] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                        <PlusIcon className="w-3 h-3 text-white" strokeWidth={4} />
                    </div>
                </div>

                {/* Likes */}
                <div className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform">
                    <HeartIcon className="w-9 h-9 text-white drop-shadow-lg" strokeWidth={1.5} />
                    <span className="text-white text-[13px] font-bold drop-shadow-md shadow-black">1.2K</span>
                </div>

                {/* Comments */}
                <button 
                    onClick={() => setIsCommentOpen(true)}
                    className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform"
                >
                    <MessageIcon className="w-9 h-9 text-white drop-shadow-lg" strokeWidth={1.5} />
                    <span className="text-white text-[13px] font-bold drop-shadow-md shadow-black">{comments.length}</span>
                </button>

                {/* Share */}
                <div className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform">
                    <ShareIcon className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={1.5} />
                    <span className="text-white text-[11px] font-bold drop-shadow-md shadow-black">Partilhar</span>
                </div>

                {/* Spinning Music Disc */}
                <div className="mt-4 relative">
                    <div className={`w-12 h-12 bg-[#222] rounded-full flex items-center justify-center border-[8px] border-[#161616] ${isPlaying ? 'animate-spin-slow' : ''}`}>
                         <img 
                            src="https://picsum.photos/seed/mirella/200" 
                            className="w-6 h-6 rounded-full object-cover"
                         />
                    </div>
                </div>
            </div>

            {/* Bottom Info Area */}
            <div className="absolute bottom-6 left-4 right-20 z-20 flex flex-col gap-3 pointer-events-none">
                <div className="flex flex-col items-start text-left max-w-full">
                    {/* Username clickable */}
                    <div className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded mb-2 pointer-events-auto">
                        <h3 className="text-white font-bold text-[17px] drop-shadow-lg shadow-black leading-tight break-words whitespace-normal">
                            @Arromba Mirela
                        </h3>
                    </div>
                    
                    {/* Description */}
                    <div className="pointer-events-auto w-full max-h-[120px] overflow-y-auto pr-2 scrollbar-hide overscroll-contain">
                        <p className="text-white text-[15px] drop-shadow-md leading-snug break-words whitespace-pre-wrap">
                            Descrição do vídeo aqui! Olhem essa paisagem incrível que encontrei hoje. A natureza é surpreendente e cheia de vida.
                            Vou escrever mais um pouco aqui para garantir que o texto seja longo o suficiente para ativar a rolagem e testar a funcionalidade corretamente.
                            Role para baixo para ver mais detalhes sobre este vídeo maravilhoso! <span className="font-bold">#natureza #viral #paisagem #video #scroll</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="flex items-center gap-2 px-0 py-1">
                        <MusicIcon className="w-4 h-4 text-white drop-shadow-md" />
                        <div className="overflow-hidden w-40 flex">
                             <div className="animate-marquee pl-full">
                                <span className="text-white text-[14px] font-medium mr-8">Som original - Arromba Mirela</span>
                                <span className="text-white text-[14px] font-medium mr-8">Som original - Arromba Mirela</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Modal */}
            <CommentModal 
                isOpen={isCommentOpen} 
                onClose={() => setIsCommentOpen(false)} 
                comments={comments}
                onAddComment={handleAddComment}
            />
        </div>
    );
};

export default VideoScreen;
