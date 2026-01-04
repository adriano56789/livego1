import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiTrackerService, LogEntry } from '../services/apiTrackerService';
import { ChevronLeftIcon, TrashIcon, PlayIcon, DatabaseIcon } from './icons';
import { api } from '../services/api';
import { LoadingSpinner } from './Loading';

interface ApiTrackerProps {
    isVisible: boolean;
    onClose: () => void;
}

interface ScanResult extends LogEntry {
    response?: any;
    paramsSent?: any;
}

interface EndpointDefinition {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    func: (...args: any[]) => Promise<any>;
    params: { name: string; default?: any }[];
    buildPayload?: (p: any) => any;
    collections: string[];
}

// FIX: Export getApiDefinitions function to be used in other components, resolving circular dependency.
export const getApiDefinitions = (): Array<{ group: string, endpoints: EndpointDefinition[] }> => [
    {
        group: 'Auth',
        endpoints: [
            { method: 'POST', path: '/auth/login', func: api.auth.login, params: [{ name: 'email', default: 'admin@livego.com' }, { name: 'password', default: '123' }], buildPayload: (p: any) => ({ email: p.email, password: p.password }), collections: ['users'] },
            { method: 'POST', path: '/auth/register', func: api.auth.register, params: [{ name: 'name', default: 'Tester' }, { name: 'email', default: `test${Date.now()}@test.com` }, { name: 'password', default: '123' }], buildPayload: (p: any) => ({ name: p.name, email: p.email, password: p.password }), collections: ['users'] },
            { method: 'POST', path: '/auth/logout', func: api.auth.logout, params: [], collections: ['users'] },
            { method: 'GET', path: '/auth/last-email', func: api.auth.getLastEmail, params: [], collections: [] },
            { method: 'POST', path: '/auth/save-email', func: api.auth.saveLastEmail, params: [{ name: 'email', default: 'saved@test.com' }], buildPayload: (p: any) => ({ email: p.email }), collections: [] },
        ]
    },
    {
        group: 'Users',
        endpoints: [
            { method: 'GET', path: '/users/me', func: api.users.me, params: [], collections: ['users'] },
            { method: 'GET', path: '/users/:id', func: api.users.get, params: [{ name: 'id', default: '5582931' }], collections: ['users'] },
            { method: 'GET', path: '/users/online', func: api.users.getOnlineUsers, params: [{ name: 'roomId', default: 'global' }], collections: ['users'] },
            { method: 'GET', path: '/users/:id/fans', func: api.users.getFansUsers, params: [{ name: 'id', default: 'me' }], collections: ['users'] },
            { method: 'GET', path: '/users/:id/friends', func: api.users.getFriends, params: [{ name: 'id', default: 'me' }], collections: ['users'] },
            { method: 'GET', path: '/users/search', func: api.users.search, params: [{ name: 'q', default: 'Mirella' }], collections: ['users'] },
            { method: 'POST', path: '/users/me/language', func: api.users.setLanguage, params: [{ name: 'code', default: 'en' }], buildPayload: (p: any) => ({code: p.code}), collections: ['users'] },
            { method: 'POST', path: '/users/:id', func: api.users.update, params: [{ name: 'id', default: 'me' }, { name: 'data', default: '{"bio":"Nova bio de teste"}' }], buildPayload: (p: any) => JSON.parse(p.data), collections: ['users'] },
            { method: 'POST', path: '/users/:id/follow', func: api.users.toggleFollow, params: [{ name: 'id', default: '9928374' }], collections: ['users'] },
            { method: 'GET', path: '/users/me/withdrawal-history', func: api.users.getWithdrawalHistory, params: [{ name: 'status', default: 'Todos' }], collections: ['transactions'] },
            { method: 'POST', path: '/users/me/blocklist/:userId', func: api.users.blockUser, params: [{ name: 'userId', default: '1122334' }], collections: ['users'] },
            { method: 'GET', path: '/users/me/blocklist', func: api.getBlocklist, params: [], collections: ['users'] },
            { method: 'POST', path: '/users/me/blocklist/:userId/unblock', func: api.unblockUser, params: [{ name: 'userId', default: '1122334' }], collections: ['users'] },
            { method: 'GET', path: '/users/:userId/following', func: api.getFollowingUsers, params: [{ name: 'userId', default: 'me' }], collections: ['users'] },
            { method: 'GET', path: '/users/:userId/visitors', func: api.getVisitors, params: [{ name: 'userId', default: 'me' }], collections: ['users'] },
            { method: 'GET', path: '/users/me/history', func: api.getStreamHistory, params: [], collections: [] },
            { method: 'GET', path: '/users/me/reminders', func: api.getReminders, params: [], collections: [] },
            { method: 'DELETE', path: '/users/me/reminders/:id', func: api.removeReminder, params: [{ name: 'id', default: 'rem-1' }], collections: [] },
            { method: 'POST', path: '/users/:userId/active-frame', func: api.setActiveFrame, params: [{ name: 'userId', default: 'me' }, { name: 'frameId', default: 'FrameBlueCrystal' }], buildPayload: (p) => ({ frameId: p.frameId }), collections: ['users'] },
            { method: 'POST', path: '/users/me/billing-address', func: api.updateBillingAddress, params: [{ name: 'address', default: '{"street":"Test St", "number":"123"}' }], buildPayload: (p) => JSON.parse(p.address), collections: ['users'] },
            { method: 'POST', path: '/users/me/credit-card', func: api.updateCreditCard, params: [{ name: 'card', default: '{"number":"4242424242424242"}' }], buildPayload: (p) => JSON.parse(p.card), collections: ['users'] },
        ]
    },
    {
        group: 'Chats',
        endpoints: [
            { method: 'GET', path: '/chats/conversations', func: api.chats.listConversations, params: [], collections: ['conversations', 'users'] },
            { method: 'POST', path: '/chats/start', func: api.chats.start, params: [{ name: 'userId', default: '9928374' }], buildPayload: (p: any) => ({ userId: p.userId }), collections: ['conversations', 'users'] },
        ]
    },
    {
        group: 'Gifts & Wallet',
        endpoints: [
            { method: 'GET', path: '/gifts', func: api.gifts.list, params: [{ name: 'category', default: 'Popular' }], collections: ['gifts'] },
            { method: 'GET', path: '/gifts/gallery', func: api.gifts.getGallery, params: [], collections: ['gifts'] },
            { method: 'POST', path: '/presentes/recarregar', func: api.gifts.recharge, params: [], collections: ['users'] },
            { method: 'POST', path: '/gift', func: api.sendGift, params: [{ name: 'from', default: 'me' }, { name: 'streamId', default: '8827364' }, { name: 'giftName', default: 'Rosa' }, { name: 'count', default: 1 }, { name: 'targetId', default: '9928374' }], collections: ['users', 'transactions'] },
            { method: 'GET', path: '/wallet/balance', func: api.diamonds.getBalance, params: [{ name: 'userId', default: 'me' }], collections: ['users'] },
            { method: 'POST', path: '/users/:userId/purchase', func: api.diamonds.purchase, params: [{ name: 'userId', default: 'me' }, { name: 'diamonds', default: 800 }, { name: 'price', default: 7 }], buildPayload: (p) => ({ diamonds: p.diamonds, price: p.price }), collections: ['users', 'transactions'] },
            { method: 'POST', path: '/wallet/confirm-purchase', func: api.confirmPurchaseTransaction, params: [{ name: 'details', default: '{"diamonds":800, "price":7}' }, { name: 'method', default: 'card' }], buildPayload: (p) => ({ details: JSON.parse(p.details), method: p.method }), collections: ['transactions', 'users'] },
            { method: 'POST', path: '/wallet/cancel-purchase', func: api.cancelPurchaseTransaction, params: [], collections: [] },
        ]
    },
    {
        group: 'Earnings & Admin',
        endpoints: [
            { method: 'POST', path: '/earnings/withdraw/calculate', func: api.earnings.withdraw.calculate, params: [{ name: 'amount', default: 10000 }], buildPayload: (p) => ({ amount: p.amount }), collections: ['users'] },
            { method: 'POST', path: '/earnings/withdraw/request', func: api.earnings.withdraw.request, params: [{ name: 'amount', default: 10000 }, { name: 'method', default: '{"method":"pix", "details":{"key":"test@test.com"}}' }], buildPayload: (p) => ({ amount: p.amount, method: JSON.parse(p.method) }), collections: ['users', 'transactions'] },
            { method: 'POST', path: '/earnings/withdraw/methods', func: api.earnings.withdraw.methods.update, params: [{ name: 'method', default: 'pix' }, { name: 'details', default: '{"key":"new@test.com"}' }], collections: ['users'] },
            { method: 'GET', path: '/admin/withdrawals', func: api.admin.getAdminWithdrawalHistory, params: [], collections: ['transactions'] },
            { method: 'POST', path: '/admin/withdrawals/request', func: api.admin.withdraw.request, params: [{ name: 'amount', default: 100 }], buildPayload: (p) => ({ amount: p.amount }), collections: ['transactions', 'users'] },
            { method: 'POST', path: '/admin/withdrawals/method', func: api.admin.saveAdminWithdrawalMethod, params: [{ name: 'details', default: '{"type":"email", "email":"admin@livego.com"}' }], buildPayload: (p) => JSON.parse(p.details), collections: ['users'] },
        ]
    },
    {
        group: 'Streams & Live',
        endpoints: [
            { method: 'GET', path: '/live/:category', func: api.streams.listByCategory, params: [{ name: 'category', default: 'popular' }, { name: 'region', default: 'global' }], collections: ['streamers'] },
            { method: 'POST', path: '/streams', func: api.streams.create, params: [{ name: 'data', default: '{"name":"Live de Teste", "hostId":"me"}' }], buildPayload: (p: any) => JSON.parse(p.data), collections: ['streamers', 'users'] },
            { method: 'PATCH', path: '/streams/:id', func: api.streams.update, params: [{ name: 'id', default: '8827364' }, { name: 'data', default: '{"isPrivate":true}' }], buildPayload: (p) => JSON.parse(p.data), collections: ['streamers'] },
            { method: 'PATCH', path: '/streams/:id/quality', func: api.streams.updateVideoQuality, params: [{ name: 'id', default: '8827364' }, { name: 'quality', default: '1080p' }], buildPayload: (p) => ({ quality: p.quality }), collections: ['streamers'] },
            { method: 'GET', path: '/streams/:streamId/donors', func: api.streams.getGiftDonors, params: [{ name: 'streamId', default: '8827364' }], collections: ['users'] },
            { method: 'GET', path: '/streams/search', func: api.streams.search, params: [{ name: 'q', default: 'Live' }], collections: ['streamers'] },
            { method: 'POST', path: '/streams/:streamId/invite', func: api.streams.inviteToPrivateRoom, params: [{ name: 'streamId', default: '8827364' }, { name: 'userId', default: '3456754' }], buildPayload: (p) => ({ userId: p.userId }), collections: [] },
            { method: 'POST', path: '/streams/:streamId/cohost/invite', func: api.inviteFriendForCoHost, params: [{ name: 'streamId', default: '8827364' }, { name: 'friendId', default: '8827361' }], buildPayload: (p) => ({ friendId: p.friendId }), collections: [] },
            { method: 'POST', path: '/streams/:r/kick', func: api.kickUser, params: [{ name: 'r', default: '8827364' }, { name: 'u', default: '3456754' }], buildPayload: (p) => ({ userId: p.u }), collections: [] },
            { method: 'POST', path: '/streams/:r/moderator', func: api.makeModerator, params: [{ name: 'r', default: '8827364' }, { name: 'u', default: '3456754' }], buildPayload: (p) => ({ userId: p.u }), collections: [] },
            { method: 'GET', path: '/streams/beauty-settings', func: api.streams.getBeautySettings, params: [], collections: [] },
            { method: 'POST', path: '/streams/beauty-settings', func: api.streams.saveBeautySettings, params: [{ name: 'settings', default: '{"smooth": 50}' }], buildPayload: (p) => JSON.parse(p.settings), collections: [] },
            { method: 'POST', path: '/streams/beauty-settings/reset', func: api.streams.resetBeautySettings, params: [], collections: [] },
            { method: 'POST', path: '/live/toggle-mic', func: api.toggleMicrophone, params: [], collections: [] },
            { method: 'POST', path: '/live/toggle-sound', func: api.toggleStreamSound, params: [], collections: [] },
            { method: 'POST', path: '/live/toggle-autofollow', func: api.toggleAutoFollow, params: [], collections: [] },
            { method: 'POST', path: '/live/toggle-autoinvite', func: api.toggleAutoPrivateInvite, params: [], collections: [] },
        ]
    },
    {
        group: 'Assets & Misc',
        endpoints: [
            { method: 'GET', path: '/ranking/daily', func: api.getDailyRanking, params: [], collections: ['users'] },
            { method: 'GET', path: '/ranking/weekly', func: api.getWeeklyRanking, params: [], collections: ['users'] },
            { method: 'GET', path: '/ranking/monthly', func: api.getMonthlyRanking, params: [], collections: ['users'] },
            { method: 'GET', path: '/ranking/top-fans', func: api.getTopFans, params: [], collections: ['users'] },
            { method: 'GET', path: '/tasks/quick-friends', func: api.getQuickCompleteFriends, params: [], collections: ['users'] },
            { method: 'POST', path: '/tasks/quick-friends/:friendId/complete', func: api.completeQuickFriendTask, params: [{ name: 'friendId', default: 'qf1' }], collections: [] },
            { method: 'GET', path: '/assets/music', func: api.getMusicLibrary, params: [], collections: ['music'] },
            { method: 'GET', path: '/assets/frames', func: api.getAvatarFrames, params: [], collections: ['frames'] },
            { method: 'POST', path: '/posts', func: api.createFeedPost, params: [{ name: 'data', default: '{"type":"image", "mediaData":"base64..."}' }], buildPayload: (p) => JSON.parse(p.data), collections: ['users', 'posts'] },
            { method: 'POST', path: '/translate', func: api.translate, params: [{ name: 'text', default: 'hello world' }], buildPayload: (p) => ({ text: p.text }), collections: [] },
        ]
    },
    {
        group: 'Database',
        endpoints: [
            { method: 'GET', path: '/db/collections', func: api.db.checkCollections, params: [], collections: ['*'] },
            { method: 'POST', path: '/db/setup', func: api.db.setupDatabase, params: [{ name: 'collections', default: '["users", "gifts"]' }], buildPayload: (p) => ({ collections: JSON.parse(p.collections) }), collections: ['*'] },
        ]
    }
];

