
import React from 'react';
import { LevelBadge } from '../LevelBadge';
import { YellowDiamondIcon } from '../icons';

interface GiftChatMessageProps {
    user: { name: string; avatarUrl: string; level: number };
    receiverName: string;
    gift: { name: string; icon: string };
    quantity: number;
    totalPrice: number;
    onUserClick: () => void;
}

const GiftChatMessage: React.FC<GiftChatMessageProps> = ({ user, receiverName, gift, quantity, totalPrice, onUserClick }) => {
    return (
        <div className="flex items-start mb-2 animate-in slide-in-from-left-4 fade-in duration-300 w-full">
            <div className="relative flex items-center bg-black/80 border border-yellow-500/50 rounded-2xl p-2 pr-4 gap-3 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                <div className="shrink-0 cursor-pointer" onClick={onUserClick}>
                    <img src={user.avatarUrl} className="w-10 h-10 rounded-full border-2 border-yellow-500" />
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <LevelBadge level={user.level} />
                        <span className="text-white text-xs font-black truncate">{user.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-300 flex items-center flex-wrap gap-1">
                        <span>enviou</span>
                        <span className="text-lg leading-none">{gift.icon}</span>
                        <span className="text-yellow-400 font-bold">{gift.name}</span>
                        <span>para</span>
                        <span className="text-white font-bold">{receiverName}</span>
                        {quantity > 1 && <span className="text-yellow-500 font-black italic">x{quantity}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftChatMessage;
