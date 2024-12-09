import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { DatabaseService } from '../services/database';
import { ThemedView } from '../components/ThemedView';
import { BouncingArrow } from '../components/BouncingArrow';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';

export default function CreateTaskScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [taskName, setTaskName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTask = async () => {
    if (!taskName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await DatabaseService.addTask(taskName, deadline);
      if (success) {
        router.back();
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Create task error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { 
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background 
    }]}>
      <TextInput
        label="Task Name"
        value={taskName}
        onChangeText={setTaskName}
        style={[styles.input, { 
          backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
        }]}
        textColor={isDark ? Colors.dark.text : Colors.light.text}
        placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
        mode="outlined"
        outlineColor={isDark ? Colors.dark.border : Colors.light.border}
        activeOutlineColor={isDark ? Colors.dark.primary : Colors.light.primary}
        autoFocus
      />
      <TextInput
        label="Deadline (optional)"
        value={deadline}
        onChangeText={setDeadline}
        style={[styles.input, { 
          backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
        }]}
        textColor={isDark ? Colors.dark.text : Colors.light.text}
        placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
        mode="outlined"
        outlineColor={isDark ? Colors.dark.border : Colors.light.border}
        activeOutlineColor={isDark ? Colors.dark.primary : Colors.light.primary}
        placeholder="YYYY-MM-DD"
      />
      <Button 
        mode="contained" 
        onPress={handleCreateTask}
        style={[styles.button, {
          backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary
        }]}
        textColor={isDark ? Colors.dark.text : '#FFFFFF'}
        disabled={!taskName.trim() || isSubmitting}
        loading={isSubmitting}
      >
        Create Task
      </Button>
      <BouncingArrow onPress={handleDismiss} />
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