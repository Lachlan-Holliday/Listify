import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from '../services/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../contexts/ThemeContext';

function RootLayoutNav() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFFFFF',
        },
        headerTintColor: theme === 'dark' ? '#FFFFFF' : '#000000',
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-task" 
        options={{
          presentation: 'modal',
          title: 'Add Task'
        }} 
      />
      <Stack.Screen 
        name="create-task" 
        options={{
          presentation: 'modal',
          title: 'Create Task'
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
    <ThemeProvider>
      <GestureHandlerRootView style={styles.container}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
