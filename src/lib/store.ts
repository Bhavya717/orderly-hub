import { MenuItem, Order, User } from "./types";

const KEYS = {
  users: "rb_users",
  session: "rb_session",
  menu: "rb_menu",
  orders: "rb_orders",
  qr: "rb_qr",
};

const ADMIN_EMAIL = "admin@restro.app";
const ADMIN_PASSWORD = "yokesh1290";

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

const DEFAULT_MENU: MenuItem[] = [
  { id: "m1", name: "Butter Chicken", description: "Creamy tomato curry, tender chicken", price: 320, category: "Mains", image: "🍛" },
  { id: "m2", name: "Paneer Tikka", description: "Smoky grilled cottage cheese", price: 240, category: "Starters", image: "🧀" },
  { id: "m3", name: "Garlic Naan", description: "Tandoor-baked, brushed with butter", price: 60, category: "Breads", image: "🫓" },
  { id: "m4", name: "Hyderabadi Biryani", description: "Aromatic basmati, slow-cooked", price: 280, category: "Mains", image: "🍚" },
  { id: "m5", name: "Masala Dosa", description: "Crisp crepe with spiced potato", price: 140, category: "South Indian", image: "🥞" },
  { id: "m6", name: "Gulab Jamun", description: "Warm, syrup-soaked dessert", price: 90, category: "Desserts", image: "🍮" },
  { id: "m7", name: "Mango Lassi", description: "Chilled yogurt smoothie", price: 110, category: "Drinks", image: "🥭" },
  { id: "m8", name: "Veg Thali", description: "Complete meal with sides", price: 350, category: "Mains", image: "🍱" },
];

export function initStore() {
  if (!localStorage.getItem(KEYS.users)) {
    const admin: User = {
      id: "admin-1",
      name: "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    };
    write(KEYS.users, [admin]);
  }
  if (!localStorage.getItem(KEYS.menu)) write(KEYS.menu, DEFAULT_MENU);
  if (!localStorage.getItem(KEYS.orders)) write(KEYS.orders, []);
}

// ---------- Auth ----------
export function getUsers(): User[] { return read<User[]>(KEYS.users, []); }
export function getSession(): User | null { return read<User | null>(KEYS.session, null); }

export function login(email: string, password: string): User {
  const users = getUsers();
  const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!u) throw new Error("Invalid email or password");
  write(KEYS.session, u);
  return u;
}

export function signup(name: string, email: string, password: string): User {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already registered");
  }
  const user: User = { id: crypto.randomUUID(), name, email, password, role: "customer" };
  write(KEYS.users, [...users, user]);
  write(KEYS.session, user);
  return user;
}

export function logout() { localStorage.removeItem(KEYS.session); window.dispatchEvent(new StorageEvent("storage", { key: KEYS.session })); }

// ---------- Menu ----------
export function getMenu(): MenuItem[] { return read<MenuItem[]>(KEYS.menu, []); }
export function saveMenu(items: MenuItem[]) { write(KEYS.menu, items); }
export function upsertMenuItem(item: MenuItem) {
  const list = getMenu();
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item; else list.push(item);
  saveMenu(list);
}
export function deleteMenuItem(id: string) { saveMenu(getMenu().filter((x) => x.id !== id)); }

// ---------- Orders ----------
export function getOrders(): Order[] { return read<Order[]>(KEYS.orders, []); }
export function saveOrders(orders: Order[]) { write(KEYS.orders, orders); }
export function createOrder(o: Omit<Order, "tokenId" | "createdAt" | "status">): Order {
  const tokenId = "T" + Math.floor(1000 + Math.random() * 9000);
  const order: Order = { ...o, tokenId, status: "processing", createdAt: new Date().toISOString() };
  saveOrders([order, ...getOrders()]);
  return order;
}
export function updateOrder(tokenId: string, patch: Partial<Order>) {
  saveOrders(getOrders().map((o) => (o.tokenId === tokenId ? { ...o, ...patch } : o)));
}
export function deleteOrder(tokenId: string) {
  saveOrders(getOrders().filter((o) => o.tokenId !== tokenId));
}

// ---------- QR ----------
export function getQR(): string | null { return read<string | null>(KEYS.qr, null); }
export function setQR(dataUrl: string) { write(KEYS.qr, dataUrl); }
