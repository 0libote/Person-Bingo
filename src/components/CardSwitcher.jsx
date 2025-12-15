import React from 'react';

const CardSwitcher = ({ cards, activeCardId, onSwitch, onAdd, onDelete }) => {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 max-w-5xl w-full scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent px-1">
            {cards.map((card) => (
                <div key={card.id} className="relative group shrink-0">
                    <button
                        onClick={() => onSwitch(card.id)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap
              ${activeCardId === card.id
                                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                            }
            `}
                    >
                        <span className="max-w-[100px] truncate">{card.name || 'Untitled'}</span>
                    </button>

                    {/* Delete Button (Only if more than 1 card) */}
                    {cards.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-rose-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-600"
                            title="Delete Card"
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}

            <button
                onClick={onAdd}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all ml-1"
                title="Add New Card"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
    );
};

export default CardSwitcher;