const getEndpointKey = (endpoint: EndpointDefinition) => `${endpoint.method}-${endpoint.path}`;

const PostmanResult: React.FC<{ result: ScanResult }> = ({ result }) => {
    const statusColor = result.status === 'Success' ? 'text-green-400' : 'text-red-400';
    return (
        <div className="mt-3 bg-black/40 font-mono text-xs space-y-3 p-4">
            <div className="flex justify-between items-center text-gray-400 text-[10px]">
                <span className={`font-bold ${statusColor}`}>STATUS: {result.status.toUpperCase()}{result.statusCode ? ` (${result.statusCode})` : ''}</span>
                <span>DURAÇÃO: {result.duration}ms</span>
            </div>
            {result.paramsSent && Object.keys(result.paramsSent).length > 0 && (
                <div>
                    <h4 className="font-bold text-gray-500 text-[9px] uppercase tracking-wider">Parâmetros</h4>
                    <pre className="text-gray-300 bg-black/30 p-2 rounded mt-1 text-[10px] whitespace-pre-wrap">{JSON.stringify(result.paramsSent, null, 2)}</pre>
                </div>
            )}
            <div>
                <h4 className="font-bold text-gray-500 text-[9px] uppercase tracking-wider">Resposta</h4>
                <pre className={`${statusColor} bg-black/30 p-2 rounded mt-1 text-[10px] whitespace-pre-wrap`}>
                    {result.status === 'Success' ? JSON.stringify(result.response, null, 2) : result.error}
                </pre>
            </div>
        </div>
    );
};

