import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeftIcon, DatabaseIcon, CheckIcon, CloseIcon, PlayIcon } from './icons';
import { ToastType } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from './Loading';
import { API_DEFINITIONS } from './ApiTracker'; // Reutilizando a definição das APIs

interface DatabaseScreenProps {
    onClose: () => void;
    addToast: (type: ToastType, message: string) => void;
}

interface CollectionStatus {
    name: string;
    exists: boolean;
}

// FIX: Explicitly type REQUIRED_COLLECTIONS as string[] to fix type inference issues.
const REQUIRED_COLLECTIONS: string[] = [...new Set(API_DEFINITIONS.flatMap(group => group.endpoints.flatMap(e => e.collections)).filter(c => c !== '*'))];

const DatabaseScreen: React.FC<DatabaseScreenProps> = ({ onClose, addToast }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [scanResult, setScanResult] = useState<{ collections: CollectionStatus[], adminUserExists?: boolean } | null>(null);

    const checkStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const existingCollections = await api.db.checkCollections();
            // FIX: Add type assertion for name to handle pluralization logic correctly
            const collectionStatus: CollectionStatus[] = REQUIRED_COLLECTIONS.map(name => ({
                name,
                exists: existingCollections.includes(name) || existingCollections.includes((name as any).slice(0,-1))
            }));
            setScanResult({ collections: collectionStatus });
        } catch (error) {
            addToast(ToastType.Error, "Falha ao conectar com a API do banco.");
            setScanResult(null);
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const handleSync = async () => {
        setIsLoading(true);
        try {
            const missingCollections = scanResult?.collections.filter(c => !c.exists).map(c => c.name) || REQUIRED_COLLECTIONS;
            const result = await api.db.setupDatabase(missingCollections);
            addToast(ToastType.Success, result.message || "Banco de dados sincronizado!");
            await checkStatus(); // Re-scan after setup
        } catch (error: any) {
            addToast(ToastType.Error, error.message || "Erro ao sincronizar banco de dados.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const missingCount = useMemo(() => scanResult?.collections.filter(c => !c.exists).length || 0, [scanResult]);

    return (
        <div className="fixed inset-0 z-[150] bg-[#121212] flex flex-col font-sans animate-in slide-in-from-right duration-300">
            <header className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1C1C1E] shrink-0">
                <button onClick={onClose}><ChevronLeftIcon className="w-6 h-6 text-white" /></button>
                <h1 className="text-white font-bold text-lg">Database Monitor</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/10 mb-6 text-center">
                    <DatabaseIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h2 className="text-white font-bold text-lg">Verificação do Banco de Dados</h2>
                    <p className="text-gray-400 text-xs mt-2 max-w-sm mx-auto">
                        Este painel verifica se todas as coleções necessárias para a API estão criadas no MongoDB e permite criá-las automaticamente.
                    </p>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-300 font-bold text-sm">Status das Coleções ({REQUIRED_COLLECTIONS.length})</h3>
                        {missingCount > 0 && <span className="text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-full">{missingCount} FALTANDO</span>}
                    </div>

                    <div className="bg-[#1C1C1E] rounded-xl border border-white/10">
                        {isLoading && !scanResult ? (
                            <div className="p-10 flex justify-center"><LoadingSpinner /></div>
                        ) : !scanResult ? (
                             <div className="p-10 text-center text-gray-500">Falha ao carregar status.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {scanResult.collections.map(col => (
                                    <div key={col.name} className="flex items-center justify-between p-3">
                                        <span className="font-mono text-sm text-gray-300">{col.name}</span>
                                        {col.exists ? (
                                            <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                                                <CheckIcon className="w-4 h-4" /> OK
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                                                <CloseIcon className="w-4 h-4" /> Faltando
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="p-4 bg-[#1C1C1E] border-t border-white/10">
                <button 
                    onClick={handleSync}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-900/30 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? <LoadingSpinner /> : <PlayIcon className="w-6 h-6" />}
                    Analisar & Sincronizar Banco de Dados
                </button>
            </footer>
        </div>
    );
};

export default DatabaseScreen;