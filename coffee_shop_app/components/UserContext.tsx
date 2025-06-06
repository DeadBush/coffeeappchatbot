import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserInfo {
  id: number;
  name: string;
  email: string;
}

interface UserContextType {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserInfo | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('user_info');
      if (stored) setUserState(JSON.parse(stored));
    })();
  }, []);

  const setUser = async (user: UserInfo | null) => {
    setUserState(user);
    if (user) {
      await AsyncStorage.setItem('user_info', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('user_info');
    }
  };

  const clearUser = async () => {
    setUserState(null);
    await AsyncStorage.removeItem('user_info');
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}; 