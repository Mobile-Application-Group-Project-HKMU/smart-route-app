import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { backgroundColor: Colors[colorScheme].card }
      ]} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
