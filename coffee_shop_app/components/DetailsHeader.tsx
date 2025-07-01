import { Text, View,Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Octicons from '@expo/vector-icons/Octicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FontAwesome5 } from '@expo/vector-icons';

interface DetailsHeaderInterface {
    image_url: string;
    name: string;
    type: string;
    rating: number;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

const DetailsHeader = ({image_url,name,type,rating,isFavorite,onToggleFavorite}:DetailsHeaderInterface) => {
  return (
    <>
        <View style={{ position: 'relative', width: '100%' }}>
            <Image 
                source = {{ uri: image_url}}
                className='w-full  h-48 rounded-2xl mt-2'
            />
            <TouchableOpacity
                style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
                onPress={onToggleFavorite}
            >
                <FontAwesome5 name="heart" size={28} color={isFavorite ? '#ED5151' : '#A2A2A2'} solid />
            </TouchableOpacity>
        </View>

        <View>
            <Text
                className="text-[#242424] text-2xl font-[Sora-SemiBold] ml-1 mt-2"
                >{name}
            </Text>

            <View
                className='flex-row w-full justify-between'
            >
                <Text
                className="text-[#A2A2A2] text-sm font-[Sora-Regular] ml-1 mt-1 mb-5"
                >{type}
                </Text>

                <View className='flex-row mt-2'>
                    <View
                        className='bg-[#F5F5F5] p-2 rounded-xl mr-2'
                    >
                        <MaterialIcons 
                        name="delivery-dining" size={24} color="#C67C4E"/>
                    </View>

                    <View
                        className='bg-[#F5F5F5] p-2 rounded-xl mr-2'
                    >
                        <FontAwesome 
                        name="coffee" size={24} color="#C67C4E"/>
                    </View>

                    <View
                        className='bg-[#F5F5F5] p-2 rounded-xl mr-2'
                    >
                        <MaterialCommunityIcons 
                        name="food-croissant"  size={24} color="#C67C4E"/>
                    </View>
                </View>

            </View>
        
            <View
                className='flex-row pl-2'
                >
                <Octicons name="star-fill" size={24} color="#FBBE21" />
                <Text 
                className='pl-2 text-xl -mt-1 font-[Sora-SemiBold] text-[#2A2A2A]'
                >
                {rating}
                </Text>
            </View>

            <View className='w-full items-center'>
                <View className="w-[90%] border-b border-gray-400 my-4" />
            </View>
        </View>
    </>
  )
}

export default DetailsHeader