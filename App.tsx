
import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import MainScreen from './components/MainScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import MessagesScreen from './components/screens/MessagesScreen';
import FooterNav from './components/FooterNav';
import ReminderModal from './components/ReminderModal';
import HistoryModal from './components/HistoryModal';
import RegionModal from './components/RegionModal';
import GoLiveScreen from './components/GoLiveScreen';
import StreamRoom from './components/StreamRoom';
import { PKBattleScreen } from './components/PKBattleScreen';
import { ToastType, ToastData, Streamer, User, Gift, StreamSummaryData, LiveSessionState, RankedUser, Conversation, Country, NotificationSettings, FeedPhoto, StreamHistoryEntry, Visitor, PurchaseRecord, MusicTrack } from './types';
import Toast from './components/Toast';
import UserProfileScreen from './components/screens/UserProfileDetailScreen';
import EditProfileScreen from './components/EditProfileScreen';
import WalletScreen from './components/WalletScreen';
import AdminWalletScreen from './components/AdminWalletScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import SearchScreen from './components/SearchScreen';
import PrivateInviteModal from './components/live/PrivateInviteModal';
import VideoScreen from './components/screens/VideoScreen';
import CreatePostScreen from "./components/screens/CreatePostScreen";
import { api } from './services/api';
import { LoadingSpinner } from './components/Loading';
import { webSocketManager } from './services/websocket';
import { db_frontend_stub as db, avatarFrames } from './services/db_shared';
import { LanguageProvider, useTranslation } from './i18n';
import EndStreamConfirmationModal from './components/EndStreamConfirmationModal';
import EndStreamSummaryScreen from './components/EndStreamSummaryScreen';

// Reconnecting Real Screens
import RelationshipScreen from './components/screens/RelationshipScreen';
import { LevelScreen, TopFansScreen as RealTopFansScreen, BlockListScreen as RealBlockListScreen } from './components/screens/ProfileSubScreens';
import PrivateChatScreen from './components/screens/PrivateChatScreen';
import MarketScreen from './components/screens/MarketScreen'; // Real Component

// Import Placeholders for components not provided in context
import { 
    AvatarProtectionScreen, FAQScreen, 
    ConfirmPurchaseScreen, CameraPermissionModal, LocationPermissionModal, 
    PrivateChatModal, PKBattleTimerSettingsScreen, FriendRequestsScreen, 
    PipSettingsModal, FullScreenPhotoViewer, LiveHistoryScreen, LanguageSelectionModal, VIPCenterScreen, 
    FanClubMembersModal, PrivateInviteNotificationModal, MusicDetailScreen 
} from './components/Placeholders';

interface StreamRoomData {
    gifts: Gift[];
    receivedGifts: (Gift & { count: number })[];
}

