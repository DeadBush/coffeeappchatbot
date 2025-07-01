import { Text, View,TouchableOpacity, ScrollView, StatusBar  } from 'react-native'
import React, { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router'
import { useLocalSearchParams } from "expo-router";
import PageHeader from '@/components/PageHeader';
import { useCart } from '@/components/CartContext';
import Toast from 'react-native-root-toast';
import DescriptionSection from '@/components/DescriptionSection';
import SizesSection from '@/components/SizesSection';
import DetailsHeader from '@/components/DetailsHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailsPage = () => {
  const { addToCart } = useCart();

  const { name, image_url, type, description, price, rating, id } = useLocalSearchParams() as { name: string, image_url: string, type: string, description: string, price: string, rating: string, id?: string };
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  useEffect(() => {
    const checkFavorite = async () => {
      const favs = await AsyncStorage.getItem('favourites');
      const favArr = favs ? JSON.parse(favs) : [];
      setIsFavorite(favArr.some((item: any) => item.id === id || item.name === name));
    };
    checkFavorite();
  }, [id, name]);

  const handleToggleFavorite = async () => {
    const favs = await AsyncStorage.getItem('favourites');
    let favArr = favs ? JSON.parse(favs) : [];
    if (isFavorite) {
      favArr = favArr.filter((item: any) => !(item.id === id || item.name === name));
    } else {
      favArr.push({ id: id || name, name, image_url, type, description, price, rating });
    }
    await AsyncStorage.setItem('favourites', JSON.stringify(favArr));
    setIsFavorite(!isFavorite);
  };

  const buyNow = () => {
    addToCart(`${name}|${selectedSize}`, 1);
    Toast.show(`${name} (${selectedSize}) added to cart`, {
      duration: Toast.durations.SHORT,
    });
    router.back();
  };

  return (
    <GestureHandlerRootView
      className='bg-[#F9F9F9] w-full h-full'
    >
      <StatusBar backgroundColor="white" />

      <PageHeader title="Detail" showHeaderRight={false} bgColor='#F9F9F9' />
      
      <View className='h-full flex-col justify-between'>
        <ScrollView>
            <View className='mx-5 items-center'>
              <DetailsHeader image_url={image_url} name={name} type={type} rating={Number(rating)} isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite} />
              <DescriptionSection description={description} />
              <SizesSection selectedSize={selectedSize} onSelectSize={setSelectedSize} />
            </View>
        </ScrollView>
        
        <View
          className='flex-row justify-between bg-white rounded-tl-3xl rounded-tr-3xl px-6 pt-3 pb-6'
        > 
          <View>
            <Text
                    className="text-[#A2A2A2] text-base font-[Sora-Regular] pb-3"
              >Price
            </Text>
            <Text
                    className="text-app_orange_color text-2xl font-[Sora-SemiBold]"
              >$ {price}
            </Text>
          </View>
            
          <TouchableOpacity 
                className="bg-app_orange_color w-[70%] rounded-3xl items-center justify-center" 
                onPress = {buyNow}
              >
                <Text className="text-xl color-white font-[Sora-Regular]">Buy Now</Text> 
          </TouchableOpacity> 
        
        </View>
        
      </View>
      
        
    </GestureHandlerRootView>
  )
}

export default DetailsPage