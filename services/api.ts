import { API_CONFIG } from './config';
import { mockData } from './mockData';
import { User, Streamer, Gift, Conversation, RankedUser, MusicTrack, PurchaseRecord } from '../types';
import { webSocketManager } from './websocket';
import { GIFTS } from '../constants';
import { GiftPayload } from '../components/live/GiftAnimationOverlay';

// Conectando à API real
const USE_MOCK = false;
const TOKEN_KEY = '@LiveGo:token';
const USER_KEY = '@LiveGo:user';

/**
 * BANCO DE DADOS MOCHA PERSISTENTE
 */
let db_currentUser: User = { 
    ...mockData.currentUser, 
    platformEarnings: 1250.75,
    withdrawal_method: { method: 'email', details: { email: 'admin@livego.com' } },
    notificationSettings: {
        newMessages: true,
        streamerLive: true,
        newFollower: false,
        followedPosts: true,
        pedido: true,
        interactive: false,
        push: true,
        followerPost: true,
        order: false,
        giftAlertsOnScreen: true,
        giftSoundEffects: true,
        giftLuxuryBanners: false,
    } 
};
let db_onlineUsers = [...mockData.onlineUsers];
let db_streams = [...mockData.streams];
let db_reminders = [
    { id: 'rem-1', name: 'Mirella Oficial', avatar: 'https://picsum.photos/seed/rem1/200', isLive: true },
    { id: 'rem-2', name: 'DJ Arromba', avatar: 'https://picsum.photos/seed/rem2/200', isLive: false },
    { id: 'rem-3', name: 'Gamer Master', avatar: 'https://picsum.photos/seed/rem3/200', isLive: true }
];

const generateInitialAdminWithdrawals = (): PurchaseRecord[] => {
    const records: PurchaseRecord[] = [];
    const recordCount = Math.floor(Math.random() * 10) + 8; // 8 a 17 registros
    const statuses: PurchaseRecord['status'][] = ['Concluído', 'Pendente', 'Cancelado', 'Processando', 'Falhou'];
    const types: PurchaseRecord['type'][] = ['fee', 'withdrawal'];
    const names = ['Mirella', 'DJ Arromba', 'Gamer Master', 'Alice Star', 'Usuário VIP'];

    for (let i = 0; i < recordCount; i++) {
        const type = Math.random() > 0.2 ? 'fee' : 'withdrawal';
        let status = statuses[Math.floor(Math.random() * statuses.length)];
        if (type === 'withdrawal' && Math.random() > 0.5) {
            status = 'Pendente';
        }
        if (status === 'Pendente' && Math.random() > 0.8) {
             status = 'Concluído';
        }

        const amount = type === 'fee' ? Math.random() * 200 + 10 : Math.random() * 1000 + 500;
        const name = names[Math.floor(Math.random() * names.length)];
        
        records.push({
            id: `adm-wd-${Date.now()}-${i}`,
            userId: type === 'fee' ? `streamer-${i}` : 'admin-id',
            amountBRL: parseFloat(amount.toFixed(2)),
            status: status,
            type: type,
            timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * (Math.random() * 12 + 4)).toISOString(),
            description: type === 'fee' ? `Taxa de Saque - ${name}` : `Saque para ${db_currentUser.withdrawal_method?.details.email || 'admin@livego.com'}`,
            relatedUserName: type === 'fee' ? name : undefined,
        });
    }
    return records;
};

let db_admin_withdrawals: PurchaseRecord[] = generateInitialAdminWithdrawals();

let db_lastLoginEmail: string | null = 'admin@livego.com';

