import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { Product } from '@/types/types';
import OrdersHeader from './OrdersHeader';
import OrdersFooter from './OrdersFooter';
import { useCart } from './CartContext';
import Feather from '@expo/vector-icons/Feather';

// Props for ProductList
interface ProductListProps {
    products: Product[];
    quantities: { [key: string]: number };
    setQuantities: (itemKey: string, delta: number) => void;
    totalPrice: number;
  }
  
const ProductList: React.FC<ProductListProps> = ({ products, quantities, setQuantities,totalPrice }) => {
    const { removeFromCart } = useCart();
    // Get all cart entries with quantity > 0
    const cartEntries = Object.entries(quantities).filter(([key, qty]) => qty > 0);

    const renderItem = ({ item }: { item: [string, number] }) => {
      const [key, qty] = item;
      const [name, size] = key.split('|');
      const product = products.find(p => p.name === name);
      if (!product) return null;
      return (
        <View className="flex-row items-center justify-between mx-7 pb-3">
          <Image
            source={{ uri: product.image_url }}
            className="w-16 h-16 rounded-lg"
          />
          <View className="flex-1 ml-4 pt-2">
            <Text className="text-lg font-[Sora-SemiBold] text-[#242424]">{product.name} <Text className="text-sm">({size})</Text></Text>
            <Text className="font-[Sora-Regular] text-xs text-gray-500">{product.category}</Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => setQuantities(key, -1)}>
              <Text className="text-xl">−</Text>
            </TouchableOpacity>
            <Text className="mx-2">{qty}</Text>
            <TouchableOpacity onPress={() => setQuantities(key, 1)}>
              <Text className="text-xl">+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeFromCart(key)} className="ml-3">
              <Feather name="trash-2" size={22} color="#C67C4E" />
            </TouchableOpacity>
          </View>
        </View>
      );
    };
  
    return (
        <View>
            {cartEntries.length > 0 ? (
                <FlatList
                    ListHeaderComponent={<OrdersHeader />}
                    ListFooterComponent={<OrdersFooter totalPrice={totalPrice} />}
                    data={cartEntries}
                    renderItem={renderItem}
                    keyExtractor={([key]) => key}
                />
            ) : (
                
                <View className='mx-7 items-center'>
                    <Text className="text-2xl font-[Sora-SemiBold] text-gray-500 mb-4 text-center">No items in your cart yet</Text>
                    <Text className="text-xl font-[Sora-SemiBold] text-gray-500 text-center">Let's Go Get some Delicious Goodies</Text>
                </View>
            )}
        </View>
    );
  };
  
export default ProductList;