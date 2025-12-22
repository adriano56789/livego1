
import React from 'react';

const Placeholder = ({ name }: { name: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 text-white p-4">
        <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 text-center">
            <h2 className="text-xl font-bold mb-2 text-[#a855f7]">{name}</h2>
            <p className="text-gray-400 text-sm">Este recurso estará disponível em breve.</p>
            <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-gray-700 rounded-full text-xs font-bold hover:bg-gray-600"
            >
                Fechar / Recarregar
            </button>
        </div>
    </div>
);

export const ChatScreen = (props: any) => <Placeholder name="Chat Screen" />;
export const FollowingScreen = (props: any) => <Placeholder name="Following Screen" />;
export const FansScreen = (props: any) => <Placeholder name="Fans Screen" />;
export const VisitorsScreen = (props: any) => <Placeholder name="Visitors Screen" />;
export const TopFansScreen = (props: any) => <Placeholder name="Top Fans Screen" />;
export const MyLevelScreen = (props: any) => <Placeholder name="My Level Screen" />;
export const BlockListScreen = (props: any) => <Placeholder name="Block List Screen" />;
export const AvatarProtectionScreen = (props: any) => <Placeholder name="Avatar Protection Screen" />;
export const MarketScreen = (props: any) => <Placeholder name="Market Screen" />;
export const FAQScreen = (props: any) => <Placeholder name="FAQ Screen" />;
export const ConfirmPurchaseScreen = (props: any) => <Placeholder name="Confirm Purchase Screen" />;
export const CameraPermissionModal = (props: any) => <Placeholder name="Camera Permission Modal" />;
export const LocationPermissionModal = (props: any) => <Placeholder name="Location Permission Modal" />;
export const PrivateChatModal = (props: any) => <Placeholder name="Private Chat Modal" />;
export const PKBattleTimerSettingsScreen = (props: any) => <Placeholder name="PK Timer Settings" />;
export const FriendRequestsScreen = (props: any) => <Placeholder name="Friend Requests Screen" />;
export const PipSettingsModal = (props: any) => <Placeholder name="PIP Settings" />;
export const FullScreenPhotoViewer = (props: any) => <Placeholder name="Photo Viewer" />;
export const LiveHistoryScreen = (props: any) => <Placeholder name="Live History Screen" />;
export const LanguageSelectionModal = (props: any) => <Placeholder name="Language Selection" />;
export const VIPCenterScreen = (props: any) => <Placeholder name="VIP Center" />;
export const FanClubMembersModal = (props: any) => <Placeholder name="Fan Club Members" />;
export const PrivateInviteNotificationModal = (props: any) => <Placeholder name="Private Invite Notification" />;
export const MusicDetailScreen = (props: any) => <Placeholder name="Music Detail Screen" />;
