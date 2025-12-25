import React, { useState } from 'react';
import { MessageCircle, User as UserIcon } from 'lucide-react';
import PrivateChatScreen from './PrivateChatScreen';
import { User } from '../../types';

// Dados estáticos para funcionamento sem API/Banco
const MOCK_FRIENDS: User[] = [
    {
        id: "11223344",
        name: "Juma",
        identification: "11223344",
        avatarUrl: "https://picsum.photos/seed/juma/100",
        coverUrl: "https://picsum.photos/seed/cover1/800/600",
        diamonds: 100,
        level: 12,
        xp: 0,
        isLive: true,
        fans: 500,
        following: 20,
        gender: "female",
        age: 22,
        location: "Brasil",
        isOnline: true,
        bio: "Amo natureza e lives!",
        earnings: 0,
        earnings_withdrawn: 0
    },
    {
        id: "55667788",
        name: "Ana",
        identification: "55667788",
        avatarUrl: "https://picsum.photos/seed/ana/100",
        coverUrl: "https://picsum.photos/seed/cover2/800/600",
        diamonds: 50,
        level: 5,
        xp: 0,
        isLive: false,
        fans: 1200,
        following: 100,
        gender: "female",
        age: 24,
        location: "Brasil",
        isOnline: false,
        bio: "Cantora e compositora.",
        earnings: 0,
        earnings_withdrawn: 0
    },
    {
        id: "99887766",
        name: "Carlos",
        identification: "99887766",
        avatarUrl: "https://picsum.photos/seed/carlos/100",
        coverUrl: "https://picsum.photos/seed/cover3/800/600",
        diamonds: 2000,
        level: 8,
        xp: 0,
        isLive: false,
        fans: 30,
        following: 150,
        gender: "male",
        age: 28,
        location: "Brasil",
        isOnline: true,
        bio: "Gamer hardcore.",
        earnings: 0,
        earnings_withdrawn: 0
    },
    {
        id: "support-livercore",
        name: "Livercore Support",
        identification: "00000001",
        avatarUrl: "https://picsum.photos/seed/livercore/100",
        coverUrl: "",
        diamonds: 999999,
        level: 99,
        xp: 0,
        isLive: false,
        fans: 9999,
        following: 0,
        gender: "not_specified",
        age: 0,
        location: "Global",
        isOnline: true,
        bio: "Suporte Oficial",
        earnings: 0,
        earnings_withdrawn: 0
    }
];

const MessagesScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Chat' | 'Amigos'>('Chat');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const getLastMessage = (userId: string) => {
        if (userId === 'support-livercore') return "Bem-vindo ao LiveGo! Como podemos ajudar?";
        if (userId === '11223344') return "Obrigado por assistir minha live hoje! ❤️";
        return "Toque para iniciar uma conversa";
    };

    const getTimeText = (userId: string) => {
        if (userId === 'support-livercore') return "Agora";
        if (userId === '11223344') return "10:45";
        return "Ontem";
    };

    if (selectedUser) {
        return (
            <PrivateChatScreen 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)} 
                variant="page"
            />
        );
    }

    return (
        <div className="h-full bg-[#121212] text-white flex flex-col font-sans">
            {/* Header com Abas */}
            <div className="pt-4 pb-2 px-4 bg-[#121212] border-b border-white/5">
                <div className="flex justify-center items-center space-x-12 relative">
                    <button 
                        onClick={() => setActiveTab('Chat')}
                        className={`text-base font-black pb-3 relative transition-all ${activeTab === 'Chat' ? 'text-white scale-105' : 'text-gray-500'}`}
                    >
                        Chat
                        {activeTab === 'Chat' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('Amigos')}
                        className={`text-base font-black pb-3 relative transition-all ${activeTab === 'Amigos' ? 'text-white scale-105' : 'text-gray-500'}`}
                    >
                        Amigos
                         {activeTab === 'Amigos' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>}
                    </button>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {activeTab === 'Chat' ? (
                    <div className="p-2">
                        {MOCK_FRIENDS.map(friend => (
                            <div 
                                key={friend.id} 
                                onClick={() => setSelectedUser(friend)}
                                className="flex items-center p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all mb-1 active:scale-[0.98]"
                            >
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
                                        <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                                    </div>
                                    {friend.isOnline && (
                                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#00E676] rounded-full border-[3px] border-[#121212]"></div>
                                    )}
                                </div>
                                <div className="ml-4 flex-1 pb-1">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-black text-[15px] text-white tracking-wide">{friend.name}</h3>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">{getTimeText(friend.id)}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs truncate max-w-[200px] font-medium">
                                        {getLastMessage(friend.id)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-2">
                        <div className="px-4 py-2 mb-2">
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Meus Amigos ({MOCK_FRIENDS.length})</span>
                        </div>
                        {MOCK_FRIENDS.map(friend => (
                            <div 
                                key={friend.id} 
                                onClick={() => setSelectedUser(friend)}
                                className="flex items-center p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all mb-1 active:scale-[0.98]"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shadow-md">
                                        <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                                    </div>
                                    {friend.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00E676] rounded-full border-2 border-[#121212]"></div>
                                    )}
                                </div>
                                <div className="ml-4 flex-1 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <h3 className="font-black text-sm text-white">{friend.name}</h3>
                                        <span className="text-[10px] text-gray-500 font-bold">ID: {friend.identification}</span>
                                    </div>
                                    <button className="bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider hover:bg-white/10 transition-colors">
                                        Conversar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesScreen;