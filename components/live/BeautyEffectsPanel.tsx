
import React, { useState } from 'react';
import { CloseIcon, FaceIcon, FaceSmoothIcon, ContrastIcon, BanIcon, RefreshIcon } from '../icons';
import { ToastType } from '../../types';

interface BeautyEffectsPanelProps {
    onClose: () => void;
    currentUser: any;
    addToast: (type: ToastType, message: string) => void;
}

const BeautyEffectsPanel: React.FC<BeautyEffectsPanelProps> = ({ onClose, currentUser, addToast }) => {
    const [activeTab, setActiveTab] = useState<'Recomendar' | 'Beleza'>('Beleza');
    const [selectedEffect, setSelectedEffect] = useState('contraste');
    const [values, setValues] = useState<Record<string, number>>({
        'branquear': 50,
        'alisar': 50,
        'ruborizar': 30,
        'contraste': 50,
        'musa': 80,
        'bonito': 60,
        'vitalidade': 70,
    });

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues(prev => ({
            ...prev,
            [selectedEffect]: parseInt(e.target.value)
        }));
    };

    const handleReset = () => {
        setValues(prev => ({
            ...prev,
            [selectedEffect]: 0
        }));
    };

    const handleSave = () => {
        addToast(ToastType.Success, "Efeitos salvos!");
        onClose();
    };

    const recommendItems = [
        { id: 'none', label: 'Fechar', icon: <BanIcon className="w-6 h-6" /> },
        { id: 'musa', label: 'Musa', image: 'https://picsum.photos/seed/musa/100' },
        { id: 'bonito', label: 'Bonito', image: 'https://picsum.photos/seed/bonito/100' },
        { id: 'vitalidade', label: 'Vitalidade', image: 'https://picsum.photos/seed/vitalidade/100' },
    ];

    const beautyItems = [
        { id: 'branquear', label: 'Branquear', icon: <FaceIcon className="w-6 h-6" />, type: 'icon' },
        { id: 'alisar', label: 'Alisar a p...', icon: <FaceSmoothIcon className="w-6 h-6" />, type: 'icon' },
        { id: 'ruborizar', label: 'Ruborizar', icon: <FaceIcon className="w-6 h-6" />, type: 'icon' },
        { id: 'contraste', label: 'Contraste', icon: <ContrastIcon className="w-6 h-6" />, type: 'icon' },
    ];

    const currentItems = activeTab === 'Recomendar' ? recommendItems : beautyItems;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
            {/* Backdrop - Transparent to allow seeing the camera feed */}
            <div className="absolute inset-0 bg-transparent"></div>

            <div 
                className="relative bg-[#1C1C1E] w-full max-w-md rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col pb-8 pt-2" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-4 border-b border-white/5">
                    <div className="flex space-x-6">
                        <button 
                            onClick={() => setActiveTab('Recomendar')}
                            className={`text-[15px] font-bold transition-colors ${activeTab === 'Recomendar' ? 'text-white' : 'text-gray-500'}`}
                        >
                            Recomendar
                        </button>
                        <button 
                            onClick={() => setActiveTab('Beleza')}
                            className={`text-[15px] font-bold transition-colors ${activeTab === 'Beleza' ? 'text-white' : 'text-gray-500'}`}
                        >
                            Beleza
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleReset} className="text-gray-400 text-xs font-medium hover:text-white transition-colors flex items-center gap-1">
                            Redefinir
                        </button>
                        <button onClick={handleSave} className="text-[#00E676] text-xs font-bold hover:text-green-400 transition-colors">
                            Salvar
                        </button>
                        <button onClick={onClose} className="bg-gray-800/50 rounded-full p-1 hover:bg-gray-700">
                            <CloseIcon className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Slider Area */}
                {selectedEffect !== 'none' && (
                    <div className="px-6 py-6 flex items-center gap-4">
                        <span className="text-white font-bold text-sm w-6 text-center">{values[selectedEffect] || 0}</span>
                        <div className="flex-1 relative h-6 flex items-center">
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={values[selectedEffect] || 0} 
                                onChange={handleValueChange}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
                            />
                        </div>
                    </div>
                )}
                
                {/* Icons Grid */}
                <div className="overflow-x-auto no-scrollbar px-4 pb-2">
                    <div className="flex space-x-3">
                        {currentItems.map((item: any) => {
                            const isSelected = selectedEffect === item.id;
                            return (
                                <button 
                                    key={item.id} 
                                    onClick={() => setSelectedEffect(item.id)}
                                    className="flex flex-col items-center gap-2 min-w-[70px]"
                                >
                                    <div 
                                        className={`
                                            w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-200
                                            ${isSelected 
                                                ? 'bg-[#a855f7] border-2 border-[#a855f7] shadow-lg shadow-purple-900/40 text-white' 
                                                : 'bg-[#2C2C2E] border border-transparent text-gray-400 hover:bg-[#3A3A3C]'
                                            }
                                        `}
                                    >
                                        {item.image ? (
                                            <img src={item.image} alt={item.label} className="w-full h-full object-cover opacity-90" />
                                        ) : (
                                            item.icon
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium text-center leading-tight max-w-[70px] ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BeautyEffectsPanel;
