import React, { useRef, useState, useEffect } from 'react';
import { HeartIcon, MessageIcon, ShareIcon, MusicIcon, CameraIcon, PlusIcon, CloseIcon, SendIcon, RefreshIcon } from '../icons';
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
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <div className="w-8"></div>
                    <h3 className="text-white font-bold text-sm">{comments.length} Comentários</h3>
                    <button onClick={onClose} className="w-8 flex justify-end">
                        <CloseIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {comments.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <p className="text-sm">Nenhum comentário ainda.</p>
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
                <div className="p-3 border-t border-gray-800 bg-[#1C1C1E] safe-area-bottom">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder="Adicionar comentário..." 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="flex-1 bg-[#2C2C2E] text-white text-sm py-2.5 px-4 rounded-full outline-none placeholder-gray-500"
                        />
                        <button type="submit" disabled={!text.trim()} className={`w-10 h-10 rounded-full flex items-center justify-center ${text.trim() ? 'bg-purple-600 text-white' : 'bg-[#2C2C2E] text-gray-500'}`}>
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
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        let isActive = true;
        const startCamera = async () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }

            // SEGURANÇA: Verifica se a API de mídia existe (bloqueada em HTTP)
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error("Câmera bloqueada: Requer HTTPS ou localhost.");
                return;
            }

            try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facingMode },
                    audio: mode === 'Vídeo'
                });
                if (!isActive) {
                    newStream.getTracks().forEach(t => t.stop());
                    return;
                }
                streamRef.current = newStream;
                setStream(newStream);
            } catch (err) {
                console.error("Camera error:", err);
            }
        };

        startCamera();
        return () => {
            isActive = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [facingMode, mode]);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="fixed inset-0 z-[100] bg-black font-sans animate-in slide-in-from-bottom duration-300">
            {stream ? (
                <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center gap-4">
                    <CameraIcon className="w-12 h-12 text-gray-600" />
                    <p className="text-white font-bold">Câmera Indisponível</p>
                    <p className="text-gray-500 text-xs">O acesso à câmera requer uma conexão segura (HTTPS). Se estiver usando IP direto na VPS, o navegador bloqueia por segurança.</p>
                    <button onClick={onClose} className="mt-4 bg-white/10 px-6 py-2 rounded-full text-white text-sm font-bold">Voltar</button>
                </div>
            )}
            
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start z-20">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white"><CloseIcon className="w-6 h-6" /></button>
                <button className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-white text-xs font-bold border border-white/10"><MusicIcon className="w-3 h-3" /><span>Adicionar música</span></button>
                <button onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white"><RefreshIcon className="w-5 h-5" /></button>
            </div>

            {stream && (
                <div className="absolute bottom-0 left-0 right-0 z-20 text-white pb-8 pt-20 px-6 flex flex-col items-center justify-end bg-gradient-to-t from-black/90 via-transparent to-transparent">
                    <div className="flex gap-8 mb-8 text-sm font-bold tracking-wide">
                        <button onClick={() => setMode('Foto')} className={mode === 'Foto' ? 'text-white scale-110' : 'text-white/60'}>Foto</button>
                        <button onClick={() => setMode('Vídeo')} className={mode === 'Vídeo' ? 'text-white scale-110' : 'text-white/60'}>Vídeo</button>
                    </div>
                    <button className="w-[72px] h-[72px] rounded-full border-[4px] border-white flex items-center justify-center active:scale-95 transition-transform mb-4">
                        <div className={`rounded-full transition-all duration-300 ${mode === 'Vídeo' ? 'w-8 h-8 bg-[#ff3b5c] rounded-sm' : 'w-14 h-14 bg-white'}`}></div>
                    </button>
                </div>
            )}
        </div>
    );
};

const VideoScreen: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [comments, setComments] = useState(INITIAL_COMMENTS);

    const videoSrc = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play().catch(e => console.error(e));
        }
    };

    const handleAddComment = (text: string) => {
        setComments(prev => [{ id: Date.now(), user: 'Você', text, avatar: 'https://picsum.photos/seed/me/100' }, ...prev]);
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => setIsPlaying(false));
        }
    }, []);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden font-sans">
            {isCameraOpen && <CameraCaptureScreen onClose={() => setIsCameraOpen(false)} />}
            
            <div className="absolute inset-0" onClick={togglePlay}>
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={videoSrc}
                    loop playsInline muted
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute top-0 left-0 right-0 pt-10 px-4 flex justify-between items-center z-20">
                <h1 className="text-white font-bold text-lg drop-shadow-md">Vídeos</h1>
                <button onClick={() => setIsCameraOpen(true)} className="bg-white/10 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center text-white"><CameraIcon className="w-6 h-6" /></button>
            </div>

            <div className="absolute bottom-20 right-2 flex flex-col items-center gap-5 z-20 pb-4">
                <div className="relative mb-3">
                    <img src="https://picsum.photos/seed/mirella/200" className="w-[50px] h-[50px] rounded-full border-2 border-white object-cover" alt="" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FE2C55] w-5 h-5 rounded-full flex items-center justify-center"><PlusIcon className="w-3 h-3 text-white" strokeWidth={4} /></div>
                </div>
                <div className="flex flex-col items-center gap-1"><HeartIcon className="w-9 h-9 text-white" /><span className="text-white text-[13px] font-bold">1.2K</span></div>
                <button onClick={() => setIsCommentOpen(true)} className="flex flex-col items-center gap-1"><MessageIcon className="w-9 h-9 text-white" /><span className="text-white text-[13px] font-bold">{comments.length}</span></button>
                <div className="flex flex-col items-center gap-1"><ShareIcon className="w-8 h-8 text-white" /><span className="text-white text-[11px] font-bold">Partilhar</span></div>
            </div>

            <div className="absolute bottom-20 left-4 right-20 z-20 pointer-events-none">
                <h3 className="text-white font-bold text-[17px] mb-2 pointer-events-auto">@Arromba Mirela</h3>
                <p className="text-white text-sm leading-snug pointer-events-auto">Dia incrível na praia! #natureza #viral</p>
                <div className="flex items-center gap-2 mt-3 text-white text-xs"><MusicIcon className="w-3 h-3" /><span>Som original - Arromba Mirela</span></div>
            </div>

            <CommentModal isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} comments={comments} onAddComment={handleAddComment} />
        </div>
    );
};

export default VideoScreen;