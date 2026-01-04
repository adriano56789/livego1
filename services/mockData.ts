
import { User, Streamer, Gift, Conversation, RankedUser, MusicTrack } from '../types';

const defaultUserFields = {
    coverUrl: 'https://picsum.photos/seed/default/800/1200',
    diamonds: 0,
    level: 1,
    xp: 0,
    isLive: false,
    earnings: 0,
    earnings_withdrawn: 0,
    following: 0,
    fans: 0,
    gender: 'not_specified' as const,
    age: 18,
    location: 'Brasil',
    obras: [],
    curtidas: [],
    ownedFrames: [],
    receptores: 0,
    enviados: 0,
    topFansAvatars: []
};

export const mockData = {
    currentUser: {
        ...defaultUserFields,
        id: '5582931',
        identification: '5582931',
        name: 'Usuário Premium',
        avatarUrl: 'https://picsum.photos/seed/5582931/200',
        coverUrl: 'https://picsum.photos/seed/5582931-c/800/1200',
        diamonds: 25000,
        level: 18,
        xp: 3400,
        earnings: 12400,
        earnings_withdrawn: 0,
        following: 84,
        fans: 156,
        gender: 'male',
        age: 26,
        location: 'São Paulo, BR',
        isVIP: true,
        ownedFrames: [{ frameId: 'FrameBlazingSun', expirationDate: '2025-12-31' }]
    } as User,
    streams: [
        { id: '8827364', hostId: '9928374', name: 'Mirella Oficial', avatar: 'https://picsum.photos/seed/9928374/200', location: 'São Paulo', viewers: 1250, category: 'Popular', tags: ['Festa', 'Música'], country: 'pt' },
        { id: '7721938', hostId: '2239485', name: 'DJ Arromba', avatar: 'https://picsum.photos/seed/2239485/200', location: 'Rio de Janeiro', viewers: 800, category: 'Música', tags: ['Eletrônica'], country: 'pt' },
        { id: '4455667', hostId: '1122334', name: 'Gamer Master', avatar: 'https://picsum.photos/seed/1122334/200', location: 'Curitiba', viewers: 2100, category: 'Jogos', tags: ['Ranked'], country: 'pt' },
        { id: '1199228', hostId: '3344556', name: 'Alice Star', avatar: 'https://picsum.photos/seed/3344556/200', location: 'Miami', viewers: 3500, category: 'Popular', tags: ['Chat'], country: 'en' }
    ],
    gifts: [
        { id: '1001', name: 'Rosa', price: 5, icon: '🌹', category: 'Popular' },
        { id: '1002', name: 'Coração', price: 10, icon: '❤️', category: 'Popular' },
        { id: '1003', name: 'Café', price: 20, icon: '☕', category: 'Popular' },
        { id: '2001', name: 'Diamante', price: 500, icon: '💎', category: 'Luxo' },
        { id: '2002', name: 'Carro Luxo', price: 2500, icon: '🏎️', category: 'Luxo' },
        { id: '3001', name: 'Foguete', price: 10000, icon: '🚀', category: 'VIP' }
    ],
    conversations: [
        {
            id: 'conv-101',
            friend: { ...defaultUserFields, id: '1234567', identification: '1234567', name: 'Suporte VIP', avatarUrl: 'https://picsum.photos/seed/1234567/200', isOnline: true, level: 99 } as User,
            lastMessage: 'Olá! Como podemos ajudar você hoje?',
            unreadCount: 1,
            updatedAt: new Date().toISOString()
        }
    ],
    onlineUsers: [
        { ...defaultUserFields, id: '3456754', identification: '3456754', name: 'Ricardo G.', avatarUrl: 'https://picsum.photos/seed/3456754/100', level: 12, age: 24, gender: 'male', value: 1500, isOnline: true },
        { ...defaultUserFields, id: '8827361', identification: '8827361', name: 'Juliana P.', avatarUrl: 'https://picsum.photos/seed/8827361/100', level: 22, age: 21, gender: 'female', value: 4200, isOnline: true },
        { ...defaultUserFields, id: '9921823', identification: '9921823', name: 'Marcos Dev', avatarUrl: 'https://picsum.photos/seed/9921823/100', level: 8, age: 28, gender: 'male', value: 300, isOnline: true }
    ] as (User & { value: number })[],
    ranking: [
        { ...defaultUserFields, id: '8827361', identification: '8827361', name: 'Juliana P.', avatarUrl: 'https://picsum.photos/seed/8827361/100', level: 22, value: 50000, rank: 1, gender: 'female' } as RankedUser,
        { ...defaultUserFields, id: '3456754', identification: '3456754', name: 'Ricardo G.', avatarUrl: 'https://picsum.photos/seed/3456754/100', level: 12, value: 30000, rank: 2, gender: 'male' } as RankedUser
    ],
    frames: [
        { id: 'FrameBlazingSun', name: 'Sol Escaldante', price: 500, category: 'avatar' },
        { id: 'FrameBlueCrystal', name: 'Cristal Azul', price: 300, category: 'avatar' }
    ],
    music: [
        { id: 'm-501', title: 'Viral Mix 2024', artist: 'LiveGo Hits', url: '#', duration: 165 }
    ]
};