const db_beauty_settings = {
  tabs: [
    { id: 'Recomendar', label: 'Recomendar' },
    { id: 'Beleza', label: 'Beleza' },
  ],
  actions: [
    { id: 'reset', label: 'Redefinir' },
    { id: 'save', label: 'Salvar' },
  ],
  slider: {
    label: 'Intensidade',
  },
  effects: {
    Recomendar: [
      { id: 'none', label: 'Fechar', icon: 'BanIcon', defaultValue: 0 },
      { id: 'musa', label: 'Musa', image: 'https://picsum.photos/seed/musa/100', defaultValue: 80 },
      { id: 'bonito', label: 'Bonito', image: 'https://picsum.photos/seed/bonito/100', defaultValue: 60 },
      { id: 'vitalidade', label: 'Vitalidade', image: 'https://picsum.photos/seed/vitalidade/100', defaultValue: 70 },
    ],
    Beleza: [
      { id: 'branquear', label: 'Branquear', icon: 'FaceIcon', defaultValue: 50 },
      { id: 'alisar', label: 'Alisar a p...', icon: 'FaceSmoothIcon', defaultValue: 50 },
      { id: 'ruborizar', label: 'Ruborizar', icon: 'FaceIcon', defaultValue: 30 },
      { id: 'contraste', label: 'Contraste', icon: 'ContrastIcon', defaultValue: 50 },
    ],
  },
};


export const storage = {
    setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setUser: (user: any) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        db_currentUser = { ...db_currentUser, ...user };
    },
    getUser: () => {
        const stored = localStorage.getItem(USER_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            db_currentUser = { ...db_currentUser, ...parsed };
            return db_currentUser;
        }
        return db_currentUser;
    },
    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
};

