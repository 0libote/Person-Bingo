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
    imageStyle: 'avatar', // 'avatar' | 'background'
    themeName: 'cyber',
    customColors: { start: '#8b5cf6', end: '#ec4899' }
  }]);
  const [activeCardId, setActiveCardId] = useState(1);
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [winner, setWinner] = useState(false);

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
      themeName: 'cyber',
      customColors: { start: '#8b5cf6', end: '#ec4899' }
    }]);
    setActiveCardId(newId);
    setIsSetupMode(true); // Force setup mode
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

      // Resize items
      const newItems = Array(totalSquares).fill('');
      c.items.forEach((item, index) => {
        if (index < totalSquares) newItems[index] = item;
      });

      // Resize marks
      const newMarked = Array(totalSquares).fill(false);
      c.markedSquares.forEach((marked, index) => {
        if (index < totalSquares) newMarked[index] = marked;
      });

      return { ...c, gridSize: size, items: newItems, markedSquares: newMarked };
    }));
    setWinner(false);
  };

  const handleItemChange = (index, value) => {
    const newItems = [...activeCard.items];
    newItems[index] = value;
    updateActiveCard({ items: newItems });
  };

  // --- GAME LOGIC ---
  const checkForWin = useCallback((currentMarked, currentItems) => {
    const activeIndices = currentItems.map((item, index) => item.trim() !== '' ? index : -1).filter(i => i !== -1);
    if (activeIndices.length === 0) return;
    const allActiveMarked = activeIndices.every(index => currentMarked[index]);

    if (allActiveMarked && !winner) {
      setWinner(true);
      triggerConfetti();
    } else if (!allActiveMarked) {
      setWinner(false); // Can win/unwin
    }
  }, [winner]);

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
    if (isSetupMode || !activeCard.items[index].trim()) return;

    const newMarked = [...activeCard.markedSquares];
    newMarked[index] = !newMarked[index];

    updateActiveCard({ markedSquares: newMarked });
    checkForWin(newMarked, activeCard.items);
  };

  // --- IMAGE & EXPORT ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateActiveCard({ personImage: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const downloadCardImage = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null, // Transparent/Theme handled
          scale: 3,
          useCORS: true,
          logging: false
        });
        canvas.toBlob((blob) => {
          saveAs(blob, `${activeCard.name.replace(/\s+/g, '-')}.png`);
        });
      } catch (err) {
        console.error(err);
        alert("Failed to generate image.");
      }
    }
  };

  const copyCardImage = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 3,
          useCORS: true
        });
        canvas.toBlob(blob => {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('Copied to clipboard!');
        });
      } catch (err) {
        console.error(err);
        alert('Failed to copy image');
      }
    }
  };

  // --- THEME ---
  const getTheme = (themeName) => {
    switch (themeName) {
      case 'dark': return {
        appBg: 'bg-black', // App background is static dark now
        textMain: 'text-white',
        cardBg: 'bg-zinc-900',
        cardBorder: 'border-zinc-800',
        squareUnmarked: 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-white/20',
        squareMarked: 'bg-white text-black border-white shadow-white/20',
        squareEmpty: 'bg-zinc-900/50 border-transparent text-zinc-800',
        inputBg: 'bg-zinc-900',
        inputBorder: 'border-zinc-800',
        titleClass: 'text-white'
      };
      case 'custom': return {
        appBg: 'bg-zinc-950',
        textMain: 'text-white',
        cardBg: 'bg-zinc-900/80',
        cardBorder: 'border-zinc-800',
        squareUnmarked: 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-white/20',
        squareMarked: 'text-white shadow-lg border-white/20 bg-[linear-gradient(135deg,var(--theme-gradient-start),var(--theme-gradient-end))]',
        squareEmpty: 'bg-zinc-950 border-zinc-900 text-zinc-700 opacity-50',
        inputBg: 'bg-zinc-900',
        inputBorder: 'border-zinc-800',
        titleClass: 'bg-clip-text text-transparent bg-[linear-gradient(to_right,var(--theme-gradient-start),var(--theme-gradient-end))] pb-1'
      };
      default: // cyber
        return {
          appBg: 'bg-zinc-950',
          textMain: 'text-white',
          cardBg: 'bg-zinc-900/50',
          cardBorder: 'border-zinc-800',
          squareUnmarked: 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-violet-500/50',
          squareMarked: 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/40',
          squareEmpty: 'bg-zinc-950 border-zinc-900 text-zinc-700 opacity-50',
          inputBg: 'bg-zinc-900',
          inputBorder: 'border-zinc-700',
          titleClass: 'text-white'
        };
    }
  };

  // Get theme based on ACTIVE CARD, not global
  // Default to 'cyber' if undefined (legacy cards)
  const currentThemeName = activeCard.themeName || 'cyber';
  const theme = getTheme(currentThemeName);

  const customStyle = currentThemeName === 'custom' ? {
    '--theme-gradient-start': activeCard.customColors?.start || '#8b5cf6',
    '--theme-gradient-end': activeCard.customColors?.end || '#ec4899'
  } : {};

  return (
    <div
      className={`min-h-screen bg-zinc-950 text-white font-sans selection:bg-violet-500/30 overflow-x-hidden transition-colors duration-500`}
      style={customStyle}
    >

      <div className="relative z-10 min-h-screen flex flex-col items-center p-6">

        {/* HEADER */}
        <header className="w-full max-w-5xl flex flex-col items-center mb-8 gap-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight opacity-90 text-center">
            {activeCard.name || 'Person Bingo'}
          </h1>

          <CardSwitcher
            cards={cards}
            activeCardId={activeCardId}
            onSwitch={setActiveCardId}
            onAdd={handleAddCard}
            onDelete={handleDeleteCard}
          />

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl bg-zinc-900/10 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-current"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            {/* Edit Button for Play Mode */}
            {!isSetupMode && (
              <button
                onClick={() => setIsSetupMode(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-current"
                title="Edit Card"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
            )}

            {isSetupMode && (
              <label className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" title="Upload Image">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </label>
            )}

            {!isSetupMode && (
              <>
                <button onClick={downloadCardImage} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Download PNG">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </button>
                <button onClick={copyCardImage} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Copy to Clipboard">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                </button>
              </>
            )}

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <button
              onClick={() => setIsSetupMode(!isSetupMode)}
              className={`ml-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSetupMode ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              {isSetupMode ? 'Play' : 'Setup'}
            </button>
          </div>
        </header>

        {isSetupMode ? (
          /* --- EDIT MODE --- */
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Config Panel */}
            <div className={`lg:col-span-1 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 backdrop-blur-xl h-fit`}>
              <h2 className="text-xl font-bold mb-6">Card Settings</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold opacity-60 uppercase tracking-wider mb-2 block">Card Title</label>
                  <input
                    type="text" value={activeCard.name} onChange={(e) => updateActiveCard({ name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all bg-zinc-950 border-zinc-800 focus:border-violet-500`}
                    placeholder="Name..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold opacity-60 uppercase tracking-wider">Grid Size</label>
                    <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded opacity-70">{activeCard.gridSize} × {activeCard.gridSize}</span>
                  </div>
                  <input
                    type="range" min="3" max="7" value={activeCard.gridSize} onChange={(e) => updateGridSize(e.target.value)}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold opacity-60 uppercase tracking-wider mb-2 block">Instant Win Condition</label>
                  <textarea
                    value={activeCard.instantWin} onChange={(e) => updateActiveCard({ instantWin: e.target.value })} rows={3}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none bg-zinc-950 border-zinc-800 focus:border-violet-500`}
                    placeholder="E.g. They spill coffee..."
                  />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-xs font-bold opacity-60 uppercase tracking-wider mb-3">Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateActiveCard({ ...activeCard, items: Array(activeCard.gridSize * activeCard.gridSize).fill('') })}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm font-medium transition-colors"
                    >
                      Clear Grid
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Clear Everything?')) {
                          updateActiveCard({ items: Array(activeCard.gridSize * activeCard.gridSize).fill(''), name: 'My Bingo Card', instantWin: '', personImage: null });
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 text-sm font-medium transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Inputs */}
            <div className="lg:col-span-2">
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${activeCard.gridSize}, 1fr)` }}>
                {activeCard.items.map((item, index) => (
                  <div key={index} className="aspect-square relative group">
                    <span className="absolute top-2 left-2 text-[10px] opacity-40 pointer-events-none z-10">{index + 1}</span>
                    <textarea
                      value={item}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      className={`
                                         w-full h-full p-2 pt-6 rounded-xl border outline-none transition-all resize-none text-center flex items-center justify-center 
                                         text-sm md:text-base leading-tight 
                                         bg-zinc-900 border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500
                                     `}
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
            <BingoCard
              ref={cardRef}
              card={activeCard}
              theme={theme}
              zoomLevel={zoomLevel}
              toggleSquare={toggleSquare}
              markedSquares={activeCard.markedSquares}
            />

            {winner && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={triggerConfetti}
                  className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg shadow-violet-500/40 animate-pulse"
                >
                  Celebrate Again! 🎉
                </button>
              </div>
            )}

            <div className="mt-8 opacity-50 hover:opacity-100 transition-opacity">
              <button onClick={() => setShowResetConfirm(true)} className="text-sm underline">Clear Bingo Card</button>
            </div>
          </div>
        )}

      </div>

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        themeName={currentThemeName}
        setThemeName={(name) => updateActiveCard({ themeName: name })}
        cardOptions={{
          showTitle: activeCard.showTitle,
          showImage: activeCard.showImage,
          imageStyle: activeCard.imageStyle // Pass new prop
        }}
        setCardOptions={(opts) => updateActiveCard(opts)}
        customColors={activeCard.customColors || { start: '#8b5cf6', end: '#ec4899' }}
        setCustomColors={(colors) => updateActiveCard({ customColors: colors })}
      />

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Clear Bingo Card?</h3>
            <p className="text-zinc-400 mb-6">This will uncheck all boxes on the current card.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800">Cancel</button>
              <button
                onClick={() => {
                  updateActiveCard({ markedSquares: Array(activeCard.gridSize * activeCard.gridSize).fill(false) });
                  setWinner(false);
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
