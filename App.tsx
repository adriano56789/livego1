import React, { useState, useCallback, useEffect, useRef } from 'react';
import LoginScreen from './components/LoginScreen';
import MainScreen from './components/MainScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import MessagesScreen from './components/screens/MessagesScreen';
import FooterNav from './components/FooterNav';
import ReminderModal from './components/ReminderModal';
import HistoryModal from './components/HistoryModal';
import RegionModal from './components/RegionModal';
import GoLiveScreen from './components/GoLiveScreen';
import { ToastType, ToastData, Streamer, User, Gift, StreamSummaryData, LiveSessionState, RankedUser } from './types';
import Toast from './components/Toast';
import UserProfileScreen from './components/screens/UserProfileDetailScreen';
import WalletScreen from './components/WalletScreen';
import AdminWalletScreen from './components/AdminWalletScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import SearchScreen from './components/SearchScreen';
import VideoScreen from './components/screens/VideoScreen';
import LanguageSelectionModal from './components/LanguageSelectionModal';
import { api, storage } from './services/api';
import { LoadingSpinner } from './components/Loading';
import { webSocketManager } from './services/websocket';
import { LanguageProvider } from './i18n';
import EndStreamConfirmationModal from './components/EndStreamConfirmationModal';
import EndStreamSummaryScreen from './components/EndStreamSummaryScreen';
import RelationshipScreen from './components/screens/RelationshipScreen';
import { LevelScreen, TopFansScreen, BlockListScreen } from './components/screens/ProfileSubScreens';
import MarketScreen from './components/screens/MarketScreen';
import FanClubMembersScreen from './components/screens/FanClubMembersScreen';
import StreamRoom from './components/StreamRoom';
import { PKBattleScreen } from './components/PKBattleScreen';
import PrivateInviteModal from './components/live/PrivateInviteModal';
import ApiTracker from './components/ApiTracker';
import EditProfileScreen from './components/EditProfileScreen';
import DatabaseScreen from './components/DatabaseScreen';

