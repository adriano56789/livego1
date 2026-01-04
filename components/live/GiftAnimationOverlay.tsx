
import React, { useEffect, useState } from 'react';
import { Gift, User } from '../../types';

export interface GiftPayload {
    id?: number;
    fromUser: User;
    toUser: { id: string; name: string };
    gift: Gift;
    quantity: number;
    roomId: string;
}

interface Props {
    giftPayload: GiftPayload;
    onAnimationEnd: (id: number) => void;
}

const GiftAnimationOverlay: React.FC<Props> = ({ giftPayload, onAnimationEnd }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                if (giftPayload.id !== undefined && giftPayload.id !== null) {
                    onAnimationEnd(giftPayload.id);
                }
            }, 300); 
        }, 2000); 

        return () => clearTimeout(timer);
    }, [giftPayload, onAnimationEnd]);

    return (
        <div 
            className={`flex items-center bg-black/60 rounded-full pr-4 py-1 pl-1 mb-2 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        >
            <img src={giftPayload.fromUser.avatarUrl} className="w-8 h-8 rounded-full border border-yellow-400" alt="" />
            <div className="ml-2 mr-2">
                <p className="text-white text-xs font-bold">{giftPayload.fromUser.name}</p>
                <p className="text-yellow-400 text-[10px]">Enviou {giftPayload.gift.name}</p>
            </div>
            <div className="text-2xl">{giftPayload.gift.icon}</div>
            <div className="ml-2 text-yellow-400 font-bold italic text-lg">x{giftPayload.quantity}</div>
        </div>
    );
};

export default GiftAnimationOverlay;
