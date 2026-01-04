import React, { useState, useEffect, useRef, useMemo } from 'react';
import OnlineUsersModal from './live/OnlineUsersModal';
import ChatMessage from './live/ChatMessage';
import CoHostModal from './CoHostModal';
import EntryChatMessage from './live/EntryChatMessage';
import ToolsModal from './ToolsModal';
import { GiftIcon, SendIcon, MoreIcon, CloseIcon, ViewerIcon, BellIcon, LockIcon } from './icons';
import { Streamer, User, Gift, RankedUser, LiveSessionState, ToastType } from '../types';
import ContributionRankingModal from './ContributionRankingModal';
import BeautyEffectsPanel from './live/BeautyEffectsPanel';
import ResolutionPanel from './live/ResolutionPanel';
import GiftModal from './live/GiftModal';
import GiftAnimationOverlay, { GiftPayload } from './live/GiftAnimationOverlay';
import { useTranslation } from '../i18n';
import { api } from '../services/api';
import { webSocketManager } from '../services/websocket';
import FullScreenGiftAnimation from './live/FullScreenGiftAnimation';
import PrivateInviteModal from './live/PrivateInviteModal';
import SupportersBar from './live/SupportersBar';

interface ChatMessageType {
    id: number;
    type: 'chat' | 'entry' | 'follow' | 'private_invite';
    user?: string;
    level?: number;
    message?: string | React.ReactNode;
    avatar?: string;
    fullUser?: User;
    inviteData?: {
        fromName: string;
        toName: string;
        streamId: string;
    };
}

interface PKBattleScreenProps {
    streamer: Streamer;
    opponent: User;
    onEndPKBattle: () => void;
    onRequestEndStream: () => void;
    onLeaveStreamView: () => void;
    onViewProfile: (user: User) => void;
    currentUser: User;
    onOpenWallet: (initialTab?: 'Diamante' | 'Ganhos') => void;
    onFollowUser: (user: User, streamId?: string) => void;
    onOpenPrivateChat: () => void;
    onOpenPrivateInviteModal: () => void;
    setActiveScreen: (screen: 'main' | 'profile' | 'messages' | 'video') => void;
    onStartChatWithStreamer: (user: User) => void;
    onOpenPKTimerSettings: () => void;
    onOpenFans: () => void;
    onOpenFriendRequests: () => void;
    liveSession: LiveSessionState | null;
    updateLiveSession: (updates: Partial<LiveSessionState>) => void;
    logLiveEvent: (type: string, data: any) => void;
    updateUser: (user: User) => void;
    onStreamUpdate: (updates: Partial<Streamer>) => void;
    refreshStreamRoomData: (streamerId: string) => void;
    addToast: (type: ToastType, message: string) => void;
    rankingData?: Record<string, RankedUser[]>;
    followingUsers?: User[];
    pkBattleDuration: number;
    streamers: Streamer[];
    onSelectStream: (streamer: Streamer) => void;
    onOpenVIPCenter: () => void;
    onOpenFanClubMembers: (streamer: User) => void;
    allUsers?: User[];
}

