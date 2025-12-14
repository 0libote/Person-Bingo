import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

const App = () => {
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [cardName, setCardName] = useState('Person Bingo');
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

  const checkForWin = useCallback((currentMarkedSquares) => {
    let hasWin = false;
    const size = gridSize;

    // Check Rows
    for (let i = 0; i < size; i++) {
      if (currentMarkedSquares.slice(i * size, (i + 1) * size).every(Boolean)) hasWin = true;
    }

    // Check Columns
    for (let i = 0; i < size; i++) {
      let colWin = true;
      for (let j = 0; j < size; j++) {
        if (!currentMarkedSquares[i + j * size]) colWin = false;
      }
      if (colWin) hasWin = true;
    }

    // Check Diagonals
    let diag1Win = true;
    let diag2Win = true;
    for (let i = 0; i < size; i++) {
      if (!currentMarkedSquares[i * size + i]) diag1Win = false;
      if (!currentMarkedSquares[(i + 1) * size - (i + 1)]) diag2Win = false;
    }
    if (diag1Win || diag2Win) hasWin = true;

    if (hasWin && !winner) {
      setWinner(true);
      triggerConfetti();
    } else if (!hasWin) {
      setWinner(false);
    }
  }, [gridSize, winner]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#ec4899', '#8b5cf6', '#3b82f6'] // Indigo, Pink, Violet, Blue
    });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const toggleSquare = (index) => {
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
    setIsSetupMode(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Improved Theme classes
  const bgClass = darkMode
    ? 'bg-slate-900'
    : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50';

  const textClass = darkMode ? 'text-slate-100' : 'text-slate-800';
  const secondaryTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

  const cardClass = darkMode
    ? 'bg-slate-800/80 border-slate-700 shadow-xl backdrop-blur-sm'
    : 'bg-white/80 border-white/50 shadow-xl backdrop-blur-sm';

  const inputClass = darkMode
    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
    : 'bg-white border-slate-200 text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

  const buttonClass = 'px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]';
  const primaryButtonClass = `${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`;
  const dangerButtonClass = `${buttonClass} bg-rose-500 text-white hover:bg-rose-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2`;
  const secondaryButtonClass = `${buttonClass} ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'} focus:ring-2 focus:ring-slate-400 focus:ring-offset-2`;

  const gridSquareClass = (isMarked) => `
    aspect-square relative group rounded-xl transition-all duration-200 cursor-pointer border-2 flex items-center justify-center p-2 text-center text-sm font-medium
    ${isMarked
      ? 'bg-indigo-500 border-indigo-500 text-white shadow-indigo-500/30 shadow-lg scale-[0.98]'
      : `${darkMode ? 'bg-slate-700/50 border-slate-600 hover:border-indigo-500/50 hover:bg-slate-700' : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'} shadow-sm hover:shadow-md`
    }
  `;

  return (
    <div className={`min-h-screen ${bgClass} py-8 px-4 transition-colors duration-500 font-sans`}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex justify-between items-center bg-transparent">
          <div>
            <h1 className={`text-4xl font-extrabold tracking-tight ${textClass} mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500`}>
              {isSetupMode ? 'Setup Bingo' : cardName}
            </h1>
            {!isSetupMode && <p className={`text-sm ${secondaryTextClass}`}>Click squares to mark them</p>}
          </div>

          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-md'} transition-all duration-200`}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </header>

        {isSetupMode ? (
          /* Setup Mode */
          <div className={`${cardClass} rounded-2xl p-8 border backdrop-filter`}>
            <div className="space-y-6">
              {/* General Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold ${secondaryTextClass} mb-2 uppercase tracking-wider`}>Card Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${inputClass}`}
                    placeholder="e.g. Office Buzzwords Bingo"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${secondaryTextClass} mb-2 uppercase tracking-wider`}>Grid Size: {gridSize}x{gridSize}</label>
                  <input
                    type="range"
                    min="3"
                    max="7"
                    value={gridSize}
                    onChange={(e) => setGridSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-3"
                  />
                  <div className={`flex justify-between text-xs mt-2 ${secondaryTextClass}`}>
                    <span>3x3</span>
                    <span>7x7</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${secondaryTextClass} mb-2 uppercase tracking-wider`}>Instant Win Condition</label>
                <input
                  type="text"
                  value={instantWin}
                  onChange={(e) => setInstantWin(e.target.value)}
                  placeholder="e.g., They arrive 15 minutes late"
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${inputClass}`}
                />
                <p className={`text-xs mt-2 ${secondaryTextClass}`}>A special condition for an instant victory!</p>
              </div>

              {/* Items Grid */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${textClass}`}>Grid Items</h2>
                  <button
                    onClick={() => {
                      const newItems = Array(gridSize * gridSize).fill('');
                      setItems(newItems);
                    }}
                    className={`text-sm text-indigo-500 hover:text-indigo-600 font-medium`}
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center group">
                      <span className={`w-8 text-sm font-mono ${secondaryTextClass} group-focus-within:text-indigo-500`}>{(index + 1).toString().padStart(2, '0')}</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        placeholder={`Square ${index + 1}`}
                        className={`flex-1 px-4 py-2 rounded-lg border outline-none transition-all ${inputClass}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={startGame}
                  disabled={items.filter(item => item.trim() !== '').length < gridSize * gridSize}
                  className={`${primaryButtonClass} w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {items.filter(item => item.trim() !== '').length < gridSize * gridSize
                    ? `Fill all ${gridSize * gridSize} items`
                    : 'Create Card & Play'
                  }
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Game Mode */
          <div className="space-y-6">
            <div className={`${cardClass} rounded-2xl p-6 md:p-8 border`}>
              {winner && (
                <div className="mb-6 p-4 bg-green-100 border-green-400 border text-green-700 rounded-xl flex items-center justify-center animate-bounce">
                  <span className="text-xl font-bold">🎉 BINGO! We have a winner! 🎉</span>
                </div>
              )}

              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
              >
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={gridSquareClass(markedSquares[index])}
                    onClick={() => toggleSquare(index)}
                  >
                    <span className={markedSquares[index] ? 'line-through opacity-90' : ''}>
                      {item || <span className="text-slate-300 italic">Empty</span>}
                    </span>

                  </div>
                ))}
              </div>

              {instantWin && (
                <div className={`mt-8 p-4 rounded-xl border-l-4 border-amber-400 ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wide text-amber-500 mb-1`}>Instant Win Condition</h3>
                  <p className={`text-lg font-medium ${darkMode ? 'text-amber-100' : 'text-amber-800'}`}>
                    {instantWin}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowResetConfirm(true)}
                className={secondaryButtonClass}
              >
                Edit / Reset Card
              </button>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className={`${cardClass} rounded-2xl p-8 max-w-sm w-full border transform transition-all scale-100`}>
              <h3 className={`text-2xl font-bold ${textClass} mb-2`}>Reset Everything?</h3>
              <p className={`${secondaryTextClass} mb-6`}>
                This will clear your current game progress and take you back to the setup screen.
              </p>
              <div className="flex gap-4 flex-col-reverse md:flex-row">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className={`${secondaryButtonClass} w-full justify-center md:w-auto`}
                >
                  Cancel
                </button>
                <button
                  onClick={resetCard}
                  className={`${dangerButtonClass} w-full justify-center md:w-auto`}
                >
                  Reset Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
