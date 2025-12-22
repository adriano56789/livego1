
import React from 'react';
export default function JoinFanClubModal({ isOpen, onClose, onConfirm }: any) {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-transparent" onClick={onClose}>
             <div className="bg-[#1C1C1E] p-6 rounded-xl text-center" onClick={e => e.stopPropagation()}>
                 <h2 className="text-white font-bold text-xl mb-4">Confirmar</h2>
                 <p className="text-gray-400 mb-6">Enviar presente especial para entrar?</p>
                 <div className="flex gap-2 justify-center">
                    <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-full">Cancelar</button>
                    <button onClick={onConfirm} className="bg-pink-600 text-white px-4 py-2 rounded-full font-bold">Confirmar</button>
                 </div>
             </div>
        </div>
    )
}
