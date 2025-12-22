
import React, { useState } from 'react';
import { CloseIcon, CheckIcon, ShieldIcon } from '../icons';

interface ChatConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPermission: 'all' | 'followers' | 'none';
    onPermissionChange: (permission: 'all' | 'followers' | 'none') => void;
}

export default function ChatConfigModal({ isOpen, onClose, currentPermission, onPermissionChange }: ChatConfigModalProps) {
    if (!isOpen) return null;

    const [sensitiveFilter, setSensitiveFilter] = useState(true);

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-transparent" onClick={onClose}>
            <div 
                className="w-full bg-[#1C1C1E] rounded-t-2xl p-5 animate-in slide-in-from-bottom duration-300 pb-8 shadow-2xl" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold text-base">Configurações de Chat</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="text-gray-400 w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Quem pode comentar */}
                    <div>
                        <h4 className="text-gray-500 text-[11px] font-bold uppercase mb-4 px-1 tracking-wider">QUEM PODE COMENTAR</h4>
                        <div className="space-y-2">
                            <button 
                                onClick={() => onPermissionChange('all')}
                                className="w-full flex items-center justify-between py-3 px-1 hover:bg-white/5 active:scale-[0.99] transition-all rounded-lg"
                            >
                                <span className={`text-sm font-bold ${currentPermission === 'all' ? 'text-white' : 'text-gray-400'}`}>Todos</span>
                                {currentPermission === 'all' && <CheckIcon className="w-5 h-5 text-[#00E676]" />}
                            </button>

                            <button 
                                onClick={() => onPermissionChange('followers')}
                                className="w-full flex items-center justify-between py-3 px-1 hover:bg-white/5 active:scale-[0.99] transition-all rounded-lg"
                            >
                                <span className={`text-sm font-bold ${currentPermission === 'followers' ? 'text-white' : 'text-gray-400'}`}>Apenas Seguidores</span>
                                {currentPermission === 'followers' && <CheckIcon className="w-5 h-5 text-[#00E676]" />}
                            </button>

                            <button 
                                onClick={() => onPermissionChange('none')}
                                className="w-full flex items-center justify-between py-3 px-1 hover:bg-white/5 active:scale-[0.99] transition-all rounded-lg"
                            >
                                <span className={`text-sm font-bold ${currentPermission === 'none' ? 'text-white' : 'text-gray-400'}`}>Ninguém</span>
                                {currentPermission === 'none' && <CheckIcon className="w-5 h-5 text-[#00E676]" />}
                            </button>
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5 w-full"></div>

                    {/* Filtros */}
                    <div>
                        <div className="flex items-center justify-between py-2 px-1">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <ShieldIcon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-white text-sm font-bold">Filtro de comentários</span>
                                    <span className="text-gray-500 text-xs">Ocultar palavras ofensivas</span>
                                </div>
                            </div>
                            <div 
                                onClick={() => setSensitiveFilter(!sensitiveFilter)}
                                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ${sensitiveFilter ? 'bg-[#00E676]' : 'bg-gray-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${sensitiveFilter ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
