
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ImageIcon, SendIcon, MoreIcon, CloseIcon } from '../icons';
import { User } from '../../types';
import { webSocketManager } from '../../services/websocket';
import { api } from '../../services/api';

interface PrivateChatScreenProps {
    user: User;
    onClose: () => void;
    variant?: 'page' | 'modal';
}

interface Message {
    id: number;
    text: string;
    isMe: boolean;
    timestamp: number;
}

const OptionsModal = ({ onClose, onBlock, onReport }: any) => {
    return (
        <div className="fixed inset-0 z-[140] flex items-end justify-center bg-transparent" onClick={onClose}>
            <div 
                className="w-full bg-[#1C1C1E] rounded-t-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden shadow-2xl border-t border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col">
                    <button 
                        onClick={onBlock}
                        className="w-full py-4 text-center text-[#ef4444] font-bold text-sm border-b border-white/5 hover:bg-white/5 active:bg-white/10 transition-colors"
                    >
                        Bloquear
                    </button>
                    <button 
                        onClick={onReport}
                        className="w-full py-4 text-center text-white font-bold text-sm hover:bg-white/5 active:bg-white/10 transition-colors"
                    >
                        Relatório
                    </button>
                </div>
                
                <div className="h-2 bg-[#1C1C1E] w-full"></div>

                <button 
                    onClick={onClose}
                    className="w-full py-4 bg-[#1C1C1E] text-center text-white font-bold text-sm hover:bg-white/5 active:bg-white/10 transition-colors pb-8"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

const PrivateChatScreen: React.FC<PrivateChatScreenProps> = ({ user, onClose, variant = 'modal' }) => {
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial load from API
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const msgs = await api.getChatMessages(user.id);
                if (msgs && Array.isArray(msgs)) {
                    // Adapt API messages to local state format
                    const formattedMsgs = msgs.map((m: any) => ({
                        id: m.id || Date.now(),
                        text: m.text,
                        isMe: m.isMe || m.fromUserId === 'me', // Adjust based on how mock server returns
                        timestamp: m.timestamp
                    }));
                    setMessages(formattedMsgs);
                }
            } catch (error) {
                console.error("Failed to load chat messages", error);
            }
        };
        fetchMessages();
    }, [user.id]);

    // WebSocket handling for real-time updates
    useEffect(() => {
        const handlePrivateMessage = (data: any) => {
            if (data.fromUserId === user.id) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: data.message,
                    isMe: false,
                    timestamp: Date.now()
                }]);
            }
        };

        webSocketManager.on('privateMessage', handlePrivateMessage);
        return () => {
            webSocketManager.off('privateMessage', handlePrivateMessage);
        };
    }, [user.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;

        const textToSend = messageText;
        setMessageText('');

        // Optimistic UI update
        const tempId = Date.now();
        setMessages(prev => [...prev, {
            id: tempId,
            text: textToSend,
            isMe: true,
            timestamp: Date.now()
        }]);

        try {
            await api.sendChatMessage('me', user.id, textToSend);
            webSocketManager.sendPrivateMessage(user.id, textToSend);
        } catch (error) {
            console.error("Failed to send message", error);
            // Optionally remove message or show error
        }
    };

    const handleBlock = () => {
        console.log("Bloquear usuário", user.id);
        setIsOptionsOpen(false);
    };

    const handleReport = () => {
        console.log("Reportar usuário", user.id);
        setIsOptionsOpen(false);
    };

    // Styling based on variant
    const containerClasses = variant === 'page' 
        ? "fixed inset-0 z-[130] bg-[#121212] flex flex-col" // Page Mode: Full black background
        : "fixed inset-0 z-[130] flex items-end justify-center bg-transparent"; // Modal Mode: Transparent overlay

    const contentClasses = variant === 'page'
        ? "w-full h-full flex flex-col"
        : "w-full h-[55%] bg-[#1C1C1E] rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-white/5 overflow-hidden";

    const headerClasses = variant === 'page'
        ? "flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#121212] shrink-0"
        : "flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#1C1C1E] shrink-0";

    const bgClass = variant === 'page' ? "bg-[#121212]" : "bg-[#1C1C1E]";

    return (
        <div className={containerClasses} onClick={variant === 'modal' ? onClose : undefined}>
            <div 
                className={contentClasses}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={headerClasses}>
                    <div className="flex items-center gap-3">
                        {variant === 'page' && (
                            <button onClick={onClose} className="p-1 -ml-2">
                                <ChevronLeftIcon className="w-6 h-6 text-white" />
                            </button>
                        )}
                        <div className="relative">
                            <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-white/10" alt={user.name} />
                            {user.isOnline && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00E676] rounded-full border-2 border-[#1C1C1E]"></div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white font-bold text-sm leading-tight">{user.name}</h1>
                            <span className="text-gray-400 text-[11px]">{user.isOnline ? 'Online agora' : 'Offline'}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsOptionsOpen(true)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <MoreIcon className="w-6 h-6" />
                        </button>
                        {variant === 'modal' && (
                            <button 
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Chat Body */}
                <div 
                    ref={scrollRef}
                    className={`flex-1 overflow-y-auto p-4 scrollbar-hide ${bgClass}`}
                >
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                            Comece a conversar com {user.name}
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex mb-3 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`
                                    max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium
                                    ${msg.isMe 
                                        ? 'bg-[#a855f7] text-white rounded-tr-none' 
                                        : 'bg-[#2C2C2E] text-white rounded-tl-none'
                                    }
                                `}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className={`p-3 border-t border-white/5 shrink-0 safe-area-bottom ${bgClass}`}>
                    <div className="flex items-center gap-2">
                         <button className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-gray-400 hover:text-white">
                            <ImageIcon className="w-5 h-5" />
                         </button>
                         <div className="flex-1 bg-[#2C2C2E] rounded-full flex items-center px-4 py-1">
                            <input 
                                type="text" 
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Enviar mensagem..."
                                className="flex-1 bg-transparent text-white text-sm outline-none py-2 placeholder-gray-500"
                            />
                         </div>
                         <button 
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${messageText.trim() ? 'bg-[#a855f7] text-white' : 'bg-[#2C2C2E] text-gray-500'}`}
                        >
                            <SendIcon className="w-5 h-5" />
                         </button>
                    </div>
                </div>

                {/* Options Modal */}
                {isOptionsOpen && (
                    <OptionsModal 
                        onClose={() => setIsOptionsOpen(false)}
                        onBlock={handleBlock}
                        onReport={handleReport}
                    />
                )}
            </div>
        </div>
    );
};

export default PrivateChatScreen;
