import type { Session, VideoEvent } from './types';

// Chrome local storage helper wrapper
export const extensionStorage = {
  async get<T>(key: string, defaultValue?: T): Promise<T> {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      const val = localStorage.getItem(key);
      return (val ? JSON.parse(val) : defaultValue) as T;
    }
    const result = await chrome.storage.local.get(key);
    return (result[key] !== undefined ? result[key] : defaultValue) as T;
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    await chrome.storage.local.set({ [key]: value });
  },

  async append<T>(key: string, item: T): Promise<void> {
    const current = await this.get<T[]>(key, []);
    current.push(item);
    await this.set(key, current);
  },

  async remove(key: string): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      localStorage.removeItem(key);
      return;
    }
    await chrome.storage.local.remove(key);
  },

  async clear(): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      localStorage.clear();
      return;
    }
    await chrome.storage.local.clear();
  }
};

// Native IndexedDB wrapper for large log streams (sessions & raw events)
const DB_NAME = 'scrollguard_db';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';
const STORE_EVENTS = 'video_events';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        db.createObjectStore(STORE_SESSIONS, { keyPath: 'sessionId' });
      }
      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        db.createObjectStore(STORE_EVENTS, { autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const logStorage = {
  async saveSession(session: Session): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readwrite');
      const store = tx.objectStore(STORE_SESSIONS);
      const request = store.put(session);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getSessions(): Promise<Session[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readonly');
      const store = tx.objectStore(STORE_SESSIONS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async saveVideoEvent(event: VideoEvent): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EVENTS, 'readwrite');
      const store = tx.objectStore(STORE_EVENTS);
      const request = store.add(event);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getVideoEvents(): Promise<VideoEvent[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EVENTS, 'readonly');
      const store = tx.objectStore(STORE_EVENTS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async clearLogs(): Promise<void> {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_SESSIONS, STORE_EVENTS], 'readwrite');
      tx.objectStore(STORE_SESSIONS).clear();
      tx.objectStore(STORE_EVENTS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};
