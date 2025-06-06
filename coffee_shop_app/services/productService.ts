import api from './api';
import { Product } from '../types/types';

const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  
  return response.data.data.map((item: any) => ({
    ...item,
    
  }));
};

const postOrder = async (orderItems: { productId: string; quantity: number }[]) => {
  return api.post('/orders', { items: orderItems });
};

export { fetchProducts, postOrder };