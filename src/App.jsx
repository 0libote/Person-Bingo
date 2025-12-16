import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import BingoCard from './components/BingoCard';
import SettingsModal from './components/SettingsModal';
import CardSwitcher from './components/CardSwitcher';

const App = () => {
  // --- STATE ---
  const [cards, setCards] = useState([{
    id: 1,
    name: 'My Bingo Card',
    gridSize: 3,
    items: Array(9).fill(''),
    markedSquares: Array(9).fill(false),
    instantWin: '',
    personImage: null,
    showTitle: true,
    showImage: true,
    imageStyle: 'avatar',
    themeName: 'cyber',
    customColors: { start: '#8b5cf6', end: '#ec4899' }
  }]);
  const [activeCardId, setActiveCardId] = useState(1);
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [winner, setWinner] = useState(false);

  // History for Undo
  const [history, setHistory] = useState([]);

  // App-wide View State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const cardRef = useRef(null);

  const activeCard = cards.find(c => c.id === activeCardId) || cards[0];

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('person-bingo-data-v3');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCards(data.cards || cards);
        setActiveCardId(data.activeCardId || 1);
        setIsSetupMode(data.isSetupMode ?? true);
        setZoomLevel(data.zoomLevel || 1);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    const data = { cards, activeCardId, isSetupMode, zoomLevel };
    localStorage.setItem('person-bingo-data-v3', JSON.stringify(data));
  }, [cards, activeCardId, isSetupMode, zoomLevel]);

  // --- CARD HELPERS ---
  const updateActiveCard = (updates, saveToHistory = false) => {
    if (saveToHistory) {
        setHistory(prev => [...prev.slice(-10), { items: activeCard.items, markedSquares: activeCard.markedSquares }]);
    }
    setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, ...updates } : c));
  };

  const undoLastAction = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    updateActiveCard(lastState, false);
    setWinner(false); // Reset winner on undo just in case
  };

  const handleAddCard = () => {
    const newId = Date.now();
    setCards([...cards, {
      id: newId,
      name: 'New Card',
      gridSize: 3,
      items: Array(9).fill(''),
      markedSquares: Array(9).fill(false),
      instantWin: '',
      personImage: null,
      showTitle: true,
      showImage: true,
      imageStyle: 'avatar',
      themeName: 'cyber',
      customColors: { start: '#8b5cf6', end: '#ec4899' }
    }]);
    setActiveCardId(newId);
    setIsSetupMode(true);
  };

  const handleDeleteCard = (id) => {
    if (cards.length <= 1) return;
    const newCards = cards.filter(c => c.id !== id);
    setCards(newCards);
    if (activeCardId === id) setActiveCardId(newCards[0].id);
  };

  const updateGridSize = (newSize) => {
    const size = parseInt(newSize);
    const totalSquares = size * size;

    setCards(prev => prev.map(c => {
      if (c.id !== activeCardId) return c;
      const newItems = Array(totalSquares).fill('');
      c.items.forEach((item, index) => { if (index < totalSquares) newItems[index] = item; });
      const newMarked = Array(totalSquares).fill(false);
      c.markedSquares.forEach((marked, index) => { if (index < totalSquares) newMarked[index] = marked; });
      return { ...c, gridSize: size, items: newItems, markedSquares: newMarked };
    }));
    setWinner(false);
  };

  const handleShuffle = () => {
    if (!confirm('Shuffle items? This will reset marks.')) return;
    const items = [...activeCard.items];
    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    updateActiveCard({ items, markedSquares: Array(activeCard.items.length).fill(false) }, true);
    setWinner(false);
  };

  const handleItemChange = (index, value) => {
    // No history for typing every character
    const newItems = [...activeCard.items];
    newItems[index] = value;
    updateActiveCard({ items: newItems });
  };

  // --- GAME LOGIC ---
  const checkForWin = useCallback((currentMarked, currentItems) => {
    const size = activeCard.gridSize;
    let isWinner = false;

    // Check rows
    for (let i = 0; i < size; i++) {
        if (currentMarked.slice(i * size, (i + 1) * size).every(Boolean)) isWinner = true;
    }
    // Check cols
    for (let i = 0; i < size; i++) {
        let colWin = true;
        for (let j = 0; j < size; j++) {
            if (!currentMarked[i + j * size]) colWin = false;
        }
        if (colWin) isWinner = true;
    }
    
    // Check diagonals
    let d1 = true, d2 = true;
    for(let i=0; i<size; i++) {
        if(!currentMarked[i * size + i]) d1 = false;
        if(!currentMarked[i * size + (size - 1 - i)]) d2 = false;
    }
    if (d1 || d2) isWinner = true;

    // Only count as win if there are actual items
    const hasItems = currentItems.some(i => i.trim() !== '');

    if (isWinner && hasItems && !winner) {
      setWinner(true);
      triggerConfetti();
    } else if (!isWinner) {
      setWinner(false);
    }
  }, [winner, activeCard.gridSize]);

  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      const colors = ['#8b5cf6', '#ec4899', '#38bdf8'];
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const toggleSquare = (index) => {
    if (isSetupMode || !activeCard.items[index].trim()) return;

    const newMarked = [...activeCard.markedSquares];
    newMarked[index] = !newMarked[index];

    updateActiveCard({ markedSquares: newMarked }, true); // Save processing to history
    checkForWin(newMarked, activeCard.items);
  };

  // --- IMAGE & EXPORT (FIXED) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateActiveCard({ personImage: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const processCapture = async () => {
    if (!cardRef.current) return null;
    
    // 1. Clone the node to avoid messing with current view
    const original = cardRef.current;
    const clone = original.cloneNode(true);
    
    // 2. Style the clone to be flat and clean
    clone.style.transform = 'none';
    clone.style.position = 'fixed';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.zIndex = '-1';
    clone.style.borderRadius = '0'; // Optional: sharp corners for better export? No, keep rounded.
    
    // Append to body temporarily
    document.body.appendChild(clone);
    
    // 3. Wait for images to load explicitly if needed (usually handled by browser cache for clones)
    // 4. Capture
    try {
        const canvas = await html2canvas(clone, {
          backgroundColor: null,
          scale: 3, // High Res
          useCORS: true,
          logging: false,
          allowTaint: true
        });
        document.body.removeChild(clone);
        return canvas;
    } catch (err) {
        document.body.removeChild(clone);
        throw err;
    }
  };

  const downloadCardImage = async () => {
    try {
      const canvas = await processCapture();
      if(canvas) {
        canvas.toBlob((blob) => {
          saveAs(blob, `${activeCard.name.replace(/\s+/g, '-')}.png`);
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate image. Please try again.");
    }
  };

  const copyCardImage = async () => {
    try {
      const canvas = await processCapture();
      if(canvas) {
        canvas.toBlob(blob => {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('Copied to clipboard!');
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to copy image. Browser may not support this.');
    }
  };

  // --- THEME & UI ---
  const getTheme = (themeName) => {
    switch (themeName) {
      case 'dark': return {
        cardBg: 'bg-zinc-900',
        cardBorder: 'border-zinc-800',
        squareUnmarked: 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-white/20',
        squareMarked: 'bg-white text-black border-white shadow-white/20',
        squareEmpty: 'bg-zinc-900/50 border-transparent text-zinc-800',
      };
      case 'custom': return {
        cardBg: 'bg-zinc-900/80',
        cardBorder: 'border-zinc-800',
        squareUnmarked: 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-white/20',
        squareMarked: 'text-white shadow-xl border-white/20 bg-[linear-gradient(135deg,var(--theme-gradient-start),var(--theme-gradient-end))]',
        squareEmpty: 'bg-zinc-950 border-zinc-900 text-zinc-700 opacity-50',
      };
      default: // cyber
        return {
          cardBg: 'bg-zinc-900/50',
          cardBorder: 'border-zinc-800',
          squareUnmarked: 'bg-zinc-900/50 border-white/5 text-zinc-300 hover:border-violet-500/50 hover:bg-violet-500/10',
          squareMarked: 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/40',
          squareEmpty: 'bg-transparent border-white/5 text-zinc-700/50',
        };
    }
  };

  const currentThemeName = activeCard.themeName || 'cyber';
  const theme = getTheme(currentThemeName);
  const customStyle = currentThemeName === 'custom' ? {
    '--theme-gradient-start': activeCard.customColors?.start || '#8b5cf6',
    '--theme-gradient-end': activeCard.customColors?.end || '#ec4899'
  } : {};

  return (
    <div className={`min-h-screen text-white overflow-x-hidden`} style={customStyle}>
      <div className="relative z-10 min-h-screen flex flex-col items-center p-4 md:p-8">

        {/* HEADER TOOLBAR */}
        <header className="fixed top-4 md:top-6 z-50 p-2 rounded-2xl glass-panel animate-slide-up bg-black/50 backdrop-blur-md border-white/10 flex items-center gap-3">
            <h1 className="hidden md:block text-sm font-bold pl-3 pr-2 opacity-80 uppercase tracking-widest">{activeCard.name}</h1>
            
            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

            <CardSwitcher
                cards={cards} activeCardId={activeCardId}
                onSwitch={setActiveCardId} onAdd={handleAddCard} onDelete={handleDeleteCard}
            />

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Settings">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>

            {!isSetupMode && (
                <>
                 <button onClick={downloadCardImage} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Download Image">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </button>
                <div className="ml-2 pl-2 border-l border-white/10 flex gap-2">
                    <button onClick={handleShuffle} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Shuffle">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    {history.length > 0 && (
                        <button onClick={undoLastAction} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Undo">
                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                        </button>
                    )}
                </div>
                </>
            )}

            <button
              onClick={() => setIsSetupMode(!isSetupMode)}
              className={`ml-3 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${isSetupMode ? 'bg-violet-600 text-white shadow-violet-500/25 ring-2 ring-violet-500/50' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'}`}
            >
              {isSetupMode ? 'Play' : 'Edit'}
            </button>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="w-full max-w-7xl pt-24 pb-12 flex flex-col items-center">
            
        {isSetupMode ? (
          /* --- EDIT MODE --- */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-fade-in">
            {/* Sidebar Config */}
            <div className={`lg:col-span-4 p-6 rounded-3xl glass-panel space-y-6`}>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Identity</label>
                <div className="flex gap-4">
                     <label className="relative group cursor-pointer w-20 h-20 shrink-0">
                        <div className="w-full h-full rounded-2xl bg-zinc-800 overflow-hidden border border-zinc-700 group-hover:border-violet-500 transition-colors">
                             {activeCard.personImage ? (
                                <img src={activeCard.personImage} className="w-full h-full object-cover" />
                             ) : (
                                <div className="flex items-center justify-center h-full text-zinc-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                             )}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                     </label>
                    <div className="flex-1 space-y-2">
                        <input
                            type="text" value={activeCard.name} onChange={(e) => updateActiveCard({ name: e.target.value })}
                            className={`w-full px-4 py-2 rounded-xl bg-zinc-950/50 border border-zinc-800 focus:border-violet-500 outline-none`}
                            placeholder="Bingo Title..."
                        />
                         <input
                            type="text" value={activeCard.instantWin} onChange={(e) => updateActiveCard({ instantWin: e.target.value })}
                            className={`w-full px-4 py-2 rounded-xl bg-zinc-950/50 border border-zinc-800 focus:border-violet-500 outline-none text-sm`}
                            placeholder="Instant Win Condition..."
                        />
                    </div>
                </div>
              </div>

              <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Grid Size: {activeCard.gridSize}x{activeCard.gridSize}</label>
                  </div>
                  <input
                    type="range" min="3" max="7" value={activeCard.gridSize} onChange={(e) => updateGridSize(e.target.value)}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <button onClick={() => updateActiveCard({ ...activeCard, items: Array(activeCard.gridSize * activeCard.gridSize).fill('') })}
                  className="btn-secondary text-xs">Clear Grid</button>
                <button onClick={() => setShowResetConfirm(true)}
                  className="btn-secondary text-xs text-rose-400 hover:bg-rose-900/20 hover:border-rose-900/30">Delete Card</button>
              </div>
            </div>

            {/* Grid Inputs */}
            <div className="lg:col-span-8">
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${activeCard.gridSize}, 1fr)` }}>
                {activeCard.items.map((item, index) => (
                  <textarea
                    key={index}
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className={`
                         aspect-square w-full p-2 rounded-xl border outline-none transition-all resize-none text-center flex items-center justify-center 
                         text-sm md:text-base leading-tight placeholder-white/20
                         bg-zinc-900/80 border-white/5 focus:border-violet-500 focus:bg-zinc-900 focus:ring-4 focus:ring-violet-500/10
                     `}
                    placeholder="..."
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* --- PLAY MODE --- */
          <div className="w-full flex justify-center animate-scale-in pb-20">
            <BingoCard
              ref={cardRef}
              card={activeCard}
              theme={theme}
              zoomLevel={zoomLevel}
              toggleSquare={toggleSquare}
              markedSquares={activeCard.markedSquares}
            />
          </div>
        )}

        </main>

        <SettingsModal
            show={showSettings} onClose={() => setShowSettings(false)}
            zoomLevel={zoomLevel} setZoomLevel={setZoomLevel}
            themeName={currentThemeName} setThemeName={(name) => updateActiveCard({ themeName: name })}
            cardOptions={{ showTitle: activeCard.showTitle, showImage: activeCard.showImage, imageStyle: activeCard.imageStyle }}
            setCardOptions={(opts) => updateActiveCard(opts)}
            customColors={activeCard.customColors || { start: '#8b5cf6', end: '#ec4899' }}
            setCustomColors={(colors) => updateActiveCard({ customColors: colors })}
        />

        {/* Reset Confirm Modal */}
        {showResetConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Are you sure?</h3>
                <p className="text-zinc-400 mb-6 text-sm">This will clear the current card's content.</p>
                <div className="flex justify-end gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="btn-secondary">Cancel</button>
                <button onClick={() => {
                        updateActiveCard({ items: Array(activeCard.gridSize * activeCard.gridSize).fill(''), name: 'New Card', instantWin: '', personImage: null });
                        setWinner(false);
                        setShowResetConfirm(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold">
                    Confirm
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

