import React, { useState, useRef, useEffect } from 'react';

const CardSwitcher = ({ cards, activeCardId, onSwitch, onAdd, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const activeCard = cards.find(c => c.id === activeCardId) || cards[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 border border-white/10 transition-all duration-200 group cursor-pointer active:scale-[0.98]"
            >
                <span className="text-sm font-bold text-zinc-200 max-w-[120px] md:max-w-[200px] truncate leading-tight">
                    {activeCard.name || 'Untitled'}
                </span>
                <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-fade-in origin-top-left p-1.5 backdrop-blur-xl">
                    <div className="space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 p-1">
                        {cards.map((card) => (
                            <div key={card.id} className="group/item relative flex items-center">
                                <button
                                    onClick={() => {
                                        onSwitch(card.id);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer
                                        ${activeCardId === card.id
                                            ? 'bg-violet-600/10 text-violet-300'
                                            : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                                        }
                                    `}
                                >
                                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activeCardId === card.id ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)] scale-110' : 'bg-zinc-800'}`} />
                                    <span className="truncate flex-1">{card.name || 'Untitled'}</span>
                                </button>

                                {cards.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(card.id);
                                        }}
                                        className="absolute right-2 opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 rounded-lg transition-all"
                                        title="Delete Card"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div >

                    <div className="p-1.5 mt-1 pt-2 border-t border-white/5">
                        <button
                            onClick={() => {
                                onAdd();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 hover:bg-white/5 transition-all duration-200 text-xs font-bold uppercase tracking-wider cursor-pointer group active:scale-[0.98]"
                        >
                            <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            New Bingo Card
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardSwitcher;
