
import React, { useState, useEffect, useMemo } from 'react';
import { YellowDiamondIcon, HeadphonesIcon, PlusIcon, ChevronLeftIcon, CheckIcon } from '../icons';
import { useTranslation } from '../../i18n';
import { User, ToastType } from '../../types';
import { api } from '../../services/api';
import { getRemainingDays } from '../../services/db_shared';
import { LoadingSpinner } from '../Loading';
import * as FrameIcons from '../icons/frames';

interface MarketScreenProps {
  onClose: () => void;
  user: User;
  updateUser: (user: User) => void;
  onOpenWallet: (initialTab: 'Diamante' | 'Ganhos') => void;
  addToast: (type: ToastType, message: string) => void;
}

const tabs = ['Quadro de avatar', 'Carro', 'Bolha', 'Anel'];

const MarketScreen: React.FC<MarketScreenProps> = ({ onClose, user, updateUser, onOpenWallet, addToast }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [frames, setFrames] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Map IDs to Components dynamically
  const frameComponents = useMemo(() => {
      const map: Record<string, React.FC<any>> = {};
      Object.entries(FrameIcons).forEach(([key, Component]) => {
          const id = key.replace('Icon', ''); 
          map[id] = Component;
          map[key] = Component;
      });
      return map;
  }, []);

  // Fetch Frames from API (Database)
  useEffect(() => {
      const fetchData = async () => {
          setIsLoadingData(true);
          try {
              const data = await api.getAvatarFrames();
              setFrames(data || []);
              
              // Set initial selected item to currently equipped or first item
              if (data && data.length > 0) {
                  const equipped = data.find((f: any) => f.id === user.activeFrameId);
                  setSelectedItem(equipped || data[0]);
              }
          } catch (error) {
              console.error("Failed to load frames", error);
              addToast(ToastType.Error, "Falha ao carregar loja.");
          } finally {
              setIsLoadingData(false);
          }
      };
      fetchData();
  }, [user.activeFrameId]); 

  const handlePurchase = async () => {
    if (!selectedItem || isActionLoading) return;
    setIsActionLoading(true);
    try {
        const { success, user: updatedUser, error } = await api.buyFrame(user.id, selectedItem.id);
        if (success && updatedUser) {
            updateUser(updatedUser);
            addToast(ToastType.Success, `Você comprou ${selectedItem.name}!`);
        } else {
            addToast(ToastType.Error, error || "Falha na compra.");
        }
    } catch (error) {
        addToast(ToastType.Error, (error as Error).message);
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleEquipFrame = async (frameId: string | null) => {
    setIsActionLoading(true);
    try {
      const { success, user: updatedUser } = await api.setActiveFrame(user.id, frameId);
      if (success && updatedUser) {
        updateUser(updatedUser);
        addToast(ToastType.Success, frameId ? 'Moldura equipada!' : 'Moldura desequipada.');
      } else {
        throw new Error('Falha ao alterar moldura.');
      }
    } catch (error) {
      addToast(ToastType.Error, (error as Error).message);
    } finally {
        setIsActionLoading(false);
    }
  };
  
  const isFrameOwned = selectedItem && user.ownedFrames?.some(f => f.frameId === selectedItem.id && getRemainingDays(f.expirationDate) > 0);
  const isSelectedFrameEquipped = isFrameOwned && user.activeFrameId === selectedItem.id;
  const selectedOwnedFrame = isFrameOwned ? user.ownedFrames?.find(f => f.frameId === selectedItem.id) : null;
  const remainingDays = getRemainingDays(selectedOwnedFrame?.expirationDate);

  const renderFrameVisual = (frameId: string, className = "absolute inset-[-15%] w-[130%] h-[130%] pointer-events-none z-10") => {
      const Component = frameComponents[frameId];
      if (Component) {
          return <Component className={className} />;
      }
      return null;
  };

  let buttonText: string = '';
  let buttonAction: (() => void) | undefined = undefined;
  let buttonDisabled: boolean = isActionLoading;
  let buttonClass = 'bg-[#00E676] hover:bg-[#00C853] text-white shadow-lg shadow-green-500/20';

  if (activeTab === 'Quadro de avatar' && selectedItem) {
    if (isSelectedFrameEquipped) {
        buttonText = `Em uso`;
        buttonAction = undefined; 
        buttonClass = 'bg-gray-600 text-gray-300 cursor-default';
    } else if (isFrameOwned) {
        buttonText = 'Usar';
        buttonAction = () => handleEquipFrame(selectedItem.id);
        buttonClass = 'bg-[#00E676] hover:bg-[#00C853] text-white';
    } else { 
        if (user.diamonds < selectedItem.price) {
            buttonText = 'Recarregar';
            buttonAction = () => onOpenWallet('Diamante');
            buttonClass = 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold';
            buttonDisabled = false;
        } else {
            buttonText = `Comprar (${selectedItem.price})`;
            buttonAction = handlePurchase;
        }
    }
  }
  
  return (
    <div className="fixed inset-0 bg-[#121212] z-[130] flex flex-col text-white font-sans animate-in slide-in-from-right duration-300">
      
      <header className="relative flex items-center justify-between p-4 pt-6 flex-shrink-0 z-10 bg-[#121212]">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold">Loja</h1>
        <button className="bg-[#2C2C2E] text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1.5 hover:bg-white/10 transition-colors border border-white/10">
            <HeadphonesIcon className="w-3.5 h-3.5" />
            <span>Mochila</span>
        </button>
      </header>

      <nav className="px-4 pb-2 flex-shrink-0 z-10 bg-[#121212]">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-white text-black font-bold' 
                : 'bg-[#1C1C1E] text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-grow overflow-y-auto no-scrollbar p-4 z-10 flex flex-col">
        {isLoadingData ? (
            <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : activeTab === 'Quadro de avatar' ? (
            <>
                <div className="flex-shrink-0 mb-6 flex flex-col items-center justify-center relative">
                    <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                        <img 
                            src={user.avatarUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-full bg-gray-800 border-2 border-white/10" 
                        />
                        {selectedItem && renderFrameVisual(selectedItem.id)}
                    </div>
                    
                    <div className="bg-[#2C2C2E] px-3 py-1 rounded-full text-xs text-gray-400">
                        {isFrameOwned 
                            ? `Válido por ${remainingDays} dia(s)` 
                            : selectedItem 
                                ? `Válido por ${selectedItem.duration} dias` 
                                : 'Selecione um item'}
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 pb-24">
                    {frames.map(frame => {
                        const isOwned = user.ownedFrames?.some(f => f.frameId === frame.id && getRemainingDays(f.expirationDate) > 0);
                        const isEquipped = isOwned && user.activeFrameId === frame.id;
                        const isSelected = selectedItem?.id === frame.id;

                        return (
                            <button 
                                key={frame.id}
                                onClick={() => setSelectedItem(frame)}
                                className={`
                                    relative aspect-square rounded-xl flex flex-col items-center justify-between p-2 transition-all duration-200 border-2
                                    ${isSelected 
                                        ? 'bg-[#252525] border-[#A855F7]' 
                                        : 'bg-[#1C1C1E] border-transparent hover:bg-[#252525]'
                                    }
                                `}
                            >
                                {isEquipped ? (
                                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00E676] rounded-full shadow-[0_0_5px_#00E676]"></div>
                                ) : isOwned && (
                                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}

                                <div className="flex-1 w-full flex items-center justify-center relative p-2">
                                    {renderFrameVisual(frame.id, "w-full h-full object-contain")}
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                    <YellowDiamondIcon className="w-3 h-3 text-yellow-400" />
                                    <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                        {frame.price}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </>
        ) : (
            <div className="flex-grow flex items-center justify-center h-full text-center p-8">
              <div className="flex flex-col items-center opacity-50">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                      <HeadphonesIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-bold mb-1">Em breve</p>
                  <p className="text-gray-400 text-xs">Novos itens chegando para esta categoria.</p>
              </div>
            </div>
        )}
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-20 bg-[#121212] border-t border-white/5 safe-area-bottom">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <YellowDiamondIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold text-white">{(user.diamonds ?? 0).toLocaleString('pt-BR')}</span>
                <button 
                    onClick={() => onOpenWallet('Diamante')} 
                    className="w-5 h-5 bg-[#333] rounded-full flex items-center justify-center text-yellow-400 border border-yellow-400/30 hover:bg-[#444] transition-colors"
                >
                    <PlusIcon className="w-3 h-3 stroke-[3px]" />
                </button>
            </div>

            {activeTab === 'Quadro de avatar' && selectedItem && (
                <button
                    onClick={buttonAction}
                    disabled={buttonDisabled}
                    className={`flex-1 font-bold text-sm py-3 px-6 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${buttonClass}`}
                >
                    {isActionLoading ? '...' : buttonText}
                </button>
            )}
        </div>
      </footer>
    </div>
  );
};

export default MarketScreen;
