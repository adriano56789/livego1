
import React, { useState } from 'react';
import { ChevronLeftIcon, SearchIcon } from './icons';

interface SearchScreenProps {
    onClose: () => void;
    onViewProfile?: (user: any) => void;
    allUsers?: any[];
    onFollowUser?: (user: any) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ onClose }) => {
    const [query, setQuery] = useState('');

    return (
        <div className="fixed inset-0 bg-[#121212] z-[120] flex flex-col font-sans animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center p-3 gap-3">
                <button onClick={onClose} className="p-1">
                    <ChevronLeftIcon className="text-gray-300 w-6 h-6" />
                </button>
                <div className="flex-1 bg-[#2C2C2E] rounded-lg flex items-center px-3 py-2.5">
                    <SearchIcon className="text-gray-500 w-4 h-4 mr-2" />
                    <input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquisar por nome ou ID" 
                        autoFocus 
                        className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Empty State */}
            {!query && (
                <div className="flex-1 flex flex-col items-center justify-center pb-40 opacity-60">
                    <SearchIcon className="w-16 h-16 text-gray-600 mb-4" strokeWidth={1.5} />
                    <p className="text-gray-500 text-sm font-medium">Pesquise por streamers e amigos.</p>
                </div>
            )}
            
            {/* Search Results Mock */}
            {query && (
                <div className="p-4 text-center text-gray-500 text-sm">
                    Procurando por "{query}"...
                </div>
            )}
        </div>
    );
};

export default SearchScreen;
