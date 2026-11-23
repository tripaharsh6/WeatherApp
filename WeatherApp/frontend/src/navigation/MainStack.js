import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavigator } from './AppNavigator';
import { CityDetailScreen } from '../screens/main/CityDetailScreen';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AppTabs" component={AppNavigator} />
      <Stack.Screen name="CityDetail" component={CityDetailScreen} />
    </Stack.Navigator>
  );
};
