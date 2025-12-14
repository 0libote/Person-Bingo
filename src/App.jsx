import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

const App = () => {
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [cardName, setCardName] = useState('My Bingo Card');
  const [gridSize, setGridSize] = useState(5);
  const [items, setItems] = useState(Array(25).fill(''));
  const [markedSquares, setMarkedSquares] = useState(Array(25).fill(false));
  const [instantWin, setInstantWin] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [winner, setWinner] = useState(false);

  // Initialize items array when grid size changes
  useEffect(() => {
    const totalSquares = gridSize * gridSize;
    setItems(prev => {
      const newItems = Array(totalSquares).fill('');
      prev.forEach((item, index) => {
        if (index < totalSquares) {
          newItems[index] = item;
        }
      });
      return newItems;
    });
    setMarkedSquares(prev => {
      const newMarked = Array(totalSquares).fill(false);
      prev.forEach((marked, index) => {
        if (index < totalSquares) {
          newMarked[index] = marked;
        }
      });
      return newMarked;
    });
    setWinner(false);
  }, [gridSize]);

  // BLACKOUT WIN LOGIC
  const checkForWin = useCallback((currentMarkedSquares) => {
    // Filter out items that are empty (if user didn't fill entire grid)
    // We only require marking squares that actually have content
    const activeIndices = items.map((item, index) => item.trim() !== '' ? index : -1).filter(i => i !== -1);

    if (activeIndices.length === 0) return; // No items to mark

    const allActiveMarked = activeIndices.every(index => currentMarkedSquares[index]);

    if (allActiveMarked && !winner) {
      setWinner(true);
      triggerConfetti();
    } else if (!allActiveMarked) {
      setWinner(false);
    }
  }, [items, winner]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#ec4899', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#ec4899', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const toggleSquare = (index) => {
    // Only allow marking if there is text? Optional, but good UX.
    // For now allow marking any to be safe.
    const newMarkedSquares = [...markedSquares];
    newMarkedSquares[index] = !newMarkedSquares[index];
    setMarkedSquares(newMarkedSquares);
    checkForWin(newMarkedSquares);
  };

  const resetCard = () => {
    setIsSetupMode(true);
    setShowResetConfirm(false);
    setWinner(false);
    setMarkedSquares(Array(gridSize * gridSize).fill(false));
  };

  const startGame = () => {
    if (items.filter(i => i.trim()).length > 0) {
      setIsSetupMode(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // --- PREMIUM THEME SYSTEM ---
  const theme = darkMode ? {
    appBg: 'bg-zinc-950',
    textMain: 'text-white',
    textMuted: 'text-zinc-400',
    cardBg: 'bg-zinc-900/50',
    cardBorder: 'border-zinc-800',
    inputBg: 'bg-zinc-900',
    inputBorder: 'border-zinc-700',
    primary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20',
    squareUnmarked: 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-violet-500/50',
    squareMarked: 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/40',
  } : {
    appBg: 'bg-[#FDFDFE]', // Very subtle off-white
    textMain: 'text-zinc-900',
    textMuted: 'text-zinc-500',
    cardBg: 'bg-white/70',
    cardBorder: 'border-zinc-200/50',
    inputBg: 'bg-white',
    inputBorder: 'border-zinc-200',
    primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/30',
    squareUnmarked: 'bg-white border-zinc-200 text-zinc-700 hover:border-violet-300 hover:shadow-md',
    squareMarked: 'bg-violet-600 border-violet-500 text-white shadow-xl shadow-violet-500/30',
  };

  return (
    <div className={`min-h-screen ${theme.appBg} transition-colors duration-500 font-sans selection:bg-violet-500/30`}>
      {/* Abstract Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 animate-float ${darkMode ? 'bg-violet-900' : 'bg-violet-200'}`} />
        <div className={`absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20 animate-pulse-slow ${darkMode ? 'bg-fuchsia-900' : 'bg-fuchsia-200'}`} />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12 flex flex-col min-h-screen">

        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex flex-col">
            <h1 className={`text-5xl font-extrabold tracking-tight ${theme.textMain} mb-2`}>
              {isSetupMode ? 'Create Your Board' : cardName}
            </h1>
            {!isSetupMode && !winner && <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
              </span>
              <p className={`text-sm font-medium ${theme.textMuted} tracking-wide uppercase`}>Blackout to Win</p>
            </div>}
            {winner && <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">COMPLETE BLACKOUT!</p>
            </div>}
          </div>

          <button
            onClick={toggleDarkMode}
            className={`p-4 rounded-2xl ${darkMode ? 'bg-zinc-900 text-yellow-400 border border-zinc-800' : 'bg-white text-zinc-600 shadow-lg shadow-zinc-200/50'} hover:scale-105 active:scale-95 transition-all duration-300`}
          >
            {darkMode ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
        </header>

        {/* Content */}
        <div className={`flex-1 flex flex-col ${isSetupMode ? '' : 'justify-center'}`}>

          {isSetupMode ? (
            /* --- SETUP MODE --- */
            <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.cardBorder} rounded-3xl p-10 shadow-2xl transition-all duration-500`}>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Col: Config */}
                <div className="lg:col-span-4 space-y-8">
                  <div>
                    <label className={`block text-xs font-bold ${theme.textMuted} uppercase tracking-wider mb-3`}>Project Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className={`w-full px-5 py-4 rounded-2xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all font-medium text-lg`}
                      placeholder="e.g. Sales Team Bingo"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className={`block text-xs font-bold ${theme.textMuted} uppercase tracking-wider`}>Grid Size</label>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}>{gridSize} × {gridSize}</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="7"
                      value={gridSize}
                      onChange={(e) => setGridSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold ${theme.textMuted} uppercase tracking-wider mb-3`}>Instant Win (Optional)</label>
                    <textarea
                      value={instantWin}
                      onChange={(e) => setInstantWin(e.target.value)}
                      rows={3}
                      className={`w-full px-5 py-4 rounded-2xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none`}
                      placeholder="Enter a rare condition that grants immediate victory..."
                    />
                  </div>

                  <button
                    onClick={startGame}
                    disabled={items.filter(item => item.trim() !== '').length < gridSize * gridSize}
                    className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wide shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${theme.primary} disabled:opacity-50 disabled:cursor-not-allowed mt-4`}
                  >
                    Launch Game
                  </button>
                </div>

                {/* Right Col: Grid Editor */}
                <div className="lg:col-span-8">
                  <div className="flex justify-between items-end mb-6">
                    <label className={`block text-xs font-bold ${theme.textMuted} uppercase tracking-wider`}>Grid Content</label>
                    <button
                      onClick={() => setItems(Array(gridSize * gridSize).fill(''))}
                      className={`text-xs font-bold text-violet-500 hover:text-violet-400 transition-colors uppercaseTracking-wider`}
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid gap-3 max-h-[500px] overflow-y-auto custom-scrollbar p-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                    {items.map((item, index) => (
                      <div key={index} className="relative group">
                        <span className={`absolute top-3 left-3 text-[10px] font-bold ${theme.textMuted} pointer-events-none`}>{(index + 1).toString().padStart(2, '0')}</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(index, e.target.value)}
                          className={`w-full h-24 px-4 pt-6 pb-2 rounded-2xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-sm font-medium text-center break-words`}
                          placeholder="..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- GAME MODE --- */
            <div className="flex flex-col items-center w-full">

              <div className={`relative ${theme.cardBg} backdrop-blur-xl border ${theme.cardBorder} rounded-[2rem] p-6 md:p-10 shadow-2xl transition-all duration-500 w-full max-w-2xl`}>

                <div
                  className="grid gap-4 md:gap-5 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                  }}
                >
                  {items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => toggleSquare(index)}
                      className={`
                                aspect-square relative rounded-2xl transition-all duration-300 flex items-center justify-center p-3 md:p-4 text-center group
                                ${markedSquares[index] ? theme.squareMarked : theme.squareUnmarked}
                                ${!item.trim() ? 'opacity-50 cursor-default' : 'cursor-pointer'}
                            `}
                    >
                      {markedSquares[index] && (
                        <div className="absolute top-2 right-2 text-white/40">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </div>
                      )}
                      <span className={`text-xs md:text-sm font-semibold leading-tight break-words select-none ${markedSquares[index] ? 'opacity-100 transform scale-105' : 'opacity-90 group-hover:scale-105 transition-transform'}`}>
                        {item}
                      </span>
                    </button>
                  ))}
                </div>

                {instantWin && (
                  <div className="mt-8 pt-8 border-t border-zinc-200/50 dark:border-zinc-700/50">
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50 border-amber-200/50'} flex gap-4 items-start`}>
                      <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      </div>
                      <div>
                        <h3 className={`text-xs font-bold uppercase tracking-wider text-amber-500 mb-1`}>Instant Win Condition</h3>
                        <p className={`font-medium ${darkMode ? 'text-amber-100' : 'text-amber-900'}`}>{instantWin}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowResetConfirm(true)}
                className={`mt-10 group flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${theme.textMuted} hover:${theme.textMain} hover:bg-zinc-100 dark:hover:bg-zinc-800`}
              >
                <svg className="w-4 h-4 transition-transform group-hover:-rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                <span>Reset or Edit Board</span>
              </button>
            </div>
          )}

          {/* Reset Confirmation Modal */}
          {showResetConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowResetConfirm(false)} />
              <div className={`relative ${theme.cardBg} backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-sm w-full border ${theme.cardBorder} transform scale-100 transition-all`}>
                <h3 className={`text-2xl font-bold ${theme.textMain} mb-3`}>Start Over?</h3>
                <p className={`${theme.textMuted} mb-8 leading-relaxed`}>
                  This will reset your current board and marking progress.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className={`px-4 py-3 rounded-xl font-bold text-sm ${darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={resetCard}
                    className="px-4 py-3 rounded-xl font-bold text-sm bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all"
                  >
                    Yes, Reset
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;
