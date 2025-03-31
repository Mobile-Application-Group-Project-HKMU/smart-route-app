import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export function ThemedButton({
  title,
  variant = 'primary',
  style,
  ...otherProps
}: ThemedButtonProps) {
  const theme = useColorScheme() ?? 'light';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary'
          ? { backgroundColor: Colors[theme].buttonBackground }
          : { backgroundColor: Colors[theme].secondaryBackground },
        style,
      ]}
      activeOpacity={0.7}
      {...otherProps}
    >
      <ThemedText
        style={[
          styles.buttonText,
          variant === 'primary'
            ? { color: Colors[theme].buttonText }
            : { color: Colors[theme].text }
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