const request = async (method: string, endpoint: string, body?: any): Promise<any> => {
    // MONITORAMENTO ROXO OBRIGATÓRIO
    const requestId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    
    const logRequest = (message: string, data?: any) => {
        console.log(`%c[API-REQUEST][${timestamp}][${requestId}] ${message}`, 
            "color: #A855F7; font-weight: bold; background: #1a1a1a; padding: 2px 6px; border-radius: 4px; border: 1px solid #A855F7", 
            data || '');
    };

    logRequest(`Iniciando requisição: ${method} ${endpoint}`, body || {});

    if (USE_MOCK) {
        logRequest('Modo MOCK ativado, simulando resposta...');
        
        // Simula atraso de rede
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
        
        // --- ROTEADOR MOCHA ---
        if (endpoint === '/auth/last-email' && method === 'GET') {
            logRequest('Retornando último email salvo');
            return { email: db_lastLoginEmail };
        }
        
        if (endpoint === '/auth/save-email' && method === 'POST') {
            logRequest('Salvando email', { email: body.email });
            db_lastLoginEmail = body.email;
            return { success: true };
        }
        
        // --- CONFIGURAÇÕES DE BELEZA ---
        if (endpoint === '/streams/beauty-settings' && method === 'GET') {
            logRequest('Retornando configurações de beleza', db_beauty_settings);
            return { ...db_beauty_settings };
        }
        
        if (endpoint === '/streams/beauty-settings' && method === 'POST') {
            logRequest('Salvando configurações de beleza', body);
            // Em um cenário real, aqui atualizaríamos o db_beauty_settings com os novos valores
            return { success: true, timestamp: new Date().toISOString() };
        }
        
        if (endpoint === '/streams/beauty-settings/reset' && method === 'POST') {
            logRequest('Resetando configurações de beleza');
            // Aqui poderíamos redefinir os valores padrão se necessário
            return { 
                success: true, 
                message: 'Configurações de beleza redefinidas com sucesso',
                timestamp: new Date().toISOString()
            };
        }
        
        if (endpoint === '/streams/beauty-settings/apply' && method === 'POST') {
            const { effect } = body || {};
            logRequest('Aplicando efeito de beleza', { effect });
            
            if (!effect) {
                logRequest('Erro: Nenhum efeito especificado', { status: 400 });
                return { 
                    success: false, 
                    error: 'Nenhum efeito especificado',
                    status: 400
                };
            }
            
            return { 
                success: true, 
                effect,
                appliedAt: new Date().toISOString()
            };
        }
        
        if (endpoint === '/streams/beauty-settings/log-tab' && method === 'POST') {
            const { tabId } = body || {};
            logRequest('Registrando clique na aba', { tabId });
            
            if (!tabId) {
                logRequest('Aviso: ID da tab não fornecido', { status: 400 });
                // Não rejeitamos a promessa para não interromper o fluxo do usuário
                return { success: false, error: 'ID da tab não fornecido' };
            }
            
            return { 
                success: true, 
                tabId,
                loggedAt: new Date().toISOString()
            };
        }
        
        if (endpoint === '/earnings/withdraw/calculate' && method === 'POST') {
            const { amount } = body;
            const conversionRate = 25 / 3000; // 3000 diamantes = R$25
            const gross_value = (amount || 0) * conversionRate;
            const platform_fee = gross_value * 0.20;
            const net_value = gross_value - platform_fee;
            return { gross_value, platform_fee, net_value };
        }

        if (endpoint === '/earnings/withdraw/request' && method === 'POST') {
            const { amount } = body;
            const conversionRate = 25 / 3000;
            const gross_brl = amount * conversionRate;
            const platform_fee_brl = gross_brl * 0.20;

            db_currentUser.platformEarnings = (db_currentUser.platformEarnings || 0) + platform_fee_brl;
            
            const newRecord: PurchaseRecord = {
                id: `fee-${Date.now()}`,
                userId: 'streamer-mock-id',
                relatedUserName: 'Streamer Aleatório',
                amountBRL: platform_fee_brl,
                status: 'Concluído',
                type: 'fee',
                timestamp: new Date().toISOString(),
                description: 'Taxa de Saque',
            };
            db_admin_withdrawals.unshift(newRecord);

            return { success: true, message: "Solicitação de saque enviada." };
        }

        if (endpoint === '/earnings/withdraw/methods' && method === 'POST') {
            const { method: updatedMethod, details } = body;
            if (db_currentUser) {
                db_currentUser.withdrawal_method = {
                    method: updatedMethod,
                    details: { email: details.key }
                };
                storage.setUser(db_currentUser);
                return { success: true, user: db_currentUser };
            }
            return Promise.reject({ message: "Usuário não encontrado" });
        }

        if (endpoint === '/admin/withdrawals' && method === 'GET') {
            // Regenera os dados a cada requisição para simular dinamismo
            db_admin_withdrawals = generateInitialAdminWithdrawals();
            return db_admin_withdrawals;
        }
        
        if (endpoint.startsWith('/users/me/withdrawal-history')) {
            const url = new URL(endpoint, 'http://localhost:3000');
            const statusFilter = url.searchParams.get('status');

            const generateMockHistory = (): PurchaseRecord[] => {
                const records: PurchaseRecord[] = [];
                const count = Math.floor(Math.random() * 15) + 5;
                const statuses: PurchaseRecord['status'][] = ['Concluído', 'Pendente', 'Cancelado'];
                const types: PurchaseRecord['type'][] = ['withdrawal', 'recharge'];
                const descriptions = ['Saque via PIX', 'Recarga de Diamantes', 'Saque para Conta', 'Bônus Recebido'];
                
                for (let i = 0; i < count; i++) {
                    records.push({
                        id: `wh-${Date.now()}-${i}`,
                        userId: db_currentUser.id,
                        amountBRL: parseFloat((Math.random() * 500 + 20).toFixed(2)),
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        type: types[Math.floor(Math.random() * types.length)],
                        timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 24 * (Math.random() * 5 + 1)).toISOString(),
                        description: descriptions[Math.floor(Math.random() * descriptions.length)],
                    });
                }
                return records;
            };
            
            const allHistory = generateMockHistory();

            if (statusFilter && statusFilter !== 'Todos') {
                return allHistory.filter(r => r.status === statusFilter);
            }
            
            return allHistory;
        }

        if (endpoint === '/admin/withdrawals/request' && method === 'POST') {
            const withdrawalAmount = db_currentUser.platformEarnings || 0;
            if (withdrawalAmount <= 0) return Promise.reject({ message: "Saldo insuficiente para saque." });

            const newWithdrawal: PurchaseRecord = {
                id: `adm-wd-${Date.now()}`,
                userId: db_currentUser.id,
                relatedUserName: db_currentUser.name,
                amountBRL: withdrawalAmount,
                status: 'Pendente',
                type: 'withdrawal',
                timestamp: new Date().toISOString(),
                description: `Saque para ${db_currentUser.withdrawal_method?.details.email || 'conta não definida'}`,
            };
            db_admin_withdrawals.unshift(newWithdrawal);
            db_currentUser.platformEarnings = 0;

            return { success: true };
        }

        if (endpoint === '/admin/withdrawals/method' && method === 'POST') {
            const { email } = body;
            if (!db_currentUser.withdrawal_method) {
                db_currentUser.withdrawal_method = { method: 'email', details: {} };
            }
            db_currentUser.withdrawal_method.details.email = email;
            return { success: true };
        }
        
        if (endpoint === '/gift' && method === 'POST') {
            const { from, giftName, count, targetId, streamId } = body;
            const gift = GIFTS.find(g => g.name === giftName);
            if (!gift) return Promise.reject({ message: "Presente não encontrado." });
            
            const totalCost = gift.price * count;
            if (db_currentUser.diamonds < totalCost) return Promise.reject({ message: "Diamantes insuficientes." });

            // Atualiza remetente
            db_currentUser.diamonds -= totalCost;
            db_currentUser.enviados = (db_currentUser.enviados || 0) + totalCost;
            db_currentUser.xp += totalCost;

            // Atualiza recebedor
            const allUsers = [db_currentUser, ...db_onlineUsers];
            const receiver = allUsers.find(u => u.id === targetId);
            if (receiver) {
                receiver.receptores = (receiver.receptores || 0) + totalCost;
            }
            
            const stream = db_streams.find(s => s.hostId === targetId);
            if(stream) {
                 (stream as any).receptores = ((stream as any).receptores || 0) + totalCost;
            }
            
            // Simula evento websocket para todos na sala
            const giftPayload: GiftPayload = {
                fromUser: { ...db_currentUser },
                toUser: { id: targetId, name: receiver?.name || stream?.name || 'Destinatário' },
                gift,
                quantity: count,
                roomId: streamId
            };
            webSocketManager.emitSimulatedEvent('newStreamGift', giftPayload);

            return { success: true, updatedSender: { ...db_currentUser }, leveledUp: false };
        }

        if (endpoint.startsWith('/gifts/gallery')) {
            return [
                { ...(GIFTS.find(g => g.name === 'Rosa')), count: 15 },
                { ...(GIFTS.find(g => g.name === 'Coração')), count: 8 },
                { ...(GIFTS.find(g => g.name === 'Foguete')), count: 1 },
            ];
        }

        if (endpoint.startsWith('/gifts')) {
            const url = new URL(endpoint, 'http://localhost:3000');
            const category = url.searchParams.get('category');

            if (!category || category === 'Todos' || category === 'Popular') {
                return GIFTS.filter(g => g.category === 'Popular');
            }
            if (/^\d+$/.test(category)) {
                const priceLimit = parseInt(category, 10);
                return GIFTS.filter(g => g.price <= priceLimit);
            }
            return GIFTS.filter(g => g.category === category);
        }
        
        if (endpoint === '/presentes/recarregar') {
            db_currentUser.diamonds += 5000;
            return { success: true, user: db_currentUser };
        }

        // Auth / User
        if (endpoint.includes('/auth/login')) return { success: true, user: db_currentUser, token: 'mocha-token' };
        if (endpoint === '/users/me') return { ...db_currentUser };
        
        if (endpoint.match(/^\/users\/(?!me|online|search)[\w-]+\/fans$/)) {
            return [...db_onlineUsers].sort(() => 0.5 - Math.random()).slice(0, 3);
        }

        if (endpoint.match(/^\/users\/(?!me|online|search)[\w-]+\/friends$/)) {
            return [...db_onlineUsers].sort(() => 0.5 - Math.random()).slice(0, 8);
        }
        
        if (endpoint.match(/^\/users\/(?!me|online|search)[\w-]+\/following$/)) {
            return [...db_onlineUsers].sort(() => 0.5 - Math.random()).slice(0, 2);
        }
        
        if (endpoint.match(/^\/users\/(?!me|online|search)[\w-]+$/) && method === 'POST') {
            const userId = endpoint.split('/')[2];
            if (userId === db_currentUser.id) {
                db_currentUser = { ...db_currentUser, ...body };
                storage.setUser(db_currentUser);
                return { success: true, user: db_currentUser };
            }
            return Promise.reject({ message: 'User not found' });
        }
        
        if (endpoint.match(/^\/users\/(?!me|online|search)[\w-]+$/)) {
            const userId = endpoint.split('/')[2];
            const allUsers = [db_currentUser, ...db_onlineUsers];
            const user = allUsers.find(u => u.id === userId || u.identification === userId);
            if (user) return user;

            const stream = db_streams.find(s => s.hostId === userId);
            if (stream) {
                 return { 
                    id: stream.hostId, identification: stream.hostId, name: stream.name, 
                    avatarUrl: stream.avatar, 
                    receptores: (stream as any).receptores || 0, 
                    enviados: 0,
                    // Preencher com defaults para evitar erros
                     coverUrl: 'https://picsum.photos/seed/default/800/1200', diamonds: 0, level: 1, xp: 0, isLive: true, earnings: 0, earnings_withdrawn: 0,
                     following: 0, fans: 0, gender: 'female' as const, age: 25, location: 'Brasil', obras: [], curtidas: [], ownedFrames: [],
                };
            }
            return Promise.reject({ message: 'User not found in mock DB' });
        }
        
        // Chat
        if (endpoint === '/chats/conversations') {
            return mockData.conversations;
        }

        // Busca por ID ou Nome
        if (endpoint.includes('/users/search')) {
            const q = new URLSearchParams(endpoint.split('?')[1]).get('q') || "";
            // Lógica de busca Mocha: Se for número, busca por ID, se não, por nome
            const isId = /^\d+$/.test(q);
            if (isId) {
                return db_onlineUsers.filter(u => u.identification.includes(q));
            }
            return db_onlineUsers.filter(u => u.name.toLowerCase().includes(q.toLowerCase()));
        }

        // Lembretes (Sino)
        if (endpoint === '/users/me/reminders') return db_reminders;
        if (endpoint.startsWith('/users/me/reminders/') && method === 'DELETE') {
            const id = endpoint.split('/').pop();
            db_reminders = db_reminders.filter(r => r.id !== id);
            return { success: true };
        }
        
        // Histórico
        if (endpoint === '/users/me/history') {
            return [
                { id: 'hist-1', name: 'Mirella Oficial', avatar: 'https://picsum.photos/seed/9928374/200', isLive: true, lastWatchedAt: '2024-07-27T10:00:00Z' },
                { id: 'hist-2', name: 'Gamer Master', avatar: 'https://picsum.photos/seed/1122334/200', isLive: false, lastWatchedAt: '2024-07-26T22:30:00Z' }
            ];
        }

        // Blocklist
        // FIX: Add mock for block user
        if (endpoint.match(/^\/users\/me\/blocklist\/[\w-]+$/) && !endpoint.endsWith('/unblock') && method === 'POST') {
            return { success: true };
        }
        if (endpoint === '/users/me/blocklist') {
            return [
                { ...mockData.onlineUsers[0], name: 'Usuário Bloqueado 1' },
                { ...mockData.onlineUsers[2], name: 'Outro Bloqueado' }
            ];
        }
        if (endpoint.match(/\/users\/me\/blocklist\/.*\/unblock$/) && method === 'POST') {
             return { success: true };
        }

        // Idioma
        if (endpoint === '/users/me/language') {
            db_currentUser.country = body.code;
            return { success: true, user: db_currentUser };
        }

        // Wallet
        if (endpoint.includes('/wallet/balance')) {
            const conversionRate = 25 / 3000;
            const available_diamonds = db_currentUser.earnings || 0;
            const gross_brl = available_diamonds * conversionRate;
            const platform_fee_brl = gross_brl * 0.20;
            const net_brl = gross_brl - platform_fee_brl;

            return { 
                diamonds: db_currentUser.diamonds,
                userEarnings: { 
                    available_diamonds, 
                    gross_brl, 
                    platform_fee_brl, 
                    net_brl 
                }
            };
        }

        // Streams e Online
        if (endpoint.startsWith('/live/')) {
            const url = new URL(endpoint, 'http://localhost:3000');
            const region = url.searchParams.get('region');
            let streamsToReturn = [...db_streams];
            
            if (region && region !== 'global' && region !== 'undefined') {
                streamsToReturn = streamsToReturn.filter(s => s.country === region);
            }
            
            return { data: streamsToReturn };
        }
        if (endpoint.includes('/users/online')) {
            const url = new URL(endpoint, 'http://localhost:3000');
            const roomId = url.searchParams.get('roomId');

            if (!roomId || roomId === 'undefined') {
                console.warn(`[MOCHA-API] /users/online called with invalid roomId: ${roomId}. Returning empty array.`);
                return [];
            }
            
            if (roomId === 'global') {
                return db_onlineUsers.map(u => ({...u, value: u.value || 0}));
            }

            // Para uma sala de transmissão específica, retorne uma lista simulada de espectadores.
            // Isso cria uma lista determinística-aleatória para cada sala.
            const seed = roomId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const shuffled = [...db_onlineUsers].sort((a, b) => {
                const hashA = (a.id.charCodeAt(0) + seed) % 100;
                const hashB = (b.id.charCodeAt(0) + seed) % 100;
                return hashA - hashB;
            });

            const stream = db_streams.find(s => s.id === roomId);
            const viewerCount = stream?.viewers ? Math.min(stream.viewers, shuffled.length) : Math.floor(shuffled.length / 1.5);
            
            const roomUsers = shuffled.slice(0, viewerCount);
            
            const streamerInfo = db_streams.find(s => s.id === roomId);
            if (streamerInfo) {
                const streamerAsUser = db_onlineUsers.find(u => u.id === streamerInfo.hostId) || {
                    id: streamerInfo.hostId,
                    identification: streamerInfo.hostId,
                    name: streamerInfo.name,
                    avatarUrl: streamerInfo.avatar,
                    level: 25,
                    value: 5000,
                };

                if (!roomUsers.some(u => u.id === streamerInfo.hostId)) {
                    roomUsers.unshift(streamerAsUser as any);
                    if(roomUsers.length > viewerCount && viewerCount > 0) {
                        roomUsers.pop();
                    }
                }
            }
            
            return roomUsers.map(u => ({...u, value: u.value || 0}));
        }
        
        if (endpoint === '/ranking/top-fans') {
            return [
                { id: '8827361', name: 'Juliana P.', avatar: 'https://picsum.photos/seed/8827361/100', amount: 50000, isVip: true, identification: '8827361' },
                { id: '3456754', name: 'Ricardo G.', avatar: 'https://picsum.photos/seed/3456754/100', amount: 30000, isVip: false, identification: '3456754' },
                { id: '9921823', name: 'Marcos Dev', avatar: 'https://picsum.photos/seed/9921823/100', amount: 15000, isVip: true, identification: '9921823' },
                { id: '1122334', name: 'Gamer Master', avatar: 'https://picsum.photos/seed/1122334/100', amount: 5000, isVip: false, identification: '1122334' },
            ];
        }

        if (endpoint === '/tasks/quick-friends') {
            return [
                { id: 'qf1', name: 'Mirella', status: 'pendente' },
                { id: 'qf2', name: 'Juh', status: 'pendente' },
                { id: 'qf3', name: 'Carla', status: 'concluido' },
                { id: 'qf4', name: 'Bia', status: 'pendente' },
                { id: 'qf5', name: 'Lia', status: 'concluido' },
            ];
        }

        // FIX: Add mock for db endpoints
        if (endpoint === '/db/collections' && method === 'GET') {
            return ['users', 'gifts', 'streamers', 'transactions', 'frames', 'conversations'];
        }
        if (endpoint === '/db/setup' && method === 'POST') {
            return { success: true, message: "Banco de dados sincronizado via mock!" };
        }
        
        return { success: true, data: [] };
    }

    // Se chegou aqui, é uma requisição real (não mockada)
    try {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const token = storage.getToken();
        const headers: HeadersInit = { 
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            'X-Request-Timestamp': timestamp
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        logRequest(`Enviando requisição para: ${url}`, { method, headers });
        
        const startTime = Date.now();
        const response = await fetch(url, { 
            method, 
            headers, 
            body: body ? JSON.stringify(body) : undefined 
        });
        
        const responseTime = Date.now() - startTime;
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logRequest(`Erro na resposta: ${response.status} ${response.statusText}`, { 
                status: response.status,
                url,
                responseTime: `${responseTime}ms`,
                error: errorData
            });
            
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        logRequest(`Resposta recebida em ${responseTime}ms`, {
            status: response.status,
            url,
            data
        });
        
        return data;
    } catch (error) {
        logRequest('Erro durante a requisição', { 
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            endpoint,
            method
        });
        
        // Em um ambiente de produção, você pode querer enviar esse erro para um serviço de monitoramento
        // como Sentry, LogRocket, etc.
        
        // Re-lança o erro para que os componentes possam tratá-lo adequadamente
        throw error;
    }
};

