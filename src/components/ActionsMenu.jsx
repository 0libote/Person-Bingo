import React, { useState } from 'react';

const ActionsMenu = ({ onShare, onRestart, onSettings, onToggleMode, isSetupMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${isOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-zinc-400 hover:text-zinc-200'}`}
                title="Actions"
            >
                <svg className="w-5 h-5 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in origin-top-right">
                        <div className="p-2 space-y-1">
                            {/* Mode Toggle */}
                            <button
                                onClick={() => { onToggleMode(); setIsOpen(false); }}
                                className="w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl transition-colors flex items-center gap-3 cursor-pointer group"
                            >
                                <div className={`p-1.5 rounded-lg ${isSetupMode ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-violet-500/10 text-violet-500 group-hover:bg-violet-500 group-hover:text-white'} transition-colors`}>
                                    {isSetupMode ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    )}
                                </div>
                                {isSetupMode ? 'Switch to Play Mode' : 'Switch to Edit Mode'}
                            </button>

                            {/* Settings */}
                            <button
                                onClick={() => { onSettings(); setIsOpen(false); }}
                                className="w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl transition-colors flex items-center gap-3 cursor-pointer group"
                            >
                                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                Settings
                            </button>

                            <hr className="border-white/5 mx-2 my-1" />

                            <button
                                onClick={() => { onShare(); setIsOpen(false); }}
                                className="w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl transition-colors flex items-center gap-3 cursor-pointer group"
                            >
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                </div>
                                Share Card
                            </button>

                            {!isSetupMode && (
                                <button
                                    onClick={() => { onRestart(); setIsOpen(false); }}
                                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-900/10 hover:text-rose-300 rounded-xl transition-colors flex items-center gap-3 cursor-pointer group"
                                >
                                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </div>
                                    Restart Game
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ActionsMenu;
