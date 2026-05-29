import React, { useState, useCallback, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import useWindowStore from '../../store/useWindowStore';
import useThemeStore from '../../store/useThemeStore';
import Finder from '../../apps/Finder';
import Terminal from '../../apps/Terminal';
import Browser from '../../apps/Browser';
import GisunMusic from '../../apps/GisunMusic';
import Settings from '../../apps/Settings';
import Calculator from '../../apps/Calculator';
import Calendar from '../../apps/Calendar';
import Notepad from '../../apps/Notepad';
import ActivityMonitorPro from '../../apps/ActivityMonitorPro';
import GisunMaps from '../../apps/GisunMaps';
import GisunTube from '../../apps/GisunTube';
import VLCPlayer from '../../apps/VLCPlayer';

const WindowContent = React.memo(({ id }) => {
  switch (id) {
    case 'finder': return <Finder />;
    case 'terminal': return <Terminal />;
    case 'compass': return <Browser />;
    case 'gisunmusic': return <GisunMusic />;
    case 'settings': return <Settings />;
    case 'calculator': return <Calculator />;
    case 'calendar': return <Calendar />;
    case 'notepad': return <Notepad />;
    case 'activity': return <ActivityMonitorPro />;
    case 'maps': return <GisunMaps />;
    case 'gisuntube': return <GisunTube />;
    case 'vlc': return <VLCPlayer />;
    default: return <div className="p-4 opacity-50 text-white font-bold uppercase tracking-widest text-[10px]">Application Binary Not Found</div>;
  }
});

const WindowFrame = ({ id }) => {
  const window = useWindowStore(useCallback(state => state.windows.find(w => w.id === id), [id]));
  const { focusWindow, closeWindow, toggleMinimize, toggleMaximize, updateWindowRect } = useWindowStore();
  const { dockAutoHide } = useThemeStore();
  
  const [isInteracting, setIsInteracting] = useState(false);
  const windowRef = useRef(null);
  const dragControls = useDragControls();
  const dims = useRef({ w: 0, h: 0, x: 0, y: 0 });

  if (!window || window.isMinimized) return null;

  // RE-DESIGNED: Unified Move & Resize Logic (Direct DOM)
  const onInteractionStart = () => {
    setIsInteracting(true);
    dims.current = { w: window.w, h: window.h, x: window.x, y: window.y };
  };

  const handleResize = (event, info, direction) => {
    const { delta } = info;
    let { w, h, x, y } = dims.current;

    if (direction.includes('e')) w = Math.max(400, w + delta.x);
    if (direction.includes('s')) h = Math.max(300, h + delta.y);
    if (direction.includes('w')) {
      const oldW = w;
      w = Math.max(400, w - delta.x);
      x += (oldW - w);
    }
    if (direction.includes('n')) {
      const oldH = h;
      h = Math.max(300, h - delta.y);
      y += (oldH - h);
    }

    dims.current = { w, h, x, y };
    applyStyles();
  };

  const applyStyles = () => {
    if (windowRef.current) {
      windowRef.current.style.width = `${dims.current.w}px`;
      windowRef.current.style.height = `${dims.current.h}px`;
      windowRef.current.style.left = `${dims.current.x}px`;
      windowRef.current.style.top = `${dims.current.y}px`;
    }
  };

  const onInteractionEnd = () => {
    setIsInteracting(false);
    updateWindowRect(id, { ...dims.current });
  };

  const isMax = window.isMaximized;
  const maximizedHeight = dockAutoHide ? '100vh' : 'calc(100vh - 96px)';

  return (
    <motion.div
      ref={windowRef}
      onPointerDown={() => focusWindow(id)}
      drag={!isMax}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ scale: 0.9, opacity: 0, y: 30 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: 0,
        width: isMax ? '100vw' : window.w,
        height: isMax ? maximizedHeight : window.h,
        top: isMax ? 0 : window.y,
        left: isMax ? 0 : window.x,
        borderRadius: isMax ? 0 : 12,
      }}
      onDragStart={onInteractionStart}
      onDragEnd={(e, info) => {
        // Calculate the new X and Y by adding the total drag offset to the original position
        const newX = window.x + info.offset.x;
        const newY = window.y + info.offset.y;
        updateWindowRect(id, { x: newX, y: newY });
        setIsInteracting(false);
      }}
      exit={{ scale: 0.9, opacity: 0, y: 30 }}
      transition={{ 
        type: "spring", 
        stiffness: 450, 
        damping: 35,
        mass: 0.8,
      }}
      style={{ 
        zIndex: window.zIndex,
        position: 'absolute',
      }}
      className={`liquid-glass pointer-events-auto flex flex-col overflow-hidden shadow-2xl backdrop-blur-3xl transition-shadow ${isMax ? 'shadow-none' : 'shadow-2xl'}`}
    >
      {/* 8-Way Resizing Handles */}
      {!isMax && (
        <>
          <motion.div onPanStart={onInteractionStart} onPan={(e, i) => handleResize(e, i, 'n')} onPanEnd={onInteractionEnd} className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-[2001]" />
          <motion.div onPanStart={onInteractionStart} onPan={(e, i) => handleResize(e, i, 's')} onPanEnd={onInteractionEnd} className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-[2001]" />
          <motion.div onPanStart={onInteractionStart} onPan={(e, i) => handleResize(e, i, 'w')} onPanEnd={onInteractionEnd} className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize z-[2001]" />
          <motion.div onPanStart={onInteractionStart} onPan={(e, i) => handleResize(e, i, 'e')} onPanEnd={onInteractionEnd} className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize z-[2001]" />
          <motion.div onPanStart={onInteractionStart} onPan={(e, i) => handleResize(e, i, 'nw')} onPanEnd={onInteractionEnd} className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize z-[2002]" />
          <motion.div onPanStart={onInteractionStart} onPan={(e, i) => handleResize(e, i, 'ne')} onPanEnd={onInteractionEnd} className="absolute top-0 right-0 w-6 h-6 cursor-ne-resize z-[2002]" />
          <motion.div onPanStart={onInteractionStart} onPan={(e, i) => handleResize(e, i, 'sw')} onPanEnd={onInteractionEnd} className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize z-[2002]" />
          <motion.div onPanStart={onInteractionStart} onPan={(e, i) => handleResize(e, i, 'se')} onPanEnd={onInteractionEnd} className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-[2002]" />
        </>
      )}

      {/* Title Bar - Handles Window Movement via Drag Controls */}
      <motion.div 
        onPointerDown={(e) => dragControls.start(e)}
        style={{ height: 'var(--window-header-h)' }}
        className="flex items-center justify-between px-4 md:px-6 select-none bg-black/5 border-b border-black/5 cursor-default active:cursor-grabbing"
        onDoubleClick={() => toggleMaximize(id)}
      >
        <div className="w-20 md:w-24" /> 
        <div className="text-[11px] md:text-[14px] font-semibold opacity-80 truncate px-4 text-white drop-shadow-sm tracking-wide">{window.title}</div>
        
        <div className="flex gap-2 md:gap-3 pointer-events-auto">
          <button 
            tabIndex="-1"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); toggleMinimize(id); }}
            className="flex h-3 w-3 md:h-4 md:w-4 items-center justify-center rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 shadow-inner group"
          >
            <Minus size={8} className="invisible group-hover:visible text-black/60 stroke-[3] md:size-[10px]" />
          </button>
          <button 
            tabIndex="-1"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
            className="flex h-3 w-3 md:h-4 md:w-4 items-center justify-center rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 shadow-inner group"
          >
            <Maximize2 size={8} className="invisible group-hover:visible text-black/60 stroke-[3] md:size-[10px]" />
          </button>
          <button 
            tabIndex="-1"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="flex h-3 w-3 md:h-4 md:w-4 items-center justify-center rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 shadow-inner group"
          >
            <X size={8} className="invisible group-hover:visible text-black/60 stroke-[3] md:size-[10px]" />
          </button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-white/5 min-w-0 min-h-0">
        <WindowContent id={id} />
        
        {/* Iframe Shield Overlay */}
        {isInteracting && (
          <div className="absolute inset-0 z-[2000] bg-transparent cursor-grabbing" />
        )}
      </div>
    </motion.div>
  );
};

export default WindowFrame;
