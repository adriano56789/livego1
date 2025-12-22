
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon } from '../icons';
import { User } from '../../types';
import { api } from '../../services/api';

interface RelationshipScreenProps {
    initialTab: 'following' | 'fans' | 'visitors';
    onClose: () => void;
    currentUser: User | null;
}

export default function RelationshipScreen({ initialTab, onClose, currentUser }: RelationshipScreenProps) {
    const [activeTab, setActiveTab] = useState<'following' | 'fans' | 'visitors'>(initialTab);
    const [userList, setUserList] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                let data: User[] = [];
                if (activeTab === 'following') {
                    data = await api.getFollowingUsers(currentUser.id);
                } else if (activeTab === 'fans') {
                    data = await api.getFansUsers(currentUser.id);
                } else if (activeTab === 'visitors') {
                    const visitorsData = await api.getVisitors(currentUser.id);
                    // Just basic casting for list display, though Visitors type has timestamp
                    data = visitorsData as unknown as User[]; 
                }
                setUserList(data || []);
            } catch (error) {
                console.error("Failed to load relationship data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, currentUser]);

    // Render list item matching the screenshot design exactly
    const renderUserItem = (user: User) => (
        <div key={user.id} className="flex items-center justify-between py-3 px-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-gray-800">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{user.name}</span>
                    <span className="text-gray-500 text-xs">Identificação: {user.identification}</span>
                </div>
            </div>
            {activeTab !== 'visitors' && (
                <button className="bg-[#2C2C2E] hover:bg-[#3A3A3C] text-gray-300 text-xs font-medium px-4 py-1.5 rounded-full transition-colors">
                    Ver Perfil
                </button>
            )}
        </div>
    );

    const getTitle = () => {
        switch(activeTab) {
            case 'following': return 'Seguindo';
            case 'fans': return 'Fãs';
            case 'visitors': return 'Visitantes';
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-3 border-b border-gray-900 bg-[#0A0A0A] sticky top-0 z-10">
                <button onClick={onClose} className="p-2">
                    <ChevronLeftIcon className="text-white w-6 h-6" />
                </button>
                <h1 className="font-bold text-base text-white absolute left-1/2 transform -translate-x-1/2">
                    {getTitle()}
                </h1>
                {/* Clear button only for Visitors */}
                {activeTab === 'visitors' ? (
                    <button 
                        onClick={() => setUserList([])} 
                        className="text-gray-400 text-sm font-medium px-2 hover:text-white"
                    >
                        Limpar
                    </button>
                ) : (
                    <div className="w-10"></div> // Spacer to center title
                )}
            </div>

            {/* Tabs for Navigation "navegando entre si" */}
            <div className="flex items-center border-b border-gray-900">
                <button 
                    onClick={() => setActiveTab('following')}
                    className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'following' ? 'text-white' : 'text-gray-500'}`}
                >
                    Seguindo
                    {activeTab === 'following' && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-white rounded-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('fans')}
                    className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'fans' ? 'text-white' : 'text-gray-500'}`}
                >
                    Fãs
                    {activeTab === 'fans' && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-white rounded-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('visitors')}
                    className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'visitors' ? 'text-white' : 'text-gray-500'}`}
                >
                    Visitantes
                    {activeTab === 'visitors' && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-white rounded-full"></div>}
                </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto bg-[#0A0A0A] pt-2">
                {loading && (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                )}

                {!loading && userList.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center pb-20 mt-10">
                        <p className="text-gray-500 text-sm">
                            Nenhum usuário encontrado nesta lista.
                        </p>
                    </div>
                )}

                {!loading && (
                    <div className="flex flex-col">
                        {userList.map(renderUserItem)}
                    </div>
                )}
            </div>
        </div>
    );
}