const LogItem: React.FC<{ log: LogEntry }> = ({ log }) => {
    const statusColor = useMemo(() => {
        switch(log.status) {
            case 'Success': return 'text-green-400';
            case 'Error': return 'text-red-400';
            case 'Timeout': return 'text-yellow-400';
            default: return 'text-gray-500 animate-pulse';
        }
    }, [log.status]);

    return (
        <div className="border-b border-white/5 last:border-b-0">
            <div className={`flex items-center justify-between py-2.5 px-3 text-xs font-mono`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`font-bold w-10 text-center ${log.method === 'GET' ? 'text-blue-400' : 'text-orange-400'}`}>{log.method}</span>
                    <span className="text-gray-300 truncate">{log.endpoint}</span>
                </div>
                <div className="flex items-center gap-4 pl-4">
                    <span className={`${statusColor} font-bold w-24 text-left`}>{log.status}{log.statusCode ? ` (${log.statusCode})` : ''}</span>
                    <span className="text-gray-500 w-16 text-right">{log.duration ? `${log.duration}ms` : '...'}</span>
                </div>
            </div>
        </div>
    );
};


const ApiTracker: React.FC<ApiTrackerProps> = ({ isVisible, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [failures, setFailures] = useState<LogEntry[]>([]);
    const [activeTab, setActiveTab] = useState('Executar Teste');
    const API_DEFINITIONS = getApiDefinitions();

    const [isFullScanning, setIsFullScanning] = useState(false);
    const [resultsMap, setResultsMap] = useState<Map<string, ScanResult>>(new Map());
    const [scanStats, setScanStats] = useState({ success: 0, error: 0, total: 0 });

    const tabs = ['Executar Teste', 'Resultados', 'Logs', 'Falhas'];

    useEffect(() => {
        if (!isVisible) return;
        const unsubscribeLogs = apiTrackerService.subscribe(setLogs);
        const unsubscribeFailures = apiTrackerService.subscribeToFailures(setFailures);
        return () => {
            unsubscribeLogs();
            unsubscribeFailures();
        };
    }, [isVisible]);
    
    const handleRunFullScan = async () => {
        apiTrackerService.clearLogs();
        setIsFullScanning(true);
        setActiveTab('Resultados');
        setResultsMap(new Map());
        setScanStats({ success: 0, error: 0, total: 0 });

        const allEndpoints = API_DEFINITIONS.flatMap(group => group.endpoints);
        setScanStats(prev => ({ ...prev, total: allEndpoints.length }));

        for (const endpoint of allEndpoints) {
            const key = getEndpointKey(endpoint);
            const startTime = Date.now();
            
            const resultEntry: Partial<ScanResult> = {
                id: key,
                method: endpoint.method,
                endpoint: endpoint.path,
                startTime,
            };

            try {
                const defaultParams: Record<string, any> = {};
                endpoint.params.forEach(p => { defaultParams[p.name] = p.default ?? ''; });
                resultEntry.paramsSent = defaultParams;
                const args = endpoint.params.map(p => defaultParams[p.name]);
                
                let response;
                if (endpoint.buildPayload) {
                    const payload = endpoint.buildPayload(defaultParams);
                    resultEntry.paramsSent = payload;
                    const finalArgs = endpoint.func.length === 1 ? [payload] : [args[0], payload];
                    response = await endpoint.func(...finalArgs);
                } else {
                    response = await endpoint.func(...args);
                }
                
                resultEntry.status = 'Success';
                resultEntry.response = response;
                setScanStats(prev => ({ ...prev, success: prev.success + 1 }));

            } catch (error: any) {
                resultEntry.status = 'Error';
                resultEntry.error = (error as Error).message || 'Unknown Error';
                if(error.status) resultEntry.statusCode = error.status;
                setScanStats(prev => ({ ...prev, error: prev.error + 1 }));
            } finally {
                resultEntry.duration = Date.now() - startTime;
                setResultsMap(prev => new Map(prev).set(key, resultEntry as ScanResult));
            }
        }
        setIsFullScanning(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-[#121212] flex flex-col font-sans animate-in fade-in duration-300">
            <header className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1C1C1E] shrink-0">
                <button onClick={onClose}><ChevronLeftIcon className="w-6 h-6 text-white" /></button>
                <h1 className="text-white font-bold text-lg">LiveGo API Monitor</h1>
                <div className="w-6"></div>
            </header>
            <div className="flex p-2 bg-[#1C1C1E] border-b border-white/10 shrink-0">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-bold rounded-lg ${activeTab === tab ? 'bg-purple-600 text-white' : '