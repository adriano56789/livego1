
import React, { useState } from 'react';
import { 
    ChevronLeftIcon, ChevronRightIcon, LinkIcon, BellIcon, GiftIcon, 
    LockIcon, ShieldIcon, BankIcon, GlobeIcon, 
    InfoIcon, FileTextIcon, LogOutIcon, CheckIcon, PlayIcon, MinusIcon, PlusIcon, RefreshIcon, TypeIcon, EyeIcon, UserPlusIcon
} from '../icons';
import { GIFTS } from '../../constants';
import { User } from '../../types';

interface SettingsScreenProps {
    onClose: () => void;
    onLogout: () => void;
    currentUser: User | null;
}

type ViewType = 'root' | 'connected_accounts' | 'notifications' | 'gift_notifications' | 'privacy' | 'earnings' | 'copyright' | 'language' | 'avatar_protection' | 'app_version' | 'zoom' | 'privacy_settings' | 'delete_account' | 'message_privacy' | 'private_live_invite';

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div 
        onClick={onChange}
        className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-[#3b82f6]' : 'bg-gray-600'}`}
    >
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </div>
);

const MenuItem = ({ icon: Icon, label, onClick, rightElement, isDestructive = false }: any) => (
    <div 
        onClick={onClick}
        className="flex items-center justify-between py-4 px-4 active:bg-white/5 cursor-pointer border-b border-gray-900/50"
    >
        <div className="flex items-center gap-3">
            {Icon && <Icon className={`w-5 h-5 ${isDestructive ? 'text-red-500' : 'text-gray-400'}`} />}
            <span className={`text-sm font-medium ${isDestructive ? 'text-red-500' : 'text-white'}`}>{label}</span>
        </div>
        {rightElement || <ChevronRightIcon className="w-4 h-4 text-gray-600" />}
    </div>
);

