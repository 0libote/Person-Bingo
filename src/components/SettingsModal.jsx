import React from 'react';
/* eslint-disable react/prop-types */

const SettingsModal = ({
    show, onClose,
    zoomLevel, setZoomLevel,
    themeName, setThemeName,
    cardOptions, setCardOptions,
    customColors, setCustomColors
}) => {
    if (!show) return null;

    const themes = [
        { id: 'cyber', name: 'Cyber Punk' },
        { id: 'dark', name: 'Dark Minimal' },
        { id: 'custom', name: 'Custom Gradient' }
    ];

    const presets = [
        { name: 'Sunset', start: '#f59e0b', end: '#ef4444' },
        { name: 'Ocean', start: '#06b6d4', end: '#3b82f6' },
        { name: 'Forest', start: '#10b981', end: '#047857' },
        { name: 'Royal', start: '#8b5cf6', end: '#d946ef' },
        { name: 'Midnight', start: '#1e1b4b', end: '#4c1d95' },
    ];

    const zoomOptions = [0.5, 0.75, 1.0, 1.25, 1.5];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-md w-full relative overflow-hidden slide-up-animation">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    View Settings
                </h3>

                <div className="space-y-6">
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

                    {/* Theme Selector */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Theme</label>
                        <div className="grid grid-cols-3 gap-2">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setThemeName(t.id)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${themeName === t.id
                                        ? 'bg-violet-600 border-violet-500 text-white'
                                        : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Color Pickers */}
                    {themeName === 'custom' && (
                        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-4 animate-fade-in">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
                                {presets.map(p => (
                                    <button
                                        key={p.name}
                                        onClick={() => setCustomColors({ start: p.start, end: p.end })}
                                        className="px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 hover:border-white/30 whitespace-nowrap text-zinc-300 transition-colors"
                                        style={{ background: `linear-gradient(to right, ${p.start}22, ${p.end}22)` }}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Start Color</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative">
                                            <input
                                                type="color"
                                                value={customColors.start}
                                                onChange={(e) => setCustomColors({ ...customColors, start: e.target.value })}
                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 m-0 cursor-pointer"
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-zinc-400">{customColors.start}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">End Color</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative">
                                            <input
                                                type="color"
                                                value={customColors.end}
                                                onChange={(e) => setCustomColors({ ...customColors, end: e.target.value })}
                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 m-0 cursor-pointer"
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-zinc-400">{customColors.end}</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="h-2 rounded-full w-full"
                                style={{ background: `linear-gradient(to right, ${customColors.start}, ${customColors.end})` }}
                            />
                        </div>
                    )}

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

