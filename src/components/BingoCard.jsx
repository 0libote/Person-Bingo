import React, { forwardRef } from 'react';

const BingoCard = forwardRef(({ card, theme, zoomLevel, toggleSquare, markedSquares, children }, ref) => {
    const { items, gridSize, personImage, cardName, instantWin, showTitle = true, showImage = true } = card;

    // Font size calculator (moved from App.jsx)
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
            className={`relative w-full max-w-[600px] p-8 md:p-12 rounded-[2.5rem] ${theme.cardBg} border ${theme.cardBorder} shadow-2xl backdrop-blur-3xl transition-transform duration-200 ease-out`}
            style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center'
            }}
        >
            {/* Header */}
            {(showImage || showTitle) && (
                <div className="mb-6 text-center md:text-left flex items-center gap-6 opacity-90 relative z-10">
                    {showImage && personImage && (
                        <img
                            src={personImage}
                            className="w-16 h-16 rounded-full object-cover border-2 border-violet-500/50 block"
                            alt="Avatar"
                        />
                    )}
                    {showTitle && (
                        <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
                            {cardName}
                        </h2>
                    )}
                </div>
            )}

            {/* Grid */}
            <div
                className="grid gap-4 md:gap-5 relative z-10"
                style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => toggleSquare(index)}
                        className={`
              aspect-square relative rounded-2xl transition-all duration-300 flex items-center justify-center p-2 text-center group
              ${!item?.trim() ? theme.squareEmpty : (markedSquares[index] ? theme.squareMarked : theme.squareUnmarked)}
              ${getTextSizeClass(item)}
              font-semibold select-none shadow-md
            `}
                    >
                        {markedSquares[index] && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 animate-scale-in">
                                <svg className="w-3/4 h-3/4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                            </div>
                        )}
                        <span className={markedSquares[index] ? 'opacity-100' : 'opacity-90'}>{item}</span>
                    </div>
                ))}
            </div>

            {/* Instant Win */}
            {instantWin && (
                <div className="mt-8 pt-6 border-t border-zinc-800 relative z-10">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-900/10 border border-amber-900/30">
                        <span className="text-xl">🌟</span>
                        <div>
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Instant Win</h3>
                            <p className="text-amber-200 font-medium text-sm">{instantWin}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Watermark/Footer (Optional for polished look) */}
            <div className="mt-4 text-center opacity-30 text-[10px] tracking-widest font-mono uppercase text-white/50">
                Person Bingo
            </div>

            {children}
        </div>
    );
});

BingoCard.displayName = 'BingoCard';

export default BingoCard;
