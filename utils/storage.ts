import { LibraryItem, UserStats, ChatMessage, ChatSession, AppSettings } from '../types';

const DEVICE_KEY = 'wanxiang_device_id';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const CACHE_KEYS = {
  SETTINGS: 'wanxiang_cache_settings',
  STATS: 'wanxiang_cache_stats',
  LIBRARY: 'wanxiang_cache_library',
  SESSIONS: 'wanxiang_cache_sessions'
};

export const DEFAULT_STATS: UserStats = {
  itemsSaved: 0,
  daysActive: 1,
  lastLogin: Date.now(),
  joinDate: Date.now(),
  xp: 0
};

export const DEFAULT_SETTINGS: AppSettings = {
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

const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      id = crypto.randomUUID();
    } else {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
};

const resolveUrl = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

const readCache = <T>(key: string, fallback: T): { value: T; hasCache: boolean } => {
  const raw = localStorage.getItem(key);
  if (!raw) return { value: fallback, hasCache: false };
  try {
    return { value: JSON.parse(raw) as T, hasCache: true };
  } catch (e) {
    return { value: fallback, hasCache: false };
  }
};

const writeCache = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore quota errors
  }
};

const emitSync = (key: string) => {
  window.dispatchEvent(new CustomEvent('storage-sync', { detail: { key } }));
  // Reuse existing listeners that watch 'storage'
  window.dispatchEvent(new Event('storage'));
};

