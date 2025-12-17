import React from 'react';
/* eslint-disable react/prop-types */

const SettingsModal = ({
    show, onClose,
    zoomLevel, setZoomLevel,
    cardOptions, setCardOptions,
    actions // { onReset, onDownload, onCopy }
}) => {
    if (!show) return null;

    const zoomOptions = [0.5, 0.75, 1.0, 1.25, 1.5];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-md w-full relative overflow-hidden slide-up-animation max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Settings & Actions
                </h3>

                <div className="space-y-8">
                    {/* Game Controls */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={actions.onReset} className="col-span-2 btn-secondary flex items-center justify-center gap-2 text-sm text-rose-400 bg-rose-900/10 border-rose-900/30 hover:bg-rose-900/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Clear Board
                        </button>
                        <button onClick={actions.onDownload} className="col-span-1 btn-secondary flex items-center justify-center gap-2 text-sm bg-zinc-800/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download
                        </button>
                        <button onClick={actions.onCopy} className="col-span-1 btn-secondary flex items-center justify-center gap-2 text-sm bg-zinc-800/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copy
                        </button>
                    </div>

                    <hr className="border-white/5" />

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

                    {/* Layout & Image Options */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Display</label>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 mb-2 p-1 bg-black/20 rounded-xl">
                                <button
                                    onClick={() => setCardOptions({ ...cardOptions, imageStyle: 'avatar' })}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${cardOptions.imageStyle !== 'background' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'}`}
                                >
                                    Avatar Mode
                                </button>
                                <button
                                    onClick={() => setCardOptions({ ...cardOptions, imageStyle: 'background' })}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${cardOptions.imageStyle === 'background' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'}`}
                                >
                                    Bg Mode
                                </button>
                            </div>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:bg-black/30 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={cardOptions.showTitle}
                                    onChange={(e) => setCardOptions({ ...cardOptions, showTitle: e.target.checked })}
                                    className="rounded border-zinc-600 text-violet-600 focus:ring-violet-500 bg-zinc-800 w-4 h-4"
                                />
                                <span className="text-sm font-medium text-zinc-300">Show Card Title</span>
                            </label>

                            {cardOptions.imageStyle !== 'background' && (
                                <label className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:bg-black/30 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={cardOptions.showImage}
                                        onChange={(e) => setCardOptions({ ...cardOptions, showImage: e.target.checked })}
                                        className="rounded border-zinc-600 text-violet-600 focus:ring-violet-500 bg-zinc-800 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-zinc-300">Show Avatar</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

