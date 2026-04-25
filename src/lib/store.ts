/**
 * store.ts  — all data operations now go through the Express + MongoDB backend.
 * The old localStorage implementation has been replaced with async API calls.
 */
import { api, getToken, setToken, clearToken } from "./api";
import { MenuItem, Order, User } from "./types";

export { getToken, setToken, clearToken };

// ---------- Auth ----------

export async function login(email: string, password: string): Promise<User> {
  const data = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
  setToken(data.token);
  return data.user;
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  const data = await api.post<{ token: string; user: User }>("/auth/signup", { name, email, password });
  setToken(data.token);
  return data.user;
}

export function logout() {
  clearToken();
}

export async function getSession(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  try {
    return await api.get<User>("/auth/me", true);
  } catch {
    clearToken();
    return null;
  }
}

// ---------- Menu ----------

export async function getMenu(): Promise<MenuItem[]> {
  return api.get<MenuItem[]>("/menu");
}

export async function upsertMenuItem(item: MenuItem): Promise<MenuItem> {
  if (item.id && !item.id.startsWith("_new_")) {
    // update existing — id is a MongoDB _id string
    return api.put<MenuItem>(`/menu/${item.id}`, item, true);
  }
  // create new
  const { id: _discard, ...body } = item;
  return api.post<MenuItem>("/menu", body, true);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await api.delete(`/menu/${id}`, true);
}

// ---------- Orders ----------

export async function getOrders(): Promise<Order[]> {
  return api.get<Order[]>("/orders", true);
}

export async function createOrder(
  o: Omit<Order, "tokenId" | "createdAt" | "status">
): Promise<Order> {
  return api.post<Order>("/orders", o, true);
}

export async function updateOrder(tokenId: string, patch: Partial<Order>): Promise<Order> {
  return api.patch<Order>(`/orders/${tokenId}`, patch, true);
}

export async function deleteOrder(tokenId: string): Promise<void> {
  await api.delete(`/orders/${tokenId}`, true);
}

// ---------- QR ----------

export async function getQR(): Promise<string | null> {
  const data = await api.get<{ value: string | null }>("/settings/qr");
  return data.value;
}

export async function setQR(dataUrl: string): Promise<void> {
  await api.put("/settings/qr", { value: dataUrl }, true);
}

// ---------- Legacy compat — kept to avoid import errors ----------
/** @deprecated No longer needed; session is loaded async via getSession() */
export function initStore() { /* no-op */ }
