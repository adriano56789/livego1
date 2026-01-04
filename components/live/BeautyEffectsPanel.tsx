import React, { useState, useEffect } from 'react';
import { CloseIcon, FaceIcon, FaceSmoothIcon, ContrastIcon, BanIcon, RefreshIcon } from '../icons';
import { ToastType } from '../../types';
import { api } from '../../services/api';
import { LoadingSpinner } from '../Loading';

interface BeautyEffectsPanelProps {
    onClose: () => void;
    addToast: (type: ToastType, message: string) => void;
}

const iconMap: { [key: string]: React.FC<any> } = {
    FaceIcon,
    FaceSmoothIcon,
    ContrastIcon,
    BanIcon,
    RefreshIcon,
};

const BeautyEffectsPanel: React.FC<BeautyEffectsPanelProps> = ({ onClose, addToast }) => {
    const [config, setConfig] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('');
    const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
    const [values, setValues] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchConfig = async () => {
            console.log('[BeautyEffectsPanel] Carregando configurações de beleza...');
            setIsLoading(true);
            
            try {
                console.log('[API] Solicitando configurações de beleza...');
                const data = await api.streams.getBeautySettings();
                console.log('[API] Configurações recebidas:', data);
                
                setConfig(data);
                
                // Inicializa os valores padrão
                const initialValues: Record<string, number> = {};
                if (data.effects) {
                    Object.entries(data.effects).forEach(([tabId, effectList]: [string, any]) => {
                        console.log(`[BeautyEffectsPanel] Processando efeitos da tab ${tabId}:`, effectList);
                        effectList.forEach((effect: any) => {
                            initialValues[effect.id] = effect.defaultValue;
                        });
                    });
                }
                
                console.log('[BeautyEffectsPanel] Valores iniciais:', initialValues);
                setValues(initialValues);

                // Seleciona a primeira aba e o primeiro efeito por padrão
                if (data.tabs && data.tabs.length > 0) {
                    const firstTabId = data.tabs[0].id;
                    console.log(`[BeautyEffectsPanel] Selecionando primeira tab: ${firstTabId}`);
                    setActiveTab(firstTabId);
                    
                    if (data.effects && data.effects[firstTabId] && data.effects[firstTabId].length > 0) {
                        const firstEffectId = data.effects[firstTabId][0].id;
                        console.log(`[BeautyEffectsPanel] Selecionando primeiro efeito: ${firstEffectId}`);
                        setSelectedEffect(firstEffectId);
                    }
                }
                
                console.log('[BeautyEffectsPanel] Configurações carregadas com sucesso');
            } catch (error) {
                console.error('[BeautyEffectsPanel] Erro ao carregar configurações:', error);
                addToast(ToastType.Error, "Falha ao carregar efeitos. Por favor, recarregue a página.");
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchConfig();
        
        // Limpeza ao desmontar o componente
        return () => {
            console.log('[BeautyEffectsPanel] Componente desmontado');
        };
    }, [addToast]);
    
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedEffect) return;
        setValues(prev => ({ ...prev, [selectedEffect]: parseInt(e.target.value) }));
    };

    const handleTabClick = async (tabId: string) => {
        console.log(`[BeautyEffectsPanel] Tab clicada: ${tabId}`);
        setActiveTab(tabId);
        try {
            console.log(`[API] Enviando log de tab clicada: ${tabId}`);
            await api.streams.logBeautyTabClick({ tabId });
            console.log(`[API] Log de tab '${tabId}' registrado com sucesso`);
        } catch (error) {
            console.error(`[API] Erro ao registrar log da tab '${tabId}':`, error);
            // Não mostramos toast para erros de log de tab, pois não é crítico
        }
    };

    const handleSelectEffect = async (effectId: string) => {
        console.log(`[BeautyEffectsPanel] Efeito selecionado: ${effectId}`);
        setSelectedEffect(effectId);
        try {
            console.log(`[API] Aplicando efeito: ${effectId}`);
            await api.streams.applyBeautyEffect({ effectId });
            console.log(`[API] Efeito '${effectId}' aplicado com sucesso`);
        } catch (error) {
            console.error(`[API] Erro ao aplicar efeito '${effectId}':`, error);
            addToast(ToastType.Error, `Falha ao aplicar efeito: ${effectId}`);
        }
    };

    const handleReset = async () => {
        if (!config) return;
        
        console.log('[BeautyEffectsPanel] Resetando configurações de beleza');
        const initialValues: Record<string, number> = {};
        
        // Preenche com valores padrão
        Object.values(config.effects).forEach((effectList: any) => {
            effectList.forEach((effect: any) => {
                initialValues[effect.id] = effect.defaultValue;
            });
        });
        
        setValues(initialValues);
        
        try {
            console.log('[API] Enviando requisição para resetar configurações');
            const result = await api.streams.resetBeautySettings();
            console.log('[API] Configurações resetadas com sucesso:', result);
            addToast(ToastType.Success, "Efeitos redefinidos para o padrão com sucesso!");
        } catch (error) {
            console.error('[API] Erro ao resetar configurações:', error);
            addToast(ToastType.Error, "Falha ao redefinir efeitos. Tente novamente.");
        }
    };

    const handleSave = async () => {
        console.log('[BeautyEffectsPanel] Salvando configurações:', values);
        setIsActionLoading(true);
        
        try {
            console.log('[API] Enviando configurações para o servidor...');
            const result = await api.streams.saveBeautySettings(values);
            console.log('[API] Configurações salvas com sucesso:', result);
            
            // Adiciona um pequeno atraso para dar feedback visual antes de fechar
            await new Promise(resolve => setTimeout(resolve, 300));
            
            addToast(ToastType.Success, "Efeitos salvos com sucesso!");
            onClose();
        } catch (error) {
            console.error('[API] Erro ao salvar configurações:', error);
            addToast(ToastType.Error, "Falha ao salvar efeitos. Por favor, tente novamente.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const currentItems = config?.effects[activeTab] || [];
    const saveAction = config?.actions.find((a: any) => a.id === 'save');
    const resetAction = config?.actions.find((a: any) => a.id === 'reset');

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-transparent"></div>
            <div 
                className="relative bg-[#1C1C1E] w-full max-w-md rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col pb-8 pt-2" 
                onClick={e => e.stopPropagation()}
            >
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
                ) : !config ? (
                    <div className="h-64 flex items-center justify-center text-gray-500">Falha ao carregar.</div>
                ) : (
                    <>
                        <div className="flex items-center justify-between px-4 pb-4 border-b border-white/5">
                            <div className="flex space-x-6">
                                {config.tabs.map((tab: any) => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`text-[15px] font-bold transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                {resetAction && <button onClick={handleReset} className="text-gray-400 text-xs font-medium hover:text-white transition-colors flex items-center gap-1">{resetAction.label}</button>}
                                {saveAction && <button onClick={handleSave} disabled={isActionLoading} className="text-[#00E676] text-xs font-bold hover:text-green-400 transition-colors disabled:opacity-50">{saveAction.label}</button>}
                                <button onClick={onClose} className="bg-gray-800/50 rounded-full p-1 hover:bg-gray-700"><CloseIcon className="w-4 h-4 text-gray-400" /></button>
                            </div>
                        </div>

                        {selectedEffect && selectedEffect !== 'none' && (
                            <div className="px-6 py-6 flex items-center gap-4">
                                <span className="text-white font-bold text-sm w-12 text-center">{config.slider.label} ({values[selectedEffect] || 0})</span>
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
                        
                        <div className="overflow-x-auto no-scrollbar px-4 pb-2">
                            <div className="flex space-x-3">
                                {currentItems.map((item: any) => {
                                    const isSelected = selectedEffect === item.id;
                                    const IconComponent = item.icon ? iconMap[item.icon] : null;
                                    return (
                                        <button key={item.id} onClick={() => handleSelectEffect(item.id)} className="flex flex-col items-center gap-2 min-w-[70px]">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-200 ${isSelected ? 'bg-[#a855f7] border-2 border-[#a855f7] shadow-lg shadow-purple-900/40 text-white' : 'bg-[#2C2C2E] border border-transparent text-gray-400 hover:bg-[#3A3A3C]'}`}>
                                                {item.image ? (<img src={item.image} alt={item.label} className="w-full h-full object-cover opacity-90" />) : IconComponent ? (<IconComponent className="w-6 h-6" />) : null}
                                            </div>
                                            <span className={`text-[10px] font-medium text-center leading-tight max-w-[70px] ${isSelected ? 'text-white' : 'text-gray-500'}`}>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default BeautyEffectsPanel;