import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from '../services/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import { PaperProvider } from 'react-native-paper';

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
          title: 'Categories'
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
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <PaperProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={styles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </ThemeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
