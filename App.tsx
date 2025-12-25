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
import MarketScreen from './components/screens/MarketScreen';

const AppContent: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState<boolean>(true);
    const [activeScreen, setActiveScreen] = useState<'main' | 'profile' | 'messages' | 'video'>('main');
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [activeStream, setActiveStream] = useState<Streamer | null>(null);
    const [streamRoomData, setStreamRoomData] = useState<any>(null);
    const [isWalletScreenOpen, setIsWalletScreenOpen] = useState(false);
    const [liveSession, setLiveSession] = useState<LiveSessionState | null>(null);
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [activeCategory, setActiveCategory] = useState('popular');
    const [isEndStreamConfirmOpen, setIsEndStreamConfirmOpen] = useState(false);
    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [isSettingsScreenOpen, setIsSettingsScreenOpen] = useState(false);
    const [isSearchScreenOpen, setIsSearchScreenOpen] = useState(false);
    const [isMarketScreenOpen, setIsMarketScreenOpen] = useState(false);
    const [isFollowingScreenOpen, setIsFollowingScreenOpen] = useState(false);
    const [isFansScreenOpen, setIsFansScreenOpen] = useState(false);
    const [isVisitorsScreenOpen, setIsVisitorsScreenOpen] = useState(false);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
        // Ativação do WebSocket Real
        webSocketManager.connect(user.id);
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            webSocketManager.disconnect();
            setIsAuthenticated(false);
            setCurrentUser(null);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        api.getCurrentUser().then(user => { if (user) handleLogin(user); }).finally(() => setIsLoadingCurrentUser(false));
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            api.getLiveStreamers(activeCategory).then(setStreamers).catch(console.error);
        }
    }, [isAuthenticated, activeCategory]);

    const handleSelectStream = async (streamer: Streamer) => {
        if (!currentUser) return;
        try {
            const [gifts, receivedGifts] = await Promise.all([api.getGifts(), api.getReceivedGifts(streamer.hostId)]);
            setStreamRoomData({ gifts, receivedGifts });
            setActiveStream(streamer);
            setLiveSession({
                startTime: Date.now(), viewers: streamer.viewers, peakViewers: streamer.viewers,
                coins: 0, followers: 0, members: 0, fans: 0, events: [],
                isMicrophoneMuted: false, isStreamMuted: false, isAutoFollowEnabled: false, isAutoPrivateInviteEnabled: false
            });
        } catch (error) { addToast(ToastType.Error, "Falha ao entrar na live."); }
    };

    const handleLeaveStreamView = useCallback(() => {
        setActiveStream(null);
        setStreamRoomData(null);
        setLiveSession(null);
    }, []);

    if (isLoadingCurrentUser) return <div className="h-full w-full bg-black flex items-center justify-center"><LoadingSpinner /></div>;
    if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;

    return (
        <div className="h-full w-full bg-black text-white overflow-hidden relative">
            {activeStream && streamRoomData && currentUser ? (
                <StreamRoom
                    streamer={activeStream}
                    currentUser={currentUser}
                    gifts={streamRoomData.gifts}
                    receivedGifts={streamRoomData.receivedGifts}
                    updateUser={setCurrentUser}
                    liveSession={liveSession}
                    updateLiveSession={(upd) => setLiveSession(p => p ? {...p, ...upd} : null)}
                    onLeaveStreamView={handleLeaveStreamView}
                    onRequestEndStream={() => setIsEndStreamConfirmOpen(true)}
                    onViewProfile={setViewingProfile}
                    addToast={addToast}
                    streamers={streamers}
                    onSelectStream={handleSelectStream}
                    followingUsers={[]}
                    onFollowUser={async (u) => { await api.toggleFollow(u.id); addToast(ToastType.Success, "Seguido!"); }}
                    onOpenWallet={(tab) => setIsWalletScreenOpen(true)}
                    onOpenVIPCenter={()=>{}}
                    onOpenFanClubMembers={()=>{}}
                    onStartChatWithStreamer={()=>{}}
                    onStartPKBattle={()=>{}}
                    refreshStreamRoomData={()=>{}}
                    onStreamUpdate={()=>{}}
                    logLiveEvent={()=>{}}
                    setActiveScreen={setActiveScreen}
                    onOpenPrivateChat={()=>{}}
                    onOpenPrivateInviteModal={()=>{}}
                    onOpenPKTimerSettings={()=>{}}
                    onOpenFans={()=>{}}
                    onOpenFriendRequests={()=>{}}
                />
            ) : (
                <>
                    <div className="h-full">
                        {activeScreen === 'main' && <MainScreen streamers={streamers} isLoading={false} activeTab={activeCategory} onTabChange={setActiveCategory} onSelectStream={handleSelectStream} onOpenReminderModal={()=>{}} onOpenRegionModal={()=>{}} onOpenSearch={()=>setIsSearchScreenOpen(true)} showLocationBanner={false} />}
                        {activeScreen === 'profile' && currentUser && <ProfileScreen 
                            currentUser={currentUser} 
                            onOpenWallet={() => setIsWalletScreenOpen(true)} 
                            onOpenSettings={()=>setIsSettingsScreenOpen(true)} 
                            onNavigateToMessages={()=>setActiveScreen('messages')} 
                            onOpenFans={()=>setIsFansScreenOpen(true)} 
                            onOpenFollowing={()=>setIsFollowingScreenOpen(true)} 
                            onOpenVisitors={()=>setIsVisitorsScreenOpen(true)} 
                            onOpenUserDetail={()=>setViewingProfile(currentUser)} 
                            onOpenProfile={()=>setViewingProfile(currentUser)} 
                            onEnterMyStream={()=>{}} 
                            onOpenTopFans={()=>{}} 
                            onOpenMarket={()=>setIsMarketScreenOpen(true)} 
                            onOpenMyLevel={()=>{}} 
                            onOpenBlockList={()=>{}} 
                            onOpenAvatarProtection={()=>{}} 
                            onOpenFAQ={()=>{}} 
                            onOpenSupportChat={()=>{}} 
                            onOpenAdminWallet={()=>{}} 
                            visitors={[]} 
                        />}
                        {activeScreen === 'messages' && <MessagesScreen />}
                        {activeScreen === 'video' && <VideoScreen />}
                    </div>
                    <FooterNav currentUser={currentUser} activeTab={activeScreen} onNavigate={setActiveScreen} onOpenGoLive={()=>{}} />
                </>
            )}

            {isWalletScreenOpen && currentUser && <WalletScreen onClose={() => setIsWalletScreenOpen(false)} currentUser={currentUser} updateUser={setCurrentUser} addToast={addToast} />}
            {viewingProfile && <UserProfileScreen currentUser={viewingProfile} onClose={() => setViewingProfile(null)} onOpenFans={()=>{}} onOpenFollowing={()=>{}} onOpenTopFans={()=>{}} />}
            {isSettingsScreenOpen && <SettingsScreen onClose={() => setIsSettingsScreenOpen(false)} currentUser={currentUser} onLogout={handleLogout} />}
            {isSearchScreenOpen && <SearchScreen onClose={() => setIsSearchScreenOpen(false)} />}
            {isMarketScreenOpen && currentUser && <MarketScreen onClose={() => setIsMarketScreenOpen(false)} user={currentUser} updateUser={setCurrentUser} onOpenWallet={() => setIsWalletScreenOpen(true)} addToast={addToast} />}
            {isFollowingScreenOpen && <RelationshipScreen initialTab="following" onClose={() => setIsFollowingScreenOpen(false)} currentUser={currentUser} />}
            {isFansScreenOpen && <RelationshipScreen initialTab="fans" onClose={() => setIsFansScreenOpen(false)} currentUser={currentUser} />}
            {isVisitorsScreenOpen && <RelationshipScreen initialTab="visitors" onClose={() => setIsVisitorsScreenOpen(false)} currentUser={currentUser} />}

            <div className="absolute top-4 right-4 space-y-2 z-[9999] pointer-events-none">
                {toasts.map(t => <Toast key={t.id} data={t} onClose={()=>{}} />)}
            </div>
        </div>
    );
};

const App: React.FC = () => <LanguageProvider><AppContent /></LanguageProvider>;
export default App;