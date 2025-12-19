import React, { useState } from 'react';

const ShareModal = ({ show, onClose, onDownload, onCopy, cardConfig }) => {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-white/90">
            <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-sm w-full relative overflow-hidden slide-up-animation shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--accent-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    Share Bingo Card
                </h3>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <button
                            onClick={onDownload}
                            className="w-full btn-primary py-3.5 group"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download PNG Image
                        </button>
                        <button
                            onClick={onCopy}
                            className="w-full btn-secondary py-3.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copy Image to Clipboard
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
                        <span className="relative z-10 block w-fit mx-auto px-4 bg-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Share Configuration</span>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
                            Share this card's setup with others by copying the config string.
                        </p>
                        <button
                            onClick={handleCopyConfig}
                            className="w-full btn-secondary text-xs py-3 border-dashed border-zinc-700 hover:border-zinc-500"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            {copiedConfig ? 'Config Copied!' : 'Copy Config String'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
