import React, { useRef, useEffect, useState } from 'react';
import { SearchIcon, GlobeIcon, TextIcon, BrazilFlagIcon, USAFlagIcon, ArgentinaFlagIcon, ColombiaFlagIcon, MexicoFlagIcon, BellIcon } from './icons';
import { Streamer } from '../types';
import { useTranslation } from '../i18n';

interface MainScreenProps {
  onOpenReminderModal: () => void;
  onOpenRegionModal: () => void;
  onSelectStream: (streamer: Streamer) => void;
  onOpenSearch: () => void;
  streamers: Streamer[];
  isLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showLocationBanner: boolean;
}

const MainScreen: React.FC<MainScreenProps> = ({ 
  onOpenReminderModal, 
  onOpenRegionModal, 
  onSelectStream, 
  onOpenSearch, 
  streamers, 
  isLoading,
  activeTab,
  onTabChange
}) => {
  const { t } = useTranslation();
  const tabsRef = useRef<HTMLDivElement>(null);
  
  // Drag scrolling state
  const [isDragging, setIsDragging] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Categories matching the screenshot
  const categories = [
    { id: 'popular', label: 'Popular' },
    { id: 'followed', label: 'Seguido' },
    { id: 'nearby', label: 'Perto' },
    { id: 'pk', label: 'PK' },
    { id: 'new', label: 'Novo' },
    { id: 'music', label: 'Música' },
    { id: 'dance', label: 'Dança' },
    { id: 'game', label: 'Jogos' },
    { id: 'voice', label: 'Voz' },
    { id: 'party', label: 'Festa' },
  ];

  // Auto-scroll to active tab when it changes (only if not dragging)
  useEffect(() => {
    if (tabsRef.current && !isDown.current) {
        const activeElement = tabsRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
        if (activeElement) {
            activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
  }, [activeTab]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    if (tabsRef.current) {
        startX.current = e.pageX - tabsRef.current.offsetLeft;
        scrollLeft.current = tabsRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    // Small timeout to prevent click event triggering after a drag
    setTimeout(() => {
        setIsDragging(false);
    }, 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !tabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll speed multiplier
    
    // Only consider it a drag if moved more than 5px to allow normal clicks
    if (Math.abs(walk) > 5) {
        if (!isDragging) setIsDragging(true);
        tabsRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const getFlagForStreamer = (index: number) => {
      // Flags constrained by parent div
      const commonClasses = "w-full h-full object-cover";
      const mod = index % 5;
      if (mod === 0) return <USAFlagIcon className={commonClasses} />;
      if (mod === 1) return <ArgentinaFlagIcon className={commonClasses} />;
      if (mod === 2) return <BrazilFlagIcon className={commonClasses} />;
      if (mod === 3) return <ColombiaFlagIcon className={commonClasses} />;
      return <MexicoFlagIcon className={commonClasses} />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#121212] text-white pb-20">
      {/* Header Container */}
      <div className="bg-[#121212]/95 backdrop-blur-md sticky top-0 z-20 pt-2 pb-0 border-b border-white/5 shadow-sm shadow-black/40">
        
        {/* Top Row: Logo & Actions */}
        <div className="flex items-center justify-between px-4 py-2">
           <h1 className="text-[24px] font-black text-white tracking-wide font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 drop-shadow-sm">
             LiveGo
           </h1>
           
           <div className="flex items-center gap-3">
              {/* Bell Icon for History/Reminders */}
              <button 
                onClick={onOpenReminderModal}
                className="w-9 h-9 rounded-xl hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center"
              >
                <BellIcon className="w-6 h-6 text-gray-200" strokeWidth={2} />
              </button>
              
              {/* Globe Icon */}
              <button 
                onClick={onOpenRegionModal} 
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95"
              >
                <GlobeIcon size={22} className="text-gray-200" strokeWidth={1.5} />
              </button>

              {/* Search Icon */}
              <button 
                onClick={onOpenSearch} 
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95"
              >
                <SearchIcon size={22} className="text-gray-200" strokeWidth={2.5} />
              </button>
           </div>
        </div>

        {/* Second Row: Scrollable Tabs */}
        <div className="w-full relative">
           {/* Gradient Masks for Scroll Indication */}
           <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#121212] to-transparent z-10 pointer-events-none"></div>
           <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#121212] to-transparent z-10 pointer-events-none"></div>

           <div 
              ref={tabsRef}
              tabIndex={0}
              className={`flex items-center gap-1 overflow-x-auto scrollbar-hide px-4 pb-0 pt-1 whitespace-nowrap touch-pan-x snap-x outline-none ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
              style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
           >
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  data-tab-id={cat.id}
                  onClick={(e) => {
                    // Prevent tab change if user was dragging
                    if (isDragging) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    onTabChange(cat.id);
                  }}
                  className={`
                    px-3 py-3 text-[15px] transition-all duration-300 relative flex flex-col items-center shrink-0 snap-center
                    outline-none focus:outline-none select-none
                    ${activeTab === cat.id ? 'text-white font-bold scale-105' : 'text-gray-400 font-medium hover:text-gray-200'}
                  `}
                >
                  <span className="z-10 relative">{cat.label}</span>
                  
                  {/* Active Indicator Line */}
                  {activeTab === cat.id && (
                    <div className="absolute bottom-1.5 w-full h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)] animate-in fade-in zoom-in duration-300"></div>
                  )}
                </button>
              ))}
              {/* Extra Spacer to prevent cutting off the last item */}
              <div className="w-8 shrink-0 h-10" />
           </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 scrollbar-hide outline-none scroll-smooth">
         {isLoading ? (
             <div className="flex items-center justify-center h-40">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
             </div>
         ) : (
             <div className="grid grid-cols-2 gap-1 px-1 pt-1 pb-20">
                {Array.isArray(streamers) && streamers.map((streamer, index) => (
                    <div 
                      key={streamer.id} 
                      onClick={() => onSelectStream(streamer)}
                      className="relative aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
                    >
                        <img 
                          src={streamer.thumbnail || `https://picsum.photos/seed/${streamer.id}/400/600`} 
                          alt={streamer.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
                        
                        {/* Top Left: Audio Visualizer */}
                        <div className="absolute top-2 left-2">
                             <div className="bg-black/40 backdrop-blur-md rounded-full px-1.5 py-1 flex items-center justify-center h-5 w-5 border border-white/5">
                                <div className="flex items-end gap-[1.5px] h-2">
                                    <div className="w-[1.5px] bg-[#4ade80] h-[60%] animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                                    <div className="w-[1.5px] bg-[#4ade80] h-[100%] animate-[pulse_1.1s_ease-in-out_infinite]"></div>
                                    <div className="w-[1.5px] bg-[#4ade80] h-[40%] animate-[pulse_0.9s_ease-in-out_infinite]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Top Right: Flag (Small & Discreet) */}
                        <div className="absolute top-2 right-2 w-[14px] h-[10px] rounded-[2px] overflow-hidden shadow-sm border border-white/10">
                             {getFlagForStreamer(index)}
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-2 left-2 right-2">
                            <div className="font-bold text-white text-[13px] truncate shadow-black drop-shadow-md leading-tight mb-1">
                                {streamer.name}
                            </div>
                            <div className="flex items-center justify-between">
                                 <div className="text-[10px] text-gray-200 flex items-center gap-1 drop-shadow-md font-medium">
                                    <span className="truncate">🤙 {(streamer.viewers || 0).toLocaleString().replace(',', '.')}</span>
                                </div>
                                <div className="text-[10px] text-gray-300 drop-shadow-md truncate max-w-[60%] text-right bg-black/20 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                    {index % 2 === 0 ? '#Beleza' : '#Dança'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
         )}
      </div>
    </div>
  );
};

export default MainScreen;