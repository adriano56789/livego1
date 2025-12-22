import { User, Gift, Streamer, PurchaseRecord, MusicTrack, RankedUser, Visitor } from '../types';

const getBaseUrl = () => {
    // No navegador, se não for localhost, usamos o proxy relativo do Nginx
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        // Em produção (VPS), o Nginx escuta em /api e manda pro Node
        return '/api';
    }
    return 'http://localhost:3000/api';
};

const API_BASE_URL = getBaseUrl();

const callApi = async <T>(method: string, path: string, body?: any): Promise<T> => {
    try {
        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        };

        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const url = `${API_BASE_URL}${cleanPath}`;
        
        console.log(`[API CALL] ${method} ${url}`);
        const res = await fetch(url, options);
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error(`API Error [${method} ${path}]:`, error);
        throw error;
    }
};

export const api = {
    // USUÁRIOS
    getCurrentUser: () => callApi<User>('GET', '/users/me'),
    getUser: (id: string) => callApi<User>('GET', `/users/${id}`),
    getAllUsers: () => callApi<User[]>('GET', '/users'),
    updateProfile: (id: string, data: any) => callApi<{ success: boolean, user: User }>('PATCH', `/users/${id}`, data),
    updateSimStatus: (online: boolean) => callApi<{ success: boolean, user: User }>('POST', '/users/status', { online }),
    deleteAccount: (userId: string) => callApi<{ success: boolean }>('DELETE', `/users/${userId}`),
    
    // STREAMS
    getLiveStreamers: (cat: string, country?: string) => callApi<Streamer[]>('GET', `/streams?cat=${cat}${country ? `&country=${country}` : ''}`),
    createStream: (data: any) => callApi<Streamer>('POST', '/streams', data),
    joinStream: (id: string) => callApi<{ success: boolean }>('POST', `/streams/${id}/join`),
    leaveStream: (id: string) => callApi<{ success: boolean }>('POST', `/streams/${id}/leave`),
    updateStream: (roomId: string, data: any) => callApi<{ success: boolean, stream: Streamer }>('PATCH', `/streams/${roomId}`, data),
    updateVideoQuality: (roomId: string, quality: string) => callApi<{ success: boolean, stream: Streamer }>('POST', `/streams/${roomId}/quality`, { quality }),
    getOnlineUsers: (roomId: string) => callApi<(User & { value: number })[]>('GET', `/streams/${roomId}/online-users`),
    endLiveSession: (roomId: string, sessionState: any) => callApi<{ success: boolean, summary: any }>('POST', `/streams/${roomId}/end`, sessionState),
    getStreamHistory: () => callApi<any[]>('GET', '/users/me/stream-history'),
    getReminders: () => callApi<any[]>('GET', '/users/me/reminders'),
    getStreamMessages: (roomId: string) => callApi<any[]>('GET', `/streams/${roomId}/messages`),

    // PRESENTES E RANKING
    getGifts: () => callApi<Gift[]>('GET', '/gifts'),
    /* Added error property to the return type to fix TypeScript errors in consuming components */
    sendGift: (fromUserId: string, streamId: string, giftName: string, amount: number) => 
        callApi<{ success: boolean, updatedSender: User, cost: number, error?: string }>('POST', '/gifts/send', { fromUserId, streamId, giftName, amount }),
    getReceivedGifts: (streamerId: string) => callApi<(Gift & { count: number })[]>('GET', `/streams/${streamerId}/received-gifts`),
    
    getLiveRanking: () => callApi<RankedUser[]>('GET', '/rankings/live'),
    getDailyRanking: () => callApi<RankedUser[]>('GET', '/rankings/daily'),
    getWeeklyRanking: () => callApi<RankedUser[]>('GET', '/rankings/weekly'),
    getMonthlyRanking: () => callApi<RankedUser[]>('GET', '/rankings/monthly'),
    getTopFans: () => callApi<any[]>('GET', '/rankings/top-fans'),

    // CARTEIRA
    getWalletData: () => callApi<any>('GET', '/wallet'),
    calculateWithdrawal: (amount: number) => callApi<any>('POST', '/wallet/calculate', { amount }),
    requestWithdraw: (amount: number, method: any) => callApi<{ success: boolean, message?: string, record: any }>('POST', '/wallet/withdraw', { amount, method }),
    setWithdrawalMethod: (method: string, details: any) => callApi<{ success: boolean, user: User }>('POST', '/users/me/withdrawal-method', { method, details }),
    buyDiamonds: (userId: string, diamonds: number, price: number) => callApi<{ success: boolean, user: User }>('POST', '/wallet/buy-diamonds', { userId, diamonds, price }),

    // OUTROS
    getChatMessages: (userId: string) => callApi<any[]>('GET', `/chats/${userId}`),
    sendChatMessage: (from: string, to: string, text: string) => callApi<{ success: boolean }>('POST', '/chats', { from, to, text }),
    translate: (text: string, lang: string) => callApi<{ translatedText: string }>('POST', '/translate', { text, lang }),
    getAvatarFrames: () => callApi<any[]>('GET', '/market/frames'),
    buyFrame: (userId: string, frameId: string) => callApi<{ success: boolean, user: User, error?: string }>('POST', '/market/buy-frame', { userId, frameId }),
    setActiveFrame: (userId: string, frameId: string | null) => callApi<{ success: boolean, user: User }>('POST', '/users/me/active-frame', { frameId }),
    createFeedPost: (data: any) => callApi<{ success: boolean, user: User }>('POST', '/feed', data),
    getMusicLibrary: () => callApi<MusicTrack[]>('GET', '/music'),
    followUser: (fromUserId: string, toUserId: string, streamId?: string) => 
        callApi<{ success: boolean, updatedFollower: User, updatedFollowed: User }>('POST', '/users/follow', { fromUserId, toUserId, streamId }),
    getFriends: (userId: string) => callApi<User[]>('GET', `/users/${userId}/friends`),
    getFollowingUsers: (userId: string) => callApi<User[]>('GET', `/users/${userId}/following`),
    getFansUsers: (userId: string) => callApi<User[]>('GET', `/users/${userId}/fans`),
    getVisitors: (userId: string) => callApi<Visitor[]>('GET', `/users/${userId}/visitors`),
    getBlockedUsers: () => callApi<User[]>('GET', '/users/me/blocked'),
    unblockUser: (userId: string) => callApi<{ success: boolean }>('POST', '/users/unblock', { userId }),
    getQuickCompleteFriends: () => callApi<any[]>('GET', '/users/quick-friends'),
    completeQuickFriendTask: (friendId: string) => callApi<{ success: boolean }>('POST', '/users/complete-quick-task', { friendId }),
    kickUser: (roomId: string, userId: string, adminId: string) => callApi<{ success: boolean }>('POST', `/streams/${roomId}/kick`, { userId, adminId }),
    makeModerator: (roomId: string, userId: string, adminId: string) => callApi<{ success: boolean }>('POST', `/streams/${roomId}/moderator`, { userId, adminId }),
    toggleMicrophone: (roomId: string) => callApi<{ success: boolean }>('POST', `/streams/${roomId}/toggle-mic`),
    toggleStreamSound: (roomId: string) => callApi<{ success: boolean }>('POST', `/streams/${roomId}/toggle-sound`),
    toggleAutoFollow: (roomId: string, enabled: boolean) => callApi<{ success: boolean }>('POST', `/streams/${roomId}/auto-follow`, { enabled }),
    toggleAutoPrivateInvite: (roomId: string, enabled: boolean) => callApi<{ success: boolean }>('POST', `/streams/${roomId}/auto-invite`, { enabled }),
    inviteFriendForCoHost: (streamId: string, friendId: string) => callApi<{ success: boolean, message?: string, error?: string }>('POST', `/streams/${streamId}/invite-cohost`, { friendId }),
    getAdminWithdrawalHistory: (filter: string) => callApi<PurchaseRecord[]>('GET', `/admin/withdrawals?filter=${filter}`),
    requestAdminWithdrawal: () => callApi<{ success: boolean }>('POST', '/admin/withdraw'),
    saveAdminWithdrawalMethod: (email: string) => callApi<{ success: boolean }>('POST', '/admin/withdrawal-method', { email }),
    confirmPurchaseTransaction: (details: any, method: string) => callApi<any[]>('POST', '/wallet/confirm-purchase', { details, method }),
    cancelPurchaseTransaction: () => callApi<{ success: boolean }>('POST', '/wallet/cancel-purchase'),
    updateBillingAddress: (address: any) => callApi<{ success: boolean }>('POST', '/users/me/billing-address', { address }),
    updateCreditCard: (card: any) => callApi<{ success: boolean }>('POST', '/users/me/billing-address', { card }),
};