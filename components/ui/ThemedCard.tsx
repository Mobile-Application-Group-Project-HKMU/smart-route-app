import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { ThemedView, ThemedViewProps } from '../ThemedView';
import { Colors } from '@/constants/Colors';

interface ThemedCardProps extends ThemedViewProps {
  cardStyle?: ViewStyle;
}

export function ThemedCard({ children, style, cardStyle, ...otherProps }: ThemedCardProps) {
  return (
    <ThemedView
      lightColor={Colors.light.card}
      darkColor={Colors.dark.card}
      style={[styles.card, style, cardStyle]}
      {...otherProps}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});
