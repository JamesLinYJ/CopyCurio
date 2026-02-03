
import { LibraryItem, UserStats, ChatMessage, ChatSession, AppSettings } from '../types';
import { ASSETS } from '../assets';

const KEYS = {
  STATS: 'wanxiang_stats',
  SETTINGS: 'wanxiang_settings'
};

const DB_NAME = 'CurioDB';
const DB_VERSION = 1;
const STORE_LIBRARY = 'library';
const STORE_SESSIONS = 'sessions';

// IndexedDB Helper
const idb = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_LIBRARY)) {
          db.createObjectStore(STORE_LIBRARY, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
          db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  getAll: <T>(storeName: string): Promise<T[]> => {
    return idb.open().then(db => {
      return new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      });
    });
  },
  put: (storeName: string, item: any): Promise<void> => {
    return idb.open().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  delete: (storeName: string, id: string): Promise<void> => {
    return idb.open().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  clear: (storeName: string): Promise<void> => {
     return idb.open().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }
};

const DEFAULT_STATS: UserStats = {
  itemsSaved: 0,
  daysActive: 1,
  lastLogin: Date.now(),
  joinDate: Date.now(),
  xp: 0
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notifications: {
    dailyFact: true,
    explorationGoal: true,
    systemUpdates: false
  },
  privacy: {
    clearOnExit: false
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false
  }
};

export const StorageService = {
  safeParse: <T>(jsonString: string | null, fallback: T): T => {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString) as T;
    } catch (e) {
      return fallback;
    }
  },

  // --- Synchronous (LocalStorage) for Stats & Settings ---

  getStats: (): UserStats => {
    const stats = StorageService.safeParse(localStorage.getItem(KEYS.STATS), DEFAULT_STATS);
    const lastDate = new Date(stats.lastLogin).toDateString();
    const today = new Date().toDateString();
    if (lastDate !== today) {
      stats.daysActive += 1;
      stats.lastLogin = Date.now();
      localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    }
    return stats;
  },

  addXp: (amount: number) => {
    const stats = StorageService.getStats();
    stats.xp = (stats.xp || 0) + amount;
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  },

  getSettings: (): AppSettings => {
    const stored = localStorage.getItem(KEYS.SETTINGS);
    const parsed = StorageService.safeParse(stored, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...parsed, accessibility: { ...DEFAULT_SETTINGS.accessibility, ...parsed.accessibility } };
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- Asynchronous (IndexedDB) for Heavy Data ---

  getLibrary: async (): Promise<LibraryItem[]> => {
    return (await idb.getAll<LibraryItem>(STORE_LIBRARY)).sort((a, b) => b.date - a.date);
  },

  saveToLibrary: async (item: Omit<LibraryItem, 'id' | 'date'>) => {
    const newItem: LibraryItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: Date.now()
    };
    await idb.put(STORE_LIBRARY, newItem);
    
    // Update count in stats
    const items = await idb.getAll(STORE_LIBRARY);
    const stats = StorageService.getStats();
    stats.itemsSaved = items.length;
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    return newItem;
  },

  deleteFromLibrary: async (id: string) => {
    await idb.delete(STORE_LIBRARY, id);
    
    const items = await idb.getAll<LibraryItem>(STORE_LIBRARY);
    const stats = StorageService.getStats();
    stats.itemsSaved = items.length;
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    return items; // Return updated list
  },

  getSessions: async (): Promise<ChatSession[]> => {
    return (await idb.getAll<ChatSession>(STORE_SESSIONS)).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  createSession: async (firstMessageText: string): Promise<ChatSession> => {
    const title = firstMessageText.slice(0, 15) + (firstMessageText.length > 15 ? '...' : '');
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: title,
      preview: title,
      updatedAt: Date.now(),
      messages: []
    };
    await idb.put(STORE_SESSIONS, newSession);
    return newSession;
  },

  updateSession: async (sessionId: string, newMessages: ChatMessage[]) => {
    const sessions = await StorageService.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.messages = newMessages.slice(-100);
      session.updatedAt = Date.now();
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg) session.preview = lastMsg.text.slice(0, 30) + "...";
      await idb.put(STORE_SESSIONS, session);
    }
  },

  deleteSession: async (sessionId: string) => {
    await idb.delete(STORE_SESSIONS, sessionId);
    return await StorageService.getSessions();
  },

  clearSessions: async () => {
    await idb.clear(STORE_SESSIONS);
  },

  optimizeImages: async () => {
    const library = await StorageService.getLibrary();
    const optimized = library.map(item => ({
      ...item,
      thumbnail: item.thumbnail?.startsWith('data:image') ? ASSETS.thumb_cat : item.thumbnail
    }));
    // Bulk put (simplified loop)
    for (const item of optimized) {
      await idb.put(STORE_LIBRARY, item);
    }
  },

  getStorageBreakdown: async () => {
    const statsRaw = localStorage.getItem(KEYS.STATS) || '';
    
    let libraryCount = 0;
    let librarySize = "0.0";
    let sessionsCount = 0;
    let sessionsSize = "0.0";
    
    try {
        const libItems = await idb.getAll<LibraryItem>(STORE_LIBRARY);
        libraryCount = libItems.length;
        librarySize = (new Blob([JSON.stringify(libItems)]).size / 1024).toFixed(1);

        const sessItems = await idb.getAll<ChatSession>(STORE_SESSIONS);
        sessionsCount = sessItems.length;
        sessionsSize = (new Blob([JSON.stringify(sessItems)]).size / 1024).toFixed(1);
    } catch (e) {
        console.warn("Failed to measure IDB size");
    }

    return {
      librarySize,
      libraryCount,
      sessionsSize,
      sessionsCount,
      systemSize: (new Blob([statsRaw]).size / 1024).toFixed(1),
      totalSize: (new Blob([Object.values(localStorage).join('')]).size / 1024).toFixed(1)
    };
  },

  clearAllData: async () => {
    localStorage.clear();
    await idb.clear(STORE_LIBRARY);
    await idb.clear(STORE_SESSIONS);
    window.location.reload();
  }
};
