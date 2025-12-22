
import React, { useState, useEffect } from 'react';
import { MessageCircle, User as UserIcon } from 'lucide-react';
import PrivateChatScreen from './PrivateChatScreen';
import { User } from '../../types';
import { api } from '../../services/api';

const MessagesScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Chat' | 'Amigos'>('Chat');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [friends, setFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch friends/chats on mount
    useEffect(() => {
        setLoading(true);
        // Using getFriends logic or mock logic
        api.getAllUsers().then(users => {
            // Filter users that are not 'me'
            if (users) {
                setFriends(users.filter(u => u.id !== 'me'));
            }
            setLoading(false);
        });
    }, []);

    const getLastSeenText = (user: User) => {
        if (user.isOnline) return 'Agora';
        
        // Simulating last seen based on user ID/Name length to keep it consistent without backend data
        // In a real app, this would use user.lastSeen
        const mockTime = new Date();
        const offset = (user.name.length + parseInt(user.id.slice(-1) || '0')) * 45; // Minutes ago
        mockTime.setMinutes(mockTime.getMinutes() - offset);
        
        return mockTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + 
               mockTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    // Se um usuário estiver selecionado, mostramos a tela de chat privado COMO PÁGINA (full screen)
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
            <div className="pt-4 pb-2 px-4 bg-[#121212]">
                <div className="flex justify-center items-center space-x-8 relative">
                    <button 
                        onClick={() => setActiveTab('Chat')}
                        className={`text-base font-bold pb-2 relative transition-colors ${activeTab === 'Chat' ? 'text-white' : 'text-gray-500'}`}
                    >
                        Chat
                        {activeTab === 'Chat' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('Amigos')}
                        className={`text-base font-bold pb-2 relative transition-colors ${activeTab === 'Amigos' ? 'text-white' : 'text-gray-500'}`}
                    >
                        Amigos
                         {activeTab === 'Amigos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>}
                    </button>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'Chat' ? (
                    <div className="p-2">
                        {loading && <div className="text-center text-gray-500 mt-4">Carregando...</div>}
                        
                        {!loading && friends.length === 0 && (
                            <div className="text-gray-500 text-xs px-4 py-2">Nenhuma conversa recente</div>
                        )}

                        {friends.map(friend => (
                            <div 
                                key={friend.id} 
                                onClick={() => setSelectedUser(friend)}
                                className="flex items-center p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors mb-1"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden border border-white/10">
                                        <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="ml-3 flex-1 border-b border-gray-900/50 pb-3">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-sm text-white">{friend.name}</h3>
                                        <span className="text-[10px] text-gray-500">
                                            {getLastSeenText(friend)}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs truncate">Toque para conversar</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-2">
                        {friends.map(friend => (
                            <div 
                                key={friend.id} 
                                onClick={() => setSelectedUser(friend)}
                                className="flex items-center p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors mb-1"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                                        <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                                    </div>
                                    {/* Indicador Online */}
                                    {friend.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00C853] rounded-full border-2 border-[#121212]"></div>
                                    )}
                                </div>
                                <div className="ml-3 flex-1 flex justify-between items-center border-b border-gray-900/50 pb-3">
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-sm text-white">{friend.name}</h3>
                                        <span className="text-[11px] text-gray-500">ID: {friend.identification}</span>
                                    </div>
                                    <button className="bg-[#2C2C2E] text-gray-300 text-xs px-3 py-1.5 rounded-full font-medium">
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
