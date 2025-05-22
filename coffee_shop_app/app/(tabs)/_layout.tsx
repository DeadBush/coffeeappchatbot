import React from 'react'
import {Tabs} from 'expo-router'
import { Entypo, FontAwesome6 } from '@expo/vector-icons'
import { TabBarIconProps } from '../../types/navigation'

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#C67C4E',
        }}
      >
        <Tabs.Screen 
          name='home'
          options={{
            headerShown: false,
            title: 'Home',
            tabBarIcon: ({color}: TabBarIconProps) => (
              <Entypo name="home" size={24} color={color} />
            )
          }}
        />

        <Tabs.Screen 
          name='chatRoom'
          options={{
            headerShown: true,
            tabBarStyle: { display: 'none' },
            title: 'Chat Bot',
            tabBarIcon: ({color}: TabBarIconProps) => (
              <FontAwesome6 name="robot" size={24} color={color} />
            )
          }}
        />

    <Tabs.Screen 
          name='order'
          options={{
            headerShown: true,
            tabBarStyle: { display: 'none' },
            title: 'Cart',
            tabBarIcon: ({color}: TabBarIconProps) => (
              <Entypo name="shopping-cart" size={24} color={color} />
            )
          }}
        />
      </Tabs>
    </>
  )
}

export default TabsLayout