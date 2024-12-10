import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';

export const useThemedStyles = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    fab: {
      borderRadius: 16,
      width: '100%',
      height: '100%',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
    },
    // Add other themed styles here
  });
}; 