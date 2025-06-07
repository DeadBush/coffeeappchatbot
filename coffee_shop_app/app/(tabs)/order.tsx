import {Text, View, StatusBar, ScrollView, TouchableOpacity, TextInput, Image} from 'react-native';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import PageHeader from '@/components/PageHeader';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Product } from '@/types/types';
import { fetchProducts, postOrder } from '@/services/productService';
import { useCart } from '@/components/CartContext';
import Toast from 'react-native-root-toast';
import { router } from 'expo-router';

const Order = () => {
  const { cartItems, SetQuantityCart, emptyCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [orderNote, setOrderNote] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [receivedAddress, setReceivedAddress] = useState('');
  const [receivedName, setReceivedName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const calculateTotal = (products: Product[], quantities: { [key: string]: number }): number => {
    return products.reduce((total, product) => {
      const quantity = quantities[product.name] || 0;
      return total + product.price * quantity;
    }, 0);
  };

  useEffect(() => {
    const total = calculateTotal(products, cartItems);
    setTotalPrice(total);
  }, [cartItems, products]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (err) {
        setError('Error fetching products' + err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>{error}</Text>;

  const validateOrder = () => {
    const newErrors: { [key: string]: string } = {};
    if (!orderNote.trim()) newErrors.orderNote = 'Order note is required.';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required.';
    if (!receivedAddress.trim()) newErrors.receivedAddress = 'Delivery address is required.';
    if (!receivedName.trim()) newErrors.receivedName = 'Received name is required.';
    if (Object.entries(cartItems).filter(([_, quantity]) => quantity > 0).length === 0) newErrors.cart = 'Cart is empty.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const orderNow = async () => {
    if (!validateOrder()) return;
    const orderDetails = Object.entries(cartItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([name, quantity]) => {
        const product = products.find((p) => p.name === name);
        return product ? { productId: product.id, quantity } : null;
      })
      .filter((item): item is { productId: string; quantity: number } => item !== null);

    if (orderDetails.length === 0) {
      Toast.show('No items in cart!', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM });
      return;
    }

    try {
      await postOrder({
        orderNote,
        phoneNumber,
        receivedAddress,
        receivedName,
        orderDetails,
      });
      emptyCart();
      Toast.show('Order placed successfully!', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      router.push('/thankyou');
    } catch (error) {
      Toast.show('Order failed!', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM });
      console.error(error);
    }
  };

  return (
    <GestureHandlerRootView className="bg-[#F9F9F9] w-full h-full">
      <StatusBar backgroundColor="white" />
      <PageHeader title="Order" showHeaderRight={false} bgColor="#F9F9F9" />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Delivery Information</Text>
          <TextInput placeholder="Order Note" value={orderNote} onChangeText={setOrderNote} style={{ marginBottom: 8, backgroundColor: '#fff', borderRadius: 8, padding: 10 }} />
          {errors.orderNote && <Text style={{ color: 'red', marginBottom: 4 }}>{errors.orderNote}</Text>}
          <TextInput placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={{ marginBottom: 8, backgroundColor: '#fff', borderRadius: 8, padding: 10 }} />
          {errors.phoneNumber && <Text style={{ color: 'red', marginBottom: 4 }}>{errors.phoneNumber}</Text>}
          <TextInput placeholder="Delivery Address" value={receivedAddress} onChangeText={setReceivedAddress} style={{ marginBottom: 8, backgroundColor: '#fff', borderRadius: 8, padding: 10 }} />
          {errors.receivedAddress && <Text style={{ color: 'red', marginBottom: 4 }}>{errors.receivedAddress}</Text>}
          <TextInput placeholder="Received Name" value={receivedName} onChangeText={setReceivedName} style={{ marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, padding: 10 }} />
          {errors.receivedName && <Text style={{ color: 'red', marginBottom: 4 }}>{errors.receivedName}</Text>}

          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Cart</Text>
          {Object.entries(cartItems)
            .filter(([_, quantity]) => quantity > 0)
            .map(([name, quantity]) => {
              const product = products.find((p) => p.name === name);
              if (!product) return null;
              return (
                <View key={product.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#fff', borderRadius: 8, padding: 8 }}>
                  <Image source={{ uri: product.image_url }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{product.name}</Text>
                    <Text style={{ color: '#888' }}>{product.category}</Text>
                  </View>
                  <TouchableOpacity onPress={() => SetQuantityCart(name, -1)}><Text style={{ fontSize: 20, marginHorizontal: 8 }}>-</Text></TouchableOpacity>
                  <Text style={{ fontSize: 16 }}>{quantity}</Text>
                  <TouchableOpacity onPress={() => SetQuantityCart(name, 1)}><Text style={{ fontSize: 20, marginHorizontal: 8 }}>+</Text></TouchableOpacity>
                </View>
              );
            })}
          {errors.cart && <Text style={{ color: 'red', marginBottom: 4 }}>{errors.cart}</Text>}
        </View>
      </ScrollView>
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 8 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12, color: '#C67C4E', textAlign: 'center' }}>Payment Summary</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 16 }}>Price</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>${totalPrice}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#C67C4E' }}>Total</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#C67C4E' }}>${totalPrice}</Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: '#C67C4E', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 }}
          onPress={orderNow}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Order</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

export default Order;