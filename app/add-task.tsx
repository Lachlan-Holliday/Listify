import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { DatabaseService } from '../services/database';
import { ThemedView } from '../components/ThemedView';

export default function AddTaskScreen() {
  const [taskName, setTaskName] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAddTask = async () => {
    if (taskName.trim()) {
      await DatabaseService.createTask(taskName, 1, deadline || undefined);
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TextInput
        label="Task Name"
        value={taskName}
        onChangeText={setTaskName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Deadline (optional)"
        value={deadline}
        onChangeText={setDeadline}
        style={styles.input}
        mode="outlined"
        placeholder="YYYY-MM-DD"
      />
      <Button 
        mode="contained" 
        onPress={handleAddTask}
        style={styles.button}
        disabled={!taskName.trim()}
      >
        Add Task
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
}); 