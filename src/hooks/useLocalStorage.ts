import { useCallback, useSyncExternalStore } from "react";

const PREFIX = "tayyibat:";

interface StorageState {
  value: unknown;
  fallback: unknown;
  normalize: (value: unknown) => unknown;
  listeners: Set<() => void>;
}

const states = new Map<string, StorageState>();
let listening = false;

function parse(raw: string | null, state: Pick<StorageState, "fallback" | "normalize">) {
  try {
    return raw === null ? state.fallback : state.normalize(JSON.parse(raw));
  } catch {
    return state.fallback;
  }
}

function notify(state: StorageState) {
  state.listeners.forEach((listener) => listener());
}

function listenForStorage() {
  if (listening) return;
  listening = true;
  window.addEventListener("storage", (event) => {
    if (event.storageArea) {
      try {
        if (event.storageArea !== window.localStorage) return;
      } catch {
        return;
      }
    }
    states.forEach((state, key) => {
      if (event.key === null || event.key === PREFIX + key) {
        state.value = parse(event.key === null ? null : event.newValue, state);
        notify(state);
      }
    });
  });
}

/** Validated storage state shared across components, including when persistence is unavailable. */
export function useLocalStorage<T>(key: string, fallback: T, normalize: (value: unknown) => T) {
  let state = states.get(key);
  if (!state) {
    state = { value: fallback, fallback, normalize, listeners: new Set() };
    try {
      state.value = parse(window.localStorage.getItem(PREFIX + key), state);
    } catch {
      // Keep the shared in-memory state when storage access is denied.
    }
    states.set(key, state);
  }
  const current = state;

  const subscribe = useCallback((listener: () => void) => {
    listenForStorage();
    current.listeners.add(listener);
    return () => { current.listeners.delete(listener); };
  }, [current]);
  const getSnapshot = useCallback(() => current.value as T, [current]);
  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    const resolved = typeof next === "function" ? (next as (prev: T) => T)(current.value as T) : next;
    current.value = current.normalize(resolved);
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(current.value));
    } catch {
      // All mounted consumers still receive the in-memory update.
    }
    notify(current);
  }, [key, current]);

  return [value, set] as const;
}
