import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ImpactCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  suffix?: string;
}

export default function ImpactCard({ icon, value, label, color, suffix }: ImpactCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const cardBgColor = colorScheme === 'light' ? '#f0f8ff' : '#1c2a43';
  const iconColor = color || Colors[colorScheme].tint;
  
  return (
    <ThemedView style={[styles.card, { backgroundColor: cardBgColor }]}>
      <View style={styles.iconContainer}>
        <IconSymbol 
          name={icon as any} 
          size={28} 
          color={iconColor} 
        />
      </View>
      <View style={styles.contentContainer}>
        <ThemedText style={styles.value}>
          {value}{suffix && <ThemedText style={styles.suffix}>{suffix}</ThemedText>}
        </ThemedText>
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: '45%',
  },
  iconContainer: {
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  suffix: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    marginLeft: 2,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  }
});
