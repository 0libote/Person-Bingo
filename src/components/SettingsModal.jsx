import React from 'react';
/* eslint-disable react/prop-types */

const SettingsModal = ({
    show, onClose,
    zoomLevel, setZoomLevel,
    actions // { onClearAllData }
}) => {
    if (!show) return null;

    const zoomOptions = [0.5, 0.75, 1.0, 1.25, 1.5];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-sm w-full relative overflow-hidden slide-up-animation shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    App Settings
                </h3>

                <div className="space-y-8">
                    {/* Zoom Control */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Card Scale</label>
                        <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
                            {zoomOptions.map(zoom => (
                                <button
                                    key={zoom}
                                    onClick={() => setZoomLevel(zoom)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${zoomLevel === zoom ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {Math.round(zoom * 100)}%
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-white/5" />

                    {/* Danger Zone */}
                    <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
                        <label className="text-xs font-bold text-rose-500/60 uppercase tracking-wider mb-3 block">Danger Zone</label>
                        <button
                            onClick={actions.onClearAllData}
                            className="w-full py-3 rounded-xl btn-secondary text-sm text-rose-400 bg-rose-900/10 border-rose-900/30 hover:bg-rose-600 hover:text-white hover:border-rose-500 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 group"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Reset All App Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

