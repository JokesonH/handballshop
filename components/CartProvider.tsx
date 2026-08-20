"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { CartLine } from "@/lib/cart";

const KEY = "northcourt.cart.v1";
const MAX_QTY = 10;

/**
 * The cart lives in localStorage, which is an external store — so it's read
 * through useSyncExternalStore rather than mirrored into state via an effect.
 * That gets correct hydration (empty on the server, real on the client, no
 * mismatch) and cross-tab sync, without a render-then-correct flash.
 */

const EMPTY: CartLine[] = [];
let snapshot: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    const lines = value.filter(
      (l): l is CartLine =>
        !!l &&
        typeof (l as CartLine).slug === "string" &&
        typeof (l as CartLine).size === "string" &&
        typeof (l as CartLine).qty === "number"
    );
    return lines.length ? lines : EMPTY;
  } catch {
    return EMPTY;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Another tab changing the cart should update this one.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    snapshot = parse(event.newValue);
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Must return a referentially stable value between mutations, or React loops. */
function getSnapshot(): CartLine[] {
  if (!loaded) {
    snapshot = parse(window.localStorage.getItem(KEY));
    loaded = true;
  }
  return snapshot;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function commit(next: CartLine[]) {
  snapshot = next;
  loaded = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private browsing / quota — the in-memory cart still works */
  }
  listeners.forEach((l) => l());
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (line: CartLine) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const add = useCallback((line: CartLine) => {
    const current = getSnapshot();
    const i = current.findIndex((l) => l.slug === line.slug && l.size === line.size);
    if (i === -1) {
      commit([...current, { ...line, qty: Math.min(line.qty, MAX_QTY) }]);
      return;
    }
    const next = [...current];
    next[i] = { ...next[i], qty: Math.min(next[i].qty + line.qty, MAX_QTY) };
    commit(next);
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    const current = getSnapshot();
    commit(
      qty <= 0
        ? current.filter((l) => !(l.slug === slug && l.size === size))
        : current.map((l) =>
            l.slug === slug && l.size === size ? { ...l, qty: Math.min(qty, MAX_QTY) } : l
          )
    );
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    commit(getSnapshot().filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const clear = useCallback(() => commit(EMPTY), []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      add,
      setQty,
      remove,
      clear,
      ready,
    }),
    [lines, add, setQty, remove, clear, ready]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
