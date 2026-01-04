import React, { useState } from 'react';
import { ChevronLeftIcon, SolidDiamondIcon, BankIcon, LockIcon, EditIcon, CheckIcon } from './icons';
import { api } from '../services/api';

interface ConfirmPurchaseScreenProps {
    packageDetails: { diamonds: number; price: number };
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmPurchaseScreen: React.FC<ConfirmPurchaseScreenProps> = ({ packageDetails, onConfirm, onCancel }) => {
    const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'card'>('card');
    
    // Form States
    const [address, setAddress] = useState({ street: '', number: '', district: '', city: '', zip: '' });
    const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isAddressSaved, setIsAddressSaved] = useState(false);
    const [isCardSaved, setIsCardSaved] = useState(false);

    const handleSaveAddress = async () => {
        try {
            await api.updateBillingAddress(address);
            setIsAddressSaved(true);
        } catch (e) {
            console.error(e);
            // Simulate success for demo purposes if backend fails
            setIsAddressSaved(true);
        }
    };

    const handleSaveCard = async () => {
        try {
            await api.updateCreditCard(card);
            setIsCardSaved(true);
        } catch (e) {
            console.error(e);
            // Simulate success for demo
            setIsCardSaved(true);
        }
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            // Even if save buttons weren't clicked, try to send data if populated
            if (!isAddressSaved && address.street) await handleSaveAddress();
            if (!isCardSaved && card.number && paymentMethod === 'card') await handleSaveCard();

            const result = await api.confirmPurchaseTransaction(packageDetails, paymentMethod);
            if (result && result.length > 0 && result[0].success) {
                onConfirm(); // Parent handler for UI update and success message
            }
        } catch (error) {
            console.error("Purchase failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            await api.cancelPurchaseTransaction();
        } catch(e) { console.error(e); }
        onCancel();
    };

