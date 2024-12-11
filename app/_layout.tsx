import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from '../services/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import { PaperProvider } from 'react-native-paper';
import { FilterProvider } from '../contexts/FilterContext';
import { router } from 'expo-router';

function RootLayoutNav() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
        },
        headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
        contentStyle: {
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
        }
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-task" 
        options={{
          presentation: 'modal',
          title: 'Choose Category'
        }} 
      />
      <Stack.Screen 
        name="create-task" 
        options={{
          presentation: 'modal',
          title: 'Create Task'
        }} 
      />
      <Stack.Screen 
        name="add-category" 
        options={{
          presentation: 'modal',
          title: 'Add Category'
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{
          presentation: 'modal',
          title: 'Settings',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
    router.replace('/(tabs)/dashboard');
  }, []);

  return (
    <PaperProvider>
      <ThemeProvider>
        <FilterProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </FilterProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
