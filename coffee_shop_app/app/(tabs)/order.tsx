import {Text, View,StatusBar,ScrollView,TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react';
import { GestureHandlerRootView} from 'react-native-gesture-handler'
import React from 'react'
import PageHeader from '@/components/PageHeader'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Product } from '@/types/types';
import { fetchProducts } from '@/services/productService';
import ProductList from '@/components/CartProductList';
import { useCart } from '@/components/CartContext';
import Toast from 'react-native-root-toast';
import { router } from 'expo-router';
import { saveOrder, OrderItem } from '@/services/orderService';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Order = () => {

  const { cartItems, SetQuantityCart,emptyCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const calculateTotal = (products: Product[], quantities: { [key: string]: number }): number => {
    return Object.entries(quantities).reduce((total, [key, quantity]) => {
      const [productName] = key.split('|');
      const product = products.find(p => p.name === productName);
      return product ? total + product.price * quantity : total;
    }, 0);
  };

  useEffect(() => {
    const total = calculateTotal(products, cartItems);
    setTotalPrice(total);
  }, [cartItems,products]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await fetchProducts();

        setProducts(productsData);
      } catch (err) {
        setError("Error fetching products"+err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>{error}</Text>;

  const orderNow = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        Toast.show('You must be logged in to place an order.', { duration: Toast.durations.SHORT });
        router.replace('/login');
        return;
      }
      // Load user profile info
      let name = '', address = '', phone = '';
      const profileStr = await AsyncStorage.getItem(`userProfile-${user.uid}`);
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        name = profile.name || '';
        address = profile.address || '';
        phone = profile.phone || '';
      }
      const items: OrderItem[] = Object.entries(cartItems).map(([key, quantity]) => {
        const [productName, size = "M"] = key.split('|');
        const product = products.find(p => p.name === productName);
        return product ? { name: productName, size, quantity, price: product.price } : null;
      }).filter(Boolean) as OrderItem[];
      const order = {
        userId: user.uid,
        email: user.email || '',
        name,
        address,
        phone,
        items,
        total: totalPrice === 0 ? 0 : totalPrice + 1,
        timestamp: Date.now(),
      };
      await saveOrder(order);
      emptyCart();
      Toast.show('Order placed successfully!', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      router.push('/thankyou');
    } catch (error: any) {
      Toast.show('Failed to place order: ' + error.message, { duration: Toast.durations.SHORT });
    }
  };

  return (
    <GestureHandlerRootView
      className='bg-[#F9F9F9] w-full h-full'
    >
      <StatusBar backgroundColor="white" />
      <PageHeader title="Order" showHeaderRight={false} bgColor='#F9F9F9' />

      <View className='h-full flex-col justify-between'>

        <View className='h-[75%]'>
          <ProductList products={products} quantities={cartItems} setQuantities={SetQuantityCart} totalPrice={totalPrice} />
        </View>
        
        <View
            className='bg-white rounded-tl-3xl rounded-tr-3xl px-7 pt-3 pb-6'
          > 
          <View
            className='flex-row justify-between items-center'
          >
            <View className='flex-row items-center'>
              <Ionicons name="wallet-outline" size={24} color="#C67C4E" />
              <View>
                <Text
                        className="text-[#242424] text-base font-[Sora-SemiBold] pb-1 ml-3"
                  >Cash/Wallet
                </Text>
                <Text
                        className="text-app_orange_color text-sm font-[Sora-SemiBold] ml-3"
                  >$ {totalPrice === 0 ? 0 : totalPrice+1} 
                </Text>
              </View>

            </View>

            <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />

          </View>
            
          <TouchableOpacity 
                className={`${totalPrice=== 0 ? 'bg-[#EDEDED]' : 'bg-app_orange_color' }  2-full rounded-2xl items-center justify-center mt-6 py-3`}
                disabled={totalPrice === 0}
                onPress={orderNow}
              >
                <Text className="text-xl color-white font-[Sora-Regular]">Order</Text> 
          </TouchableOpacity> 
        
        </View>

      </View>

    </GestureHandlerRootView>
  )
}

export default Order