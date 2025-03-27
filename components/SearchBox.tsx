import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from './ui/IconSymbol';

interface SearchBoxProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBox({ placeholder, value, onChangeText }: SearchBoxProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = Colors[colorScheme].text;
  const iconColor = Colors[colorScheme].icon;
  
  return (
    <ThemedView 
      style={styles.container}
      lightColor="#f0f0f0"
      darkColor="#2A2A2A"
    >
      <IconSymbol name="paperplane.fill" size={20} color={iconColor} />
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={Colors[colorScheme].tabIconDefault}
        value={value}
        onChangeText={onChangeText}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 4,
  },
});