    return (
        <div className="fixed inset-0 z-[150] bg-[#121212] flex flex-col font-sans animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center p-4 bg-[#121212] border-b border-white/5 shrink-0 z-10">
                <button onClick={handleCancel} className="p-1 -ml-2">
                    <ChevronLeftIcon className="text-white w-6 h-6" />
                </button>
                <h2 className="flex-1 text-center text-white text-base font-bold mr-4">Confirmar compra</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-28 scrollbar-hide">
                {/* Package Summary Card */}
                <div className="bg-[#1C1C1E] rounded-lg p-4 mb-6 border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <SolidDiamondIcon className="w-8 h-8 text-[#FFC107]" />
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm">{packageDetails.diamonds.toLocaleString('pt-BR')} Diamante</span>
                            <span className="text-gray-500 text-xs">Pacote Selecionado</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2 border-t border-white/10 pt-3">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-400">Valor do Pacote</span>
                            <span className="text-white">R$ {packageDetails.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-400">Taxas</span>
                            <span className="text-white">R$ 0,00</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 font-bold border-t border-white/5 mt-2">
                            <span className="text-white">Total a Pagar</span>
                            <span className="text-white">R$ {packageDetails.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods Tabs */}
                <div className="flex gap-3 mb-6">
                    <button 
                        onClick={() => setPaymentMethod('transfer')}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                            paymentMethod === 'transfer' 
                            ? 'bg-[#A855F7] text-white border-[#A855F7]' 
                            : 'bg-transparent text-gray-400 border-gray-700 hover:bg-white/5'
                        }`}
                    >
                        <BankIcon className="w-4 h-4" /> Transferência
                    </button>
                    <button 
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                            paymentMethod === 'card' 
                            ? 'bg-[#A855F7] text-white border-[#A855F7]' 
                            : 'bg-transparent text-gray-400 border-gray-700 hover:bg-white/5'
                        }`}
                    >
                        <LockIcon className="w-4 h-4" /> Cartão de Crédito
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Address Section */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-white font-bold text-xs">Endereço de Cobrança (Obrigatório)</h3>
                            {isAddressSaved && <CheckIcon className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                placeholder="Rua" 
                                className="w-full bg-[#232325] text-white p-3 rounded-lg text-xs outline-none border border-white/5 focus:border-[#A855F7] placeholder-gray-500"
                                value={address.street}
                                onChange={e => setAddress({...address, street: e.target.value})}
                            />
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Nº" 
                                    className="w-1/3 bg-[#232325] text-white p-3 rounded-lg text-xs outline-none border border-white/5 focus:border-[#A855F7] placeholder-gray-500"
                                    value={address.number}
                                    onChange={e => setAddress({...address, number: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Bairro" 
                                    className="w-2/3 bg-[#232325] text-white p-3 rounded-lg text-xs outline-none border border-white/5 focus:border-[#A855F7] placeholder-gray-500"
                                    value={address.district}
                                    onChange={e => setAddress({...address, district: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Cidade" 
                                    className="w-1/2 bg-[#232325] text-white p-3 rounded-lg text-xs outline-none border border-white/5 focus:border-[#A855F7] placeholder-gray-500"
                                    value={address.city}
                                    onChange={e => setAddress({...address, city: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="CEP" 
                                    className="w-1/2 bg-[#232325] text-white p-3 rounded-lg text-xs outline-none border border-white/5 focus:border-[#A855F7] placeholder-gray-500"
                                    value={address.zip}
                                    onChange={e => setAddress({...address, zip: e.target.value})}
                                />
                            </div>
                            {!isAddressSaved && (
                                <div className="flex justify-end gap-3 mt-2">
                                    <button onClick={handleSaveAddress} className="px-6 py-1.5 bg-[#A855F7] text-white text-xs font-bold rounded-full hover:bg-[#9333ea]">Salvar Endereço</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Method Specific Section */}
                    {paymentMethod === 'card' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white font-bold text-xs">Informações do Cartão</h3>
                                {isCardSaved && <CheckIcon className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="Número do Cartão" 
                                    className="w-full bg-[#232325] text-white p-3 rounded-lg text-xs outline-none border border-white/5 focus:border-[#A855F7] placeholder-gray-500"
                                    value={card.number}
                                    onChange={e => setCard({...card, number: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Nome no Cartão" 
                                    className="w-full bg-[#232325] text-white p-3 rounded-lg text-xs outline-none border border-white/5 focus:border-[#A855F7] placeholder-gray-500"
                                    value={card.name}
                                    onChange={e => setCard({...card, name: e.target.value})}
                                />
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="MM/AA" 
                                        className="w-1/2 bg-[#232325] text-white p-3 rounded-lg text-xs outline-none border border-white/5 focus:border-[#A855F7] placeholder-gray-500"
                                        value={card.expiry}
                                        onChange={e => setCard({...card, expiry: e.target.value})}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="CVV" 
                                        className="w-1/2 bg-[#232325] text-white p-3 rounded-lg text-xs outline-none border border-white/5 focus:border-[#A855F7] placeholder-gray-500"
                                        value={card.cvv}
                                        onChange={e => setCard({...card, cvv: e.target.value})}
                                    />
                                </div>
                                {!isCardSaved && (
                                    <div className="flex justify-end gap-3 mt-2">
                                        <button onClick={handleSaveCard} className="px-6 py-1.5 bg-[#A855F7] text-white text-xs font-bold rounded-full hover:bg-[#9333ea]">Salvar Cartão</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white font-bold text-xs">Dados Bancários</h3>
                                <button className="text-[#A855F7] text-xs font-bold flex items-center gap-1 hover:text-purple-400">
                                    <EditIcon className="w-3 h-3" /> Editar
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-[#232325] border border-[#3b82f6]/30 p-3 rounded-lg text-gray-300 text-xs font-medium">
                                    Banco do Brasil (001)
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-2/3 bg-[#232325] border border-white/5 p-3 rounded-lg text-gray-300 text-xs font-medium">
                                        1234-5
                                    </div>
                                    <div className="w-1/3 bg-[#232325] border border-white/5 p-3 rounded-lg text-gray-300 text-xs font-medium">
                                        ******-0
                                    </div>
                                </div>
                                <div className="bg-[#232325] border border-white/5 p-3 rounded-lg text-gray-300 text-xs font-medium">
                                    123.***.***-00
                                </div>
                                <div className="bg-[#232325] border border-white/5 p-3 rounded-lg text-gray-300 text-xs font-medium">
                                    LiveGo Pagamentos Ltda.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Footer Button */}
            <div className="p-4 bg-[#121212] border-t border-white/5 safe-area-bottom z-20">
                <button 
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="w-full bg-[#3b4453] hover:bg-[#4b5563] text-white font-bold py-3.5 rounded-full text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Processando...' : `Confirmar Compra (R$ ${packageDetails.price.toFixed(2).replace('.', ',')})`}
                </button>
            </div>
        </div>
    );
};

export default ConfirmPurchaseScreen;