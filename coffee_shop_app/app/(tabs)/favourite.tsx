import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '@/components/CartContext';
import Toast from 'react-native-root-toast';

interface FavouriteItem {
  id: string;
  name: string;
  image_url: string;
  type: string;
  [key: string]: any;
}

const FavouritePage = () => {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const router = useRouter();
  const { addToCart } = useCart();

  useFocusEffect(
    React.useCallback(() => {
      const loadFavourites = async () => {
        const favs = await AsyncStorage.getItem('favourites');
        setFavourites(favs ? JSON.parse(favs) : []);
      };
      loadFavourites();
    }, [])
  );

  return (
    <View className="flex-1 bg-[#F9F9F9] pt-8">
      <Text className="text-3xl font-[Sora-SemiBold] text-app_orange_color text-center mb-6">Favourites</Text>
      {favourites.length === 0 ? (
        <Text className="text-center text-[#A2A2A2] font-[Sora-Regular]">No favourites yet.</Text>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={item => item.id + '-' + item.name}
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-white rounded-2xl mx-4 mb-4 p-4 border border-[#EDEDED]">
              <TouchableOpacity
                className="flex-1 flex-row items-center"
                onPress={() => router.push({ pathname: '/details', params: { ...item } })}
              >
                {item.image_url && (
                  <Image source={{ uri: item.image_url }} style={{ width: 48, height: 48, borderRadius: 12, marginRight: 16 }} />
                )}
                <View className="flex-1">
                  <Text className="text-lg font-[Sora-SemiBold] text-[#242424]">{item.name}</Text>
                  <Text className="text-sm text-[#A2A2A2]">{item.type}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-2 bg-app_orange_color rounded-xl px-4 py-2 items-center justify-center"
                onPress={() => {
                  addToCart(item.name, 1);
                  Toast.show(`${item.name} added to cart`, { duration: Toast.durations.SHORT });
                }}
              >
                <Text className="text-white font-[Sora-SemiBold]">Add to cart</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default FavouritePage; 