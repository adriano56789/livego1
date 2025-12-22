
import React, { useState } from 'react';
import { CloseIcon, SearchIcon } from '../icons';

interface UserInvite {
    id: string;
    name: string;
    avatar: string;
    invited?: boolean;
}

interface PrivateInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MOCK_FOLLOWERS: UserInvite[] = [
    { id: '11223344', name: 'Juma', avatar: 'https://picsum.photos/seed/juma/100' },
    { id: '55667788', name: 'Ana', avatar: 'https://picsum.photos/seed/ana/100' },
    { id: '99887766', name: 'Carlos', avatar: 'https://picsum.photos/seed/carlos/100' },
    { id: '44556677', name: 'Beatriz', avatar: 'https://picsum.photos/seed/beatriz/100' },
];

const MOCK_GIFTERS: UserInvite[] = [
    { id: '12312312', name: 'Roberto Rico', avatar: 'https://picsum.photos/seed/roberto/100' },
    { id: '45645645', name: 'Luiza Gold', avatar: 'https://picsum.photos/seed/luiza/100' },
];

const PrivateInviteModal: React.FC<PrivateInviteModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'followers' | 'gifters'>('followers');
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const list = activeTab === 'followers' ? MOCK_FOLLOWERS : MOCK_GIFTERS;
    const filteredList = list.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.id.includes(searchTerm)
    );

    const handleInvite = (id: string) => {
        setInvitedIds(prev => new Set(prev).add(id));
    };

    const handleInviteAll = () => {
        const newSet = new Set(invitedIds);
        filteredList.forEach(u => newSet.add(u.id));
        setInvitedIds(newSet);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-transparent" onClick={onClose}>
            <div 
                className="w-full bg-[#1C1C1E] rounded-t-2xl h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl border-t border-white/5"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                    <button onClick={onClose}>
                        <CloseIcon className="w-6 h-6 text-white" />
                    </button>
                    <h2 className="text-white font-bold text-base">Convidar para Sala Privada</h2>
                    <button 
                        onClick={handleInviteAll}
                        className="bg-[#FE2C55] hover:bg-[#E02449] text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                    >
                        Convidar Todos
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                    <button 
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-3 text-sm font-bold relative ${activeTab === 'followers' ? 'text-white' : 'text-gray-500'}`}
                    >
                        Seguidores
                        {activeTab === 'followers' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('gifters')}
                        className={`flex-1 py-3 text-sm font-bold relative ${activeTab === 'gifters' ? 'text-white' : 'text-gray-500'}`}
                    >
                        Doadores de presentes
                        {activeTab === 'gifters' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>}
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="bg-[#2C2C2E] rounded-lg flex items-center px-3 py-2.5">
                        <SearchIcon className="w-4 h-4 text-gray-500 mr-2" />
                        <input 
                            type="text"
                            placeholder="Pesquisar por nome ou ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent w-full text-white text-sm outline-none placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 pb-6">
                    {filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                            Nenhum usuário encontrado.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredList.map((user) => {
                                const isInvited = invitedIds.has(user.id);
                                return (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-sm">{user.name}</span>
                                                <span className="text-gray-500 text-xs">ID: {user.id}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleInvite(user.id)}
                                            disabled={isInvited}
                                            className={`
                                                px-5 py-1.5 rounded-full text-xs font-bold transition-all
                                                ${isInvited 
                                                    ? 'bg-gray-700 text-gray-400 cursor-default' 
                                                    : 'bg-[#FE2C55] hover:bg-[#E02449] text-white shadow-lg shadow-pink-900/20'
                                                }
                                            `}
                                        >
                                            {isInvited ? 'Enviado' : 'Convidar'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivateInviteModal;
