import { Text, View,TouchableOpacity } from 'react-native'
import React from 'react'

interface SizesSectionProps {
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

const SizesSection = ({ selectedSize, onSelectSize }: SizesSectionProps) => {
  const sizes = ['S', 'M', 'L'];

  return (
    <View>
        <Text
            className="text-[#242424] text-lg font-[Sora-SemiBold] ml-1 mt-4"
            >Size
        </Text>

        <View className="flex-row justify-center items-center space-x-4 mt-3 mb-3">
            {sizes.map((size) => (
            <TouchableOpacity
                key={size}
                onPress={() => onSelectSize(size)}
                className={`px-4 py-2 rounded-2xl w-[30%] items-center ${
                selectedSize === size ? 'bg-[#fdf5f0] border-2 border-app_orange_color' : 'bg-white'
                }`}
            >
                <Text className={`font-[Sora-Regular] ${selectedSize === size ? 'text-app_orange_color' : 'text-black'}`}>{size}</Text>
            </TouchableOpacity>
            ))}
        </View>
    </View>
  )
}

export default SizesSection