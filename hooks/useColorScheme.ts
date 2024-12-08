import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useColorScheme() {
  const systemColorScheme = useNativeColorScheme();
  const [theme, setTheme] = useState(systemColorScheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme as 'light' | 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  return theme;
}
