export type Role = "admin" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // mock only — DO NOT do this in production
  role: Role;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "processing" | "completed";

export interface Order {
  tokenId: string;
  userId: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  paymentScreenshot?: string; // base64
  status: OrderStatus;
  createdAt: string;
}
