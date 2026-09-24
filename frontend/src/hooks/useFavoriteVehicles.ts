import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "concessionaria.favorites";

function readFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function useFavoriteVehicles() {
  const [favorites, setFavorites] = useState<number[]>(readFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // localStorage indisponível (modo privado, storage bloqueado etc.) — favoritos seguem só em memória
    }
  }, [favorites]);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((favoriteId) => favoriteId !== id) : [...prev, id]));
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
