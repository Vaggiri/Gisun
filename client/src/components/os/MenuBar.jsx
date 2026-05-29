import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Battery, Search, List, LogOut, Power, RefreshCcw } from 'lucide-react';
import ControlCenter from './ControlCenter';
import useSystemStore from '../../store/useSystemStore';
import useWindowStore from '../../store/useWindowStore';
import { supabase } from '../../supabase';

const MenuBar = () => {
  const [time, setTime] = useState(new Date());
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const appleMenuRef = useRef(null);
  
  const { setBootStage, logout } = useSystemStore();
  const windows = useWindowStore(state => state.windows);
  const hasOpenApps = windows.some(w => !w.isMinimized);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (appleMenuRef.current && !appleMenuRef.current.contains(event.target)) {
        setShowAppleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    logout();
    setShowAppleMenu(false);
    // Ensure all states are flushed for a clean redirect to login
    window.location.reload();
  };

  const handleShutDown = () => {
    setBootStage('none');
    setShowAppleMenu(false);
    // Reload after a delay to simulate power-off/reboot cycle if desired
    setTimeout(() => window.location.reload(), 2000);
  };

  const shouldShow = !hasOpenApps || isHovered || showAppleMenu || showControlCenter;

  return (
    <>
      {hasOpenApps && (
        <div 
          className="fixed top-0 left-0 right-0 h-[6px] z-[999] pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
        />
      )}
      <div 
        style={{ 
          height: 'var(--menubar-h)',
          transform: shouldShow ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 text-[10px] md:text-sm font-semibold text-white shadow-lg bg-black/5 backdrop-blur-md border-b border-white/5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Side */}
        <div className="flex items-center gap-4 relative">
          <div ref={appleMenuRef}>
            <img 
              src="/logo.png" 
              alt="Gisun" 
              className={`w-4 h-4 md:w-6 md:h-6 cursor-pointer object-contain transition-all duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] ${showAppleMenu ? 'brightness-125 scale-110' : 'hover:scale-110 hover:brightness-110'}`} 
              onClick={() => setShowAppleMenu(!showAppleMenu)}
            />
            {showAppleMenu && (
              <div className="absolute top-10 left-0 w-64 p-1.5 bg-[#1a1a1b]/95 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5 mb-2">
                  Gisun System
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-500 text-white transition-colors group"
                >
                  <span className="text-[13px] font-medium">Log Out Gisun user...</span>
                  <LogOut size={14} className="opacity-40 group-hover:opacity-100" />
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button 
                  onClick={() => { setBootStage('logo'); setShowAppleMenu(false); setTimeout(() => window.location.reload(), 1000); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-500 text-white transition-colors group"
                >
                  <span className="text-[13px] font-medium">Restart...</span>
                  <RefreshCcw size={14} className="opacity-40 group-hover:opacity-100" />
                </button>
                <button 
                  onClick={handleShutDown}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-500 text-white transition-colors group"
                >
                  <span className="text-[13px] font-medium">Shut Down...</span>
                  <Power size={14} className="opacity-40 group-hover:opacity-100" />
                </button>
              </div>
            )}
          </div>
          <span className="cursor-default font-bold">GisunOS</span>
          <span className="cursor-default font-medium opacity-80 decoration-none hover:bg-white/10 px-2 rounded">Finder</span>
          <span className="hidden md:inline-block cursor-default font-medium opacity-80 hover:bg-white/10 px-2 rounded">File</span>
          <span className="hidden md:inline-block cursor-default font-medium opacity-80 hover:bg-white/10 px-2 rounded">Edit</span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 md:gap-6 scale-90 md:scale-100">
          <Wifi size={14} className="md:size-[18px] cursor-pointer hover:opacity-70 transition-opacity" />
          <Battery size={14} className="md:size-[18px] cursor-pointer hover:opacity-70 transition-opacity" />
          <Search size={14} className="md:size-[18px] cursor-pointer hover:opacity-70 transition-opacity" />
          <List 
            size={14} 
            className={`md:size-[18px] cursor-pointer transition-all ${showControlCenter ? 'text-blue-400 scale-110' : 'hover:opacity-70'}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowControlCenter(!showControlCenter);
            }} 
          />
          <div className="flex items-center gap-2 cursor-default select-none">
            <span className="text-white/80">{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="text-white">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {showControlCenter && (
        <ControlCenter closeMenu={() => setShowControlCenter(false)} />
      )}
    </>
  );
};

export default MenuBar;
