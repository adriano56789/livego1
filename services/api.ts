import { User, Gift, Streamer, PurchaseRecord, Message, Conversation, ToastType } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro na requisição: ${response.status}`);
    }

    const result = await response.json();
    return result.data !== undefined ? result.data : result;
}

export const api = {
    login: (credentials: any) => request<{ success: boolean; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    register: (userData: any) => request<{ success: boolean; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    getCurrentUser: () => request<User>('/users/me'),
    getUser: (id: string) => request<User>(`/users/${id}`),
    toggleFollow: (targetId: string) => request<{ success: boolean }>((`/users/${targetId}/toggle-follow`), { method: 'POST' }),
    getLiveStreamers: (category: string) => request<Streamer[]>(`/live/${category}`),
    getGifts: () => request<Gift[]>('/gifts'),
    // Added error property to return type to fix StreamRoom.tsx error
    sendGift: (fromUserId: string, streamId: string, giftName: string, amount: number) => 
        request<{ success: boolean; updatedSender: User; cost: number; error?: string }>(`/streams/${streamId}/gift`, {
            method: 'POST',
            body: JSON.stringify({ fromUserId, giftName, amount })
        }),
    getWalletData: (userId: string) => request<any>(`/wallets/${userId}`),
    requestWithdraw: (amount: number, method: any) => request<any>('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount, method })
    }),
    getReceivedGifts: (userId: string) => request<any[]>(`/users/${userId}/received-gifts`).catch(() => []),
    translate: (text: string, lang: string) => request<{ translatedText: string }>('/translate', {
        method: 'POST',
        body: JSON.stringify({ text, lang })
    }),
    getOnlineUsers: (streamId: string) => request<any[]>(`/streams/${streamId}/users`).catch(() => []),
    getFriends: (userId: string) => request<User[]>(`/users/${userId}/friends`).catch(() => []),
    getFansUsers: (userId: string) => request<User[]>(`/users/${userId}/fans`).catch(() => []),
    getFollowingUsers: (userId: string) => request<User[]>(`/users/${userId}/following`).catch(() => []),
    getVisitors: (userId: string) => request<any[]>(`/users/${userId}/visitors`).catch(() => []),
    getAvatarFrames: () => request<any[]>('/store/frames').catch(() => []),
    buyFrame: (userId: string, frameId: string) => request<any>('/store/frames/buy', { method: 'POST', body: JSON.stringify({ userId, frameId }) }),
    setActiveFrame: (userId: string, frameId: string | null) => request<any>('/users/me/active-frame', { method: 'POST', body: JSON.stringify({ userId, frameId }) }),
    
    // Added missing methods to resolve component errors
    updateStream: (id: string, updates: any) => request<any>(`/streams/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    updateVideoQuality: (id: string, quality: string) => request<any>(`/streams/${id}/quality`, { method: 'POST', body: JSON.stringify({ quality }) }),
    kickUser: (streamId: string, userId: string, moderatorId: string) => request<any>(`/streams/${streamId}/kick`, { method: 'POST', body: JSON.stringify({ userId, moderatorId }) }),
    makeModerator: (streamId: string, userId: string, moderatorId: string) => request<any>(`/streams/${streamId}/moderator`, { method: 'POST', body: JSON.stringify({ userId, moderatorId }) }),
    toggleMicrophone: (streamId: string) => request<any>(`/streams/${streamId}/microphone`, { method: 'POST' }),
    toggleStreamSound: (streamId: string) => request<any>(`/streams/${streamId}/sound`, { method: 'POST' }),
    toggleAutoFollow: (streamId: string, isEnabled: boolean) => request<any>(`/streams/${streamId}/auto-follow`, { method: 'POST', body: JSON.stringify({ isEnabled }) }),
    toggleAutoPrivateInvite: (streamId: string, isEnabled: boolean) => request<any>(`/streams/${streamId}/auto-invite`, { method: 'POST', body: JSON.stringify({ isEnabled }) }),
    getLiveRanking: () => request<any[]>('/ranking/live').catch(() => []),
    getDailyRanking: () => request<any[]>('/ranking/daily').catch(() => []),
    getWeeklyRanking: () => request<any[]>('/ranking/weekly').catch(() => []),
    getMonthlyRanking: () => request<any[]>('/ranking/monthly').catch(() => []),
    getQuickCompleteFriends: () => request<any[]>('/friends/quick').catch(() => []),
    inviteFriendForCoHost: (streamId: string, friendId: string) => request<any>(`/streams/${streamId}/cohost-invite`, { method: 'POST', body: JSON.stringify({ friendId }) }),
    completeQuickFriendTask: (friendId: string) => request<any>('/friends/complete-task', { method: 'POST', body: JSON.stringify({ friendId }) }),
    sendMessage: (hostId: string, text: string) => request<any>('/messages', { method: 'POST', body: JSON.stringify({ to: hostId, text }) }),
    getTopFans: () => request<any[]>('/ranking/top-fans').catch(() => []),
    getBlocklist: () => request<User[]>('/users/me/blocklist').catch(() => []),
    unblockUser: (userId: string) => request<any>(`/users/${userId}/unblock`, { method: 'POST' }),
    updateProfile: (userId: string, updates: any) => request<any>(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    createStream: (streamData: any) => request<any>('/streams', { method: 'POST', body: JSON.stringify(streamData) }),
    getStreamHistory: () => request<any[]>('/users/me/history').catch(() => []),
    getReminders: () => request<any[]>('/reminders').catch(() => []),
    createFeedPost: (payload: any) => request<any>('/feed', { method: 'POST', body: JSON.stringify(payload) }),
    getMusicLibrary: () => request<any[]>('/music').catch(() => []),
    getAdminWithdrawalHistory: (status: string) => request<any[]>(`/admin/withdrawals?status=${status}`).catch(() => []),
    requestAdminWithdrawal: () => request<any>('/admin/withdraw', { method: 'POST' }),
    saveAdminWithdrawalMethod: (email: string) => request<any>('/admin/withdrawal-method', { method: 'POST', body: JSON.stringify({ email }) }),
    calculateWithdrawal: (amount: number) => request<any>('/wallet/calculate', { method: 'POST', body: JSON.stringify({ amount }) }),
    setWithdrawalMethod: (method: string, details: any) => request<any>('/wallet/method', { method: 'POST', body: JSON.stringify({ method, details }) }),
    buyDiamonds: (userId: string, diamonds: number, price: number) => request<any>('/wallet/buy', { method: 'POST', body: JSON.stringify({ userId, diamonds, price }) }),
    updateBillingAddress: (address: any) => request<any>('/wallet/address', { method: 'POST', body: JSON.stringify({ address }) }),
    updateCreditCard: (card: any) => request<any>('/wallet/card', { method: 'POST', body: JSON.stringify({ card }) }),
    confirmPurchaseTransaction: (packageDetails: any, paymentMethod: string) => request<any[]>('/wallet/confirm', { method: 'POST', body: JSON.stringify({ packageDetails, paymentMethod }) }),
    cancelPurchaseTransaction: () => request<any>('/wallet/cancel', { method: 'POST' }),
};