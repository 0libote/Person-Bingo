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
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            >
                <span className="text-sm font-bold text-zinc-200 max-w-[120px] md:max-w-[200px] truncate">
                    {activeCard.name || 'Untitled'}
                </span>
                <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-fade-in origin-top-left">
                    <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                        {cards.map((card) => (
                            <div key={card.id} className="group/item relative flex items-center">
                                <button
                                    onClick={() => {
                                        onSwitch(card.id);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all
                                        ${activeCardId === card.id
                                            ? 'bg-violet-600/20 text-violet-300'
                                            : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                                        }
                                    `}
                                >
                                    <div className={`w-2 h-2 rounded-full ${activeCardId === card.id ? 'bg-violet-500 shadow-lg shadow-violet-500/50' : 'bg-transparent border border-zinc-700'}`} />
                                    <span className="truncate flex-1">{card.name || 'Untitled'}</span>
                                </button>

                                {cards.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(card.id);
                                        }}
                                        className="absolute right-2 opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-rose-500/20 text-zinc-600 hover:text-rose-400 rounded-lg transition-all"
                                        title="Delete Card"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div >

                    <div className="p-2 border-t border-white/5 bg-black/20">
                        <button
                            onClick={() => {
                                onAdd();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 hover:bg-white/5 transition-all text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            New Bingo Card
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardSwitcher;
