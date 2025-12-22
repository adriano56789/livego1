
import React from 'react';
import { User } from '../../types';
import { useTranslation } from '../../i18n';
import { 
    WalletIcon,
    SettingsIcon,
    ChevronRightIcon,
    ShopIcon,
    ShieldIcon,
    BanIcon,
    HelpIcon,
    MailIcon,
    MessageIcon,
    UserPlusIcon,
    CopyIcon,
    MarsIcon,
    VenusIcon,
    BankIcon,
    StarIcon,
    SolidDiamondIcon,
    BeanIcon,
    BrazilFlagIcon
} from '../icons';
import { LevelBadge } from '../LevelBadge';

interface ProfileScreenProps {
    currentUser: User;
    onOpenProfile: () => void;
    onOpenUserDetail: () => void;
    onEnterMyStream: () => void;
    onOpenWallet: (initialTab?: 'Diamante' | 'Ganhos') => void;
    onOpenFollowing: () => void;
    onOpenFans: () => void;
    onOpenVisitors: () => void;
    onOpenTopFans: () => void;
    onNavigateToMessages: () => void;
    onOpenMarket: () => void;
    onOpenMyLevel: () => void;
    onOpenBlockList: () => void;
    onOpenAvatarProtection: () => void;
    onOpenFAQ: () => void;
    onOpenSettings: () => void;
    onOpenSupportChat: () => void;
    onOpenAdminWallet: () => void;
    visitors: User[];
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
    currentUser,
    onOpenProfile,
    onOpenUserDetail,
    onOpenWallet,
    onOpenFollowing,
    onOpenFans,
    onOpenVisitors,
    onNavigateToMessages,
    onOpenMarket,
    onOpenMyLevel,
    onOpenBlockList,
    onOpenFAQ,
    onOpenSettings,
    onOpenSupportChat,
    onOpenAdminWallet,
    visitors = []
}) => {
    const { t } = useTranslation();

    const handleCopyId = () => {
        if (currentUser?.identification) {
            navigator.clipboard.writeText(currentUser.identification);
        }
    };
    
    return (
        <div 
            className="h-full bg-[#121212] text-white overflow-y-auto scrollbar-hide pb-24 font-sans outline-none scroll-smooth"
            tabIndex={0}
        >
            {/* --- Header Section --- */}
            <div className="flex flex-col items-center pt-10 pb-6">
                {/* Avatar with Border and Flag */}
                <div className="relative mb-3 cursor-pointer" onClick={onOpenUserDetail}>
                    <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6]">
                        <img 
                            src={currentUser.avatarUrl} 
                            alt={currentUser.name} 
                            className="w-full h-full rounded-full object-cover border-[3px] border-[#121212]"
                        />
                    </div>
                    {/* Brazil Flag Icon Overlay */}
                    <div className="absolute bottom-0 right-1 rounded-full border-2 border-[#121212] overflow-hidden w-6 h-6">
                        <BrazilFlagIcon className="w-full h-full" />
                    </div>
                </div>
                
                {/* Name */}
                <h1 className="text-xl font-bold text-white mb-2 tracking-wide">{currentUser.name}</h1>
                
                {/* Badges: Level & Rank */}
                <div className="flex items-center gap-2 mb-2">
                    {/* Level Badge (Blue) */}
                    <div className="flex items-center bg-[#3b82f6] rounded-full px-2 py-[2px] gap-1 min-w-[40px] justify-center">
                        {currentUser.gender === 'female' ? <VenusIcon size={10} className="text-white fill-white" /> : <MarsIcon size={10} className="text-white fill-white" />}
                        <span className="text-[11px] font-black italic">{currentUser.age || 18}</span>
                    </div>
                    
                    {/* Level Badge Component */}
                    <LevelBadge level={currentUser.level} />
                </div>
                
                {/* ID & Copy */}
                <div className="flex items-center gap-2 mb-1 text-gray-400">
                    <span className="text-xs font-medium">Identificação: {currentUser.identification}</span>
                    <button onClick={handleCopyId} className="hover:text-white transition-colors">
                        <CopyIcon size={12} className="text-gray-500" />
                    </button>
                </div>
                
                {/* Location */}
                <div className="text-[11px] text-gray-500 mb-8 font-medium">
                    Brasil | Brasil
                </div>
                
                {/* Stats Row */}
                <div className="flex justify-around w-full max-w-sm px-8">
                    <div className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity" onClick={onOpenFollowing}>
                        <span className="text-xl font-bold text-white leading-none mb-1">{currentUser.following || 120}</span>
                        <span className="text-xs text-gray-400">Seguindo</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity" onClick={onOpenFans}>
                        <span className="text-xl font-bold text-white leading-none mb-1">{currentUser.fans || 0}</span>
                        <span className="text-xs text-gray-400">Fãs</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity" onClick={onOpenVisitors}>
                        <span className="text-xl font-bold text-white leading-none mb-1">{visitors.length}</span>
                        <span className="text-xs text-gray-400">Visitantes</span>
                    </div>
                </div>
            </div>
            
            {/* --- Menu List --- */}
            <div className="mt-4 flex flex-col gap-[2px]">
                {/* Carteira (Wallet) - Custom Row */}
                <div 
                    onClick={() => onOpenWallet()}
                    className="flex items-center justify-between py-4 px-4 active:bg-white/5 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <WalletIcon className="w-5 h-5 text-[#fbbf24]" /> 
                        <span className="text-sm font-medium text-white">Carteira</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Diamonds */}
                        <div className="flex items-center gap-1.5">
                            <SolidDiamondIcon className="w-3 h-3 text-[#fbbf24]" />
                            <span className="text-xs text-gray-200 font-medium">2.123</span>
                        </div>
                        {/* Beans */}
                        <div className="flex items-center gap-1.5 ml-1">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#a16207] flex items-center justify-center">
                                <span className="text-[9px] font-bold text-[#fcd34d]">$</span>
                            </div>
                            <span className="text-xs text-gray-200 font-medium">1.161</span>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-600 ml-1" />
                    </div>
                </div>

                <MenuItem 
                    icon={ShopIcon} 
                    color="text-[#60a5fa]" // Light Blue
                    label="Loja VIP" 
                    onClick={onOpenMarket} 
                />
                
                <MenuItem 
                    icon={StarIcon} 
                    color="text-[#fbbf24]" // Yellow
                    label="Minha Patente" 
                    onClick={onOpenMyLevel}
                />

                <MenuItem 
                    icon={UserPlusIcon} 
                    color="text-[#4ade80]" // Green
                    label="Meus Fãs" 
                    onClick={onOpenFans} 
                />

                <MenuItem 
                    icon={BanIcon} 
                    color="text-[#ef4444]" // Red
                    label="Lista de Bloqueio" 
                    onClick={onOpenBlockList} 
                />
                
                <MenuItem 
                    icon={MailIcon} 
                    color="text-[#2dd4bf]" // Teal
                    label="Suporte Livercore" 
                    onClick={onOpenSupportChat} 
                />

                <MenuItem 
                    icon={MessageIcon} 
                    color="text-gray-400" 
                    label="Mensagens" 
                    onClick={onNavigateToMessages} 
                />

                <MenuItem 
                    icon={HelpIcon} 
                    color="text-gray-400" 
                    label="Perguntas Frequentes" 
                    onClick={onOpenFAQ} 
                />
                
                <MenuItem 
                    icon={SettingsIcon} 
                    color="text-gray-400" 
                    label="Configurações" 
                    onClick={onOpenSettings} 
                />

                <MenuItem 
                    icon={BankIcon} 
                    color="text-[#f59e0b]" // Gold/Orange
                    label="Carteira Admin" 
                    onClick={onOpenAdminWallet} 
                />
            </div>
        </div>
    );
};

// Reusable Menu Item Component
const MenuItem = ({ icon: Icon, color, label, onClick }: any) => (
    <div 
        onClick={onClick}
        className="flex items-center justify-between py-4 px-4 active:bg-white/5 cursor-pointer"
    >
        <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
            <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-600" />
    </div>
);

export default ProfileScreen;
