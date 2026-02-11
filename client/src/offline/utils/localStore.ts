// src/shared/storage/localStore.ts
export const localStore = {
  getJSON<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  setJSON(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};
