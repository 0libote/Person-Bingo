import React, { useState } from 'react';

const ShareModal = ({ show, onClose, onDownload, onCopyImage, cardConfig }) => {
    if (!show) return null;

    const [copiedConfig, setCopiedConfig] = useState(false);

    const handleCopyConfig = () => {
        const configString = JSON.stringify(cardConfig);
        navigator.clipboard.writeText(configString).then(() => {
            setCopiedConfig(true);
            setTimeout(() => setCopiedConfig(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl max-w-sm w-full relative overflow-hidden slide-up-animation">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    Share Card
                </h3>

                <div className="space-y-4">
                    {/* Image Actions */}
                    <button onClick={onDownload} className="w-full p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 flex items-center gap-3 transition-all duration-200 cursor-pointer group active:scale-[0.98]">
                        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-zinc-200 text-sm">Download Image</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-tight font-medium">Save as PNG to device</div>
                        </div>
                    </button>

                    <button onClick={onCopyImage} className="w-full p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 flex items-center gap-3 transition-all duration-200 cursor-pointer group active:scale-[0.98]">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-zinc-200 text-sm">Copy to Clipboard</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-tight font-medium">Paste directly into apps</div>
                        </div>
                    </button>

                    <hr className="border-white/5 my-2" />

                    {/* Config String */}
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Config Data</span>
                            {copiedConfig && <span className="text-[10px] text-emerald-400 font-bold animate-pulse">Copied!</span>}
                        </div>
                        <button
                            onClick={handleCopyConfig}
                            className="w-full py-2.5 rounded-xl bg-zinc-950/50 hover:bg-emerald-600/10 hover:text-emerald-400 text-zinc-400 text-xs font-mono border border-dashed border-zinc-700 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            Copy Config String
                        </button>
                        <p className="text-[9px] text-zinc-600 mt-2 text-center leading-tight">Share this text with friends to import this card setup.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
