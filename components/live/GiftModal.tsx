import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Gift, RankedUser, User } from '../../types';
import { YellowDiamondIcon, CheckIcon, CloseIcon, SolidDiamondIcon, TrophyIcon, ArrowUpIcon, HeadphonesIcon } from '../icons';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';
import { LoadingSpinner } from '../Loading';
import { LevelBadge } from '../LevelBadge';

interface GiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    userDiamonds: number;
    onSendGift: (gift: Gift, quantity: number) => Promise<User | null>;
    onRecharge: () => void;
    gifts: Gift[];
    receivedGifts: (Gift & { count: number })[];
    isBroadcaster?: boolean;
    isSendingGift?: boolean;
    isVIP: boolean;
    onOpenVIPCenter: () => void;
}

const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose, userDiamonds, onSendGift, onRecharge, gifts, receivedGifts, isBroadcaster = false, isSendingGift = false, isVIP, onOpenVIPCenter }) => {
    const { t } = useTranslation();
    const [giftsByTab, setGiftsByTab] = useState<Record<string, Gift[]>>({});
    const [activeTab, setActiveTab] = useState('Popular');
    const [rankingSubTab, setRankingSubTab] = useState<'Live' | 'Diária' | 'Semanal' | 'Mensal'>('Live');
    const [rankingList, setRankingList] = useState<RankedUser[]>([]);
    const [isLoadingRanking, setIsLoadingRanking] = useState(false);
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showQuantitySelector, setShowQuantitySelector] = useState(false);
    
    // Combo States
    const [comboCount, setComboCount] = useState(0);
    const [showCombo, setShowCombo] = useState(false);
    const [comboProgress, setComboProgress] = useState(100);
    const [isPulsing, setIsPulsing] = useState(false);
    
    const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const comboIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const giftCategories = ['Popular', 'Mochila', 'Luxo', 'Atividade', 'VIP', 'Ranking', 'Galeria'];
    const presetQuantities = [1, 10, 99, 188, 520, 1314];

    useEffect(() => {
        const groupedGifts = gifts.reduce((acc, gift) => {
            const category = gift.category || 'Popular';
            if (!acc[category]) acc[category] = [];
            acc[category].push(gift);
            return acc;
        }, {} as Record<string, Gift[]>);
        setGiftsByTab(groupedGifts);
    }, [gifts]);

    useEffect(() => {
        if (activeTab === 'Ranking' && isOpen) {
            fetchRankingData();
        }
    }, [activeTab, rankingSubTab, isOpen]);

    const fetchRankingData = async () => {
        setIsLoadingRanking(true);
        try {
            let data: RankedUser[] = [];
            if (rankingSubTab === 'Live') data = await api.getLiveRanking();
            else if (rankingSubTab === 'Diária') data = await api.getDailyRanking();
            else if (rankingSubTab === 'Semanal') data = await api.getWeeklyRanking();
            else data = await api.getMonthlyRanking();
            
            setRankingList(data || []);
        } catch (e) {
            console.error("Erro ao carregar ranking", e);
        } finally {
            setIsLoadingRanking(false);
        }
    };

    const resetCombo = () => {
        setShowCombo(false);
        setComboCount(0);
        setComboProgress(100);
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        if (comboIntervalRef.current) clearInterval(comboIntervalRef.current);
    };

    const startComboTimer = () => {
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        if (comboIntervalRef.current) clearInterval(comboIntervalRef.current);

        setComboProgress(100);
        const duration = 3000; 
        const interval = 16; 
        const decrement = (interval / duration) * 100;

        comboIntervalRef.current = setInterval(() => {
            setComboProgress(prev => {
                if (prev <= 0) {
                    resetCombo();
                    return 0;
                }
                return prev - decrement;
            });
        }, interval);

        comboTimerRef.current = setTimeout(() => {
            resetCombo();
        }, duration);
    };

    const handleSend = async () => {
        if (!selectedGift || isSendingGift) return;
        
        // Cost check
        const totalCost = selectedGift.price * quantity;
        if (userDiamonds < totalCost) {
            onRecharge();
            return;
        }

        const result = await onSendGift(selectedGift, quantity);
        if (result) {
            setShowCombo(true);
            setComboCount(prev => prev + 1);
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 200);
            startComboTimer();
        }
    };

    // When switching gifts or tabs, stop the combo to prevent sending the wrong gift
    useEffect(() => {
        resetCombo();
    }, [selectedGift?.id, activeTab]);

    return (
        <div className={`fixed inset-0 z-[100] flex items-end justify-center transition-all duration-300 ${isOpen ? 'bg-black/40 backdrop-blur-[2px]' : 'pointer-events-none opacity-0'}`} onClick={onClose}>
            <div 
                className={`w-full max-w-xl bg-[#121214]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[40px] flex flex-col h-[70vh] transform transition-transform duration-500 cubic-bezier(0.33, 1, 0.68, 1) shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} 
                onClick={e => e.stopPropagation()}
            >
                {/* Drag Handle */}
                <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mt-4 shrink-0"></div>

                <header className="px-6 pt-2">
                    <div className="flex justify-between items-center mb-6">
                        <div 
                            className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:bg-white/10" 
                            onClick={onRecharge}
                        >
                            <YellowDiamondIcon className="w-4 h-4 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                            <span className="text-white font-black text-[15px]">{(userDiamonds || 0).toLocaleString()}</span>
                            <div className="h-3 w-[1px] bg-white/20 mx-1"></div>
                            <span className="text-yellow-400 text-[10px] font-black uppercase tracking-wider">Recarregar</span>
                        </div>
                        
                        <h2 className="text-white font-black text-base uppercase tracking-[2px] opacity-80">Presentear</h2>
                        
                        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-colors border border-white/5">
                            <CloseIcon className="w-4 h-4 text-gray-300" />
                        </button>
                    </div>

                    <nav className="flex gap-7 overflow-x-auto no-scrollbar border-b border-white/5 pb-1 mb-2">
                        {giftCategories.map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`text-[13px] font-black whitespace-nowrap transition-all relative py-2 px-1 tracking-wide ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute -bottom-[6px] left-0 right-0 h-[4px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.7)] animate-in fade-in duration-300"></div>
                                )}
                            </button>
                        ))}
                    </nav>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
                    {activeTab === 'Ranking' ? (
                        <div className="space-y-5">
                            <div className="flex justify-center bg-white/5 p-1 rounded-2xl w-fit mx-auto border border-white/5 backdrop-blur-sm">
                                {['Live', 'Diária', 'Semanal', 'Mensal'].map(st => (
                                    <button 
                                        key={st} 
                                        onClick={() => setRankingSubTab(st as any)} 
                                        className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${rankingSubTab === st ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                            
                            {isLoadingRanking ? (
                                <div className="flex justify-center py-24"><LoadingSpinner /></div>
                            ) : (
                                <div className="space-y-2 pb-12">
                                    {rankingList.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                            <TrophyIcon className="w-12 h-12 text-gray-600 mb-3" />
                                            <p className="text-gray-500 text-sm font-bold">Nenhum dado disponível.</p>
                                        </div>
                                    ) : rankingList.map((user, i) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 rounded-[24px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-6 text-center font-black text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                                                    {i + 1}
                                                </span>
                                                <div className="relative">
                                                    <img src={user.avatarUrl} className="w-11 h-11 rounded-full object-cover border-2 border-white/10 shadow-lg" alt={user.name} />
                                                    {i < 3 && <div className="absolute -top-1 -right-1 text-xs">👑</div>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white text-sm font-black truncate max-w-[130px] tracking-tight">{user.name}</span>
                                                    <div className="mt-0.5"><LevelBadge level={user.level || 1} /></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
                                                <span className="text-yellow-500 font-black text-sm">{(user.value || 0).toLocaleString()}</span>
                                                <SolidDiamondIcon className="w-3.5 h-3.5 text-yellow-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'Galeria' ? (
                        <div className="grid grid-cols-4 gap-4 pb-12">
                            {receivedGifts.length === 0 ? (
                                <div className="col-span-4 text-center py-24 opacity-30">
                                    <SolidDiamondIcon className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                    <p className="text-gray-500 text-sm font-bold">Sua galeria está vazia.</p>
                                </div>
                            ) : receivedGifts.map(g => (
                                <div key={g.id} className="flex flex-col items-center bg-white/5 p-4 rounded-[28px] border border-white/5 shadow-inner">
                                    <span className="text-4xl mb-3 drop-shadow-xl">{g.icon}</span>
                                    <div className="bg-black/30 px-2 py-0.5 rounded-full">
                                        <span className="text-[10px] text-white font-black tracking-tighter">x{g.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activeTab === 'Mochila' ? (
                        <div className="flex flex-col items-center justify-center py-24 opacity-40">
                            <HeadphonesIcon className="w-14 h-14 text-gray-600 mb-4" />
                            <p className="text-gray-500 text-sm font-bold mb-1">Sua mochila está vazia</p>
                            <p className="text-gray-600 text-xs px-12 text-center">Itens comprados na Loja aparecerão aqui para serem enviados.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-x-2 gap-y-5 pb-12">
                            {(giftsByTab[activeTab] || []).map(gift => (
                                <button 
                                    key={gift.id} 
                                    onClick={() => { setSelectedGift(gift); setQuantity(1); }}
                                    className={`relative flex flex-col items-center p-3 rounded-[26px] transition-all duration-300 active:scale-90 ${selectedGift?.id === gift.id ? 'bg-purple-600/20 ring-[3px] ring-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'hover:bg-white/5'}`}
                                >
                                    <div className="text-[44px] mb-2.5 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] transform hover:scale-110 transition-transform duration-300">
                                        {gift.icon}
                                    </div>
                                    <span className="text-[11px] text-white font-black truncate w-full text-center tracking-tighter mb-1">{gift.name}</span>
                                    <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full">
                                        <YellowDiamondIcon className="w-2.5 h-2.5" />
                                        <span className="text-[10px] text-yellow-500 font-black">{gift.price}</span>
                                    </div>
                                    {selectedGift?.id === gift.id && (
                                        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1 shadow-lg border border-white/20 animate-in zoom-in duration-200">
                                            <CheckIcon className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </main>

                {activeTab !== 'Ranking' && activeTab !== 'Galeria' && (
                    <footer className="px-6 py-6 border-t border-white/10 bg-black/60 pb-10 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between gap-5">
                            {/* Quantity Selector Area */}
                            <div className="flex-1 bg-white/5 rounded-[22px] px-4 h-14 flex items-center justify-between relative border border-white/10 group transition-all hover:bg-white/10">
                                <button 
                                    onClick={() => setShowQuantitySelector(!showQuantitySelector)} 
                                    className="flex items-center gap-3 text-white font-black text-sm h-full"
                                >
                                    <span className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center border border-white/5">{quantity}</span> 
                                    <ArrowUpIcon className={`w-3.5 h-3.5 transition-transform duration-300 ${showQuantitySelector ? 'rotate-180' : ''}`} strokeWidth={3} />
                                </button>
                                
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2">
                                        <YellowDiamondIcon className="w-4 h-4 drop-shadow-[0_0_4px_rgba(234,179,8,0.4)]" />
                                        <span className={`text-sm font-black transition-colors ${userDiamonds < (selectedGift?.price || 0) * quantity ? 'text-red-500' : 'text-yellow-500'}`}>
                                            {(selectedGift ? selectedGift.price * quantity : 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Total</span>
                                </div>

                                {showQuantitySelector && (
                                    <div className="absolute bottom-[calc(100%+12px)] left-0 w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-3 z-50 grid grid-cols-3 gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-2 duration-200">
                                        {presetQuantities.map(q => (
                                            <button 
                                                key={q} 
                                                onClick={() => { setQuantity(q); setShowQuantitySelector(false); }} 
                                                className={`py-3 rounded-xl text-xs font-black transition-all active:scale-95 ${quantity === q ? 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Main Action Button */}
                            <div className="relative">
                                <button 
                                    onClick={handleSend}
                                    disabled={!selectedGift || isSendingGift}
                                    className={`relative z-10 h-14 px-12 rounded-[22px] font-black text-sm tracking-[1px] transition-all shadow-[0_8px_25px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center min-w-[140px] active:scale-95 ${
                                        showCombo 
                                        ? `bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-500 shadow-orange-500/40 border-2 border-white/20 ${isPulsing ? 'combo-active' : ''}` 
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed hover:brightness-110 active:brightness-90'
                                    }`}
                                >
                                    {showCombo ? (
                                        <div className="flex flex-col items-center animate-in zoom-in duration-200">
                                            <span className="text-[10px] italic leading-none opacity-90 mb-0.5 uppercase font-black tracking-widest">Combo</span>
                                            <span className="text-3xl leading-none font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">x{comboCount}</span>
                                        </div>
                                    ) : (
                                        isSendingGift ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : 'ENVIAR'
                                    )}
                                    
                                    {showCombo && (
                                        <div 
                                            className="absolute bottom-0 left-0 h-1.5 bg-white/60 transition-all duration-75 ease-linear"
                                            style={{ width: `${comboProgress}%` }}
                                        />
                                    )}
                                </button>
                                
                                {showCombo && (
                                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                                )}
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default GiftModal;
