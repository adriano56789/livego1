
import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ClockIcon, BellIcon, PlusIcon, CheckIcon } from './icons';
import { api } from '../services/api';
import { Streamer } from '../types';
import { webSocketManager } from '../services/websocket';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenHistory?: () => void;
    onSelectStream: (streamer: Streamer) => void;
}

interface ReminderStreamer extends Streamer {
    isSet?: boolean; // Represents "Is Following" in this context
    relationship?: 'none' | 'following' | 'friend';
    isHot?: boolean;
    desc?: string;
    startedAt?: string; 
    isLive?: boolean;
    hostId: string;
    time?: string;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, onOpenHistory, onSelectStream }) => {
    const [reminders, setReminders] = useState<ReminderStreamer[]>([]);
    const [loading, setLoading] = useState(false);

    const calculateTime = (startedAt?: string) => {
        if (!startedAt) return '0min';
        const start = new Date(startedAt).getTime();
        const now = Date.now();
        const diffMs = now - start;
        if (diffMs < 0) return '0min';

        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;

        if (hours > 0) return `${hours}h${mins}m`;
        return `${mins}min`;
    };

    const fetchReminders = () => {
        setLoading(true);
        api.getReminders().then(data => {
            setReminders(data as ReminderStreamer[]);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        if (isOpen) {
            fetchReminders();
        }
    }, [isOpen]);

    // WebSocket Listener for Real-Time "Went Live" updates
    useEffect(() => {
        const handleStreamNotification = (data: any) => {
            if (data.type === 'live_started' && data.streamer) {
                // Refresh list to show new live user at top
                fetchReminders();
            }
        };

        const handleFollowUpdate = (data: any) => {
            // Se eu segui alguém ou alguém me seguiu, atualiza a lista para refletir amigo/seguindo
            if (data.follower.id === 'me' || data.followed.id === 'me') {
                fetchReminders();
            }
        };

        webSocketManager.on('streamNotification', handleStreamNotification);
        webSocketManager.on('followUpdate', handleFollowUpdate);

        return () => {
            webSocketManager.off('streamNotification', handleStreamNotification);
            webSocketManager.off('followUpdate', handleFollowUpdate);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setReminders(prev => prev.map(item => ({
                ...item,
                time: item.startedAt && item.isLive ? `${calculateTime(item.startedAt)} online` : item.time 
            })));
        }, 60000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const handleCardClick = (item: ReminderStreamer) => {
        if (item.isLive) {
            onSelectStream(item);
            onClose();
        }
    };

    const handleToggleFollow = async (e: React.MouseEvent, item: ReminderStreamer) => {
        e.stopPropagation();
        
        // Determinar novo estado otimista
        let newRel = item.relationship;
        let newSet = item.isSet;

        if (item.relationship === 'none') {
            // Follow -> Following (ou Friend se o backend confirmar)
            newRel = 'following';
            newSet = true;
        } else {
            // Unfollow -> None
            newRel = 'none';
            newSet = false;
        }

        setReminders(prev => prev.map(r => r.hostId === item.hostId ? { ...r, isSet: newSet, relationship: newRel as any } : r));

        try {
            const response = await api.followUser('me', item.hostId);
            if (response.success) {
                // Atualiza com o estado real retornado (pode ter virado amigo)
                // O evento WS também vai disparar e atualizar, mas aqui garantimos feedback imediato
                // A lista pode reordenar no próximo fetch
            }
        } catch (error) {
            console.error("Erro ao seguir", error);
            // Revert
            setReminders(prev => prev.map(r => r.hostId === item.hostId ? { ...r, isSet: item.isSet, relationship: item.relationship } : r));
        }
    };

    const renderActionButton = (item: ReminderStreamer) => {
        if (item.relationship === 'friend') {
            return (
                <button 
                    onClick={(e) => handleToggleFollow(e, item)}
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform bg-white/10"
                >
                    <div className="flex -space-x-1">
                        <CheckIcon className="w-3 h-3 text-[#00E676]" />
                        <CheckIcon className="w-3 h-3 text-[#00E676]" />
                    </div>
                </button>
            );
        }
        if (item.relationship === 'following' || item.isSet) {
            return (
                <button 
                    onClick={(e) => handleToggleFollow(e, item)}
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform bg-white/10"
                >
                    <BellIcon className="w-4 h-4 text-[#fbbf24]" />
                </button>
            );
        }
        return (
            <button 
                onClick={(e) => handleToggleFollow(e, item)}
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform bg-[#22d3ee]"
            >
                <PlusIcon className="w-5 h-5 text-white" />
            </button>
        );
    };

    return (
        <div 
            className={`fixed inset-0 z-[60] flex justify-end transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        >
            <div className="absolute inset-0 bg-transparent" onClick={onClose} />
            <div className={`relative w-full sm:max-w-md bg-[#1C1C1E] h-full shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                     <div className="w-8"></div> 
                    <h2 className="text-white text-lg font-bold">Lembrete</h2>
                    <button onClick={onOpenHistory} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <ClockIcon className="w-6 h-6 text-white" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                    {loading ? (
                        <div className="flex justify-center mt-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reminders.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="flex items-start justify-between group cursor-pointer"
                                    onClick={() => handleCardClick(item)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative">
                                            <div className={`w-14 h-14 rounded-lg overflow-hidden bg-gray-800 border ${item.isLive ? 'border-[#00E676] ring-2 ring-[#00E676]/30' : 'border-white/5'}`}>
                                                <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            {item.isLive && (
                                                <div className="absolute top-0 right-0 bg-[#00E676] w-3 h-3 rounded-full border-2 border-[#1C1C1E] animate-pulse"></div>
                                            )}
                                            {item.isHot && !item.isLive && (
                                                <div className="absolute top-0 left-0 bg-black/60 text-emerald-400 text-[9px] px-1 font-bold backdrop-blur-sm rounded-br">HOT</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col pt-0.5">
                                            <span className="text-white font-bold text-sm">{item.name}</span>
                                            
                                            {item.isLive ? (
                                                <span className="text-[#00E676] text-xs mt-0.5 font-bold animate-pulse flex items-center gap-1">
                                                    AO VIVO • {item.time}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-xs mt-0.5 font-medium">{item.time}</span>
                                            )}

                                            {item.desc && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <div className="w-0.5 h-3 bg-gray-600"></div>
                                                    <span className="text-gray-400 text-xs truncate max-w-[150px]">{item.desc}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Botão de Ação (Seguir/Amigo) */}
                                    <div className="pt-2 pr-2">
                                         {renderActionButton(item)}
                                    </div>
                                </div>
                            ))}
                            {reminders.length === 0 && (
                                <div className="text-center text-gray-500 mt-10 text-sm">
                                    Nenhum lembrete disponível no momento.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;
