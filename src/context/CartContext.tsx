import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { MenuItem, OrderItem } from "@/lib/types";

interface CartCtx {
  items: OrderItem[];
  add: (m: MenuItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<OrderItem[]>([]);

  const add = (m: MenuItem) =>
    setItems((prev) => {
      const ex = prev.find((p) => p.id === m.id);
      if (ex) return prev.map((p) => (p.id === m.id ? { ...p, quantity: p.quantity + 1 } : p));
      return [...prev, { id: m.id, name: m.name, price: m.price, quantity: 1 }];
    });
  const remove = (id: string) => setItems((p) => p.filter((x) => x.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((p) => (qty <= 0 ? p.filter((x) => x.id !== id) : p.map((x) => (x.id === id ? { ...x, quantity: qty } : x))));
  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, total, count }}>{children}</Ctx.Provider>;
};

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};
