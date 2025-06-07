import api from './api';
import { Product } from '../types/types';

const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  
  return response.data.data.map((item: any) => ({
    ...item,
    image_url: item.image_url,
  }));
};

const postOrder = async (order: any) => {
  return api.post('/orders', order);
};

export { fetchProducts, postOrder };