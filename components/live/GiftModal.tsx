import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Gift, RankedUser } from '../../types';
import { YellowDiamondIcon, CheckIcon, CloseIcon, SolidDiamondIcon, TrophyIcon, ArrowUpIcon } from '../icons';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';
import { LoadingSpinner } from '../Loading';
import { LevelBadge } from '../LevelBadge';

interface GiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    userDiamonds: number;
    onSendGift: (gift: Gift, quantity: number) => Promise<any>;
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
    const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const comboIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const giftCategories = ['Popular', 'Luxo', 'Atividade', 'VIP', 'Ranking', 'Galeria'];
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
        const interval = 50;
        const decrement = (interval / duration) * 100;

        comboIntervalRef.current = setInterval(() => {
            setComboProgress(prev => Math.max(0, prev - decrement));
        }, interval);

        comboTimerRef.current = setTimeout(() => {
            resetCombo();
        }, duration);
    };

    const handleSend = async () => {
        if (!selectedGift || isSendingGift) return;
        
        const result = await onSendGift(selectedGift, quantity);
        if (result) {
            setShowCombo(true);
            setComboCount(prev => prev + 1);
            startComboTimer();
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`} onClick={onClose}>
            <div className={`w-full max-w-lg bg-[#121214]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] flex flex-col h-[70vh] transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
                
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 shrink-0"></div>

                <header className="p-4 pb-2">
                    <div className="flex justify-between items-center mb-5">
                        <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2" onClick={onRecharge}>
                            <YellowDiamondIcon className="w-4 h-4" />
                            <span className="text-white font-black text-sm">{(userDiamonds || 0).toLocaleString()}</span>
                            <span className="text-yellow-400 text-[10px] font-black ml-1">RECARGA</span>
                        </div>
                        <h2 className="text-white font-black text-base">Presentear</h2>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5">
                            <CloseIcon className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <nav className="flex gap-6 overflow-x-auto no-scrollbar border-b border-white/5 pb-2">
                        {giftCategories.map(tab => (
                            <button key={tab} onClick={() => { setActiveTab(tab); resetCombo(); }} className={`text-sm font-black whitespace-nowrap transition-all relative py-1 ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>
                                {tab}
                                {activeTab === tab && <div className="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>}
                            </button>
                        ))}
                    </nav>
                </header>

                <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    {activeTab === 'Ranking' ? (
                        <div className="space-y-4">
                            <div className="flex justify-center bg-black/40 p-1 rounded-full w-fit mx-auto border border-white/10">
                                {['Live', 'Diária', 'Semanal', 'Mensal'].map(st => (
                                    <button key={st} onClick={() => setRankingSubTab(st as any)} className={`px-4 py-1.5 rounded-full text-[11px] font-black transition-all ${rankingSubTab === st ? 'bg-white text-black' : 'text-gray-500'}`}>{st}</button>
                                ))}
                            </div>
                            
                            {isLoadingRanking ? (
                                <div className="flex justify-center py-20"><LoadingSpinner /></div>
                            ) : (
                                <div className="space-y-2 pb-10">
                                    {rankingList.length === 0 ? (
                                        <p className="text-center text-gray-500 text-sm py-10">Nenhum ranking disponível.</p>
                                    ) : rankingList.map((user, i) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-5 text-center font-black text-xs ${i < 3 ? 'text-yellow-500' : 'text-gray-500'}`}>{i + 1}</span>
                                                <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                                <div className="flex flex-col text-left">
                                                    <span className="text-white text-sm font-black truncate max-w-[120px]">{user.name}</span>
                                                    <LevelBadge level={user.level || 1} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full">
                                                <span className="text-yellow-500 font-black text-xs">{(user.value || 0).toLocaleString()}</span>
                                                <SolidDiamondIcon className="w-3 h-3 text-yellow-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'Galeria' ? (
                        <div className="grid grid-cols-4 gap-4 pb-10">
                            {receivedGifts.length === 0 ? (
                                <div className="col-span-4 text-center py-10 text-gray-500 text-sm">Sua galeria está vazia.</div>
                            ) : receivedGifts.map(g => (
                                <div key={g.id} className="flex flex-col items-center bg-white/5 p-4 rounded-[24px] border border-white/5">
                                    <span className="text-4xl mb-2">{g.icon}</span>
                                    <span className="text-[10px] text-white font-black">x{g.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-x-2 gap-y-4 pb-10">
                            {(giftsByTab[activeTab] || []).map(gift => (
                                <button 
                                    key={gift.id} 
                                    onClick={() => { setSelectedGift(gift); setQuantity(1); resetCombo(); }}
                                    className={`relative flex flex-col items-center p-2 rounded-[20px] transition-all active:scale-95 ${selectedGift?.id === gift.id ? 'bg-purple-600/20 ring-2 ring-purple-500/50' : 'hover:bg-white/5'}`}
                                >
                                    <span className="text-4xl mb-2 drop-shadow-lg">{gift.icon}</span>
                                    <span className="text-[10px] text-white font-black truncate w-full text-center">{gift.name}</span>
                                    <div className="flex items-center gap-1">
                                        <YellowDiamondIcon className="w-2.5 h-2.5" />
                                        <span className="text-[10px] text-yellow-500 font-black">{gift.price}</span>
                                    </div>
                                    {selectedGift?.id === gift.id && (
                                        <div className="absolute top-1 right-1 bg-purple-500 rounded-full p-0.5">
                                            <CheckIcon className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </main>

                {activeTab !== 'Ranking' && activeTab !== 'Galeria' && (
                    <footer className="p-4 border-t border-white/5 bg-black/40 pb-10">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 bg-white/5 rounded-2xl px-4 h-12 flex items-center justify-between relative border border-white/5">
                                <button onClick={() => setShowQuantitySelector(!showQuantitySelector)} className="flex items-center gap-2 text-white font-black text-sm">
                                    {quantity} <ArrowUpIcon className={`w-3 h-3 transition-transform ${showQuantitySelector ? 'rotate-180' : ''}`} />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <YellowDiamondIcon className="w-3.5 h-3.5" />
                                    <span className="text-yellow-500 font-black text-sm">{(selectedGift ? selectedGift.price * quantity : 0).toLocaleString()}</span>
                                </div>
                                {showQuantitySelector && (
                                    <div className="absolute bottom-full left-0 w-full bg-[#1C1C1E] border border-white/10 rounded-t-2xl p-2 z-50 grid grid-cols-3 gap-2 shadow-2xl">
                                        {presetQuantities.map(q => (
                                            <button key={q} onClick={() => { setQuantity(q); setShowQuantitySelector(false); resetCombo(); }} className={`py-2 rounded-xl text-xs font-black ${quantity === q ? 'bg-purple-600 text-white' : 'bg-white/5 text-white'}`}>{q}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative">
                                <button 
                                    onClick={handleSend}
                                    disabled={!selectedGift || isSendingGift}
                                    className={`relative z-10 h-12 px-10 rounded-2xl font-black text-sm transition-all shadow-lg overflow-hidden flex items-center justify-center min-w-[120px] ${
                                        showCombo 
                                        ? 'bg-gradient-to-tr from-orange-500 to-yellow-500 scale-110 shadow-orange-500/40' 
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50 active:scale-95'
                                    }`}
                                >
                                    {showCombo ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] italic leading-none opacity-80">COMBO</span>
                                            <span className="text-2xl leading-none">{comboCount}</span>
                                        </div>
                                    ) : (
                                        isSendingGift ? '...' : 'ENVIAR'
                                    )}
                                    
                                    {showCombo && (
                                        <div 
                                            className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-75"
                                            style={{ width: `${comboProgress}%` }}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default GiftModal;