export default function SettingsScreen({ onClose, onLogout, currentUser }: SettingsScreenProps) {
    const [currentView, setCurrentView] = useState<ViewType>('root');
    const [language, setLanguage] = useState('Português (Brasil)');
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    
    // States for new screens
    const [isAvatarProtectionEnabled, setIsAvatarProtectionEnabled] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(90);
    const [privacySettings, setPrivacySettings] = useState({
        showLocation: true,
        showActiveStatus: true
    });
    
    // Message Privacy State
    const [messagePrivacy, setMessagePrivacy] = useState<'everyone' | 'followers' | 'nobody'>('everyone');
    const [tempMessagePrivacy, setTempMessagePrivacy] = useState<'everyone' | 'followers' | 'nobody'>('everyone');

    // Private Live Invite State
    const [privateInviteSettings, setPrivateInviteSettings] = useState({
        enabled: true,
        onlyFollowed: true,
        onlyFans: false,
        onlyFriends: false
    });

    // Delete Account State
    const [deleteInput, setDeleteInput] = useState('');

    // Mock States for toggles
    const [notifSettings, setNotifSettings] = useState({
        newMessages: true,
        streamStart: true,
        push: false,
        followerPost: true,
        order: true,
        interactive: true
    });
    
    // Gift toggles
    const [giftToggles, setGiftToggles] = useState<Record<string, boolean>>(
        GIFTS.reduce((acc, gift) => ({ ...acc, [gift.id]: true }), {})
    );

    const handleBack = () => {
        if (currentView === 'root') {
            onClose();
        } else if (currentView === 'message_privacy') {
            setCurrentView('privacy_settings');
        } else if (currentView === 'privacy_settings') {
            setCurrentView('root');
        } else {
            setCurrentView('root');
        }
    };

    const getPrivacyLabel = (key: string) => {
        switch(key) {
            case 'everyone': return 'Todos';
            case 'followers': return 'Apenas seguidores';
            case 'nobody': return 'Ninguém';
            default: return 'Todos';
        }
    };

    const handleOpenMessagePrivacy = () => {
        setTempMessagePrivacy(messagePrivacy);
        setCurrentView('message_privacy');
    };

    // --- Sub Views Components ---

    const PrivateLiveInviteView = () => (
        <div className="flex flex-col bg-[#0A0A0A]">
            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-900/50">
                <div className="flex flex-col pr-4">
                    <span className="text-white text-sm font-medium">Convite privado ao vivo</span>
                    <span className="text-gray-500 text-xs mt-1 leading-tight">Você recebe um convite privado ao vivo quando o liga.</span>
                </div>
                <ToggleSwitch 
                    checked={privateInviteSettings.enabled} 
                    onChange={() => setPrivateInviteSettings(p => ({...p, enabled: !p.enabled}))} 
                />
            </div>
            
            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-900/50">
                <span className="text-white text-sm font-medium">Após a abertura, só aceito usuários que sigo.</span>
                <ToggleSwitch 
                    checked={privateInviteSettings.onlyFollowed} 
                    onChange={() => setPrivateInviteSettings(p => ({...p, onlyFollowed: !p.onlyFollowed}))} 
                />
            </div>

            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-900/50">
                <span className="text-white text-sm font-medium">Após a abertura, apenas meus fãs são aceitos.</span>
                <ToggleSwitch 
                    checked={privateInviteSettings.onlyFans} 
                    onChange={() => setPrivateInviteSettings(p => ({...p, onlyFans: !p.onlyFans}))} 
                />
            </div>

            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-900/50">
                <span className="text-white text-sm font-medium">Após a abertura, só aceito meus amigos.</span>
                <ToggleSwitch 
                    checked={privateInviteSettings.onlyFriends} 
                    onChange={() => setPrivateInviteSettings(p => ({...p, onlyFriends: !p.onlyFriends}))} 
                />
            </div>
        </div>
    );

    const DeleteAccountView = () => (
        <div className="flex flex-col h-full bg-[#0A0A0A] px-6 pt-8">
            <h2 className="text-white text-lg font-bold mb-3">Tem certeza?</h2>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Esta ação é irreversível. Todos os seus dados, incluindo perfil, diamantes, ganhos e histórico, serão permanentemente excluídos.
            </p>
            <p className="text-gray-400 text-xs mb-3">
                Para confirmar, digite <span className="text-red-500 font-bold">DELETE</span> no campo abaixo.
            </p>
            <input 
                type="text" 
                placeholder="DELETE"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full bg-[#27272a] text-white p-3 rounded-lg outline-none border border-white/5 text-sm placeholder-gray-500 mb-auto focus:border-red-500/50 transition-colors"
            />
            
            <div className="pb-8">
                <button 
                    disabled={deleteInput !== 'DELETE'}
                    onClick={() => {
                        onLogout();
                        onClose();
                    }}
                    className={`w-full py-3.5 rounded-full font-bold text-sm transition-colors ${
                        deleteInput === 'DELETE' 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20' 
                        : 'bg-[#27272a] text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Excluir minha conta permanentemente
                </button>
            </div>
        </div>
    );

    const MessagePrivacyView = () => {
        const options = [
            { id: 'everyone', label: 'Todos', desc: null },
            { id: 'followers', label: 'Apenas seguidores', desc: 'Não receba mais mensagens de estranhos, mas ainda pode receber presentes' },
            { id: 'nobody', label: 'Ninguém', desc: 'Você não receberá mensagens de ninguém, mas ainda poderá receber presentes.' },
        ];

        return (
            <div className="flex flex-col bg-[#0A0A0A]">
                {options.map((opt) => (
                    <div 
                        key={opt.id}
                        onClick={() => { setTempMessagePrivacy(opt.id as any); setMessagePrivacy(opt.id as any); }}
                        className="flex flex-col py-4 px-4 border-b border-gray-900/50 cursor-pointer active:bg-white/5"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-medium">{opt.label}</span>
                            {tempMessagePrivacy === opt.id && <CheckIcon className="w-5 h-5 text-[#a855f7]" />}
                        </div>
                        {opt.desc && (
                            <p className="text-gray-500 text-xs mt-1 pr-8 leading-relaxed">
                                {opt.desc}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const AvatarProtectionView = () => (
        <div className="flex flex-col h-full bg-[#0A0A0A]">
            <div className="flex-1 flex flex-col items-center pt-20 px-6">
                <div className="w-32 h-32 rounded-full p-1 border-2 border-gray-800 mb-6">
                     <img 
                        src={currentUser?.avatarUrl || 'https://picsum.photos/200'} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                     />
                </div>
                <h2 className="text-white text-xl font-bold mb-3">Proteja seu avatar</h2>
                <p className="text-gray-400 text-sm text-center leading-relaxed max-w-xs">
                    Ative a proteção para evitar que outras pessoas usem sua foto de perfil, prevenindo golpes e perfis falsos.
                </p>
            </div>
            <div className="p-6 pb-10">
                <div className="bg-[#1C1C1E] p-4 rounded-xl flex items-center justify-between">
                    <span className="text-white font-bold">Ativar Proteção de Avatar</span>
                    <ToggleSwitch 
                        checked={isAvatarProtectionEnabled} 
                        onChange={() => setIsAvatarProtectionEnabled(!isAvatarProtectionEnabled)} 
                    />
                </div>
            </div>
        </div>
    );

    const AppVersionView = () => (
        <div className="flex flex-col h-full bg-[#0A0A0A] items-center pt-32">
            <div className="mb-4">
                 <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#C135F3] to-[#FF4D9E] flex items-center justify-center shadow-lg">
                    <PlayIcon className="w-10 h-10 text-white fill-white ml-1" />
                 </div>
            </div>
            <h2 className="text-[#a855f7] text-2xl font-bold mb-8">livego</h2>
            <p className="text-gray-400 text-sm mb-12">Sua versão atual é 1.0.0 do livego</p>

            <div className="w-full px-4">
                <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
                        <span className="text-white text-sm">Última versão</span>
                        <span className="text-white text-sm">1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="text-white text-sm">Status</span>
                        <span className="text-[#00C853] text-sm">Atualizado</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const PrivacySettingsView = () => (
        <div className="flex flex-col bg-[#0A0A0A]">
            <MenuItem 
                label="Quem pode me enviar uma mensagem?" 
                rightElement={<span className="text-gray-400 text-sm flex items-center gap-2">{getPrivacyLabel(messagePrivacy)} <ChevronRightIcon className="w-4 h-4"/></span>}
                onClick={handleOpenMessagePrivacy} 
            />
            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-900/50">
                <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">Mostrar local</span>
                    <span className="text-gray-500 text-xs mt-1">Desligar irá ocultar sua localização de outros</span>
                </div>
                <ToggleSwitch 
                    checked={privacySettings.showLocation} 
                    onChange={() => setPrivacySettings(p => ({...p, showLocation: !p.showLocation}))} 
                />
            </div>
            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-900/50">
                <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">Mostrar estado ativo</span>
                    <span className="text-gray-500 text-xs mt-1">Desligar a atividade de ocultação de outros</span>
                </div>
                <ToggleSwitch 
                    checked={privacySettings.showActiveStatus} 
                    onChange={() => setPrivacySettings(p => ({...p, showActiveStatus: !p.showActiveStatus}))} 
                />
            </div>
             <MenuItem 
                icon={EyeIcon}
                label="Picture-in-Picture Visualizador" 
                rightElement={<span className="text-gray-400 text-sm flex items-center gap-2">Desativado <ChevronRightIcon className="w-4 h-4"/></span>}
                onClick={() => {}} 
            />
             <div className="px-4 py-2">
                <p className="text-gray-500 text-xs">Ative para usar o visualizador em modo Picture-in-Picture</p>
             </div>
        </div>
    );

    const ZoomAdjustmentView = () => (
        <div className="flex flex-col h-full bg-[#18181b] items-center justify-center">
             <div className="flex-1 flex flex-col items-center justify-center w-full">
                 <h1 className="text-white text-7xl font-bold mb-4">{zoomLevel}%</h1>
                 <p className="text-gray-400 text-sm">Nível de zoom atual</p>
             </div>

             <div className="w-full bg-[#27272a] rounded-t-3xl p-8 pb-12">
                 <div className="flex justify-between text-gray-400 text-xs mb-4 font-bold">
                     <span>Pequeno</span>
                     <span>Grande</span>
                 </div>
                 
                 <div className="flex items-center gap-4 mb-8">
                    <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={zoomLevel} 
                        onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                    />
                 </div>

                 <div className="flex items-center justify-between px-8">
                     <button 
                        onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                        className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-white/10"
                    >
                         <MinusIcon className="w-5 h-5" />
                     </button>
                     
                     <button 
                        onClick={() => setZoomLevel(90)}
                        className="px-8 py-2 bg-[#3f3f46] text-white font-bold rounded-full hover:bg-[#52525b]"
                     >
                         Redefinir
                     </button>

                     <button 
                        onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                        className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-white/10"
                    >
                         <PlusIcon className="w-5 h-5" />
                     </button>
                 </div>

                 <p className="text-center text-gray-400 text-xs mt-8 px-4 leading-relaxed">
                     O zoom afeta todo o aplicativo, incluindo textos, botões e imagens. Use para melhorar a legibilidade ou visualização.
                 </p>
             </div>
        </div>
    );

    const ConnectedAccountsView = () => (
        <div className="flex flex-col p-4 text-center">
            <p className="text-gray-400 text-sm mb-12 mt-4 leading-relaxed">
                Esta é uma conta do Google que você usou para entrar no LiveGo. Você pode desconectar para entrar com outra conta.
            </p>
            <div className="flex flex-col items-center justify-center flex-1 mt-20">
                <p className="text-gray-600 text-sm">Nenhuma conta do Google conectada.</p>
            </div>
        </div>
    );

    const NotificationsView = () => (
        <div className="flex flex-col">
            <div className="px-4 py-2 text-gray-500 text-xs font-bold mt-2">Receber notificações</div>
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-900/50">
                <span className="text-white text-sm">Novas mensagens</span>
                <ToggleSwitch checked={notifSettings.newMessages} onChange={() => setNotifSettings(p => ({...p, newMessages: !p.newMessages}))} />
            </div>
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-900/50">
                <span className="text-white text-sm">Início ao vivo do streamer seguido</span>
                <ToggleSwitch checked={notifSettings.streamStart} onChange={() => setNotifSettings(p => ({...p, streamStart: !p.streamStart}))} />
            </div>
             <div className="flex items-center justify-between py-3 px-4 border-b border-gray-900/50 active:bg-white/5">
                <span className="text-white text-sm">Iniciar configurações de push</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-900/50">
                <span className="text-white text-sm">Pessoa em seguida postou um vídeo LiveGo</span>
                <ToggleSwitch checked={notifSettings.followerPost} onChange={() => setNotifSettings(p => ({...p, followerPost: !p.followerPost}))} />
            </div>

            <div className="px-4 py-2 text-gray-500 text-xs font-bold mt-6">Notificações interativas</div>
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-900/50">
                <span className="text-white text-sm">Pedido</span>
                <ToggleSwitch checked={notifSettings.order} onChange={() => setNotifSettings(p => ({...p, order: !p.order}))} />
            </div>
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-900/50">
                <span className="text-white text-sm">Notificações interativas</span>
                <ToggleSwitch checked={notifSettings.interactive} onChange={() => setNotifSettings(p => ({...p, interactive: !p.interactive}))} />
            </div>
        </div>
    );

    const GiftNotificationsView = () => (
        <div className="flex flex-col h-full overflow-hidden">
             <div className="px-4 mt-2 mb-2">
                 <p className="text-gray-400 text-xs mb-3">
                     Controle quais notificações de presente aparecem na tela durante uma transmissão.
                 </p>
                 <div className="bg-[#3F2E00] border border-[#F59E0B]/30 rounded-lg p-3 flex justify-between items-center mb-3">
                     <span className="text-[#F59E0B] text-sm font-bold">Torne-se VIP para usar presentes exclusivos!</span>
                     <button className="bg-[#F59E0B] text-black text-xs font-bold px-3 py-1 rounded-full">Assinar</button>
                 </div>
                 <div className="bg-[#064E3B] border border-[#10B981]/30 rounded-lg p-3 flex items-start gap-2 mb-2">
                     <div className="bg-[#10B981] rounded text-black p-0.5 mt-0.5"><CheckIcon className="w-3 h-3" /></div>
                     <span className="text-[#A7F3D0] text-xs font-medium">
                         201 presentes configurados - Todos os presentes estão disponíveis.
                     </span>
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto">
                 {GIFTS.map((gift) => (
                     <div key={gift.id} className="flex items-center justify-between py-3 px-4 border-b border-gray-900/50 hover:bg-white/5">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 flex items-center justify-center text-2xl">
                                 {gift.icon}
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-white text-sm font-bold">{gift.name}</span>
                                 <div className="flex items-center gap-1">
                                     <span className="text-[#F59E0B]"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12L12 22L22 12L12 2Z" /></svg></span>
                                     <span className="text-gray-400 text-xs">{gift.price}</span>
                                 </div>
                             </div>
                         </div>
                         <ToggleSwitch 
                            checked={!!giftToggles[gift.id]} 
                            onChange={() => setGiftToggles(p => ({...p, [gift.id]: !p[gift.id]}))} 
                        />
                     </div>
                 ))}
             </div>
        </div>
    );

    const EarningsView = () => (
        <div className="flex flex-col p-4">
             <h2 className="text-white text-xl font-bold mb-6 text-center">Nossa Política de 'Ganhos'</h2>
             
             <h3 className="text-white font-bold text-sm mb-2">Conversão de Ganhos para Dinheiro</h3>
             <p className="text-gray-400 text-xs leading-relaxed mb-6">
                 A conversão dos seus 'Ganhos' acumulados na plataforma para Reais (BRL) é totalmente gratuita. Não há nenhuma taxa oculta neste processo. Seu saldo de Ganhos é convertido usando a taxa de câmbio atual da plataforma.
             </p>

             <h3 className="text-white font-bold text-sm mb-2">Taxa de Saque</h3>
             <p className="text-gray-400 text-xs leading-relaxed mb-4">
                 Quando você solicita um saque, uma taxa de serviço é aplicada para cobrir os custos operacionais e de processamento de pagamento. A divisão é transparente:
             </p>

             <div className="space-y-3">
                 <div className="bg-[#1C1C1E] p-4 rounded-lg border border-white/5">
                     <div className="text-white font-bold text-sm mb-1">80% para Você (Streamer)</div>
                     <p className="text-gray-400 text-xs">A maior parte do valor é sua! Acreditamos em recompensar nossos criadores de conteúdo.</p>
                 </div>
                 <div className="bg-[#1C1C1E] p-4 rounded-lg border border-white/5">
                     <div className="text-white font-bold text-sm mb-1">20% para a Plataforma</div>
                     <p className="text-gray-400 text-xs">Esta taxa nos ajuda a manter a plataforma segura, desenvolver novos recursos e oferecer suporte à comunidade.</p>
                 </div>
             </div>
        </div>
    );

    const CopyrightView = () => (
        <div className="flex flex-col p-4 overflow-y-auto">
            <h3 className="text-white font-bold text-sm mb-2">Aviso de Direitos Autorais</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
                © 2024 LiveGo. Todos os direitos reservados. O conteúdo, layout, design, dados, bancos de dados e gráficos neste aplicativo são protegidos por leis de propriedade intelectual e são de propriedade da LiveGo, salvo indicação em contrário.
            </p>

            <h3 className="text-white font-bold text-sm mb-2">Propriedade Intelectual</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Todas as marcas comerciais, marcas de serviço e nomes comerciais são propriedade da LiveGo ou de outros respectivos proprietários que concederam à LiveGo o direito e a licença para usar tais marcas.
            </p>

            <h3 className="text-white font-bold text-sm mb-2">Conteúdo Gerado pelo Usuário</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Você é o único responsável pelo conteúdo que transmite ou exibe ("posta") no serviço LiveGo. Você não deve postar conteúdo que infrinja os direitos de propriedade intelectual de terceiros. Removeremos o conteúdo infrator se formos devidamente notificados.
            </p>

            <h3 className="text-white font-bold text-sm mb-2">Denúncia de Infração</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-2">
                Se você acredita que seu trabalho protegido por direitos autorais foi copiado de uma forma que constitui violação de direitos autorais e está acessível através do serviço, notifique nosso agente de direitos autorais.
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
                Por favor, envie todas as notificações de infração para:<br/>
                <span className="text-purple-400">copyright@livego.com</span>
            </p>
        </div>
    );

    // --- Main Render ---

    const getTitle = () => {
        switch(currentView) {
            case 'root': return 'Configurações';
            case 'connected_accounts': return 'Contas Conectadas';
            case 'notifications': return 'Configurações de notificação';
            case 'gift_notifications': return 'Configuração de Notificação de...';
            case 'earnings': return 'Informações de Ganhos';
            case 'copyright': return 'Sobre LiveGo';
            case 'language': return 'Idiomas';
            case 'avatar_protection': return 'Proteção de Avatar';
            case 'app_version': return 'Sobre';
            case 'zoom': return 'Tamanho da fonte';
            case 'privacy_settings': return 'Privacidade';
            case 'message_privacy': return 'Quem pode me enviar uma mensagem';
            case 'delete_account': return 'Excluir Conta';
            case 'private_live_invite': return 'Convite Privado';
            default: return 'Configurações';
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#121212] flex flex-col font-sans animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-900 bg-[#121212] sticky top-0 z-10">
                <button onClick={handleBack}>
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>
                <h2 className="text-white font-bold text-lg">{getTitle()}</h2>
                <div className="w-6"></div> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {currentView === 'root' && (
                    <div className="flex flex-col">
                        <div className="h-2 bg-black/20"></div>
                        <MenuItem icon={LinkIcon} label="Contas Conectadas" onClick={() => setCurrentView('connected_accounts')} />
                        
                        <div className="h-2 bg-black/20"></div>
                        <MenuItem icon={BellIcon} label="Notificações" onClick={() => setCurrentView('notifications')} />
                        <MenuItem icon={GiftIcon} label="Configuração de Notificação de Presentes" onClick={() => setCurrentView('gift_notifications')} />
                        
                        <div className="h-2 bg-black/20"></div>
                        <MenuItem icon={LockIcon} label="Privacidade" onClick={() => setCurrentView('privacy_settings')} />
                        <MenuItem icon={ShieldIcon} label="Proteção de Avatar" onClick={() => setCurrentView('avatar_protection')} />
                        <MenuItem icon={UserPlusIcon} label="Convite privado ao vivo" onClick={() => setCurrentView('private_live_invite')} />
                        <div className="flex items-center justify-between py-4 px-4 border-b border-gray-900/50">
                            <div className="flex items-center gap-3">
                                <MinusIcon className="w-5 h-5 text-gray-400" /> {/* Should be BlockIcon/BanIcon ideally */}
                                <span className="text-white text-sm font-medium">Lista de bloqueio</span>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                        </div>

                        <div className="h-2 bg-black/20"></div>
                        <MenuItem icon={BankIcon} label="Meus Ganhos" onClick={() => setCurrentView('earnings')} />
                        
                        <div className="h-2 bg-black/20"></div>
                        <MenuItem icon={TypeIcon} label="Tamanho da fonte" onClick={() => setCurrentView('zoom')} />
                        <MenuItem icon={GlobeIcon} label="Idiomas" rightElement={<span className="text-gray-400 text-sm flex items-center gap-2">{language} <ChevronRightIcon className="w-4 h-4"/></span>} onClick={() => setIsLanguageModalOpen(true)} />
                        
                        <div className="h-2 bg-black/20"></div>
                        <MenuItem icon={InfoIcon} label="Sobre LiveGo" onClick={() => setCurrentView('copyright')} />
                        <MenuItem icon={FileTextIcon} label="Contrato do Usuário" onClick={() => {}} />
                        <MenuItem icon={FileTextIcon} label="Política de Privacidade" onClick={() => {}} />
                        <MenuItem icon={PlayIcon} label="Sobre" rightElement={<span className="text-gray-400 text-sm flex items-center gap-2">V1.0.0 <ChevronRightIcon className="w-4 h-4"/></span>} onClick={() => setCurrentView('app_version')} />
                        <MenuItem icon={RefreshIcon} label="Limpar cache" rightElement={<span className="text-gray-400 text-sm">34MB</span>} onClick={() => {}} />

                        <div className="mt-6 mb-10 px-4 space-y-4">
                            <button onClick={onLogout} className="w-full py-3.5 rounded-full bg-[#2C2C2E] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#3A3A3C] transition-colors">
                                <LogOutIcon className="w-4 h-4" /> Sair
                            </button>
                            
                            <div className="flex justify-center">
                                <button onClick={() => setCurrentView('delete_account')} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                                    Excluir conta
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'connected_accounts' && <ConnectedAccountsView />}
                {currentView === 'notifications' && <NotificationsView />}
                {currentView === 'gift_notifications' && <GiftNotificationsView />}
                {currentView === 'earnings' && <EarningsView />}
                {currentView === 'copyright' && <CopyrightView />}
                {currentView === 'avatar_protection' && <AvatarProtectionView />}
                {currentView === 'app_version' && <AppVersionView />}
                {currentView === 'zoom' && <ZoomAdjustmentView />}
                {currentView === 'privacy_settings' && <PrivacySettingsView />}
                {currentView === 'message_privacy' && <MessagePrivacyView />}
                {currentView === 'delete_account' && <DeleteAccountView />}
                {currentView === 'private_live_invite' && <PrivateLiveInviteView />}
            </div>

            {/* Language Modal (Simple overlay) */}
            {isLanguageModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={() => setIsLanguageModalOpen(false)}>
                    <div className="bg-[#1C1C1E] rounded-xl p-4 w-64">
                        <h3 className="text-white font-bold mb-4">Selecione o Idioma</h3>
                        <button onClick={() => { setLanguage('Português (Brasil)'); setIsLanguageModalOpen(false); }} className="w-full text-left py-2 text-white hover:text-purple-500">Português (Brasil)</button>
                        <button onClick={() => { setLanguage('English'); setIsLanguageModalOpen(false); }} className="w-full text-left py-2 text-white hover:text-purple-500">English</button>
                        <button onClick={() => { setLanguage('Español'); setIsLanguageModalOpen(false); }} className="w-full text-left py-2 text-white hover:text-purple-500">Español</button>
                    </div>
                </div>
            )}
        </div>
    );
}