const AppContent: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
    const [activeScreen, setActiveScreen] = useState<'main' | 'profile' | 'messages' | 'video'>('main');
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [liveSession, setLiveSession] = useState<LiveSessionState | null>(null);
    const [isApiTrackerVisible, setIsApiTrackerVisible] = useState(false);
    const [isDatabaseMonitorOpen, setIsDatabaseMonitorOpen] = useState(false);
    const tapCount = useRef(0);
    const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    useEffect(() => {
        const checkAuth = async () => {
            const savedUser = storage.getUser();
            const token = storage.getToken();

            if (savedUser && token) {
                try {
                    const freshUser = await api.users.me();
                    setCurrentUser(freshUser);
                    setIsAuthenticated(true);
                    webSocketManager.connect(freshUser.id);
                    // @FIX: Fetch visitors for ProfileScreen
                    api.getVisitors(freshUser.id).then(visitorList => setVisitors(visitorList || [])).catch(() => setVisitors([]));
                } catch (e) {
                    console.warn("Sessão expirada ou VPS offline.");
                    storage.clear();
                }
            }
            setIsLoadingInitial(false);
        };
        checkAuth();
    }, []);

    const [activeStream, setActiveStream] = useState<Streamer | null>(null);
    const [pkOpponent, setPkOpponent] = useState<User | null>(null);
    const [streamRoomData, setStreamRoomData] = useState<any>(null);
    const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
    
    const [isReminderOpen, setIsReminderOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isRegionOpen, setIsRegionOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [isPrivateInviteModalOpen, setIsPrivateInviteModalOpen] = useState(false);

    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [walletTab, setWalletTab] = useState<'Diamante' | 'Ganhos'>('Diamante');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const [isLevelOpen, setIsLevelOpen] = useState(false);
    const [isAdminWalletOpen, setIsAdminWalletOpen] = useState(false);
    const [isBlockListOpen, setIsBlockListOpen] = useState(false);
    const [isTopFansOpen, setIsTopFansOpen] = useState(false);
    const [isFanClubMembersOpen, setIsFanClubMembersOpen] = useState(false);
    
    const [relTab, setRelTab] = useState<'following' | 'fans' | 'visitors'>('following');
    const [isRelOpen, setIsRelOpen] = useState(false);
    
    const [profileScreenState, setProfileScreenState] = useState<{ user: User | null; startInEditMode?: boolean }>({ user: null, startInEditMode: false });
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [isEndConfirmationOpen, setIsEndConfirmationOpen] = useState(false);
    const [showStreamSummary, setShowStreamSummary] = useState(false);
    const [lastSummary, setLastSummary] = useState<StreamSummaryData | null>(null);

    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [isLoadingStreams, setIsLoadingStreams] = useState(false);
    const [activeTab, setActiveTab] = useState('popular');
    const [selectedRegion, setSelectedRegion] = useState('global');
    const [followingUsers, setFollowingUsers] = useState<User[]>([]);
    // @FIX: Add state for visitors
    const [visitors, setVisitors] = useState<User[]>([]);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    const updateCurrentUser = (user: User) => {
        setCurrentUser(user);
        storage.setUser(user);
    };

    const handleLogin = (user: User) => {
        storage.setUser(user);
        storage.setToken('fake-jwt-token');
        setCurrentUser(user);
        setIsAuthenticated(true);
        webSocketManager.connect(user.id);
    };

    const handleLogout = () => {
        storage.clear();
        setIsAuthenticated(false);
        setCurrentUser(null);
        webSocketManager.disconnect();
    };
    
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const handleSelectStream = (streamer: Streamer) => {
        if (activeStream?.id === streamer.id) return;
        setActiveStream(streamer);
        
        // Crie uma sessão de live simulada
        if (!liveSession || liveSession.viewers === 0) { // Cria apenas se não houver uma ativa
            const newLiveSession: LiveSessionState = {
                viewers: streamer.viewers || 0,
                peakViewers: streamer.viewers || 0,
                coins: Math.floor(Math.random() * 10000),
                followers: 0,
                members: 0,
                fans: 0,
                events: [],
                isMicrophoneMuted: false,
                isStreamMuted: false,
                isAutoFollowEnabled: false,
                isAutoPrivateInviteEnabled: false,
                startTime: Date.now(),
            };
            setLiveSession(newLiveSession);
        }
    };

    const handleLeaveStream = () => {
        setActiveStream(null);
        setLiveSession(null); // Limpa a sessão ao sair
    };
    
    const handleStartStream = (streamData: Partial<Streamer>) => {
        const newStreamer: Streamer = {
            id: `live_${Date.now()}`,
            hostId: currentUser!.id,
            name: currentUser!.name,
            avatar: currentUser!.avatarUrl,
            location: currentUser!.location,
            viewers: 1,
            tags: [],
            ...streamData
        };
        setActiveStream(newStreamer);
        setIsGoLiveOpen(false);
    };
    
    const handleEndStream = () => {
        setIsEndConfirmationOpen(false);
        setActiveStream(null);
        if (liveSession) {
            const duration = (Date.now() - liveSession.startTime) / 1000;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const summary = {
                viewers: liveSession.peakViewers,
                duration: `${minutes}m ${seconds}s`,
                coins: liveSession.coins,
                followers: liveSession.followers,
                members: liveSession.members,
                fans: liveSession.fans
            };
            setLastSummary(summary);
            setShowStreamSummary(true);
        }
        setLiveSession(null); // Limpa a sessão ao finalizar
    };
    
    const handleViewProfile = (userToView: User, isEditing: boolean = false) => {
        setProfileScreenState({ user: userToView });
        setIsEditingProfile(isEditing);
    };
    
    const handleOpenRelationship = (tab: 'following' | 'fans' | 'visitors') => {
        setRelTab(tab);
        setIsRelOpen(true);
    };
    
    const handleStartPK = (opponent: User) => {
        setPkOpponent(opponent);
    };

    const handleSecretTap = () => {
        if (tapTimeout.current) clearTimeout(tapTimeout.current);
        tapCount.current += 1;
        if (tapCount.current >= 5) {
            setIsApiTrackerVisible(p => !p);
            tapCount.current = 0;
        }
        tapTimeout.current = setTimeout(() => {
            tapCount.current = 0;
        }, 1000);
    };
    
    const handleStartChatWith = (user: User) => {
        // This would typically navigate to a chat screen with this user.
        // For now, let's just log it and potentially switch to messages tab.
        console.log("Starting chat with", user.name);
        setActiveScreen('messages');
        setProfileScreenState({ user: null }); // close profile if open
    };

    const handleFollowUser = (userToFollow: User, streamId?: string) => {
        if (!currentUser) return;
        
        // Simulação otimista
        const isAlreadyFollowing = followingUsers.some(u => u.id === userToFollow.id);
        if (!isAlreadyFollowing) {
            setFollowingUsers(prev => [...prev, userToFollow]);
            addToast(ToastType.Success, `Você começou a seguir ${userToFollow.name}!`);
        }
        
        // Chamada de API em background
        api.users.toggleFollow(userToFollow.id).catch(() => {
             // Reverter em caso de erro
             setFollowingUsers(prev => prev.filter(u => u.id !== userToFollow.id));
             addToast(ToastType.Error, `Falha ao seguir ${userToFollow.name}.`);
        });
    };
    
    const handleSaveProfile = (updatedData: Partial<User>) => {
        if (profileScreenState.user) {
            const updatedUser = { ...profileScreenState.user, ...updatedData };
            setProfileScreenState({ user: updatedUser });
            if (updatedUser.id === currentUser?.id) {
                updateCurrentUser(updatedUser);
            }
        }
        setIsEditingProfile(false);
    };

    const refreshStreamRoomData = (streamerId: string) => {
        // This function would re-fetch data for a specific stream room, e.g., rankings
        console.log("Refreshing data for stream:", streamerId);
    };
    
    const updateLiveSessionState = (updates: Partial<LiveSessionState>) => {
        setLiveSession(prev => prev ? { ...prev, ...updates } : null);
    };

    const handleRegionSelect = (region: string) => {
        setSelectedRegion(region);
        addToast(ToastType.Info, `Região alterada para ${region.toUpperCase()}.`);
    };

    const handleOpenPrivateChat = () => {
      setActiveScreen('messages');
      if(activeStream) {
        handleLeaveStream();
      }
    };
    
    if (isLoadingInitial) {
        return <div className="h-screen w-screen flex items-center justify-center bg-black"><LoadingSpinner /></div>;
    }

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    // FIX: Add missing return statement with full application JSX.
    return (
        <div className="h-screen w-screen bg-black text-white font-sans overflow-hidden select-none">
          {/* Dev Tools */}
          {isApiTrackerVisible && <ApiTracker isVisible={isApiTrackerVisible} onClose={() => setIsApiTrackerVisible(false)} />}
          {isDatabaseMonitorOpen && <DatabaseScreen onClose={() => setIsDatabaseMonitorOpen(false)} addToast={addToast} />}
    
          {/* Full-screen overlays and pages */}
          {isWalletOpen && currentUser && <WalletScreen onClose={() => setIsWalletOpen(false)} initialTab={walletTab} currentUser={currentUser} updateUser={updateCurrentUser} addToast={addToast} />}
          {isAdminWalletOpen && currentUser && <AdminWalletScreen onClose={() => setIsAdminWalletOpen(false)} user={currentUser} addToast={addToast} />}
          {isSettingsOpen && currentUser && <SettingsScreen onClose={() => setIsSettingsOpen(false)} onLogout={handleLogout} currentUser={currentUser} updateUser={updateCurrentUser} addToast={addToast} onOpenBlockList={() => { setIsSettingsOpen(false); setIsBlockListOpen(true); }} onOpenWallet={(tab = 'Diamante') => { setIsSettingsOpen(false); setWalletTab(tab); setIsWalletOpen(true); }} onOpenLanguageModal={() => { setIsSettingsOpen(false); setIsLanguageModalOpen(true); }} />}
          {isMarketOpen && currentUser && <MarketScreen onClose={() => setIsMarketOpen(false)} user={currentUser} updateUser={updateCurrentUser} onOpenWallet={(tab = 'Diamante') => { setIsMarketOpen(false); setWalletTab(tab); setIsWalletOpen(true); }} addToast={addToast} />}
          {isLevelOpen && currentUser && <LevelScreen onClose={() => setIsLevelOpen(false)} currentUser={currentUser} />}
          {isBlockListOpen && <BlockListScreen onClose={() => setIsBlockListOpen(false)} />}
          {isTopFansOpen && <TopFansScreen onClose={() => setIsTopFansOpen(false)} />}
          {isFanClubMembersOpen && profileScreenState.user && <FanClubMembersScreen streamer={profileScreenState.user} onClose={() => setIsFanClubMembersOpen(false)} onViewProfile={(user) => { setIsFanClubMembersOpen(false); handleViewProfile(user); }} />}
          {isSearchOpen && <SearchScreen onClose={() => setIsSearchOpen(false)} onUserSelected={handleViewProfile} />}
          {isRelOpen && currentUser && <RelationshipScreen initialTab={relTab} onClose={() => setIsRelOpen(false)} currentUser={currentUser} onViewProfile={handleViewProfile} />}
          
          {profileScreenState.user && !isEditingProfile && (
            <UserProfileScreen 
                currentUser={profileScreenState.user} 
                onClose={() => setProfileScreenState({ user: null })} 
                onOpenFans={() => handleOpenRelationship('fans')}
                onOpenFollowing={() => handleOpenRelationship('following')}
                onOpenTopFans={() => setIsTopFansOpen(true)}
                onFollow={() => currentUser && handleFollowUser(profileScreenState.user!, activeStream?.id)}
                onChat={() => {
                    handleStartChatWith(profileScreenState.user!);
                }}
                addToast={addToast}
                onUpdateUser={updateCurrentUser}
            />
          )}
          {profileScreenState.user && isEditingProfile && currentUser && (
            // FIX: Removed extraneous props `currentUser`, `initialMusic`, `onPostComplete` not defined in `EditProfileScreenProps`.
            <EditProfileScreen
              user={profileScreenState.user}
              onClose={() => setIsEditingProfile(false)}
              onSave={handleSaveProfile}
              addToast={addToast}
            />
          )}
          
          {showStreamSummary && lastSummary && currentUser && (
              <EndStreamSummaryScreen
                  currentUser={currentUser}
                  summaryData={lastSummary}
                  onClose={() => setShowStreamSummary(false)}
              />
          )}
    
          {/* Main Content Area */}
          <div className="h-full w-full relative">
            <div style={{ display: activeStream || isGoLiveOpen ? 'none' : 'block', height: '100%' }}>
                {/* Main Screens */}
                <div style={{ display: activeScreen === 'main' ? 'block' : 'none', height: '100%' }}>
                    <MainScreen 
                        onOpenReminderModal={() => setIsReminderOpen(true)}
                        onOpenRegionModal={() => setIsRegionOpen(true)}
                        onSelectStream={handleSelectStream}
                        onOpenSearch={() => setIsSearchOpen(true)}
                        streamers={streamers}
                        isLoading={isLoadingStreams}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        showLocationBanner={true}
                    />
                </div>
                <div style={{ display: activeScreen === 'video' ? 'block' : 'none', height: '100%' }}>
                    <VideoScreen />
                </div>
                <div style={{ display: activeScreen === 'messages' ? 'block' : 'none', height: '100%' }}>
                    <MessagesScreen />
                </div>
                {activeScreen === 'profile' && currentUser && (
                    <ProfileScreen
                        currentUser={currentUser}
                        onOpenUserDetail={() => handleViewProfile(currentUser, true)}
                        onOpenWallet={(tab = 'Diamante') => { setWalletTab(tab); setIsWalletOpen(true); }}
                        onOpenFollowing={() => handleOpenRelationship('following')}
                        onOpenFans={() => handleOpenRelationship('fans')}
                        onOpenVisitors={() => handleOpenRelationship('visitors')}
                        onNavigateToMessages={() => setActiveScreen('messages')}
                        onOpenMarket={() => setIsMarketOpen(true)}
                        onOpenMyLevel={() => setIsLevelOpen(true)}
                        onOpenBlockList={() => setIsBlockListOpen(true)}
                        onOpenFAQ={() => {}}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        onOpenSupportChat={() => handleStartChatWith({ id: 'support-livercore', name: 'Support', avatarUrl: '...' } as User)}
                        onOpenAdminWallet={() => setIsAdminWalletOpen(true)}
                        onOpenApiTracker={() => setIsApiTrackerVisible(true)}
                        onOpenDatabaseMonitor={() => setIsDatabaseMonitorOpen(true)}
                        visitors={visitors}
                    />
                )}
            </div>
    
            {/* Live Screens */}
            {activeStream && currentUser && !pkOpponent && (
              <StreamRoom
                  streamer={activeStream}
                  currentUser={currentUser}
                  liveSession={liveSession}
                  followingUsers={followingUsers}
                  streamers={streamers}
                  onSelectStream={handleSelectStream}
                  onRequestEndStream={() => setIsEndConfirmationOpen(true)}
                  onLeaveStreamView={handleLeaveStream}
                  onViewProfile={handleViewProfile}
                  onFollowUser={handleFollowUser}
                  onStartPKBattle={handleStartPK}
                  onOpenWallet={(tab = 'Diamante') => { setWalletTab(tab); setIsWalletOpen(true); }}
                  onOpenPrivateChat={handleOpenPrivateChat}
                  onOpenPrivateInviteModal={() => setIsPrivateInviteModalOpen(true)}
                  setActiveScreen={setActiveScreen}
                  onStartChatWithStreamer={handleStartChatWith}
                  onOpenPKTimerSettings={() => {}}
                  onOpenFans={() => handleOpenRelationship('fans')}
                  onOpenFriendRequests={() => handleOpenRelationship('fans')}
                  updateUser={updateCurrentUser}
                  updateLiveSession={updateLiveSessionState}
                  logLiveEvent={() => {}}
                  onStreamUpdate={(updates) => setActiveStream(s => s ? {...s, ...updates} : null)}
                  refreshStreamRoomData={refreshStreamRoomData}
                  addToast={addToast}
                  onOpenVIPCenter={() => setIsMarketOpen(true)}
                  onOpenFanClubMembers={(streamer) => { setProfileScreenState({ user: streamer }); setIsFanClubMembersOpen(true); }}
              />
            )}
            {activeStream && currentUser && pkOpponent && (
                <PKBattleScreen 
                    streamer={activeStream} 
                    opponent={pkOpponent} 
                    onEndPKBattle={() => setPkOpponent(null)} 
                    pkBattleDuration={5}
                    currentUser={currentUser}
                    liveSession={liveSession}
                    followingUsers={followingUsers}
                    streamers={streamers}
                    onSelectStream={handleSelectStream}
                    onRequestEndStream={() => setIsEndConfirmationOpen(true)}
                    onLeaveStreamView={handleLeaveStream}
                    onViewProfile={handleViewProfile}
                    onFollowUser={handleFollowUser}
                    onOpenWallet={(tab = 'Diamante') => { setWalletTab(tab); setIsWalletOpen(true); }}
                    onOpenPrivateChat={handleOpenPrivateChat}
                    onOpenPrivateInviteModal={() => setIsPrivateInviteModalOpen(true)}
                    setActiveScreen={setActiveScreen}
                    onStartChatWithStreamer={handleStartChatWith}
                    onOpenPKTimerSettings={() => {}}
                    onOpenFans={() => handleOpenRelationship('fans')}
                    onOpenFriendRequests={() => handleOpenRelationship('fans')}
                    updateUser={updateCurrentUser}
                    updateLiveSession={updateLiveSessionState}
                    logLiveEvent={() => {}}
                    onStreamUpdate={(updates) => setActiveStream(s => s ? {...s, ...updates} : null)}
                    refreshStreamRoomData={refreshStreamRoomData}
                    addToast={addToast}
                    onOpenVIPCenter={() => setIsMarketOpen(true)}
                    onOpenFanClubMembers={(streamer) => { setProfileScreenState({ user: streamer }); setIsFanClubMembersOpen(true); }}
                />
            )}
            {isGoLiveOpen && (
                <GoLiveScreen 
                    onClose={() => setIsGoLiveOpen(false)}
                    onStartStream={handleStartStream}
                    addToast={addToast}
                />
            )}
          </div>
    
          {/* Floating Modals */}
          <ReminderModal isOpen={isReminderOpen} onClose={() => setIsReminderOpen(false)} onOpenHistory={() => { setIsReminderOpen(false); setIsHistoryOpen(true); }} onSelectStream={handleSelectStream} />
          <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
          <RegionModal isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} onSelectRegion={handleRegionSelect} />
          <LanguageSelectionModal isOpen={isLanguageModalOpen} onClose={() => setIsLanguageModalOpen(false)} />
          {activeStream && isPrivateInviteModalOpen && <PrivateInviteModal isOpen={isPrivateInviteModalOpen} onClose={() => setIsPrivateInviteModalOpen(false)} streamId={activeStream.id} hostId={activeStream.hostId} />}
          <EndStreamConfirmationModal isOpen={isEndConfirmationOpen} onConfirm={handleEndStream} onCancel={() => setIsEndConfirmationOpen(false)} />
    
          {/* Footer Navigation */}
          {currentUser && !activeStream && !isGoLiveOpen && (
              <FooterNav
                  currentUser={currentUser}
                  onOpenGoLive={() => setIsGoLiveOpen(true)}
                  activeTab={activeScreen}
                  onNavigate={setActiveScreen}
                  onSecretTap={handleSecretTap}
              />
          )}
    
          {/* Toasts Container */}
          <div className="fixed top-12 right-4 z-[9999] flex flex-col items-end gap-2">
              {toasts.map((toast) => (
                  <Toast key={toast.id} data={toast} onClose={() => setToasts(p => p.filter(t => t.id !== toast.id))} />
              ))}
          </div>
        </div>
      );
};

const App = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
);

export default App;