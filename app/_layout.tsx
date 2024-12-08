import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDatabase, DatabaseService } from '../services/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        const tasks = await DatabaseService.getTasks();
        console.log('Initial database check - tasks:', tasks);
      } catch (error) {
        console.error('Database setup error:', error);
      }
    };
    
    setupDatabase();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack>
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
