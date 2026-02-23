import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export interface MixedSet {
  id: number;
  numbers: number[];
  createdAt: Date;
  drawName: string;
  status: "available" | "unavailable";
}

interface StoredData {
  savedSets: Array<Omit<MixedSet, "createdAt"> & { createdAt: string }>;
  counter: number;
}

function loadFromStorage(): { sets: MixedSet[]; counter: number } {
  try {
    const raw = localStorage.getItem("mix-store");
    if (!raw) return { sets: [], counter: 1 };
    const data: StoredData = JSON.parse(raw);
    const sets = data.savedSets.map((s) => ({
      ...s,
      createdAt: new Date(s.createdAt),
    }));
    return { sets, counter: data.counter };
  } catch {
    return { sets: [], counter: 1 };
  }
}

function saveToStorage(sets: MixedSet[], counter: number) {
  const data: StoredData = {
    savedSets: sets.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
    counter,
  };
  localStorage.setItem("mix-store", JSON.stringify(data));
}

interface MixStoreContextType {
  savedSets: MixedSet[];
  setSavedSets: React.Dispatch<React.SetStateAction<MixedSet[]>>;
  addSet: (set: MixedSet) => void;
  deleteSet: (id: number) => void;
  toggleAvailability: (id: number) => void;
  setCounter: number;
  incrementCounter: () => number;
}

const MixStoreContext = createContext<MixStoreContextType | null>(null);

export function MixStoreProvider({ children }: { children: ReactNode }) {
  const [savedSets, setSavedSets] = useState<MixedSet[]>(() => loadFromStorage().sets);
  const [counter, setCounter] = useState(() => loadFromStorage().counter);

  useEffect(() => {
    saveToStorage(savedSets, counter);
  }, [savedSets, counter]);

  const addSet = useCallback((set: MixedSet) => {
    setSavedSets((prev) => {
      if (prev.length === 0) {
        return [set];
      }
      return [set, ...prev];
    });
  }, []);

  const deleteSet = useCallback((id: number) => {
    setSavedSets((prev) => {
      const deleted = prev.find((s) => s.id === id);
      const remaining = prev.filter((s) => s.id !== id);
      if (deleted?.status === "available" && remaining.length > 0) {
        remaining[0] = { ...remaining[0], status: "available" };
      }
      return remaining;
    });
  }, []);

  const toggleAvailability = useCallback((id: number) => {
    setSavedSets((prev) =>
      prev.map((s) => ({
        ...s,
        status: s.id === id ? "available" : "unavailable",
      }))
    );
  }, []);

  const incrementCounter = useCallback(() => {
    const current = counter;
    setCounter((c) => c + 1);
    return current;
  }, [counter]);

  return (
    <MixStoreContext.Provider
      value={{
        savedSets,
        setSavedSets,
        addSet,
        deleteSet,
        toggleAvailability,
        setCounter: counter,
        incrementCounter,
      }}
    >
      {children}
    </MixStoreContext.Provider>
  );
}

export function useMixStore() {
  const ctx = useContext(MixStoreContext);
  if (!ctx) {
    throw new Error("useMixStore must be used within MixStoreProvider");
  }
  return ctx;
}
