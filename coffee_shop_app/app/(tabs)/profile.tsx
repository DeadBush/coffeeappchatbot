import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { app } from '../../config/firebaseConfig';
import { router } from 'expo-router';
import { getDatabase, ref, onValue, DataSnapshot } from 'firebase/database';
import { cancelOrder } from '@/services/orderService';

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderKeys, setOrderKeys] = useState<string[]>([]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const db = getDatabase(app);
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const userOrders = data
        ? Object.entries(data)
            .filter(([_, order]: [string, any]) => order.userId === user.uid)
            .map(([key, order]: [string, any]) => ({ key, ...order }))
        : [];
      setOrders(userOrders.reverse());
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <GestureHandlerRootView className="flex-1 bg-[#F9F9F9]">
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text className="text-3xl font-[Sora-SemiBold] mb-8 text-app_orange_color">Profile</Text>
        <View className="w-full bg-white rounded-2xl p-6 mb-8 border border-[#EDEDED] items-center">
          <Text className="text-lg font-[Sora-Regular] text-[#242424] mb-2">Email:</Text>
          <Text className="text-lg font-[Sora-SemiBold] text-app_orange_color">{user?.email}</Text>
        </View>
        <TouchableOpacity
          className="bg-app_orange_color w-full rounded-2xl items-center justify-center py-4"
          onPress={handleLogout}
        >
          <Text className="text-xl color-white font-[Sora-SemiBold]">Logout</Text>
        </TouchableOpacity>

        {/* Orders List */}
        <View className="w-full mt-8">
          <Text className="text-lg font-[Sora-SemiBold] mb-4 text-[#242424]">Order History</Text>
          {orders.length === 0 ? (
            <Text className="text-base text-[#A2A2A2] font-[Sora-Regular]">No orders yet.</Text>
          ) : (
            orders.map((order, idx) => (
              <View key={order.key} className="mb-6 p-4 bg-white rounded-2xl border border-[#EDEDED]">
                <Text className="text-base font-[Sora-SemiBold] text-app_orange_color mb-1">
                  {new Date(order.timestamp).toLocaleString()}
                </Text>
                <Text className="text-base font-[Sora-Regular] text-[#242424] mb-1">
                  Total: ${order.total}
                </Text>
                <Text className="text-base font-[Sora-Regular] text-[#242424] mb-1">Items:</Text>
                {order.items.map((item: any, i: number) => (
                  <Text key={i} className="text-sm text-[#242424] ml-2">
                    - {item.name} x{item.quantity} (${item.price} each)
                  </Text>
                ))}
                <TouchableOpacity
                  className="mt-4 bg-red-500 rounded-xl py-2 px-4 items-center"
                  onPress={async () => {
                    await cancelOrder(order.key);
                  }}
                >
                  <Text className="text-white font-[Sora-SemiBold]">Cancel Order</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default ProfilePage; 