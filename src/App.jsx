import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import BingoCard from './components/BingoCard';
import SettingsModal from './components/SettingsModal';
import CardSwitcher from './components/CardSwitcher';
import GridItem from './components/GridItem';
import ActionsMenu from './components/ActionsMenu';
import ShareModal from './components/ShareModal';

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
    customColors: { start: '#8b5cf6', end: '#ec4899' },
    winCondition: 'full' // 'full' or 'standard'
  }]);
  const [activeCardId, setActiveCardId] = useState(1);
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [winner, setWinner] = useState(false);
  const [isInstantWinMarked, setIsInstantWinMarked] = useState(false);



  // App-wide View State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const cardRef = useRef(null);

  const activeCard = cards.find(c => c.id === activeCardId) || cards[0];

  // --- DRAFT STATE FOR EDIT MODE ---
  const [draftCard, setDraftCard] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (activeCard) {
      setDraftCard(JSON.parse(JSON.stringify(activeCard)));
      setIsDirty(false);
    } else {
      setDraftCard(null);
    }
  }, [activeCard]); // Reset draft when active card changes (switching cards)

  const updateDraft = (updates) => {
    if (!draftCard) return;
    setDraftCard(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!draftCard) return;
    setCards(prev => prev.map(c => c.id === draftCard.id ? draftCard : c));
    setIsDirty(false);
    // triggerConfetti(); // Optional satisfaction
  };

  const handleRevert = () => {
    if (activeCard) {
      setDraftCard(JSON.parse(JSON.stringify(activeCard)));
      setIsDirty(false);
    }
  };

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
  const updateActiveCard = (updates) => {
    setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, ...updates } : c));
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
      winCondition: 'full'
    }]);
    setActiveCardId(newId);
    setIsSetupMode(true);
  };

  const handleDeleteCard = (id) => {
    const newCards = cards.filter(c => c.id !== id);
    setCards(newCards);
    if (newCards.length > 0) {
      if (activeCardId === id) setActiveCardId(newCards[0].id);
    } else {
      setActiveCardId(null);
    }
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

  const handleItemChange = (index, value) => {
    // No history for typing every character
    const newItems = [...activeCard.items];
    newItems[index] = value;
    updateActiveCard({ items: newItems });
  };

  const toggleMode = () => {
    if (isSetupMode) {
      if (isDirty) {
        setShowUnsavedWarning(true);
        return;
      }
      // Validate: correct number of items filled?
      const filledCount = activeCard.items.filter(i => i.trim() !== '').length;
      if (filledCount < activeCard.items.length) {
        alert(`Please fill all ${activeCard.items.length} boxes before playing!`);
        return;
      }
    }
    setIsSetupMode(!isSetupMode);
  };

  const handleClearAllData = () => {
    localStorage.removeItem('person-bingo-data-v3');
    window.location.reload();
  };

  // --- RENDERING EMPTY STATE ---
  if (!activeCard && cards.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Person Bingo</h1>
        <button
          onClick={handleAddCard}
          className="btn-primary"
        >
          Create Bingo Card
        </button>
      </div>
    );
  }

  if (!activeCard) return null; // Safety fallback

  // --- GAME LOGIC ---
  const checkForWin = useCallback((currentMarked, currentItems, currentInstantWinMarked) => {
    let isWinner = false;

    // Instant win always wins
    if (currentInstantWinMarked) isWinner = true;

    if (!isWinner) {
      if (activeCard.winCondition === 'standard') {
        const size = activeCard.gridSize;
        // Check rows
        for (let i = 0; i < size; i++) {
          if (currentMarked.slice(i * size, (i + 1) * size).every(Boolean)) isWinner = true;
        }
        // Check cols
        if (!isWinner) {
          for (let i = 0; i < size; i++) {
            let colWin = true;
            for (let j = 0; j < size; j++) {
              if (!currentMarked[i + j * size]) colWin = false;
            }
            if (colWin) isWinner = true;
          }
        }
        // Check diagonals
        if (!isWinner) {
          let d1 = true, d2 = true;
          for (let i = 0; i < size; i++) {
            if (!currentMarked[i * size + i]) d1 = false;
            if (!currentMarked[i * size + (size - 1 - i)]) d2 = false;
          }
          if (d1 || d2) isWinner = true;
        }
      } else {
        // Full grid win condition
        if (currentMarked.every(Boolean)) isWinner = true;
      }
    }

    // Only count as win if there are actual items
    const hasItems = currentItems.some(i => i.trim() !== '');

    if (isWinner && hasItems && !winner) {
      setWinner(true);
      triggerConfetti();
    } else if (!isWinner) {
      setWinner(false);
    }
  }, [winner, activeCard.winCondition, activeCard.gridSize]);

  const toggleInstantWin = () => {
    if (isSetupMode || !activeCard.instantWin) return;
    const newState = !isInstantWinMarked;
    setIsInstantWinMarked(newState);
    checkForWin(activeCard.markedSquares, activeCard.items, newState);
  };

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

    updateActiveCard({ markedSquares: newMarked }); // History removed
    checkForWin(newMarked, activeCard.items, isInstantWinMarked);
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
      if (canvas) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          saveAs(blob, `${activeCard.name.replace(/\s+/g, '-')}.png`);
        } else {
          throw new Error('Failed to create image blob');
        }
      }
    } catch (err) {
      console.error('Download error:', err);
      alert("Failed to generate image. Please try again.");
    }
  };

  const copyCardImage = async () => {
    try {
      const canvas = await processCapture();
      if (canvas) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('Copied to clipboard!');
        } else {
          throw new Error('Failed to create image blob');
        }
      }
    } catch (err) {
      console.error('Copy error:', err);
      alert('Failed to copy image. Your browser may not support clipboard images.');
    }
  };

  // --- THEME & UI ---
  // --- THEME & UI ---
  // Hardcoded Green Theme as requested
  const theme = {
    cardBg: 'bg-zinc-900/50',
    cardBorder: 'border-zinc-800',
    squareUnmarked: 'bg-zinc-900/50 border-white/5 text-zinc-300 hover:border-emerald-500/50 hover:bg-emerald-500/10',
    squareMarked: 'bg-emerald-600/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    squareEmpty: 'bg-transparent border-white/5 text-zinc-700/50',
  };

  const customStyle = {};

  return (
    <div className={`min-h-screen text-white overflow-x-hidden`} style={customStyle}>
      <div className="relative z-10 min-h-screen flex flex-col items-center p-4 md:p-8">

        {/* HEADER TOOLBAR */}
        {/* HEADER TOOLBAR */}
        <header className="fixed top-4 md:top-6 z-50 w-full max-w-7xl mx-auto flex items-center justify-between px-4 pointer-events-none">
          {/* Left: Card Switcher (Acts as Title) */}
          <div className="pointer-events-auto flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 pl-4 pr-3 rounded-2xl border border-white/10">
            <CardSwitcher
              cards={cards} activeCardId={activeCardId}
              onSwitch={setActiveCardId} onAdd={handleAddCard} onDelete={handleDeleteCard}
            />
          </div>

          {/* Right: Actions */}
          <div className="pointer-events-auto flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <ActionsMenu
              onShare={() => setShowShareModal(true)}
              onRestart={() => {
                const newMarked = Array(activeCard.gridSize * activeCard.gridSize).fill(false);
                updateActiveCard({ markedSquares: newMarked });
                setIsInstantWinMarked(false);
                setWinner(false);
                setShowResetConfirm(false);
              }}
              onSettings={() => setShowSettings(true)}
              onToggleMode={toggleMode}
              isSetupMode={isSetupMode}
            />
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="w-full max-w-7xl pt-24 pb-12 flex flex-col items-center">

          {isSetupMode && draftCard ? (
            /* --- EDIT MODE --- */
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-fade-in">
              {/* Sidebar Config */}
              <div className={`lg:col-span-4 p-6 rounded-3xl glass-panel space-y-6 overflow-y-auto max-h-[80vh] scrollbar-thin`}>

                {/* 1. Identity & Image Picker */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Card Identity</label>
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 group">
                      <div className="relative w-32 h-32">
                        <div className="w-full h-full rounded-2xl bg-zinc-800 overflow-hidden border-2 border-zinc-700 group-hover:border-violet-500 transition-all shadow-xl">
                          {draftCard.personImage ? (
                            <img src={draftCard.personImage} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span className="text-[10px] font-bold uppercase tracking-tight">No Image</span>
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-95 border-2 border-zinc-900">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => updateDraft({ personImage: reader.result });
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>
                      <div className="w-full space-y-2">
                        <input
                          type="text" value={draftCard.name} onChange={(e) => updateDraft({ name: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800 focus:border-violet-500 outline-none text-sm transition-all focus:bg-zinc-950`}
                          placeholder="Bingo Title..."
                        />
                        <input
                          type="text" value={draftCard.instantWin} onChange={(e) => updateDraft({ instantWin: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800 focus:border-violet-500 outline-none text-xs transition-all focus:bg-zinc-950`}
                          placeholder="Instant Win Condition..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Win Conditions */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Win Condition</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-xl">
                    <button
                      onClick={() => updateDraft({ winCondition: 'standard' })}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${draftCard.winCondition === 'standard' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-400'}`}
                    >
                      Standard Bingo
                    </button>
                    <button
                      onClick={() => updateDraft({ winCondition: 'full' })}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${draftCard.winCondition === 'full' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-400'}`}
                    >
                      Full Grid
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-2 px-1">
                    {draftCard.winCondition === 'standard' ? 'Win with any row, column, or diagonal line.' : 'Win only when every single box is ticked.'}
                  </p>
                </div>

                {/* 3. Grid Settings */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Grid Size: {draftCard.gridSize}x{draftCard.gridSize}</label>
                    </div>
                    <input
                      type="range" min="3" max="7" value={draftCard.gridSize}
                      onChange={(e) => {
                        const size = parseInt(e.target.value);
                        const total = size * size;
                        const newItems = Array(total).fill('');
                        draftCard.items.forEach((it, i) => { if (i < total) newItems[i] = it; });
                        updateDraft({ gridSize: size, items: newItems, markedSquares: Array(total).fill(false) });
                      }}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Display Style</label>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-xl">
                        <button
                          onClick={() => updateDraft({ imageStyle: 'avatar' })}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${draftCard.imageStyle !== 'background' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-400'}`}
                        >
                          Avatar
                        </button>
                        <button
                          onClick={() => updateDraft({ imageStyle: 'background' })}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${draftCard.imageStyle === 'background' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-400'}`}
                        >
                          Full Bg
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:bg-black/30 transition-colors">
                          <span className="text-sm font-medium text-zinc-300">Show Title</span>
                          <input
                            type="checkbox"
                            checked={draftCard.showTitle}
                            onChange={(e) => updateDraft({ showTitle: e.target.checked })}
                            className="rounded border-zinc-600 text-violet-600 focus:ring-violet-500 bg-zinc-950 w-4 h-4 cursor-pointer"
                          />
                        </label>

                        {draftCard.imageStyle !== 'background' && (
                          <label className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:bg-black/30 transition-colors">
                            <span className="text-sm font-medium text-zinc-300">Show Avatar</span>
                            <input
                              type="checkbox"
                              checked={draftCard.showImage}
                              onChange={(e) => updateDraft({ showImage: e.target.checked })}
                              className="rounded border-zinc-600 text-violet-600 focus:ring-violet-500 bg-zinc-950 w-4 h-4 cursor-pointer"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Actions */}
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => updateDraft({ items: Array(draftCard.gridSize * draftCard.gridSize).fill('') })}
                      className="btn-secondary text-xs cursor-pointer py-2">Clear Grid</button>
                    <button onClick={() => setShowResetConfirm(true)}
                      className="btn-secondary text-xs text-rose-400 hover:bg-rose-900/10 border-rose-900/30 hover:border-rose-900/50 cursor-pointer py-2">Delete Card</button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={!isDirty}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all cursor-pointer ${isDirty ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-900/20' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                    >
                      Save
                    </button>
                    <button
                      onClick={toggleMode}
                      className="flex-1 py-3 rounded-xl font-bold transition-all shadow-lg bg-violet-600 text-white hover:bg-violet-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      Play
                    </button>
                  </div>
                </div>
              </div>


              {/* Grid Inputs */}
              <div className="lg:col-span-8">
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${draftCard.gridSize}, 1fr)` }}>
                  {draftCard.items.map((item, index) => (
                    <GridItem
                      key={index}
                      value={item}
                      onChange={(val) => {
                        const newItems = [...draftCard.items];
                        newItems[index] = val;
                        updateDraft({ items: newItems });
                      }}
                      className={`
                         aspect-square w-full p-2 rounded-xl border outline-none transition-all
                         flex items-center justify-start pl-4 text-left
                         text-sm md:text-base leading-tight
                         bg-zinc-900/80 border-white/5 focus-within:border-violet-500 focus-within:bg-zinc-900 focus-within:ring-4 focus-within:ring-violet-500/10
                     `}
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
                isInstantWinMarked={isInstantWinMarked}
                onToggleInstantWin={toggleInstantWin}
              />
            </div>
          )}

        </main>

        <SettingsModal
          show={showSettings} onClose={() => setShowSettings(false)}
          zoomLevel={zoomLevel} setZoomLevel={setZoomLevel}
          actions={{
            onClearAllData: () => { setShowSettings(false); setShowClearDataConfirm(true); }
          }}
        />

        <ShareModal
          show={showShareModal}
          onClose={() => setShowShareModal(false)}
          onDownload={downloadCardImage}
          onCopy={copyCardImage}
          cardConfig={activeCard}
        />

        {/* Unsaved Changes Warning */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl slide-up-animation">
              <h3 className="text-xl font-bold text-white mb-2">Unsaved Changes</h3>
              <p className="text-zinc-400 mb-6 text-sm">You have unsaved changes in your draft. Playing will discard these changes.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => {
                  handleRevert();
                  setShowUnsavedWarning(false);
                  // Validate saved data before playing
                  const filledCount = activeCard.items.filter(i => i.trim() !== '').length;
                  if (filledCount < activeCard.items.length) {
                    alert(`Please save a complete card before playing!`);
                    return;
                  }
                  setIsSetupMode(false);
                }}
                  className="btn-primary w-full">
                  Discard & Play
                </button>
                <button onClick={() => setShowUnsavedWarning(false)} className="btn-secondary w-full">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Data Confirm Modal */}
        {showClearDataConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2 text-rose-500">Reset App Data?</h3>
              <p className="text-zinc-400 mb-6 text-sm">This will permanently delete ALL your bingo cards and settings. This cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowClearDataConfirm(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleClearAllData}
                  className="btn-secondary text-rose-400 bg-rose-900/10 border-rose-900/30 hover:bg-rose-600 hover:text-white hover:border-rose-500">
                  Yes, Delete Everything
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirm Modal (Clear Board) */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Are you sure?</h3>
              <p className="text-zinc-400 mb-6 text-sm">This will clear the current card's content.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="btn-secondary text-sm">Cancel</button>
                <button onClick={() => {
                  updateActiveCard({ items: Array(activeCard.gridSize * activeCard.gridSize).fill(''), name: 'New Card', instantWin: '', personImage: null });
                  setWinner(false);
                  setShowResetConfirm(false);
                }}
                  className="btn-primary text-sm bg-rose-600 hover:bg-rose-500 shadow-rose-900/20">
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

