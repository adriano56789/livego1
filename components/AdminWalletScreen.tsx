import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, BankIcon, MailIcon, EditIcon, HistoryIcon, RefreshIcon, CloseIcon } from './icons';
import { User, PurchaseRecord, ToastType } from '../types';
import { api } from '../services/api';

interface AdminWalletScreenProps {
    onClose: () => void;
    user: User;
    currentUser?: User;
    updateUser?: any;
    addToast?: (type: ToastType, message: string) => void;
}

const EditMethodModal = ({ currentEmail, onSave, onClose }: { currentEmail: string, onSave: (email: string) => void, onClose: () => void }) => {
    const [email, setEmail] = useState(currentEmail);

    return (
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-transparent" onClick={onClose}>
            <div 
                className="w-full bg-[#1C1C1E] rounded-t-2xl p-5 animate-in slide-in-from-bottom duration-300 pb-8 shadow-2xl border-t border-white/10" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold text-base">Editar Método de Saque</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="text-gray-400 w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-xs font-bold mb-2 block">Chave PIX / E-mail</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#2C2C2E] text-white p-4 rounded-xl outline-none border border-white/5 focus:border-[#A855F7] transition-colors"
                            placeholder="seu.email@exemplo.com"
                            autoFocus
                        />
                    </div>

                    <button 
                        onClick={() => onSave(email)}
                        className="w-full bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-3.5 rounded-full transition-colors shadow-lg active:scale-95"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminWalletScreen: React.FC<AdminWalletScreenProps> = ({ onClose, user, addToast }) => {
    const [activeTab, setActiveTab] = useState('Todos');
    const tabs = ['Todos', 'Concluído', 'Pendente', 'Cancelado'];
    const [history, setHistory] = useState<PurchaseRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(user.platformEarnings || 0);
    
    const [withdrawalEmail, setWithdrawalEmail] = useState(
        user.withdrawal_method?.details?.email || 'admin@livego.com'
    );
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const updatedUser = await api.getUser('me');
            if (updatedUser) {
                setBalance(updatedUser.platformEarnings || 0);
                if (updatedUser.withdrawal_method?.details?.email) {
                    setWithdrawalEmail(updatedUser.withdrawal_method.details.email);
                }
            }

            const records = await api.getAdminWithdrawalHistory(activeTab as any);
            setHistory(records || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const handleWithdraw = async () => {
        if (balance <= 0) return;
        try {
            const res = await api.requestAdminWithdrawal();
            if (res.success) {
                if (addToast) addToast(ToastType.Success, "Saque solicitado com sucesso!");
                setBalance(0); 
                loadData();
            }
        } catch (error) {
            if (addToast) addToast(ToastType.Error, "Falha ao solicitar saque.");
        }
    };

    const handleSaveEmail = async (newEmail: string) => {
        try {
            const res = await api.saveAdminWithdrawalMethod(newEmail);
            if (res.success) {
                setWithdrawalEmail(newEmail);
                setIsEditingEmail(false);
                if (addToast) addToast(ToastType.Success, "Método de saque atualizado!");
            }
        } catch (error) {
            console.error(error);
            if (addToast) addToast(ToastType.Error, "Erro ao salvar e-mail.");
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + 
               ', ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (val: number | undefined) => {
        const amount = val || 0;
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="fixed inset-0 bg-[#121212] z-[120] flex flex-col font-sans">
            {/* Navbar */}
            <div className="flex items-center p-4 bg-[#121212] z-10">
                <button onClick={onClose} className="p-1">
                    <ChevronLeftIcon className="text-white w-6 h-6" />
                </button>
                <div className="flex-1 flex justify-center items-center gap-2 mr-7">
                    <img src={user.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-white/20" alt="Admin" />
                    <span className="font-bold text-white text-base">Admin LiveGo</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-[#6366F1] to-[#3B82F6] rounded-2xl p-6 relative shadow-lg mt-2">
                    <div className="flex flex-col">
                        <span className="text-white/90 text-xs font-medium mb-1">Saldo Disponível</span>
                        <span className="text-4xl font-black text-white tracking-wide">{formatCurrency(balance)}</span>
                        <span className="text-white/80 text-[11px] mt-1">Saque disponível</span>
                    </div>
                    <div className="absolute right-4 bottom-4 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <BankIcon className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Withdraw Method */}
                <div>
                     <div className="flex justify-between items-end mb-2 px-1">
                        <h3 className="text-white font-bold text-sm">Método de Saque</h3>
                        <button 
                            onClick={() => setIsEditingEmail(true)}
                            className="text-[#A855F7] text-xs font-bold flex items-center gap-1 hover:text-purple-400 transition-colors"
                        >
                             <EditIcon className="w-3 h-3" /> Editar
                        </button>
                    </div>
                    <div className="bg-[#1C1C1E] rounded-xl p-4 flex items-center gap-3 border border-white/5">
                        <MailIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-300 text-sm font-medium">{withdrawalEmail}</span>
                    </div>
                </div>

                {/* History Section */}
                <div className="flex flex-col h-full">
                     <div className="flex items-center gap-2 mb-4 px-1">
                        <HistoryIcon className="w-4 h-4 text-gray-400" />
                        <h3 className="text-white font-bold text-sm">Histórico de Saques</h3>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                        {tabs.map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab 
                                    ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-900/20' 
                                    : 'bg-[#1C1C1E] text-gray-400 hover:bg-[#2C2C2E]'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="flex flex-col space-y-3 pb-4">
                        {loading ? (
                            <div className="flex justify-center py-10 text-gray-500 text-xs">Carregando...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center text-gray-500 text-xs py-10">Nenhum registro encontrado.</div>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-transparent py-2 border-b border-white/5 last:border-0">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-white font-bold text-sm">{item.description || item.relatedUserName || 'Taxa de Saque'}</span>
                                        <span className="text-gray-500 text-[10px]">{formatDate(item.timestamp)}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-white font-bold text-sm">{formatCurrency(item.amountBRL)}</span>
                                        <span className={`text-[10px] font-bold uppercase ${item.status === 'Concluído' ? 'text-[#00C853]' : item.status === 'Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {item.status === 'Concluído' ? 'completed' : item.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#121212] border-t border-white/5 z-20">
                <button 
                    onClick={handleWithdraw}
                    disabled={balance <= 0}
                    className={`w-full font-bold py-4 rounded-xl text-sm shadow-lg transition-all ${
                        balance > 0 
                        ? 'bg-[#00C853] hover:bg-[#00a846] text-white active:scale-95' 
                        : 'bg-[#2C2C2E] text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Sacar {formatCurrency(balance)}
                </button>
            </div>

            {/* Edit Email Modal */}
            {isEditingEmail && (
                <EditMethodModal 
                    currentEmail={withdrawalEmail} 
                    onSave={handleSaveEmail} 
                    onClose={() => setIsEditingEmail(false)} 
                />
            )}
        </div>
    );
};

export default AdminWalletScreen;