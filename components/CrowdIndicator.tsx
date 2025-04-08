import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { CrowdLevel, getCrowdLevelColor, getCrowdLevelIcon, getCrowdLevelText } from '@/util/crowdPrediction';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
// Import the correct type from expo-symbols
import { SymbolViewProps } from 'expo-symbols';

interface CrowdIndicatorProps {
  level: CrowdLevel;
  percentage?: number;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function CrowdIndicator({ 
  level, 
  percentage, 
  showText = true, 
  size = 'medium' 
}: CrowdIndicatorProps) {
  const { language } = useLanguage();
  const color = getCrowdLevelColor(level);
  const icon = getCrowdLevelIcon(level);
  
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  const textSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  
  return (
    <View style={styles.container}>
      <IconSymbol name={icon as SymbolViewProps['name']} size={iconSize} color={color} />
      {percentage && (
        <View style={[styles.percentageBar, { borderColor: color }]}>
          <View 
            style={[
              styles.percentageFill, 
              { 
                backgroundColor: color,
                width: `${percentage}%` 
              }
            ]} 
          />
        </View>
      )}
      {showText && (
        <ThemedText style={[styles.text, { fontSize: textSize, color }]}>
          {getCrowdLevelText(level, language)}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentageBar: {
    height: 6,
    width: 40,
    borderRadius: 3,
    borderWidth: 1,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
  },
  text: {
    fontWeight: '500',
  }
});
