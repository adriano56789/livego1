import React, { useState, useEffect } from 'react';
import { 
    ChevronLeftIcon, ChevronRightIcon, LinkIcon, BellIcon, GiftIcon, 
    LockIcon, ShieldIcon, BankIcon, GlobeIcon, 
    InfoIcon, FileTextIcon, LogOutIcon, PlayIcon, RefreshIcon, TypeIcon, UserPlusIcon, MinusIcon,
    CheckIcon, GoogleIcon, FacebookIcon
} from '../icons';
import { User, ToastType } from '../../types';
import { api } from '../../services/api';

interface SettingsScreenProps {
    onClose: () => void;
    onLogout: () => void;
    currentUser: User | null;
    onOpenBlockList?: () => void;
    onOpenWallet?: (tab?: 'Diamante' | 'Ganhos') => void;
    onOpenLanguageModal?: () => void;
    updateUser: (user: User) => void;
    addToast: (type: ToastType, message: string) => void;
}

const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${active ? 'bg-purple-600' : 'bg-gray-700'}`}
    >
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
);

const SettingRow = ({ label, subLabel, children, onClick, icon: Icon, color = "text-gray-400" }: any) => (
    <div 
        onClick={onClick}
        className="flex items-center justify-between py-4 px-4 active:bg-white/5 bg-[#121212] border-none"
    >
        <div className="flex items-center gap-3 max-w-[80%]">
            {Icon && <Icon className={`w-5 h-5 ${color}`} />}
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-white">{label}</span>
                {subLabel && <span className="text-[10px] text-gray-500 leading-tight">{subLabel}</span>}
            </div>
        </div>
        <div className="flex items-center gap-3">
            {children}
        </div>
    </div>
);

const SubPage = ({ title, onBack, children }: { title: string, onBack: () => void, children?: React.ReactNode }) => (
    <div className="absolute inset-0 bg-[#121212] flex flex-col z-[160] animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-4 py-3 bg-[#121212] shrink-0 border-b border-white/5">
            <button onClick={onBack} className="p-1">
                <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-white font-bold text-lg">{title}</h2>
            <div className="w-6"></div>
        </div>
        <div className="flex-1 overflow-y-auto bg-[#121212] no-scrollbar">
            {children}
        </div>
    </div>
);

const permissionMap: { [key: string]: string } = {
    all: 'Todos',
    followers: 'Apenas Seguidores',
    none: 'Ninguém'
};

const reversePermissionMap: { [key: string]: 'all' | 'followers' | 'none' } = {
    'Todos': 'all',
    'Apenas Seguidores': 'followers',
    'Ninguém': 'none'
};

export default function SettingsScreen({ onClose, onLogout, currentUser, onOpenBlockList, onOpenWallet, onOpenLanguageModal, updateUser, addToast }: SettingsScreenProps) {
    const [view, setView] = useState<string>('root');
    const [settings, setSettings] = useState({
        pushMsgs: true,
        pushLive: true,
        pushFollowers: false,
        giftAlerts: true,
        giftSound: true,
        giftLargeBanner: true,
        showLocation: currentUser?.showLocation ?? true,
        showOnline: currentUser?.showActivityStatus ?? true,
        hideLikes: currentUser?.hideLikes ?? false,
        avatarProtection: currentUser?.isAvatarProtected ?? false,
        fontSize: 'Padrão',
        language: 'Português (Brasil)',
        invitePermission: 'Todos'
    });

    useEffect(() => {
        if (currentUser) {
            setSettings(prev => ({
                ...prev,
                showLocation: currentUser.showLocation ?? true,
                showOnline: currentUser.showActivityStatus ?? true,
                hideLikes: currentUser.hideLikes ?? false,
                pushMsgs: currentUser.notificationSettings?.newMessages ?? true,
                pushLive: currentUser.notificationSettings?.streamerLive ?? true,
                pushFollowers: currentUser.notificationSettings?.newFollower ?? false,
                giftAlerts: currentUser.notificationSettings?.giftAlertsOnScreen ?? true,
                giftSound: currentUser.notificationSettings?.giftSoundEffects ?? true,
                giftLargeBanner: currentUser.notificationSettings?.giftLuxuryBanners ?? false,
                avatarProtection: currentUser.isAvatarProtected ?? false,
                invitePermission: permissionMap[currentUser.privateInvitePermission || 'all'],
            }));
        }
    }, [currentUser]);

    const handleBack = () => {
        if (view === 'root') onClose();
        else setView('root');
    };

    const handlePrivacyToggle = async (key: 'showLocation' | 'showOnline' | 'hideLikes') => {
        if (!currentUser) return;

        const newValue = !settings[key];
        
        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            const apiFieldMapping = {
                showLocation: 'showLocation',
                showOnline: 'showActivityStatus',
                hideLikes: 'hideLikes'
            };

            const apiField = apiFieldMapping[key];
            const payload = { [apiField]: newValue };

            const { success, user: updatedUser } = await api.users.update(currentUser.id, payload);

            if (success && updatedUser) {
                updateUser(updatedUser);
            } else {
                throw new Error('API update failed');
            }
        } catch (error) {
            console.error("Failed to update privacy setting:", error);
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
    };

    const handleNotificationToggle = async (key: 'pushMsgs' | 'pushLive' | 'pushFollowers') => {
        if (!currentUser) return;

        const apiFieldMapping = {
            pushMsgs: 'newMessages',
            pushLive: 'streamerLive',
            pushFollowers: 'newFollower'
        };
        const apiField = apiFieldMapping[key];
        const newValue = !settings[key];

        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            const newNotificationSettings = {
                ...(currentUser.notificationSettings || {}),
                [apiField]: newValue
            };
            const { success, user: updatedUser } = await api.users.update(currentUser.id, {
                notificationSettings: newNotificationSettings
            });
            if (success && updatedUser) {
                updateUser(updatedUser);
            } else {
                throw new Error('API update failed');
            }
        } catch (error) {
            console.error("Failed to update notification setting:", error);
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
    };

    const handleGiftNotificationToggle = async (key: 'giftAlerts' | 'giftSound' | 'giftLargeBanner') => {
        if (!currentUser) return;

        const apiFieldMapping = {
            giftAlerts: 'giftAlertsOnScreen',
            giftSound: 'giftSoundEffects',
            giftLargeBanner: 'giftLuxuryBanners'
        };
        const apiField = apiFieldMapping[key];
        const newValue = !settings[key];

        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            const newNotificationSettings = {
                ...(currentUser.notificationSettings || {}),
                [apiField]: newValue
            };
            const { success, user: updatedUser } = await api.users.update(currentUser.id, {
                notificationSettings: newNotificationSettings
            });
            if (success && updatedUser) {
                updateUser(updatedUser);
                addToast(ToastType.Success, 'Configuração salva!');
            } else {
                throw new Error('API update failed');
            }
        } catch (error) {
            console.error("Failed to update gift notification setting:", error);
            setSettings(prev => ({ ...prev, [key]: !newValue }));
            addToast(ToastType.Error, 'Falha ao salvar.');
        }
    };
    
    const handleAvatarProtectionToggle = async () => {
        if (!currentUser) return;
        const newValue = !settings.avatarProtection;
        setSettings(prev => ({ ...prev, avatarProtection: newValue }));

        try {
            const { success, user: updatedUser } = await api.users.update(currentUser.id, {
                isAvatarProtected: newValue
            });
            if (success && updatedUser) {
                updateUser(updatedUser);
            } else {
                throw new Error('API update failed');
            }
        } catch (error) {
            console.error("Failed to update avatar protection:", error);
            setSettings(prev => ({ ...prev, avatarProtection: !newValue }));
        }
    };
    
    const handleInvitePermissionChange = async (option: string) => {
        if (!currentUser) return;
        
        const apiValue = reversePermissionMap[option];

        // Optimistic UI update and navigate back
        setSettings(prev => ({ ...prev, invitePermission: option }));
        setView('root');

        try {
            const { success, user: updatedUser } = await api.users.update(currentUser.id, {
                privateInvitePermission: apiValue
            });
            if (success && updatedUser) {
                updateUser(updatedUser);
            } else {
                throw new Error('API update failed');
            }
        } catch (error) {
            console.error("Failed to update invite permission:", error);
            // Revert on error
            setSettings(prev => ({ ...prev, invitePermission: permissionMap[currentUser.privateInvitePermission || 'all'] }));
        }
    };

    const navigate = (page: string) => setView(page);

    const handleUpdateSetting = (key: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setTimeout(() => setView('root'), 200);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-[#121212] flex flex-col font-sans animate-in slide-in-from-right duration-300 overflow-hidden">
            <div className="relative flex-1 flex flex-col overflow-hidden">
                
                {view === 'root' && (
                    <>
                        <div className="flex items-center justify-between px-4 py-3 bg-[#121212] shrink-0">
                            <button onClick={handleBack} className="p-1">
                                <ChevronLeftIcon className="w-6 h-6 text-white" />
                            </button>
                            <h2 className="text-white font-bold text-lg">Configurações</h2>
                            <div className="w-6"></div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-[#121212] no-scrollbar">
                            <div className="flex flex-col bg-[#121212]">
                                <SettingRow icon={LinkIcon} label="Contas Conectadas" onClick={() => navigate('Contas')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={BellIcon} label="Notificações" onClick={() => navigate('Notificações')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={GiftIcon} label="Configuração de Notificação de Presentes" onClick={() => navigate('NotifPresentes')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={LockIcon} label="Privacidade" onClick={() => navigate('Privacidade')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={ShieldIcon} label="Proteção de Avatar" onClick={() => navigate('ProtAvatar')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={UserPlusIcon} label="Convite privado ao vivo" onClick={() => navigate('ConvitePrivado')}><span className="text-gray-500 text-xs">{settings.invitePermission}</span><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={MinusIcon} label="Lista de bloqueio" onClick={() => onOpenBlockList ? onOpenBlockList() : navigate('Bloqueio')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={BankIcon} label="Meus Ganhos" onClick={() => onOpenWallet ? onOpenWallet('Ganhos') : navigate('Ganhos')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={TypeIcon} label="Tamanho da fonte" onClick={() => navigate('Fonte')}><span className="text-gray-500 text-sm">{settings.fontSize}</span><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={GlobeIcon} label="Idiomas" onClick={() => onOpenLanguageModal ? onOpenLanguageModal() : navigate('Idiomas')}><span className="text-gray-400 text-sm">{settings.language}</span><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={InfoIcon} label="Sobre LiveGo" onClick={() => navigate('SobreLG')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={FileTextIcon} label="Contrato do Usuário" onClick={() => navigate('Contrato')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={FileTextIcon} label="Política de Privacidade" onClick={() => navigate('Politica')}><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={PlayIcon} label="Sobre" onClick={() => navigate('SobreApp')}><span className="text-gray-400 text-sm">V1.0.0</span><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>
                                <SettingRow icon={RefreshIcon} label="Limpar cache" onClick={() => addToast(ToastType.Success, 'Cache limpo!')}><span className="text-gray-400 text-sm">34MB</span><ChevronRightIcon className="w-4 h-4 text-gray-600" /></SettingRow>

                                <div className="mt-8 mb-12 px-4 space-y-4 bg-[#121212]">
                                    <button onClick={onLogout} className="w-full py-4 rounded-full bg-[#2C2C2E] text-white font-bold text-sm flex items-center justify-center gap-2 active:bg-white/5 transition-colors">
                                        <LogOutIcon className="w-4 h-4 text-red-500" /> Sair
                                    </button>
                                    <div className="flex justify-center pb-10">
                                        <button className="text-gray-500 text-xs hover:text-gray-300 transition-colors py-2">Excluir conta</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* --- SUB PAGES --- */}

                {view === 'Contas' && (
                    <SubPage title="Contas Conectadas" onBack={handleBack}>
                        <SettingRow label="Google" subLabel="Vincule para login rápido" icon={GoogleIcon}>
                            <button className="bg-white/5 px-4 py-1.5 rounded-full text-xs font-bold text-gray-300">Vincular</button>
                        </SettingRow>
                        <SettingRow label="Facebook" subLabel="Sincronize seus amigos" icon={FacebookIcon}>
                            <button className="bg-white/5 px-4 py-1.5 rounded-full text-xs font-bold text-gray-300">Vincular</button>
                        </SettingRow>
                    </SubPage>
                )}

                {view === 'Notificações' && (
                    <SubPage title="Notificações" onBack={handleBack}>
                        <SettingRow label="Novas Mensagens" subLabel="Alertar ao receber mensagens privadas">
                            <Toggle active={settings.pushMsgs} onToggle={() => handleNotificationToggle('pushMsgs')} />
                        </SettingRow>
                        <SettingRow label="Streamer Ao Vivo" subLabel="Notificar quando ídolos iniciarem live">
                            <Toggle active={settings.pushLive} onToggle={() => handleNotificationToggle('pushLive')} />
                        </SettingRow>
                        <SettingRow label="Novos Seguidores" subLabel="Alertar quando alguém te seguir">
                            <Toggle active={settings.pushFollowers} onToggle={() => handleNotificationToggle('pushFollowers')} />
                        </SettingRow>
                    </SubPage>
                )}

                {view === 'NotifPresentes' && (
                    <SubPage title="Notificação de Presentes" onBack={handleBack}>
                        <SettingRow label="Alertas na Tela" subLabel="Mostrar animações de presentes na live">
                            <Toggle active={settings.giftAlerts} onToggle={() => handleGiftNotificationToggle('giftAlerts')} />
                        </SettingRow>
                        <SettingRow label="Efeitos Sonoros" subLabel="Reproduzir sons de moedas e presentes">
                            <Toggle active={settings.giftSound} onToggle={() => handleGiftNotificationToggle('giftSound')} />
                        </SettingRow>
                        <SettingRow label="Banners de Luxo" subLabel="Mostrar avisos de presentes raros">
                            <Toggle active={settings.giftLargeBanner} onToggle={() => handleGiftNotificationToggle('giftLargeBanner')} />
                        </SettingRow>
                    </SubPage>
                )}

                {view === 'Privacidade' && (
                    <SubPage title="Privacidade" onBack={handleBack}>
                        <SettingRow label="Mostrar Localização" subLabel="Permitir ver sua cidade no perfil">
                            <Toggle active={settings.showLocation} onToggle={() => handlePrivacyToggle('showLocation')} />
                        </SettingRow>
                        <SettingRow label="Status Online" subLabel="Mostrar quando você estiver ativo">
                            <Toggle active={settings.showOnline} onToggle={() => handlePrivacyToggle('showOnline')} />
                        </SettingRow>
                        <SettingRow label="Esconder Minhas Curtidas" subLabel="Outros não verão o que você curtiu">
                            <Toggle active={settings.hideLikes} onToggle={() => handlePrivacyToggle('hideLikes')} />
                        </SettingRow>
                    </SubPage>
                )}

                {view === 'ProtAvatar' && (
                    <SubPage title="Proteção de Avatar" onBack={handleBack}>
                        <div className="p-6 bg-blue-500/10 m-4 rounded-2xl border border-blue-500/20">
                            <ShieldIcon className="w-10 h-10 text-blue-400 mb-4" />
                            <h3 className="text-white font-bold mb-2">Segurança de Imagem</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">Ao ativar a proteção, impedimos que seu avatar seja baixado, printado ou usado por terceiros.</p>
                        </div>
                        <SettingRow label="Ativar Proteção">
                            <Toggle active={settings.avatarProtection} onToggle={handleAvatarProtectionToggle} />
                        </SettingRow>
                    </SubPage>
                )}

                {view === 'ConvitePrivado' && (
                    <SubPage title="Convites Privados" onBack={handleBack}>
                        {['Todos', 'Apenas Seguidores', 'Ninguém'].map(opt => (
                            <SettingRow key={opt} label={opt} onClick={() => handleInvitePermissionChange(opt)}>
                                {settings.invitePermission === opt && <CheckIcon className="w-5 h-5 text-purple-500" />}
                            </SettingRow>
                        ))}
                    </SubPage>
                )}

                {view === 'Fonte' && (
                    <SubPage title="Tamanho da fonte" onBack={handleBack}>
                        {['Pequeno', 'Padrão', 'Grande'].map(size => (
                            <SettingRow key={size} label={size} onClick={() => handleUpdateSetting('fontSize', size)}>
                                {settings.fontSize === size && <CheckIcon className="w-5 h-5 text-purple-500" />}
                            </SettingRow>
                        ))}
                    </SubPage>
                )}

                {view === 'Idiomas' && (
                    <SubPage title="Idiomas" onBack={handleBack}>
                        {['Português (Brasil)', 'English (US)', 'Español'].map(lang => (
                            <SettingRow key={lang} label={lang} onClick={() => handleUpdateSetting('language', lang)}>
                                {settings.language === lang && <CheckIcon className="w-5 h-5 text-purple-500" />}
                            </SettingRow>
                        ))}
                    </SubPage>
                )}

                {view === 'SobreLG' && (
                    <SubPage title="Sobre LiveGo" onBack={handleBack}>
                        <div className="p-6 space-y-6 text-gray-400 text-sm leading-relaxed">
                            <div className="flex justify-center mb-8">
                                <h1 className="text-4xl font-black text-white italic">LiveGo</h1>
                            </div>
                            <p>O LiveGo é a plataforma líder em transmissões ao vivo interativas, conectando talentos e fãs em todo o mundo através de tecnologia de ponta e um sistema de presentes inovador.</p>
                            <p>Nossa missão é criar um ambiente seguro e divertido para criadores de conteúdo prosperarem e comunidades se formarem.</p>
                        </div>
                    </SubPage>
                )}

                {view === 'Contrato' && (
                    <SubPage title="Contrato do Usuário" onBack={handleBack}>
                        <div className="p-6 text-gray-500 text-xs space-y-4">
                            <h4 className="text-white font-bold text-sm">Termos de Uso</h4>
                            <p>Ao utilizar o LiveGo, você concorda com nossas diretrizes de comunidade e políticas de monetização.</p>
                            <p>1. O usuário é responsável por todo conteúdo transmitido.</p>
                            <p>2. É proibido conteúdo abusivo, ilegal ou sexualmente explícito.</p>
                            <p>3. O sistema de moedas e diamantes segue as regras de câmbio vigentes na plataforma.</p>
                            <p className="pt-20 text-center italic">Última atualização: Janeiro de 2024</p>
                        </div>
                    </SubPage>
                )}

                {view === 'Politica' && (
                    <SubPage title="Política de Privacidade" onBack={handleBack}>
                        <div className="p-6 text-gray-500 text-xs space-y-4">
                            <h4 className="text-white font-bold text-sm">Privacidade de Dados</h4>
                            <p>Respeitamos sua privacidade e protegemos seus dados pessoais de acordo com a LGPD.</p>
                            <p>Coletamos informações básicas de perfil para melhorar sua experiência e garantir a segurança das transações financeiras.</p>
                            <p>Seus dados de localização são utilizados apenas se você permitir explicitamente nas configurações de privacidade.</p>
                        </div>
                    </SubPage>
                )}

                {view === 'SobreApp' && (
                    <SubPage title="Sobre o Aplicativo" onBack={handleBack}>
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-3xl shadow-xl flex items-center justify-center">
                                <PlayIcon className="w-10 h-10 text-white fill-white ml-1" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-black text-xl">LiveGo Premium</h3>
                                <p className="text-gray-500 text-sm">Versão 1.0.0 (Build 2024.01)</p>
                            </div>
                            <p className="text-gray-600 text-xs mt-10">© 2024 LiveGo Inc. Todos os direitos reservados.</p>
                        </div>
                    </SubPage>
                )}

            </div>
        </div>
    );
}