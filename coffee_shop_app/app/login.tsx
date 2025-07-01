import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../config/firebaseConfig';
import CustomKeyboardView from '@/components/CustomKeyboardView';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace('/(tabs)/home');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1 bg-[#F9F9F9]">
      <CustomKeyboardView>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-3xl font-[Sora-SemiBold] mb-8 text-app_orange_color">Login</Text>
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
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-xl color-white font-[Sora-SemiBold]">{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('./register')}>
            <Text className="text-base text-app_orange_color font-[Sora-Regular]">Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </CustomKeyboardView>
    </GestureHandlerRootView>
  );
};

export default LoginPage; 