const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-device-id': getDeviceId(),
    ...(options.headers as Record<string, string> | undefined)
  };

  const response = await fetch(resolveUrl(path), {
    ...options,
    headers
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error (${response.status}): ${text}`);
  }

  return response.json() as Promise<T>;
};

const mergeSettings = (settings: AppSettings) => {
  return { ...DEFAULT_SETTINGS, ...settings, accessibility: { ...DEFAULT_SETTINGS.accessibility, ...settings.accessibility } };
};

const updateCachedStatsItems = (libraryCount: number) => {
  const { value: cachedStats, hasCache } = readCache<UserStats>(CACHE_KEYS.STATS, DEFAULT_STATS);
  if (!hasCache) return;
  const next = { ...cachedStats, itemsSaved: libraryCount };
  writeCache(CACHE_KEYS.STATS, next);
  emitSync('stats');
};

const refreshSettings = async (): Promise<AppSettings> => {
  const data = await apiFetch<{ settings: AppSettings }>('/api/settings');
  const merged = mergeSettings(data.settings);
  writeCache(CACHE_KEYS.SETTINGS, merged);
  emitSync('settings');
  return merged;
};

const refreshStats = async (): Promise<UserStats> => {
  const data = await apiFetch<{ stats: UserStats }>('/api/stats');
  writeCache(CACHE_KEYS.STATS, data.stats);
  emitSync('stats');
  return data.stats;
};

const refreshLibrary = async (): Promise<LibraryItem[]> => {
  const data = await apiFetch<{ items: LibraryItem[] }>('/api/library');
  writeCache(CACHE_KEYS.LIBRARY, data.items);
  emitSync('library');
  updateCachedStatsItems(data.items.length);
  return data.items;
};

const refreshSessions = async (): Promise<ChatSession[]> => {
  const data = await apiFetch<{ sessions: ChatSession[] }>('/api/sessions');
  writeCache(CACHE_KEYS.SESSIONS, data.sessions);
  emitSync('sessions');
  return data.sessions;
};

export const StorageService = {
  // --- Stats & Settings ---

  getStats: async (): Promise<UserStats> => {
    const cached = readCache<UserStats>(CACHE_KEYS.STATS, DEFAULT_STATS);
    if (cached.hasCache) {
      void refreshStats();
      return cached.value;
    }
    try {
      return await refreshStats();
    } catch (e) {
      return DEFAULT_STATS;
    }
  },

  addXp: async (amount: number) => {
    const cached = readCache<UserStats>(CACHE_KEYS.STATS, DEFAULT_STATS);
    const optimistic = { ...cached.value, xp: (cached.value.xp || 0) + amount };
    writeCache(CACHE_KEYS.STATS, optimistic);
    emitSync('stats');

    try {
      const data = await apiFetch<{ stats: UserStats }>('/api/stats/xp', {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
      writeCache(CACHE_KEYS.STATS, data.stats);
      emitSync('stats');
    } catch (e) {
      // Ignore XP failures to avoid blocking UI
    }
  },

  getSettings: async (): Promise<AppSettings> => {
    const cached = readCache<AppSettings>(CACHE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    if (cached.hasCache) {
      void refreshSettings();
      return mergeSettings(cached.value);
    }

    try {
      return await refreshSettings();
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: async (settings: AppSettings) => {
    const merged = mergeSettings(settings);
    writeCache(CACHE_KEYS.SETTINGS, merged);
    emitSync('settings');

    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: merged })
      });
    } catch (e) {
      // Allow offline/local changes; sync will retry on next load
    }
  },

  // --- Library ---

  getLibrary: async (): Promise<LibraryItem[]> => {
    const cached = readCache<LibraryItem[]>(CACHE_KEYS.LIBRARY, []);
    if (cached.hasCache) {
      void refreshLibrary();
      return cached.value;
    }
    try {
      return await refreshLibrary();
    } catch (e) {
      return [];
    }
  },

  saveToLibrary: async (item: Omit<LibraryItem, 'id' | 'date'>) => {
    const data = await apiFetch<{ item: LibraryItem }>('/api/library', {
      method: 'POST',
      body: JSON.stringify({ item })
    });

    const cached = readCache<LibraryItem[]>(CACHE_KEYS.LIBRARY, []);
    const next = [data.item, ...cached.value.filter((entry) => entry.id !== data.item.id)];
    writeCache(CACHE_KEYS.LIBRARY, next);
    emitSync('library');
    updateCachedStatsItems(next.length);

    return data.item;
  },

  deleteFromLibrary: async (id: string) => {
    const data = await apiFetch<{ items: LibraryItem[] }>(`/api/library/${id}`, {
      method: 'DELETE'
    });
    writeCache(CACHE_KEYS.LIBRARY, data.items);
    emitSync('library');
    updateCachedStatsItems(data.items.length);
    return data.items;
  },

  // --- Sessions ---

  getSessions: async (): Promise<ChatSession[]> => {
    const cached = readCache<ChatSession[]>(CACHE_KEYS.SESSIONS, []);
    if (cached.hasCache) {
      void refreshSessions();
      return cached.value;
    }
    try {
      return await refreshSessions();
    } catch (e) {
      return [];
    }
  },

  createSession: async (firstMessageText: string): Promise<ChatSession> => {
    const data = await apiFetch<{ session: ChatSession }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ firstMessageText })
    });
    const cached = readCache<ChatSession[]>(CACHE_KEYS.SESSIONS, []);
    const next = [data.session, ...cached.value.filter((entry) => entry.id !== data.session.id)];
    writeCache(CACHE_KEYS.SESSIONS, next);
    emitSync('sessions');
    return data.session;
  },

  updateSession: async (sessionId: string, newMessages: ChatMessage[]) => {
    await apiFetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({ messages: newMessages })
    });

    const cached = readCache<ChatSession[]>(CACHE_KEYS.SESSIONS, []);
    if (cached.value.length > 0) {
      const updatedAt = Date.now();
      const lastMsg = newMessages[newMessages.length - 1];
      const preview = lastMsg ? String(lastMsg.text || '').slice(0, 30) + '...' : '';
      const updated = cached.value.map((session) =>
        session.id === sessionId
          ? { ...session, messages: newMessages.slice(-100), updatedAt, preview }
          : session
      );
      const reordered = updated.sort((a, b) => b.updatedAt - a.updatedAt);
      writeCache(CACHE_KEYS.SESSIONS, reordered);
      emitSync('sessions');
    }
  },

  deleteSession: async (sessionId: string) => {
    const data = await apiFetch<{ sessions: ChatSession[] }>(`/api/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    writeCache(CACHE_KEYS.SESSIONS, data.sessions);
    emitSync('sessions');
    return data.sessions;
  },

  clearSessions: async () => {
    await apiFetch('/api/sessions', { method: 'DELETE' });
    writeCache(CACHE_KEYS.SESSIONS, []);
    emitSync('sessions');
  },

  // --- Storage Tools ---

  optimizeImages: async () => {
    await apiFetch('/api/library/optimize-images', { method: 'POST' });
    const cached = readCache<LibraryItem[]>(CACHE_KEYS.LIBRARY, []);
    if (cached.value.length > 0) {
      const next = cached.value.map((item) => ({
        ...item,
        thumbnail: item.thumbnail?.startsWith('data:image') ? undefined : item.thumbnail
      }));
      writeCache(CACHE_KEYS.LIBRARY, next);
      emitSync('library');
    }
  },

  getStorageBreakdown: async () => {
    try {
      const data = await apiFetch<{ breakdown: { librarySize: string; libraryCount: number; sessionsSize: string; sessionsCount: number; systemSize: string; totalSize: string } }>('/api/storage/breakdown');
      return data.breakdown;
    } catch (e) {
      const library = readCache<LibraryItem[]>(CACHE_KEYS.LIBRARY, []).value;
      const sessions = readCache<ChatSession[]>(CACHE_KEYS.SESSIONS, []).value;
      const settingsRaw = localStorage.getItem(CACHE_KEYS.SETTINGS) || '';
      const statsRaw = localStorage.getItem(CACHE_KEYS.STATS) || '';
      const toKb = (value: number) => (value / 1024).toFixed(1);
      const librarySize = toKb(new Blob([JSON.stringify(library)]).size);
      const sessionsSize = toKb(new Blob([JSON.stringify(sessions)]).size);
      const systemSize = toKb(new Blob([settingsRaw + statsRaw]).size);
      const totalSize = toKb(new Blob([JSON.stringify(library) + JSON.stringify(sessions) + settingsRaw + statsRaw]).size);
      return {
        librarySize,
        libraryCount: library.length,
        sessionsSize,
        sessionsCount: sessions.length,
        systemSize,
        totalSize
      };
    }
  },

  clearAllData: async () => {
    await apiFetch('/api/all', { method: 'DELETE' });
    localStorage.removeItem(CACHE_KEYS.LIBRARY);
    localStorage.removeItem(CACHE_KEYS.SESSIONS);
    localStorage.removeItem(CACHE_KEYS.STATS);
    localStorage.removeItem(CACHE_KEYS.SETTINGS);
    window.location.reload();
  }
};
