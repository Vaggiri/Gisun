import React, { useState, useEffect } from 'react';
import useFileSystemStore from '../store/useFileSystemStore';
import { Folder, ChevronLeft, ChevronRight, LayoutGrid, Cloud, Music, Video, File, RefreshCw } from 'lucide-react';
import { API_URL } from '../config';

const Finder = () => {
  const [currentId, setCurrentId] = useState('user');
  const [cloudItems, setCloudItems] = useState([]);
  const [cloudError, setCloudError] = useState(null);
  
  const [localItems, setLocalItems] = useState([]);
  const [localPath, setLocalPath] = useState('');
  const [parentPath, setParentPath] = useState('');
  
  const [loading, setLoading] = useState(false);
  const { getNode, getChildren, fetchCloudFiles } = useFileSystemStore();
  
  const currentNode = getNode(currentId);
  const isLocal = currentId === 'local-pc' || (typeof currentId === 'string' && (currentId.includes(':\\') || currentId.startsWith('/') || currentId.startsWith('\\\\')));
  const items = currentId === 'cloud-drive' 
    ? cloudItems 
    : (isLocal ? localItems : getChildren(currentId));

  useEffect(() => {
    if (currentId === 'cloud-drive') {
      refreshCloud();
    }
  }, [currentId]);

  useEffect(() => {
    if (isLocal) {
      refreshLocal(currentId === 'local-pc' ? '' : currentId);
    }
  }, [currentId]);

  const refreshCloud = async () => {
    setLoading(true);
    setCloudError(null);
    const result = await fetchCloudFiles();
    
    if (result && result.error) {
      setCloudError(result.error);
      setCloudItems([]);
    } else {
      setCloudItems(result || []);
    }
    setLoading(false);
  };

  const refreshLocal = async (path) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/local/list?path=${encodeURIComponent(path)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch local directory');
      }
      const data = await res.json();
      setLocalItems(data.items || []);
      setLocalPath(data.currentPath);
      setParentPath(data.parentPath);
      
      // If we clicked the virtual "local-pc" item, transition currentId to the actual path
      if (currentId === 'local-pc' && data.currentPath) {
        setCurrentId(data.currentPath);
      }
    } catch (err) {
      console.error('Error listing local path:', err);
      setLocalItems([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () => {
    if (currentId === 'cloud-drive') {
      setCurrentId('user');
      return;
    }
    if (isLocal) {
      if (parentPath) {
        setCurrentId(parentPath);
      } else {
        setCurrentId('user');
      }
      return;
    }
    if (currentNode && currentNode.parent_id) {
       setCurrentId(currentNode.parent_id);
    }
  };

  const getIcon = (item) => {
    if (item.type === 'folder') return <Folder size={64} fill="currentColor" fillOpacity={0.2} />;
    
    const name = item.name.toLowerCase();
    if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg')) return <Music size={64} className="text-orange-400" />;
    if (name.endsWith('.mp4') || name.endsWith('.mov')) return <Video size={64} className="text-purple-400" />;
    return <File size={64} className="text-slate-400" />;
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-900/50 backdrop-blur-md text-white font-sans">
      {/* Finder Toolbar */}
      <div className="flex h-12 items-center gap-4 border-b border-white/10 px-4">
        <div className="flex gap-2">
          <button 
            onClick={navigateBack}
            className="rounded p-1 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button className="rounded p-1 opacity-30 cursor-not-allowed">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold opacity-80 truncate max-w-[60%]">
          {currentId === 'cloud-drive' && <Cloud size={14} className="text-orange-400" />}
          {isLocal ? (localPath || 'Local PC') : (currentNode?.name || 'GisunOS')}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {currentId === 'cloud-drive' && (
            <button onClick={refreshCloud} className="p-1 hover:bg-white/10 rounded transition-colors group">
              <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''} opacity-40 group-hover:opacity-100`} />
            </button>
          )}
          {isLocal && (
            <button onClick={() => refreshLocal(currentId === 'local-pc' ? '' : currentId)} className="p-1 hover:bg-white/10 rounded transition-colors group">
              <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''} opacity-40 group-hover:opacity-100`} />
            </button>
          )}
          <LayoutGrid size={18} className="opacity-60" />
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 p-6 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-6 content-start overflow-y-auto custom-scrollbar">
        {items.map(item => (
          <div
            key={item.id}
            onDoubleClick={() => {
              if (item.type === 'folder') {
                setCurrentId(item.isLocal ? item.path : item.id);
              } else if (item.isLocal) {
                fetch(`${API_URL}/api/local/open?path=${encodeURIComponent(item.path)}`);
              }
            }}
            className="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <div className={`${item.isCloud ? 'drop-shadow-[0_0_15px_rgba(251,146,60,0.2)]' : (item.isLocal ? 'text-emerald-400 drop-shadow-lg' : 'text-blue-400 drop-shadow-lg')}`}>
              {getIcon(item)}
            </div>
            <span className="text-[10px] text-center truncate w-full px-1 font-medium opacity-80 group-hover:opacity-100">
              {item.name}
              {item.isCloud && <div className="text-[8px] text-orange-400 font-black uppercase tracking-widest mt-0.5">Cloud</div>}
              {item.isLocal && <div className="text-[8px] text-emerald-400 font-black uppercase tracking-widest mt-0.5">Local</div>}
            </span>
          </div>
        ))}

        {loading && (
          <div className="col-span-full flex flex-col items-center justify-center pt-20 gap-4">
             <RefreshCw size={32} className="animate-spin text-orange-500/50" />
             <span className="text-xs font-bold text-white/20 uppercase tracking-[0.3em]">Connecting...</span>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center pt-20">
            {currentId === 'cloud-drive' && cloudError ? (
              <div className="flex flex-col items-center gap-2 text-red-400">
                <Cloud size={32} className="opacity-20 translate-y-2" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Sync Error</span>
                <span className="text-[10px] opacity-40 italic">{cloudError}</span>
              </div>
            ) : (
              <span className="opacity-30 italic text-sm text-white">This folder is empty</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Finder;
