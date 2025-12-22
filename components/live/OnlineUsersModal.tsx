
import React from 'react';
import { CloseIcon, VenusIcon, MarsIcon, YellowDiamondIcon } from '../icons';
import { LevelBadge } from '../LevelBadge';
import { User } from '../../types';

interface OnlineUsersModalProps {
    onClose: () => void;
    streamId: string; // Kept for interface compatibility but unused for data fetching now
    users?: (User & { value: number })[]; // New prop for real-time data
}

const OnlineUsersModal: React.FC<OnlineUsersModalProps> = ({ onClose, users = [] }) => {
    
    // Helper to determine a "Contribution Level" based on diamonds sent
    const getContributionLevel = (value: number) => {
        if (value > 50000) return 30;
        if (value > 20000) return 20;
        if (value > 5000) return 10;
        if (value > 1000) return 5;
        if (value > 0) return 1;
        return 0;
    };

    const renderFrame = (user: any) => {
        if (user.activeFrameId === 'frame_gold') {
            return (
                <div className="absolute inset-[-4px] pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                        <defs>
                            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FCD34D" />
                                <stop offset="50%" stopColor="#F59E0B" />
                                <stop offset="100%" stopColor="#B45309" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="46" stroke="url(#goldGradient)" strokeWidth="3" fill="none" />
                        <path d="M50 95 L40 85 L60 85 Z" fill="url(#goldGradient)" />
                    </svg>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-transparent" onClick={onClose}>
            <div 
                className="w-full bg-[#18181b] rounded-t-3xl h-[60vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl border-t border-white/5"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 px-5 border-b border-white/5 bg-[#18181b] rounded-t-3xl">
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-white text-[15px] font-bold tracking-wide">Usuários Online ({users.length})</h2>
                    <div className="w-5"></div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    {users.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">Nenhum usuário online no momento.</div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {users.map((user, index) => {
                                const isFemale = user.gender === 'female';
                                const contribution = user.value || 0;
                                const contribLevel = getContributionLevel(contribution);

                                return (
                                    <div key={user.id} className="flex items-center gap-3">
                                        {/* Avatar Container */}
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            {renderFrame(user)}
                                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 border border-white/10">
                                                <img 
                                                    src={user.avatarUrl} 
                                                    alt={user.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            {/* Rank Number for top 3 */}
                                            {index < 3 && (
                                                <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black border border-white/20 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-orange-400'}`}>
                                                    {index + 1}
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-white text-[13px] font-bold truncate leading-tight mr-2">{user.name}</span>
                                                
                                                {/* Contribution Display */}
                                                {contribution > 0 && (
                                                    <div className="flex items-center gap-1 bg-[#2C2C2E] px-2 py-0.5 rounded-full border border-yellow-500/30">
                                                        <span className="text-yellow-400 text-xs font-bold">{contribution.toLocaleString()}</span>
                                                        <YellowDiamondIcon className="w-3 h-3 text-yellow-400" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5">
                                                {/* Gender Badge */}
                                                <div className={`flex items-center px-1.5 py-[1px] rounded-[4px] gap-0.5 min-w-[30px] justify-center h-[16px] ${isFemale ? 'bg-[#FF4D80]' : 'bg-[#3b82f6]'}`}>
                                                    {isFemale ? <VenusIcon className="w-2.5 h-2.5 text-white fill-white" /> : <MarsIcon className="w-2.5 h-2.5 text-white fill-white" />}
                                                    <span className="text-[9px] font-bold text-white leading-none">{user.age || 18}</span>
                                                </div>

                                                {/* User Level Badge */}
                                                <LevelBadge level={user.level} />

                                                {/* Contribution Level Badge (If active) */}
                                                {contribLevel > 0 && (
                                                    <div className="flex items-center bg-orange-500/20 border border-orange-500/50 px-1.5 py-[1px] rounded-[4px] gap-0.5 h-[16px]">
                                                        <span className="text-[9px] font-bold text-orange-400 leading-none">C.Nv {contribLevel}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnlineUsersModal;