const AppContent: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState<boolean>(true);
    const [isEnteringStream, setIsEnteringStream] = useState<boolean>(false);

    const [activeScreen, setActiveScreen] = useState<'main' | 'profile' | 'messages' | 'video'>('main');
    const [messagesInitialTab, setMessagesInitialTab] = useState<'messages' | 'friends'>('messages');
    const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
    const [isRegionModalOpen, setIsRegionModalOpen] = useState<boolean>(false);
    const [isGoLiveSetupOpen, setIsGoLiveSetupOpen] = useState<boolean>(false);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false);
    const [permissionStep, setPermissionStep] = useState<'idle' | 'camera' | 'microphone'>('idle');
    const [permissionAction, setPermissionAction] = useState<'goLive' | 'createPost' | null>(null);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [isLocationPermissionModalOpen, setIsLocationPermissionModalOpen] = useState(false);
    const [locationPermissionStatus, setLocationPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
    const [showLocationBanner, setShowLocationBanner] = useState(false);
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [activeStream, setActiveStream] = useState<Streamer | null>(null);
    const [streamRoomData, setStreamRoomData] = useState<StreamRoomData | null>(null);
    const [isPKBattleActive, setIsPKBattleActive] = useState<boolean>(false);
    const [pkOpponent, setPkOpponent] = useState<User | null>(null);
    const [chattingWith, setChattingWith] = useState<User | null>(null);
    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
    const [isWalletScreenOpen, setIsWalletScreenOpen] = useState<boolean>(false);
    const [walletInitialTab, setWalletInitialTab] = useState<'Diamante' | 'Ganhos'>('Diamante');
    const [isConfirmingPurchase, setIsConfirmingPurchase] = useState<boolean>(false);
    const [selectedPackage, setSelectedPackage] = useState<{ diamonds: number; price: number; } | null>(null);
    const [isFollowingScreenOpen, setIsFollowingScreenOpen] = useState<boolean>(false);
    const [isFansScreenOpen, setIsFansScreenOpen] = useState<boolean>(false);
    const [isFriendRequestsScreenOpen, setIsFriendRequestsScreenOpen] = useState<boolean>(false);
    const [isVisitorsScreenOpen, setIsVisitorsScreenOpen] = useState<boolean>(false);
    const [isTopFansScreenOpen, setIsTopFansScreenOpen] = useState<boolean>(false);
    const [isMyLevelScreenOpen, setIsMyLevelScreenOpen] = useState<boolean>(false);
    const [isBlockListScreenOpen, setIsBlockListScreenOpen] = useState<boolean>(false);
    const [isAvatarProtectionScreenOpen, setIsAvatarProtectionScreenOpen] = useState<boolean>(false);
    const [isMarketScreenOpen, setIsMarketScreenOpen] = useState<boolean>(false);
    const [isFAQScreenOpen, setIsFAQScreenOpen] = useState<boolean>(false);
    const [isSettingsScreenOpen, setIsSettingsScreenOpen] = useState<boolean>(false);
    const [isSearchScreenOpen, setIsSearchScreenOpen] = useState<boolean>(false);
    
    // Updated Logic for End Stream
    const [isEndStreamConfirmOpen, setIsEndStreamConfirmOpen] = useState<boolean>(false);
    const [isEndStreamSummaryOpen, setIsEndStreamSummaryOpen] = useState<boolean>(false);
    const [streamSummaryData, setStreamSummaryData] = useState<StreamSummaryData | null>(null);

    const [isPrivateChatModalOpen, setIsPrivateChatModalOpen] = useState<boolean>(false);
    const [isPKTimerSettingsOpen, setIsPKTimerSettingsOpen] = useState(false);
    const [pkBattleDuration, setPkBattleDuration] = useState(7);
    const [isPipSettingsModalOpen, setIsPipSettingsModalOpen] = useState(false);
    const [liveSession, setLiveSession] = useState<LiveSessionState | null>(null);
    const [isPrivateInviteModalOpen, setIsPrivateInviteModalOpen] = useState<boolean>(false);
    const [photoViewerData, setPhotoViewerData] = useState<{ photos: FeedPhoto[], initialIndex: number } | null>(null);
    const [isLiveHistoryOpen, setIsLiveHistoryOpen] = useState(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [isAdminWalletOpen, setIsAdminWalletOpen] = useState(false);
    const [isVIPCenterOpen, setIsVIPCenterOpen] = useState<boolean>(false);
    const [isFanClubMembersModalOpen, setIsFanClubMembersModalOpen] = useState<boolean>(false);
    const [fanClubMembers, setFanClubMembers] = useState<User[]>([]);
    const [viewingFanClubStreamer, setViewingFanClubStreamer] = useState<User | null>(null);
    const [inviteNotification, setInviteNotification] = useState<{ stream: Streamer } | null>(null);
    const [viewingMusic, setViewingMusic] = useState<MusicTrack | null>(null);
    const [musicForPost, setMusicForPost] = useState<MusicTrack | null>(null);

    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [isLoadingStreamers, setIsLoadingStreamers] = useState(true);
    const [countries, setCountries] = useState<Country[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [friends, setFriends] = useState<User[]>([]);
    const [followingUsers, setFollowingUsers] = useState<User[]>([]);
    const [fans, setFans] = useState<User[]>([]);
    const [allGifts, setAllGifts] = useState<Gift[]>([]);
    const [reminderStreamers, setReminderStreamers] = useState<Streamer[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('ICON_GLOBE');
    const [activeCategory, setActiveCategory] = useState('popular');
    const [rankingData, setRankingData] = useState<Record<string, RankedUser[]>>({ 'Diária': [], 'Semanal': [], 'Mensal': [] });
    const [listScreenUsers, setListScreenUsers] = useState<User[]>([]);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
    const [lastPhotoLikeUpdate, setLastPhotoLikeUpdate] = useState<number>(0);
    const [streamHistory, setStreamHistory] = useState<StreamHistoryEntry[]>([]);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);

    const { t, language, setLanguage } = useTranslation();

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    // WebSocket Notification Listener
    useEffect(() => {
        const handleStreamNotification = (data: any) => {
            if (data.type === 'live_started' && data.streamer) {
                addToast(ToastType.Info, `🔔 ${data.streamer.name} está AO VIVO!`);
                // Opcional: Atualizar lista de streamers localmente
                setStreamers(prev => [data.stream, ...prev]);
            }
        };

        webSocketManager.on('streamNotification', handleStreamNotification);
        return () => {
            webSocketManager.off('streamNotification', handleStreamNotification);
        }
    }, [addToast]);

    const updateUserEverywhere = useCallback((updatedUser: User) => {
        const updater = (users: User[]) => users.map(u => u.id === updatedUser.id ? updatedUser : u);

        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
        if (viewingProfile?.id === updatedUser.id) {
            setViewingProfile(updatedUser);
        }
        if (pkOpponent?.id === updatedUser.id) {
            setPkOpponent(updatedUser);
        }

        setAllUsers(updater);
        setFollowingUsers(updater);
        setFans(updater);
        setFriends(updater);
        setListScreenUsers(updater);

        setConversations(prev => prev.map(c => c.friend.id === updatedUser.id ? { ...c, friend: updatedUser } : c));

        const streamUpdater = (s: Streamer) => s.hostId === updatedUser.id ? { ...s, name: updatedUser.name, avatar: updatedUser.avatarUrl } : s;
        setStreamers(prev => prev.map(streamUpdater));
        setReminderStreamers(prev => prev.map(streamUpdater));

        if (activeStream?.hostId === updatedUser.id) {
            setActiveStream(prev => prev ? streamUpdater(prev) : null);
        }
    }, [currentUser, viewingProfile, pkOpponent, activeStream]);

    const handleLeaveStreamView = useCallback(() => {
        if (activeStream) {
            webSocketManager.leaveStreamRoom(activeStream.id);
            db.liveSessions.delete(activeStream.id);
        }
        setActiveStream(null);
        setIsPKBattleActive(false);
        setPkOpponent(null);
        setLiveSession(null);
        setStreamRoomData(null);
    }, [activeStream]);

    const handleLogout = async () => {
        if (currentUser) {
            await api.updateSimStatus(false).catch(err => console.error("Failed to set user offline:", err));
        }
        webSocketManager.disconnect();
        setIsAuthenticated(false);
        setCurrentUser(null);
        setActiveScreen('main');
        setIsSettingsScreenOpen(false);
    };

    const handleDeleteAccount = async () => {
        if (!currentUser) return;
        try {
            const { success } = await api.deleteAccount(currentUser.id);
            if (success) {
                addToast(ToastType.Success, "Conta excluída com sucesso.");
                await handleLogout();
            } else {
                throw new Error("Falha ao excluir a conta do servidor.");
            }
        } catch (error) {
            addToast(ToastType.Error, (error as Error).message || "Falha ao excluir a conta.");
        }
    };

    useEffect(() => {
        if (isAuthenticated && !currentUser) { 
            api.getCurrentUser().then(async user => {
                if (user) {
                    const { success, user: updatedUser } = await api.updateSimStatus(true);
                    if (success && updatedUser) {
                        setCurrentUser(updatedUser);
                    } else {
                        setCurrentUser(user);
                    }
                    webSocketManager.connect(user.id);
                }
                setIsLoadingCurrentUser(false);
            }).catch(err => {
                console.error("Failed to fetch current user:", err);
                addToast(ToastType.Error, "Falha ao carregar dados do usuário.");
                setIsLoadingCurrentUser(false);
            });
        }
    }, [isAuthenticated, currentUser, addToast]);

    useEffect(() => {
        if (currentUser) {
            setIsLoadingStreamers(true);
            const countryCode = selectedCountry === 'ICON_GLOBE' ? undefined : selectedCountry;
            api.getLiveStreamers(activeCategory, countryCode).then(data => {
                setStreamers(data || []);
                setIsLoadingStreamers(false);
            }).catch(err => {
                console.error("Failed to load streamers:", err);
                addToast(ToastType.Error, (err as Error).message);
                setIsLoadingStreamers(false);
            });
        }
    }, [currentUser, selectedCountry, activeCategory, addToast]);

    const refreshStreamRoomData = useCallback(async (streamerId: string) => {
        try {
            const newReceivedGifts = await api.getReceivedGifts(streamerId);
            setStreamRoomData(prev => prev ? { ...prev, receivedGifts: newReceivedGifts || [] } : null);
        } catch (error) {
            console.error("Failed to refresh received gifts:", error);
            addToast(ToastType.Error, "Falha ao atualizar os presentes recebidos.");
        }
    }, [addToast]);

    const handleStreamUpdate = (updates: Partial<Streamer>) => {
        setActiveStream(prev => {
            if (!prev) return null;
            return { ...prev, ...updates };
        });
    };

    const updateLiveSession = useCallback((updates: Partial<LiveSessionState>) => {
        setLiveSession(prev => {
            if (!prev) return null;
            const newSession = { ...prev, ...updates };
            if (updates.viewers !== undefined) {
                newSession.peakViewers = Math.max(prev.peakViewers, updates.viewers);
            }
            if (activeStream) {
                db.liveSessions.set(activeStream.id, newSession);
            }
            return newSession;
        });
    }, [activeStream]);

    const handleSelectRegion = (countryCode: string) => {
        setSelectedCountry(countryCode);
        setIsRegionModalOpen(false);
    };

    const startLiveSession = (streamer: Streamer) => {
        const newSession = {
            startTime: Date.now(),
            viewers: streamer.viewers || 1,
            peakViewers: streamer.viewers || 1,
            coins: 0,
            followers: 0,
            members: 0,
            fans: 0,
            events: [],
            isMicrophoneMuted: false,
            isStreamMuted: false,
            isAutoFollowEnabled: false,
            isAutoPrivateInviteEnabled: false,
        };
        setLiveSession(newSession);
        db.liveSessions.set(streamer.id, newSession);
        setActiveStream(streamer);
    };

    const logLiveEvent = (type: string, data: any) => {
        if (!liveSession || !activeStream) return;
        const event = { type, timestamp: new Date().toISOString(), ...data };
        updateLiveSession({ events: [...(liveSession.events || []), event] });
    };

    const handleLogin = () => setIsAuthenticated(true);

    const handleNavigation = (screen: 'main' | 'profile' | 'messages' | 'video') => {
        if (screen === 'messages') {
            setMessagesInitialTab('messages');
        }
        setActiveScreen(screen);
    };

    const handleTabChange = async (tab: string) => {
        setActiveCategory(tab);
        setShowLocationBanner(false);
    };

    const handleSelectStream = async (streamer: Streamer) => {
        if (!currentUser) return;
        setIsEnteringStream(true);
        try {
            if (activeStream) {
                webSocketManager.leaveStreamRoom(activeStream.id);
            }

            const [gifts, receivedGifts] = await Promise.all([
                api.getGifts(),
                api.getReceivedGifts(streamer.hostId),
            ]);
            setStreamRoomData({ gifts: gifts || [], receivedGifts: receivedGifts || [] });
            startLiveSession(streamer);
            webSocketManager.joinStreamRoom(streamer.id);
        } catch (error) {
            addToast(ToastType.Error, "Falha ao carregar dados da live.");
        } finally {
            setIsEnteringStream(false);
        }
    };

    const handleStartStream = async (streamer: Streamer) => {
        setIsGoLiveSetupOpen(false);
        handleSelectStream(streamer);
    };

    const handleRequestEndStream = () => setIsEndStreamConfirmOpen(true);

    const handleConfirmEndStream = async () => {
        setIsEndStreamConfirmOpen(false);
        if (activeStream && liveSession) {
            webSocketManager.leaveStreamRoom(activeStream.id);
            
            try {
                // Call API to end session and get summary stats
                // The API in server.ts has been updated to return 'summary' in data
                const response: any = await api.endLiveSession(activeStream.id, liveSession);
                
                // Close stream room view
                handleLeaveStreamView();

                // Open Summary Screen
                if (response && response.summary) {
                    setStreamSummaryData(response.summary);
                    setIsEndStreamSummaryOpen(true);
                } else {
                    // Fallback if no summary data
                    setActiveScreen('main');
                }
                
            } catch (error) {
                console.error("Failed to end session properly", error);
                handleLeaveStreamView();
            }
        } else {
            handleLeaveStreamView();
        }
    };

    const handleCloseSummary = () => {
        setIsEndStreamSummaryOpen(false);
        setStreamSummaryData(null);
        setActiveScreen('main');
    };

    const handleStartPKBattle = async (opponent: User) => {
       // Placeholder PK Logic
       setIsPKBattleActive(true);
       setPkOpponent(opponent);
    };

    const handleViewProfile = async (user: User) => {
        setChattingWith(null);
        setViewingProfile(user);
    };

    const handleEditProfile = () => { setIsEditingProfile(true); setViewingProfile(null); }

    const handleSaveProfile = async (updatedData: Partial<User>) => {
        if (!currentUser) return;
        const { success, user } = await api.updateProfile(currentUser.id, updatedData);
        if (success && user) {
            updateUserEverywhere(user);
            setIsEditingProfile(false);
            setViewingProfile(user);
            addToast(ToastType.Success, "Perfil salvo!");
        }
    };

    const handleFollowUser = async (userToFollow: User, streamId?: string) => {
        if (!currentUser) return;
        const { success, updatedFollower, updatedFollowed } = await api.followUser(currentUser.id, userToFollow.id, streamId);
        if (success && updatedFollower) {
            updateUserEverywhere(updatedFollower);
            addToast(ToastType.Success, "Seguido com sucesso!");
        }
    };

    const handleOpenWallet = (initialTab: 'Diamante' | 'Ganhos' = 'Diamante') => {
        setWalletInitialTab(initialTab);
        setIsWalletScreenOpen(true);
    };

    const handleOpenMyStream = () => {
        if (!currentUser) return;
        setIsGoLiveSetupOpen(true);
    };

    const handleUseSound = (music: MusicTrack) => {
        setViewingMusic(null); 
        setMusicForPost(music);
        setIsCreatePostOpen(true); 
    };

    const handlePostComplete = (updatedUser: User) => {
        setIsCreatePostOpen(false);
        setMusicForPost(null);
        setLastPhotoLikeUpdate(Date.now());
        if (updatedUser) {
            updateUserEverywhere(updatedUser);
        }
        setActiveScreen('video'); 
    };

    if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;
    if (isLoadingCurrentUser || !currentUser) return <div className="h-full w-full bg-black flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="h-full w-full bg-black text-white overflow-hidden relative font-sans">
            {(isEnteringStream) && (
                <div className="absolute inset-0 bg-black/80 z-[9999] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-purple-500"></div>
                </div>
            )}

            {activeStream && streamRoomData && currentUser ? (
                isPKBattleActive && pkOpponent ? (
                    <PKBattleScreen
                        streamer={activeStream}
                        opponent={pkOpponent}
                        onEndPKBattle={() => { setIsPKBattleActive(false); setPkOpponent(null); }}
                        onRequestEndStream={handleRequestEndStream}
                        onLeaveStreamView={handleLeaveStreamView}
                        onViewProfile={handleViewProfile}
                        currentUser={currentUser}
                        onOpenWallet={handleOpenWallet}
                        onFollowUser={handleFollowUser}
                        onOpenPrivateChat={() => setIsPrivateChatModalOpen(true)}
                        onOpenPrivateInviteModal={() => setIsPrivateInviteModalOpen(true)}
                        setActiveScreen={handleNavigation}
                        onStartChatWithStreamer={(user) => setChattingWith(user)}
                        onOpenPKTimerSettings={() => setIsPKTimerSettingsOpen(true)}
                        onOpenFans={() => setIsFansScreenOpen(true)}
                        onOpenFriendRequests={() => setIsFriendRequestsScreenOpen(true)}
                        gifts={streamRoomData.gifts}
                        receivedGifts={streamRoomData.receivedGifts}
                        liveSession={liveSession}
                        updateLiveSession={updateLiveSession}
                        logLiveEvent={logLiveEvent}
                        updateUser={updateUserEverywhere}
                        onStreamUpdate={handleStreamUpdate}
                        refreshStreamRoomData={refreshStreamRoomData}
                        addToast={addToast}
                        rankingData={rankingData}
                        followingUsers={followingUsers}
                        pkBattleDuration={pkBattleDuration}
                        streamers={streamers}
                        onSelectStream={handleSelectStream}
                        onOpenVIPCenter={() => setIsVIPCenterOpen(true)}
                        onOpenFanClubMembers={() => setIsFanClubMembersModalOpen(true)}
                        allUsers={allUsers}
                        onOpenEditStreamInfo={() => addToast(ToastType.Info, "Edit Stream Info")}
                    />
                ) : (
                    <StreamRoom
                        streamer={activeStream}
                        onRequestEndStream={handleRequestEndStream}
                        onStartPKBattle={handleStartPKBattle}
                        onViewProfile={handleViewProfile}
                        currentUser={currentUser}
                        onOpenWallet={handleOpenWallet}
                        onFollowUser={handleFollowUser}
                        onOpenPrivateChat={() => setIsPrivateChatModalOpen(true)}
                        onStartChatWithStreamer={(user) => setChattingWith(user)}
                        onOpenPKTimerSettings={() => setIsPKTimerSettingsOpen(true)}
                        gifts={streamRoomData.gifts}
                        receivedGifts={streamRoomData.receivedGifts}
                        updateUser={updateUserEverywhere}
                        liveSession={liveSession}
                        updateLiveSession={updateLiveSession}
                        logLiveEvent={logLiveEvent}
                        setActiveScreen={handleNavigation}
                        onStreamUpdate={handleStreamUpdate}
                        refreshStreamRoomData={refreshStreamRoomData}
                        addToast={addToast}
                        onLeaveStreamView={handleLeaveStreamView}
                        onOpenPrivateInviteModal={() => setIsPrivateInviteModalOpen(true)}
                        onOpenFans={() => {}}
                        onOpenFriendRequests={() => setIsFriendRequestsScreenOpen(true)}
                        followingUsers={followingUsers}
                        streamers={streamers}
                        onSelectStream={handleSelectStream}
                        onOpenVIPCenter={() => setIsVIPCenterOpen(true)}
                        onOpenFanClubMembers={() => setIsFanClubMembersModalOpen(true)}
                    />
                )
            ) : (
                <>
                    <div className="h-full w-full">
                        {activeScreen === 'main' && <MainScreen onOpenReminderModal={() => setIsReminderModalOpen(true)} onOpenRegionModal={() => setIsRegionModalOpen(true)} onSelectStream={handleSelectStream} onOpenSearch={() => setIsSearchScreenOpen(true)} streamers={streamers} isLoading={isLoadingStreamers} activeTab={activeCategory} onTabChange={handleTabChange} showLocationBanner={showLocationBanner} />}
                        {activeScreen === 'video' && <VideoScreen />}
                        {activeScreen === 'profile' &&
                            <ProfileScreen
                                currentUser={currentUser}
                                onOpenProfile={() => handleViewProfile(currentUser)}
                                onOpenUserDetail={() => handleViewProfile(currentUser)}
                                onEnterMyStream={handleOpenMyStream}
                                onOpenWallet={handleOpenWallet}
                                onOpenFollowing={() => setIsFollowingScreenOpen(true)}
                                onOpenFans={() => setIsFansScreenOpen(true)}
                                onOpenVisitors={() => setIsVisitorsScreenOpen(true)}
                                onOpenTopFans={() => setIsTopFansScreenOpen(true)}
                                onNavigateToMessages={() => handleNavigation('messages')}
                                onOpenMarket={() => setIsMarketScreenOpen(true)}
                                onOpenMyLevel={() => setIsMyLevelScreenOpen(true)}
                                onOpenBlockList={() => setIsBlockListScreenOpen(true)}
                                onOpenAvatarProtection={() => setIsAvatarProtectionScreenOpen(true)}
                                onOpenFAQ={() => setIsFAQScreenOpen(true)}
                                onOpenSettings={() => setIsSettingsScreenOpen(true)}
                                onOpenSupportChat={() => {}}
                                onOpenAdminWallet={() => setIsAdminWalletOpen(true)}
                                visitors={visitors}
                            />
                        }
                        {activeScreen === 'messages' && <MessagesScreen />}
                    </div>
                    <FooterNav currentUser={currentUser} onOpenGoLive={handleOpenMyStream} activeTab={activeScreen} onNavigate={handleNavigation} />
                </>
            )}

            <ReminderModal 
                isOpen={isReminderModalOpen} 
                onClose={() => setIsReminderModalOpen(false)} 
                onOpenHistory={() => {
                    setIsReminderModalOpen(false);
                    setIsHistoryModalOpen(true);
                }}
                onSelectStream={handleSelectStream}
            />
            {isHistoryModalOpen && <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} />}
            
            {isRegionModalOpen && <RegionModal onClose={() => setIsRegionModalOpen(false)} onSelectRegion={handleSelectRegion} />}
            {isGoLiveSetupOpen && <GoLiveScreen onClose={() => setIsGoLiveSetupOpen(false)} onStartStream={handleStartStream} addToast={addToast} />}
            {(isCreatePostOpen || musicForPost) && currentUser && (
                <CreatePostScreen
                    isOpen={isCreatePostOpen || !!musicForPost}
                    onClose={() => { setIsCreatePostOpen(false); setMusicForPost(null); }}
                    onPostComplete={handlePostComplete}
                    addToast={addToast}
                    currentUser={currentUser}
                    initialMusic={musicForPost}
                />
            )}
            
            {viewingProfile && <UserProfileScreen currentUser={viewingProfile} onClose={() => setViewingProfile(null)} onOpenFans={() => setIsFansScreenOpen(true)} onOpenFollowing={() => setIsFollowingScreenOpen(true)} onOpenTopFans={() => setIsTopFansScreenOpen(true)} onChat={() => setChattingWith(viewingProfile)} onFollow={() => handleFollowUser(viewingProfile)} addToast={addToast} />}
            {isEditingProfile && <EditProfileScreen user={currentUser} onClose={() => setIsEditingProfile(false)} onSave={handleSaveProfile} />}
            {isWalletScreenOpen && <WalletScreen onClose={() => setIsWalletScreenOpen(false)} initialTab={walletInitialTab} currentUser={currentUser} />}
            {isSettingsScreenOpen && <SettingsScreen onClose={() => setIsSettingsScreenOpen(false)} currentUser={currentUser} onLogout={handleLogout} />}
            {isSearchScreenOpen && <SearchScreen onClose={() => setIsSearchScreenOpen(false)} />}
            {activeStream && isPrivateInviteModalOpen && <PrivateInviteModal isOpen={isPrivateInviteModalOpen} onClose={() => setIsPrivateInviteModalOpen(false)} />}
            {isAdminWalletOpen && <AdminWalletScreen onClose={() => setIsAdminWalletOpen(false)} user={currentUser} />}
            
            {isEndStreamConfirmOpen && (
                <EndStreamConfirmationModal 
                    isOpen={isEndStreamConfirmOpen}
                    onConfirm={handleConfirmEndStream}
                    onCancel={() => setIsEndStreamConfirmOpen(false)}
                />
            )}

            {isEndStreamSummaryOpen && currentUser && streamSummaryData && (
                <EndStreamSummaryScreen 
                    currentUser={currentUser}
                    summaryData={streamSummaryData}
                    onClose={handleCloseSummary}
                />
            )}

            {/* Reconnected Screens */}
            {chattingWith && <PrivateChatScreen user={chattingWith} onClose={() => setChattingWith(null)} variant="page" />}
            {isFollowingScreenOpen && <RelationshipScreen initialTab="following" onClose={() => setIsFollowingScreenOpen(false)} currentUser={currentUser} />}
            {isFansScreenOpen && <RelationshipScreen initialTab="fans" onClose={() => setIsFansScreenOpen(false)} currentUser={currentUser} />}
            {isVisitorsScreenOpen && <RelationshipScreen initialTab="visitors" onClose={() => setIsVisitorsScreenOpen(false)} currentUser={currentUser} />}
            
            {isTopFansScreenOpen && <RealTopFansScreen onClose={() => setIsTopFansScreenOpen(false)} />}
            {isMyLevelScreenOpen && <LevelScreen onClose={() => setIsMyLevelScreenOpen(false)} currentUser={currentUser} />}
            {isBlockListScreenOpen && <RealBlockListScreen onClose={() => setIsBlockListScreenOpen(false)} />}
            
            {/* Real Market Screen - Connected to API/DB */}
            {isMarketScreenOpen && (
                <MarketScreen 
                    onClose={() => setIsMarketScreenOpen(false)}
                    user={currentUser}
                    updateUser={updateUserEverywhere}
                    onOpenWallet={handleOpenWallet}
                    addToast={addToast}
                />
            )}

            {/* Remaining Placeholders */}
            {isFAQScreenOpen && <FAQScreen />}
            {isVIPCenterOpen && <VIPCenterScreen />}
            {isFanClubMembersModalOpen && <FanClubMembersModal />}
            {isPrivateChatModalOpen && <PrivateChatModal />}
            {isPKTimerSettingsOpen && <PKBattleTimerSettingsScreen />}
            {isFriendRequestsScreenOpen && <FriendRequestsScreen />}
            {isPipSettingsModalOpen && <PipSettingsModal />}
            {isLiveHistoryOpen && <LiveHistoryScreen />}
            {isLanguageModalOpen && <LanguageSelectionModal />}
            {inviteNotification && <PrivateInviteNotificationModal />}
            {isAvatarProtectionScreenOpen && <AvatarProtectionScreen />}

            <div className="absolute top-4 right-4 left-4 sm:left-auto space-y-2 z-[9999] pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast data={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};

export default App;
