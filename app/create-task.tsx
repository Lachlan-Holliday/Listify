import React, { useState } from 'react';
import { StyleSheet, View, Animated, Pressable } from 'react-native';
import { TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DatabaseService } from '../services/database';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { BouncingArrow } from '../components/BouncingArrow';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';

type RecurringOption = 'none' | 'daily' | 'weekly' | 'monthly';

export default function CreateTaskScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const buttonScale = new Animated.Value(1);

  const [taskName, setTaskName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [recurring, setRecurring] = useState<RecurringOption>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useLocalSearchParams<{ category: string }>();
  const category = params.category;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCreateTask = async () => {
    if (!taskName.trim() || isSubmitting) return;
    
    animateButton();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    
    try {
      const success = await DatabaseService.addTask(taskName, category, recurring, deadline);
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
      <View style={styles.content}>
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

        <View style={styles.recurringSection}>
          <ThemedText style={[styles.sectionTitle, {
            color: isDark ? Colors.dark.text : Colors.light.text,
          }]}>
            How often should this task repeat?
          </ThemedText>
          <SegmentedButtons
            value={recurring}
            onValueChange={value => {
              Haptics.selectionAsync();
              setRecurring(value as RecurringOption);
            }}
            buttons={[
              { value: 'none', label: 'Once' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            style={styles.segmentedButtons}
            theme={{
              colors: {
                primary: isDark ? Colors.dark.primary : Colors.light.primary,
                secondaryContainer: isDark ? Colors.dark.card : Colors.light.card,
                onSecondaryContainer: isDark ? Colors.dark.text : Colors.light.text,
                outline: isDark ? Colors.dark.border : Colors.light.border,
                onSurface: isDark ? '#FFFFFF' : Colors.light.text,
              }
            }}
          />
        </View>

        <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
          <Button 
            mode="contained" 
            onPress={handleCreateTask}
            style={[styles.button, {
              backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
            }]}
            labelStyle={[styles.buttonLabel, {
              color: '#FFFFFF',
            }]}
            contentStyle={styles.buttonContent}
            disabled={!taskName.trim() || isSubmitting}
            loading={isSubmitting}
          >
            Create Task
          </Button>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <BouncingArrow onPress={handleDismiss} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  input: {
    marginBottom: 24,
    borderRadius: 12,
  },
  recurringSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
}); 