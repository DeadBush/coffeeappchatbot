import { getDatabase, ref, push, remove } from 'firebase/database';
import { app } from '../config/firebaseConfig';

export interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  userId: string;
  email: string;
  items: OrderItem[];
  total: number;
  timestamp: number;
}

export async function saveOrder(order: Order) {
  const db = getDatabase(app);
  const ordersRef = ref(db, 'orders');
  await push(ordersRef, order);
}

export async function cancelOrder(orderKey: string) {
  const db = getDatabase(app);
  const orderRef = ref(db, `orders/${orderKey}`);
  await remove(orderRef);
} 