export const PKBattleScreen: React.FC<PKBattleScreenProps> = ({ 
    streamer, opponent, onEndPKBattle, onRequestEndStream, onLeaveStreamView, onViewProfile, currentUser,
    onOpenWallet, onFollowUser, onOpenPrivateChat, onOpenPrivateInviteModal, onStartChatWithStreamer,
    onOpenPKTimerSettings, onOpenFans, onOpenFriendRequests, liveSession,
    updateLiveSession, logLiveEvent, updateUser, onStreamUpdate, refreshStreamRoomData, addToast,
    followingUsers = [], pkBattleDuration, onOpenVIPCenter, streamers, onSelectStream, onOpenFanClubMembers
}) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(pkBattleDuration * 60);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [chatInput, setChatInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [isGiftModalOpen, setGiftModalOpen] = useState(false);
    const [isOnlineUsersOpen, setIsOnlineUsersOpen] = useState(false);
    const [isPrivateInviteModalOpen, setIsPrivateInviteModalOpen] = useState(false);
    const [isRankingOpen, setIsRankingOpen] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<(User & { value: number })[]>([]);
    const [currentEffect, setCurrentEffect] = useState<GiftPayload | null>(null);
    const [bannerGifts, setBannerGifts] = useState<(GiftPayload & { id: number })[]>([]);
    const nextGiftId = useRef(0);


    const isBroadcaster = streamer.hostId === currentUser.id;

    // FIX: Add streamerUser object for GiftModal hostUser prop
    const streamerUser: User = useMemo(() => ({
        id: streamer.hostId,
        identification: streamer.hostId,
        name: streamer.name,
        avatarUrl: streamer.avatar,
        coverUrl: `https://picsum.photos/seed/${streamer.id}/800/1600`,
        country: streamer.country,
        age: 23, // mock
        gender: 'female', // mock
        level: 1, // mock
        xp: 0,
        location: streamer.location,
        distance: 'desconhecida',
        fans: 3, // mock
        following: 0,
        receptores: 0,
        enviados: 0,
        topFansAvatars: [],
        isLive: true,
        diamonds: 50000, // mock
        earnings: 125000, // mock
        earnings_withdrawn: 0,
        bio: 'Amante de streams!',
        obras: [],
        curtidas: [],
        ownedFrames: [],
        activeFrameId: null,
        frameExpiration: null,
    }), [streamer]);

    useEffect(() => {
        if (!streamer.id) return;
        api.users.getOnlineUsers(streamer.id).then(data => {
            const users = Array.isArray(data) ? data : [];
            const mappedUsers = users.map(u => ({ ...u, value: (u as any).value || 0 }));
            setOnlineUsers(mappedUsers);
        });
        
        const handleInvite = (payload: any) => {
            if (payload.toUserId === currentUser.id || isBroadcaster) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'private_invite',
                    inviteData: payload
                } as ChatMessageType]);
            }
        };

        const handleNewGift = (payload: GiftPayload) => {
            if (payload.roomId !== streamer.id) return;
            if (liveSession) {
                const totalGiftValue = payload.gift.price * payload.quantity;
                updateLiveSession({ coins: (liveSession.coins || 0) + totalGiftValue });
            }
            setMessages(prev => [...prev, {
                id: Date.now(), type: 'chat', user: payload.fromUser.name, avatar: payload.fromUser.avatarUrl,
                message: `enviou ${payload.quantity}x ${payload.gift.icon} ${payload.gift.name}`
            }]);
            setCurrentEffect(payload);
        };

        webSocketManager.on('privateRoomInvite', handleInvite);
        webSocketManager.on('newStreamGift', handleNewGift);
        return () => { 
            webSocketManager.off('privateRoomInvite', handleInvite); 
            webSocketManager.off('newStreamGift', handleNewGift);
        };
    }, [streamer.id, currentUser.id, isBroadcaster, liveSession, updateLiveSession]);

    useEffect(() => {
        const timerId = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
        return () => clearInterval(timerId);
    }, []);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'chat',
            user: currentUser.name,
            avatar: currentUser.avatarUrl,
            message: chatInput.trim()
        }]);
        setChatInput('');
    };

    const handleJoinPrivate = (invite: any) => {
        addToast(ToastType.Success, `Saindo da batalha para entrar na sala de ${invite.fromName}...`);
        onEndPKBattle(); // Encerra o PK para mudar de sala
    };

    const handleFullscreenGiftAnimationEnd = () => {
        if (currentEffect) {
            const newBanner = { ...currentEffect, id: nextGiftId.current++ };
            setBannerGifts(prev => [...prev, newBanner].slice(-5));
        }
        setCurrentEffect(null);
    };

    const handleBannerAnimationEnd = (id: number) => {
        setBannerGifts(prev => prev.filter(g => g.id !== id));
    };

    const handleSendGift = async (gift: Gift, quantity: number, targetId?: string): Promise<User | null> => {
        const totalCost = (gift.price || 0) * quantity;
        if (currentUser.diamonds < totalCost) {
            onOpenWallet('Diamante');
            return null;
        }
        
        try {
            const result = await api.sendGift(currentUser.id, streamer.id, gift.name, quantity, targetId || streamer.hostId);
            if (result.success && result.updatedSender) {
                updateUser(result.updatedSender);
                return result.updatedSender;
            }
            return null;
        } catch(error: any) {
            addToast(ToastType.Error, error.message || "Falha ao enviar o presente.");
            api.users.me().then(user => updateUser(user)); // Re-sincroniza em caso de erro
            return null;
        }
    };

    return (
        <div className="absolute inset-0 bg-black flex flex-col font-sans text-white z-10 overflow-hidden">
            <div className="h-[60%] w-full relative grid grid-cols-2">
                <div className="h-full border-r border-yellow-400/50 relative">
                    <img src={`https://picsum.photos/seed/${streamer.hostId}/500/800`} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold">ME</div>
                </div>
                <div className="h-full relative">
                    <img src={opponent.coverUrl} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase">Opponent</div>
                </div>
                
                <FullScreenGiftAnimation payload={currentEffect} onEnd={handleFullscreenGiftAnimationEnd} />
                
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 font-black text-xs">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
            </div>

            <div className="flex-1 bg-black flex flex-col p-3 gap-2 overflow-hidden">
                <div className="absolute top-[62%] left-3 z-30 pointer-events-none flex flex-col-reverse items-start">
                    {bannerGifts.map((payload) => (
                        <GiftAnimationOverlay 
                            key={payload.id}
                            giftPayload={payload}
                            onAnimationEnd={handleBannerAnimationEnd}
                        />
                    ))}
                </div>
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2">
                    {messages.map(msg => (
                        <div key={msg.id}>
                            {msg.type === 'private_invite' ? (
                                <div onClick={() => handleJoinPrivate(msg.inviteData)} className="bg-purple-600/90 p-3 rounded-xl border border-white/20 cursor-pointer active:scale-95 transition-all">
                                    <p className="text-[12px] font-bold text-white leading-tight">
                                        “{msg.inviteData?.fromName} convidou para a sala privada”
                                    </p>
                                    <span className="text-[10px] text-purple-200 mt-1 block font-bold uppercase">Toque para aceitar</span>
                                </div>
                            ) : (
                                <ChatMessage userObject={{ name: msg.user, avatarUrl: msg.avatar, level: 1 }} message={msg.message!} onAvatarClick={() => {}} streamerId={streamer.hostId} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <input type="text" className="flex-1 bg-white/10 rounded-full px-4 py-2 outline-none text-sm" placeholder="Diga algo..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} />
                    <button onClick={() => setGiftModalOpen(true)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-yellow-400"><GiftIcon className="w-6 h-6" /></button>
                    <button onClick={() => setIsToolsOpen(true)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><MoreIcon className="w-6 h-6" /></button>
                </div>
            </div>

            <GiftModal 
                isOpen={isGiftModalOpen} 
                onClose={() => setGiftModalOpen(false)} 
                userDiamonds={currentUser.diamonds || 0} 
                onSendGift={handleSendGift} 
                onRecharge={() => onOpenWallet('Diamante')} 
                isVIP={currentUser.isVIP || false} 
                onOpenVIPCenter={onOpenVIPCenter}
                streamId={streamer.id}
                hostId={streamer.hostId}
                onlineUsers={onlineUsers}
                hostUser={streamerUser}
            />

            <ToolsModal 
                isOpen={isToolsOpen} 
                onClose={() => setIsToolsOpen(false)} 
                onOpenCoHostModal={() => {}}
                isPKBattleActive={true}
                onEndPKBattle={onEndPKBattle}
                onOpenBeautyPanel={() => {}}
                onOpenPrivateChat={onOpenPrivateChat}
                onOpenPrivateInviteModal={() => setIsPrivateInviteModalOpen(true)}
                onOpenClarityPanel={() => {}}
                onOpenRanking={() => setIsRankingOpen(true)}
                isMicrophoneMuted={false}
                onToggleMicrophone={() => {}}
                isSoundMuted={false}
                onToggleSound={() => {}}
                isAutoFollowEnabled={false}
                onToggleAutoFollow={() => {}}
                isAutoPrivateInviteEnabled={false}
                onToggleAutoPrivateInvite={() => {}}
                onToggleModeration={() => {}}
                isModerationActive={false}
            />

            {isPrivateInviteModalOpen && <PrivateInviteModal isOpen={isPrivateInviteModalOpen} onClose={() => setIsPrivateInviteModalOpen(false)} streamId={streamer.id} hostId={streamer.hostId} />}
            {isOnlineUsersOpen && <OnlineUsersModal onClose={() => setIsOnlineUsersOpen(false)} streamId={streamer.id} users={onlineUsers} />}
            {isRankingOpen && (
                <ContributionRankingModal 
                    onClose={() => setIsRankingOpen(false)} 
                    liveRanking={onlineUsers}
                />
            )}
        </div>
    );
};

export default PKBattleScreen;