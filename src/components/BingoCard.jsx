import React, { forwardRef } from 'react';

const BingoCard = forwardRef(({ card, theme, zoomLevel, toggleSquare, markedSquares, children }, ref) => {
    const { items, gridSize, personImage, cardName, instantWin, showTitle = true, showImage = true, imageStyle = 'avatar' } = card;

    const getTextSizeClass = (text) => {
        if (!text) return 'text-xs md:text-sm';
        const len = text.length;
        if (len < 5) return 'text-2xl md:text-3xl';
        if (len < 15) return 'text-lg md:text-xl';
        if (len < 30) return 'text-base md:text-lg';
        return 'text-xs md:text-sm';
    };

    return (
        <div
            ref={ref}
            className={`relative w-full max-w-[600px] p-8 md:p-12 rounded-[2.5rem] ${theme.cardBg} border ${theme.cardBorder} shadow-2xl backdrop-blur-3xl transition-all duration-300 ease-out overflow-hidden`}
            style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
        >
            {/* Background Image Rendering */}
            {imageStyle === 'background' && personImage && (
                <>
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 blur-sm mix-blend-overlay"
                        style={{ backgroundImage: `url(${personImage})` }}
                    />
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: `url(${personImage})` }}
                    />
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/0 via-black/20 to-black/60" />
                </>
            )}

            {/* Header */}
            {(showTitle || (imageStyle === 'avatar' && showImage)) && (
                <div className="mb-6 text-center md:text-left flex flex-col md:flex-row items-center gap-4 md:gap-6 opacity-90 relative z-10">
                    {imageStyle === 'avatar' && showImage && personImage && (
                        <div className="relative">
                            <img
                                src={personImage}
                                className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-lg"
                                alt="Avatar"
                            />
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10"></div>
                        </div>
                    )}
                    {showTitle && (
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none drop-shadow-md">
                            {cardName}
                        </h2>
                    )}
                </div>
            )}

            {/* Grid */}
            <div
                className="grid gap-3 md:gap-4 relative z-10"
                style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => toggleSquare(index)}
                        className={`
              aspect-square relative rounded-xl transition-all duration-200 flex items-center justify-center p-2 text-center group cursor-pointer
              ${!item?.trim() ? theme.squareEmpty : (markedSquares[index] ? `${theme.squareMarked} scale-[0.98]` : `${theme.squareUnmarked} hover:scale-105 active:scale-95`)}
              ${getTextSizeClass(item)}
              font-bold select-none
            `}
                    >
                        {/* Corner check badge indicator for marked squares */}
                        {markedSquares[index] && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/95 flex items-center justify-center shadow-md animate-scale-in z-20">
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                        {/* Text always visible */}
                        <span className="relative z-10 opacity-90">{item}</span>
                    </div>
                ))}
            </div>

            {/* Instant Win */}
            {instantWin && (
                <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                        <span className="text-2xl filter drop-shadow hover:scale-110 transition-transform cursor-help">🌟</span>
                        <div>
                            <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1 opacity-80">Instant Win</h3>
                            <p className="text-amber-100 font-medium text-sm leading-snug">{instantWin}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Watermark/Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center opacity-10 text-[9px] tracking-[0.3em] font-black uppercase text-white pointer-events-none">
                Bingo
            </div>

            {children}
        </div>
    );
});

BingoCard.displayName = 'BingoCard';

export default BingoCard;

