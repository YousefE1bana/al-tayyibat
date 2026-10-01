import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type FavoriteKind = "food" | "recipe" | "article";

interface Favorites {
  food: string[];
  recipe: string[];
  article: string[];
}

const EMPTY: Favorites = { food: [], recipe: [], article: [] };
const EMPTY_LIST: string[] = [];

function normalizeIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && id.length > 0))]
    : [];
}

function normalizeFavorites(value: unknown): Favorites {
  const record = value !== null && typeof value === "object" ? value as Partial<Record<FavoriteKind, unknown>> : {};
  return {
    food: normalizeIds(record.food),
    recipe: normalizeIds(record.recipe),
    article: normalizeIds(record.article),
  };
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<Favorites>("favorites", EMPTY, normalizeFavorites);

  const isFavorite = useCallback(
    (kind: FavoriteKind, id: string) => favorites[kind]?.includes(id) ?? false,
    [favorites],
  );

  const toggle = useCallback(
    (kind: FavoriteKind, id: string) =>
      setFavorites((prev) => {
        const list = prev[kind] ?? [];
        return { ...prev, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [id, ...list] };
      }),
    [setFavorites],
  );

  const count = favorites.food.length + favorites.recipe.length + favorites.article.length;
  return { favorites, isFavorite, toggle, count };
}

const MAX_RECENT = 8;
const normalizeRecent = (value: unknown) => normalizeIds(value).slice(0, MAX_RECENT);

export function useRecentFoods() {
  const [recent, setRecent] = useLocalStorage<string[]>("recent-foods", EMPTY_LIST, normalizeRecent);
  const push = useCallback(
    (id: string) => setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENT)),
    [setRecent],
  );
  const clear = useCallback(() => setRecent([]), [setRecent]);
  return { recent, push, clear };
}

export function useShoppingChecks() {
  const [checked, setChecked] = useLocalStorage<string[]>("shopping", EMPTY_LIST, normalizeIds);
  const toggle = useCallback(
    (id: string) => setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setChecked],
  );
  const reset = useCallback(() => setChecked([]), [setChecked]);
  return { checked, toggle, reset };
}