export const api = {
    auth: {
        login: (creds: any) => request('POST', '/auth/login', creds),
        register: (data: any) => request('POST', '/auth/register', data),
        logout: () => { storage.clear(); return Promise.resolve(); },
        getLastEmail: (): Promise<{ email: string | null }> => request('GET', '/auth/last-email'),
        saveLastEmail: (email: string): Promise<{ success: boolean }> => request('POST', '/auth/save-email', { email }),
    },
    users: {
        me: (): Promise<User> => request('GET', '/users/me'),
        get: (id: string): Promise<User> => request('GET', `/users/${id}`),
        getOnlineUsers: (roomId: string): Promise<User[]> => request('GET', `/users/online?roomId=${roomId}`),
        getFansUsers: (id: string): Promise<User[]> => request('GET', `/users/${id}/fans`),
        getFriends: (id: string): Promise<User[]> => request('GET', `/users/${id}/friends`),
        search: (q: string): Promise<User[]> => request('GET', `/users/search?q=${q}`),
        setLanguage: (code: string) => request('POST', '/users/me/language', { code }),
        update: (id: string, data: any): Promise<{ success: boolean; user: User }> => request('POST', `/users/${id}`, data),
        toggleFollow: (id: string) => request('POST', `/users/${id}/follow`),
        getWithdrawalHistory: (status: string): Promise<PurchaseRecord[]> => request('GET', `/users/me/withdrawal-history?status=${status}`),
        blockUser: (userId: string): Promise<{ success: boolean }> => request('POST', `/users/me/blocklist/${userId}`),
    },
    chats: {
        listConversations: (): Promise<Conversation[]> => request('GET', '/chats/conversations'),
        start: (userId: string) => request('POST', '/chats/start', { userId }),
    },
    gifts: {
        list: (category?: string): Promise<Gift[]> => request('GET', `/gifts?category=${category || 'Popular'}`),
        getGallery: (): Promise<(Gift & { count: number })[]> => request('GET', '/gifts/gallery'),
        recharge: (): Promise<{ success: boolean; user: User }> => request('POST', '/presentes/recarregar'),
    },
    streams: {
        listByCategory: (cat: string, region?: string) => request('GET', `/live/${cat}?region=${region || 'global'}`),
        create: (data: any): Promise<Streamer> => request('POST', '/streams', data),
        update: (id: string, data: any) => request('PATCH', `/streams/${id}`, data),
        updateVideoQuality: (id: string, quality: string) => request('PATCH', `/streams/${id}/quality`, { quality }),
        getGiftDonors: (streamId: string): Promise<User[]> => request('GET', `/streams/${streamId}/donors`),
        search: (q: string): Promise<Streamer[]> => request('GET', `/streams/search?q=${q}`),
        inviteToPrivateRoom: (streamId: string, userId: string): Promise<{ success: boolean }> => request('POST', `/streams/${streamId}/invite`, { userId }),
        getBeautySettings: (): Promise<any> => request('GET', '/streams/beauty-settings'),
        saveBeautySettings: (settings: any): Promise<{ success: boolean }> => request('POST', '/streams/beauty-settings', { settings }),
        resetBeautySettings: (): Promise<{ success: boolean }> => request('POST', '/streams/beauty-settings/reset'),
        applyBeautyEffect: (effect: any): Promise<{ success: boolean }> => request('POST', '/streams/beauty-settings/apply', { effect }),
        logBeautyTabClick: (tab: any): Promise<{ success: boolean }> => request('POST', '/streams/beauty-settings/log-tab', { tab }),
    },
    diamonds: {
        getBalance: (userId: string) => request('GET', `/wallet/balance`),
        purchase: (userId: string, diamonds: number, price: number): Promise<{ success: boolean; user: User }> => request('POST', `/users/${userId}/purchase`, { diamonds, price }),
    },
    earnings: {
        withdraw: {
            calculate: (amount: number): Promise<{ gross_value: number; platform_fee: number; net_value: number }> => request('POST', '/earnings/withdraw/calculate', { amount }),
            request: (amount: number, method: any): Promise<{ success: boolean; message: string }> => request('POST', '/earnings/withdraw/request', { amount, method }),
            methods: {
                update: (method: string, details: any): Promise<{ success: boolean; user: User }> => request('POST', '/earnings/withdraw/methods', { method, details }),
            }
        }
    },
    admin: {
        getAdminWithdrawalHistory: (): Promise<PurchaseRecord[]> => request('GET', '/admin/withdrawals'),
        withdraw: {
            request: (amount: number): Promise<{ success: boolean }> => request('POST', '/admin/withdrawals/request', { amount }),
        },
        saveAdminWithdrawalMethod: (details: { type: string; email: string; }): Promise<{ success: boolean; }> => request('POST', '/admin/withdrawals/method', details),
    },
    db: {
        checkCollections: (): Promise<string[]> => request('GET', '/db/collections'),
        setupDatabase: (collections: string[]): Promise<{ message: string }> => request('POST', '/db/setup', { collections }),
    },
    sendGift: (from: string, streamId: string, giftName: string, count: number, targetId?: string): Promise<{ success: boolean; updatedSender: User, leveledUp: boolean }> => 
        request('POST', `/gift`, { from, streamId, giftName, count, targetId }),
    
    getQuickCompleteFriends: (): Promise<any[]> => request('GET', '/tasks/quick-friends'),
    inviteFriendForCoHost: (streamId: string, friendId: string): Promise<{ success: boolean }> => request('POST', `/streams/${streamId}/cohost/invite`, { friendId }),
    completeQuickFriendTask: (friendId: string): Promise<{ success: boolean }> => request('POST', `/tasks/quick-friends/${friendId}/complete`),
    getDailyRanking: (): Promise<RankedUser[]> => request('GET', '/ranking/daily'),
    getWeeklyRanking: (): Promise<RankedUser[]> => request('GET', '/ranking/weekly'),
    getMonthlyRanking: (): Promise<RankedUser[]> => request('GET', '/ranking/monthly'),
    getTopFans: (): Promise<any[]> => request('GET', '/ranking/top-fans'),
    getBlocklist: (): Promise<User[]> => request('GET', '/users/me/blocklist'),
    unblockUser: (userId: string) => request('POST', `/users/me/blocklist/${userId}/unblock`),
    getFollowingUsers: (userId: string): Promise<User[]> => request('GET', `/users/${userId}/following`),
    getVisitors: (userId: string): Promise<any[]> => request('GET', `/users/${userId}/visitors`),
    getStreamHistory: (): Promise<any[]> => request('GET', '/users/me/history'),
    getReminders: (): Promise<any[]> => request('GET', '/users/me/reminders'),
    removeReminder: (id: string) => request('DELETE', `/users/me/reminders/${id}`),
    getMusicLibrary: (): Promise<MusicTrack[]> => request('GET', '/assets/music'),
    getAvatarFrames: (): Promise<any[]> => request('GET', '/assets/frames'),
    setActiveFrame: (userId: string, frameId: string): Promise<User> => request('POST', `/users/${userId}/active-frame`, { frameId }),
    translate: (text: string): Promise<{ translatedText: string }> => request('POST', '/translate', { text }),
    kickUser: (r: string, u: string) => request('POST', `/streams/${r}/kick`, { userId: u }),
    makeModerator: (r: string, u: string) => request('POST', `/streams/${r}/moderator`, { userId: u }),
    toggleMicrophone: () => request('POST', '/live/toggle-mic'),
    toggleStreamSound: () => request('POST', '/live/toggle-sound'),
    toggleAutoFollow: () => request('POST', '/live/toggle-autofollow'),
    toggleAutoPrivateInvite: () => request('POST', '/live/toggle-autoinvite'),
    createFeedPost: (data: any): Promise<{ success: boolean; user: User }> => request('POST', '/posts', data),
    confirmPurchaseTransaction: (details: any, method: string): Promise<any> => request('POST', '/wallet/confirm-purchase', { details, method }),
    cancelPurchaseTransaction: () => request('POST', '/wallet/cancel-purchase'),
    updateBillingAddress: (address: any) => request('POST', '/users/me/billing-address', address),
    updateCreditCard: (card: any) => request('POST', '/users/me/credit-card', card),
};