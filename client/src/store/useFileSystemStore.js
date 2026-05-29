import { create } from 'zustand';
import { supabase } from '../supabase';

const useFileSystemStore = create((set, get) => ({
  fileTree: [],
  isLoading: false,

  fetchFileSystem: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ fileTree: [], isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('vfs_nodes')
      .select('*')
      .eq('owner_id', user.id);

    if (error) {
      console.error('Error fetching VFS:', error);
      set({ isLoading: false });
    } else {
      set({ fileTree: data, isLoading: false });
    }
  },

  createNode: async (name, type, parentId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('vfs_nodes')
      .insert([
        { name, type, parent_id: parentId, owner_id: user.id, content: '' }
      ])
      .select();

    if (!error && data) {
      set((state) => ({ fileTree: [...state.fileTree, data[0]] }));
    }
  },

  deleteNode: async (id) => {
    const { error } = await supabase
      .from('vfs_nodes')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        fileTree: state.fileTree.filter(n => n.id !== id)
      }));
    }
  },

  renameNode: async (id, newName) => {
    const { error } = await supabase
      .from('vfs_nodes')
      .update({ name: newName })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        fileTree: state.fileTree.map(n => n.id === id ? { ...n, name: newName } : n)
      }));
    }
  },

  updateFileContent: async (id, content) => {
    const { error } = await supabase
      .from('vfs_nodes')
      .update({ content })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        fileTree: state.fileTree.map(n => n.id === id ? { ...n, content } : n)
      }));
    }
  },

  moveToTrash: async (id) => {
    const { error } = await supabase
      .from('vfs_nodes')
      .update({ parent_id: 'trash' })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        fileTree: state.fileTree.map(n => n.id === id ? { ...n, parent_id: 'trash' } : n)
      }));
    }
  },

  emptyTrash: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('vfs_nodes')
      .delete()
      .eq('owner_id', user.id)
      .eq('parent_id', 'trash');

    if (!error) {
      set((state) => ({
        fileTree: state.fileTree.filter(n => n.parent_id !== 'trash')
      }));
    }
  },

  getNode: (id) => {
    if (id === 'cloud-drive') return { id: 'cloud-drive', name: 'Cloud Drive', type: 'folder', parent_id: 'user' };
    if (id === 'local-pc') return { id: 'local-pc', name: 'Local PC', type: 'folder', parent_id: 'user' };
    if (id && (id.includes(':\\') || id.startsWith('/') || id.startsWith('\\\\'))) {
      return { id, name: id.split(/[\\/]/).pop() || id, type: 'folder' };
    }
    return get().fileTree.find(n => n.id === id);
  },

  getChildren: (parentId) => {
    const localChildren = get().fileTree.filter(n => n.parent_id === parentId);
    if (parentId === 'user') {
      const items = [...localChildren, { id: 'cloud-drive', name: 'Cloud Drive', type: 'folder', parent_id: 'user' }];
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        items.push({ id: 'local-pc', name: 'Local PC', type: 'folder', parent_id: 'user', isLocalRoot: true });
      }
      return items;
    }
    return localChildren;
  },

  fetchCloudFiles: async () => {
    try {
      console.log('[FileSystem] Fetching cloud files from bucket: giri-os-media');
      const { data, error } = await supabase.storage.from('giri-os-media').list();
      
      if (error) {
        console.error('[FileSystem] Supabase Storage Error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('[FileSystem] No data returned from storage.list()');
        return [];
      }

      console.log(`[FileSystem] Successfully fetched ${data.length} files from cloud`);
      
      return data.map(file => ({
        id: `cloud-${file.name}`,
        name: file.name,
        type: 'file',
        parent_id: 'cloud-drive',
        isCloud: true,
        metadata: file.metadata,
        size: file.metadata?.size
      }));
    } catch (err) {
      console.error('Error fetching cloud files:', err);
      // Propagate error message for UI to display
      return { error: err.message || 'Unknown storage error' };
    }
  }
}));

export default useFileSystemStore;
