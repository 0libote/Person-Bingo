import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const App = () => {
  // --- STATE ---
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [cardName, setCardName] = useState('My Bingo Card');
  const [gridSize, setGridSize] = useState(3); // Default to 3x3
  const [items, setItems] = useState(Array(9).fill('')); // 3x3 = 9
  const [markedSquares, setMarkedSquares] = useState(Array(9).fill(false));
  const [instantWin, setInstantWin] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [winner, setWinner] = useState(false);
  const [personImage, setPersonImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const cardRef = useRef(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('person-bingo-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCardName(data.cardName || 'My Bingo Card');
        setGridSize(data.gridSize || 3);
        setItems(data.items || Array(9).fill(''));
        setMarkedSquares(data.markedSquares || Array(9).fill(false));
        setInstantWin(data.instantWin || '');
        setPersonImage(data.personImage || null);
        setIsSetupMode(data.isSetupMode ?? true);
        setZoomLevel(data.zoomLevel || 1);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    const data = {
      cardName,
      gridSize,
      items,
      markedSquares,
      instantWin,
      personImage,
      isSetupMode,
      zoomLevel
    };
    localStorage.setItem('person-bingo-data', JSON.stringify(data));
  }, [cardName, gridSize, items, markedSquares, instantWin, personImage, isSetupMode, zoomLevel]);

  // --- GRID SIZE HANDLER ---
  const updateGridSize = (newSize) => {
    const size = parseInt(newSize);
    setGridSize(size);
    const totalSquares = size * size;

    // Resize items array, preserving existing content where possible
    setItems(prev => {
      const newItems = Array(totalSquares).fill('');
      prev.forEach((item, index) => {
        if (index < totalSquares) newItems[index] = item;
      });
      return newItems;
    });

    setMarkedSquares(prev => {
      const newMarked = Array(totalSquares).fill(false);
      prev.forEach((marked, index) => {
        if (index < totalSquares) newMarked[index] = marked;
      });
      return newMarked;
    });
    setWinner(false); // Reset win state on resize
  };

  // --- GAME LOGIC ---
  const checkForWin = useCallback((currentMarkedSquares) => {
    const activeIndices = items.map((item, index) => item.trim() !== '' ? index : -1).filter(i => i !== -1);
    if (activeIndices.length === 0) return;
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
      const colors = ['#8b5cf6', '#ec4899', '#ffffff'];
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const toggleSquare = (index) => {
    if (!items[index].trim()) return;
    const newMarkedSquares = [...markedSquares];
    newMarkedSquares[index] = !newMarkedSquares[index];
    setMarkedSquares(newMarkedSquares);
    checkForWin(newMarkedSquares);
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  // --- IMAGE & IMPORT/EXPORT ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPersonImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const exportData = () => {
    const data = { cardName, gridSize, items, markedSquares, instantWin, personImage };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8" });
    saveAs(blob, "bingo-preset.json");
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setCardName(data.cardName || cardName);
          updateGridSize(data.gridSize || gridSize); // Use helper to resize arrays correctly
          // Need to set items/marked after updateGridSize logic runs, or just override it directly if we trust the import
          setTimeout(() => {
            setItems(data.items || Array(data.gridSize * data.gridSize).fill(''));
            setMarkedSquares(data.markedSquares || Array(data.gridSize * data.gridSize).fill(false));
            setInstantWin(data.instantWin || '');
            setPersonImage(data.personImage || null);
          }, 0);
        } catch (err) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadCardImage = async () => {
    if (cardRef.current) {
      try {
        // Temporarily enhance visibility for capture
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#0f172a', // zinc-950
          scale: 2, // High res
          useCORS: true
        });
        canvas.toBlob((blob) => {
          saveAs(blob, `${cardName.replace(/\s+/g, '-')}.png`);
        });
      } catch (err) {
        console.error(err);
        alert("Failed to generate image.");
      }
    }
  };

  const resetGame = () => {
    setMarkedSquares(Array(gridSize * gridSize).fill(false));
    setWinner(false);
    setShowResetConfirm(false);
  };

  const fullReset = () => {
    setIsSetupMode(true);
    resetGame();
  };

  // --- UTILS ---
  const getTextSizeClass = (text) => {
    const len = text.length;
    if (len < 5) return 'text-2xl md:text-3xl';
    if (len < 15) return 'text-lg md:text-xl';
    if (len < 30) return 'text-base md:text-lg';
    return 'text-xs md:text-sm';
  };

  // --- THEME ---
  // Forced Dark Mode Theme
  const theme = {
    appBg: 'bg-zinc-950',
    textMain: 'text-white',
    textMuted: 'text-zinc-400',
    cardBg: 'bg-zinc-900/50',
    cardBorder: 'border-zinc-800',
    inputBg: 'bg-zinc-900',
    inputBorder: 'border-zinc-700',
    primary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20',
    squareUnmarked: 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-violet-500/50 cursor-pointer',
    squareMarked: 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/40 cursor-pointer',
    squareEmpty: 'bg-zinc-950 border-zinc-900 text-zinc-700 opacity-50 cursor-default',
  };

  return (
    <div className={`min-h-screen ${theme.appBg} text-white font-sans selection:bg-violet-500/30 overflow-x-hidden`}>

      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20 bg-violet-900/40 animate-float" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[130px] opacity-20 bg-fuchsia-900/40 animate-pulse-slow" />
      </div>

      {/* Main UI Container */}
      <div
        className="relative z-10 min-h-screen flex flex-col items-center p-6 transition-transform duration-200 ease-out"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
      >

        {/* HEADER */}
        <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-6">
            {personImage && (
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-violet-500/30 shadow-2xl">
                <img src={personImage} alt="Person" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                {cardName || 'Bingo'}
              </h1>
              {winner && <p className="text-xl font-bold text-fuchsia-400 mt-2 animate-bounce">🏆 COMPLETE BLACKOUT! 🏆</p>}
            </div>
          </div>

          {/* Controls Bar */}
          <div className={`flex flex-wrap items-center gap-3 p-2 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} backdrop-blur-md`}>
            <div className="flex items-center px-4 border-r border-zinc-700/50">
              <span className="text-xs font-bold text-zinc-500 uppercase mr-2">Zoom</span>
              <input
                type="range" min="0.5" max="1.3" step="0.1"
                value={zoomLevel} onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>

            <label className="p-2 hover:bg-zinc-700/50 rounded-lg cursor-pointer transition-colors" title="Upload Image">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </label>

            {!isSetupMode && (
              <button onClick={downloadCardImage} className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors" title="Download PNG">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </button>
            )}

            <div className="h-6 w-px bg-zinc-700/50 mx-1"></div>

            <div className="relative group">
              <button className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors" title="Import/Export">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={exportData} className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-sm text-zinc-300">Save Preset (JSON)</button>
                <label className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-sm text-zinc-300 block cursor-pointer">
                  Load Preset (JSON)
                  <input type="file" accept=".json" className="hidden" onChange={importData} />
                </label>
              </div>
            </div>

            <button
              onClick={() => setIsSetupMode(!isSetupMode)}
              className={`ml-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSetupMode ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              {isSetupMode ? 'Play Game' : 'Edit Board'}
            </button>
          </div>
        </header>

        {isSetupMode ? (
          /* --- EDIT MODE --- */
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Config Panel */}
            <div className={`lg:col-span-1 p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} backdrop-blur-xl h-fit`}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Settings
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Card Title</label>
                  <input
                    type="text" value={cardName} onChange={(e) => setCardName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.inputBg} ${theme.inputBorder} focus:border-violet-500`}
                    placeholder="Name..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Grid Size</label>
                    <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">{gridSize} × {gridSize}</span>
                  </div>
                  <input
                    type="range" min="3" max="7" value={gridSize} onChange={(e) => updateGridSize(e.target.value)}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Instant Win Condition</label>
                  <textarea
                    value={instantWin} onChange={(e) => setInstantWin(e.target.value)} rows={3}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none ${theme.inputBg} ${theme.inputBorder} focus:border-violet-500`}
                    placeholder="E.g. They spill coffee..."
                  />
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setItems(Array(gridSize * gridSize).fill(''))} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm font-medium transition-colors">Clear Grid</button>
                    <button onClick={() => { if (confirm('Clear Everything?')) { setItems(Array(gridSize * gridSize).fill('')); setCardName(''); setInstantWin(''); setPersonImage(null) } }} className="px-4 py-2 rounded-lg bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 text-sm font-medium transition-colors">Reset All</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Inputs */}
            <div className="lg:col-span-2">
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {items.map((item, index) => (
                  <div key={index} className="aspect-square relative group">
                    <span className="absolute top-2 left-2 text-[10px] text-zinc-600 pointer-events-none z-10">{index + 1}</span>
                    <textarea
                      value={item}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      className={`w-full h-full p-2 pt-6 rounded-xl border outline-none transition-all resize-none text-center flex items-center justify-center text-sm md:text-base leading-tight ${theme.inputBg} ${theme.inputBorder} focus:border-violet-500 focus:ring-1 focus:ring-violet-500`}
                      placeholder="..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* --- PLAY MODE --- */
          <div className="w-full max-w-4xl flex flex-col items-center animate-scale-in">

            <div
              ref={cardRef}
              id="bingo-card"
              className={`relative w-full p-8 md:p-12 rounded-[2.5rem] ${theme.cardBg} border ${theme.cardBorder} shadow-2xl backdrop-blur-3xl`}
            >
              {/* Header for Screenshot Logic (Invisible mostly but good structure) */}
              <div className="mb-6 text-center md:text-left flex items-center gap-6 opacity-90">
                {personImage && <img src={personImage} className="w-16 h-16 rounded-full object-cover border-2 border-violet-500/50" alt="" />}
                <h2 className="text-3xl font-bold text-white tracking-tight">{cardName}</h2>
              </div>

              <div
                className="grid gap-4 md:gap-5"
                style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
              >
                {items.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => toggleSquare(index)}
                    className={`
                                    aspect-square relative rounded-2xl transition-all duration-300 flex items-center justify-center p-2 text-center group
                                    ${!item.trim() ? theme.squareEmpty : (markedSquares[index] ? theme.squareMarked : theme.squareUnmarked)}
                                    ${getTextSizeClass(item)}
                                    font-semibold select-none shadow-md
                                `}
                  >
                    {markedSquares[index] && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <svg className="w-3/4 h-3/4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                      </div>
                    )}
                    <span className={markedSquares[index] ? 'opacity-100' : 'opacity-90'}>{item}</span>
                  </div>
                ))}
              </div>

              {instantWin && (
                <div className="mt-8 pt-6 border-t border-zinc-800">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-900/10 border border-amber-900/30">
                    <span className="text-xl">🌟</span>
                    <div>
                      <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Instant Win</h3>
                      <p className="text-amber-200 font-medium">{instantWin}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Clear Markers
              </button>
              {winner && (
                <button
                  onClick={triggerConfetti}
                  className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg shadow-violet-500/40 animate-pulse"
                >
                  Celebrate Again! 🎉
                </button>
              )}
            </div>

          </div>
        )}

        {/* Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Clear Markers?</h3>
              <p className="text-zinc-400 mb-6">This will uncheck all boxes. The layout will be saved.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800">Cancel</button>
                <button onClick={resetGame} className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
