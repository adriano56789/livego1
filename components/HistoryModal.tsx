
import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, TrashIcon, PlusIcon, CheckIcon, RefreshIcon } from './icons';
import { api } from '../services/api';
import { StreamHistoryEntry } from '../types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState<StreamHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const data = await api.getStreamHistory();
            if (data && Array.isArray(data)) {
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get consistent random-ish color from name
    const getBgColor = (name: string) => {
        const colors = ['bg-indigo-300', 'bg-pink-300', 'bg-rose-300', 'bg-blue-300', 'bg-green-300', 'bg-red-300', 'bg-purple-300'];
        const index = name.length % colors.length;
        return colors[index];
    };

    return (
        <div 
            className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        >
            <div className="absolute inset-0 bg-transparent" onClick={onClose} />
            <div className={`relative w-full sm:max-w-md bg-[#1C1C1E] h-full shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <button onClick={onClose} className="p-1">
                        <ChevronLeftIcon className="w-6 h-6 text-white" />
                    </button>
                    <h2 className="text-white text-base font-bold">Histórico de Visualização</h2>
                    <div className="flex gap-4">
                        <button className="p-1" onClick={loadHistory}>
                            <RefreshIcon className={`w-5 h-5 text-gray-400 hover:text-white ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-1">
                            <TrashIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                    <p className="text-gray-500 text-xs mb-4">Visualizado em dentro de 7 dias</p>
                    
                    {isLoading && history.length === 0 ? (
                        <div className="flex justify-center mt-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.length === 0 && (
                                <p className="text-center text-gray-500 text-sm mt-10">Nenhum histórico encontrado.</p>
                            )}
                            {history.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-14 h-14 rounded-lg overflow-hidden ${getBgColor(item.name)} bg-gray-700`}>
                                            <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                                 {item.isLive && (
                                                    <div className="bg-[#00E676] w-2 h-2 rounded-full animate-pulse mr-1"></div>
                                                 )}
                                                <span className="text-white font-bold text-sm">{item.name}</span>
                                            </div>
                                            <span className={`text-xs ${item.isLive ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {item.status}
                                            </span>
                                            {item.isLive && (
                                                <div className="mt-1 bg-white/10 w-fit px-1.5 py-0.5 rounded text-[10px] text-white font-bold flex items-center gap-1">
                                                    <div className="w-1 h-2 bg-[#00E676] rounded-sm"></div> LIVE
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pr-2">
                                        {item.isLive ? (
                                            <button className="w-8 h-8 rounded-full bg-[#22d3ee] flex items-center justify-center text-white shadow-lg">
                                                <PlusIcon className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                                <CheckIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
