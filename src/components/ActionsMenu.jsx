import React, { useState } from 'react';

const ActionsMenu = ({ onShare, onRestart }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${isOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-zinc-400 hover:text-zinc-200'}`}
                title="Actions"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in origin-top-right">
                        <button
                            onClick={() => { onShare(); setIsOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-3 cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Share Card
                        </button>
                        <hr className="border-white/5" />
                        <button
                            onClick={() => { onRestart(); setIsOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-900/10 hover:text-rose-300 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Restart Game
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ActionsMenu;
