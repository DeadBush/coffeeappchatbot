import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../config/firebaseConfig';
import CustomKeyboardView from '@/components/CustomKeyboardView';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const auth = getAuth(app);
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView className="flex-1 bg-[#F9F9F9]">
      <CustomKeyboardView>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-3xl font-[Sora-SemiBold] mb-8 text-app_orange_color">Register</Text>
          <TextInput
            className="w-full h-14 bg-white rounded-2xl px-4 mb-4 text-base font-[Sora-Regular] border border-[#EDEDED]"
            placeholder="Email"
            placeholderTextColor="#A2A2A2"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="w-full h-14 bg-white rounded-2xl px-4 mb-6 text-base font-[Sora-Regular] border border-[#EDEDED]"
            placeholder="Password"
            placeholderTextColor="#A2A2A2"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            className="bg-app_orange_color w-full rounded-2xl items-center justify-center py-4 mb-4"
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-xl color-white font-[Sora-SemiBold]">{loading ? 'Registering...' : 'Register'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('./login')}>
            <Text className="text-base text-app_orange_color font-[Sora-Regular]">Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </CustomKeyboardView>
    </GestureHandlerRootView>
  );
};

export default RegisterPage; 