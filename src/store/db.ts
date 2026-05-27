import type { ClothingItem, CalendarEvent, AppSettings } from '../types';

const DB_NAME = 'OutfitDB';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('clothes')) {
        db.createObjectStore('clothes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
      }),
  );
}

export const clothingDB = {
  getAll(): Promise<ClothingItem[]> {
    return tx<ClothingItem[]>('clothes', 'readonly', (s) => s.getAll());
  },
  get(id: string): Promise<ClothingItem | undefined> {
    return tx<ClothingItem | undefined>('clothes', 'readonly', (s) => s.get(id));
  },
  add(item: ClothingItem): Promise<string> {
    return tx<string>('clothes', 'readwrite', (s) => s.add(item));
  },
  put(item: ClothingItem): Promise<string> {
    return tx<string>('clothes', 'readwrite', (s) => s.put(item));
  },
  delete(id: string): Promise<undefined> {
    return tx<undefined>('clothes', 'readwrite', (s) => s.delete(id));
  },
};

export const eventDB = {
  getAll(): Promise<CalendarEvent[]> {
    return tx<CalendarEvent[]>('events', 'readonly', (s) => s.getAll());
  },
  get(id: string): Promise<CalendarEvent | undefined> {
    return tx<CalendarEvent | undefined>('events', 'readonly', (s) => s.get(id));
  },
  add(item: CalendarEvent): Promise<string> {
    return tx<string>('events', 'readwrite', (s) => s.add(item));
  },
  put(item: CalendarEvent): Promise<string> {
    return tx<string>('events', 'readwrite', (s) => s.put(item));
  },
  delete(id: string): Promise<undefined> {
    return tx<undefined>('events', 'readwrite', (s) => s.delete(id));
  },
};

export const settingsDB = {
  get(key: string): Promise<string | undefined> {
    return openDB().then(
      (db) =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction('settings', 'readonly');
          const store = transaction.objectStore('settings');
          const request = store.get(key);
          request.onsuccess = () => {
            const result = request.result as { key: string; value: string } | undefined;
            resolve(result?.value);
          };
          request.onerror = () => reject(request.error);
        }),
    );
  },
  set(key: string, value: string): Promise<string> {
    return openDB().then(
      (db) =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction('settings', 'readwrite');
          const store = transaction.objectStore('settings');
          const request = store.put({ key, value });
          request.onsuccess = () => resolve(request.result as string);
          request.onerror = () => reject(request.error);
        }),
    );
  },
  getAllSettings(): Promise<AppSettings> {
    return openDB().then(
      (db) =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction('settings', 'readonly');
          const store = transaction.objectStore('settings');
          const request = store.getAll();
          request.onsuccess = () => {
            const results = request.result as { key: string; value: string }[];
            const settings: AppSettings = {
              city: 'auto',
              weatherApiKey: '',
            };
            results.forEach((r) => {
              if (r.key === 'city') settings.city = r.value;
              if (r.key === 'weatherApiKey') settings.weatherApiKey = r.value;
            });
            resolve(settings);
          };
          request.onerror = () => reject(request.error);
        }),
    );
  },
};
