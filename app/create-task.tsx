import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Animated, Pressable, Platform, Keyboard } from 'react-native';
import { TextInput, Button, SegmentedButtons, Modal } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DatabaseService } from '../services/database';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { BouncingArrow } from '../components/BouncingArrow';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';

type RecurringOption = 'none' | 'daily' | 'weekly' | 'monthly';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CreateTaskScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const buttonScale = new Animated.Value(1);

  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [recurring, setRecurring] = useState<RecurringOption | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('');
  const [selectedWeekDay, setSelectedWeekDay] = useState<number>(new Date().getDay());
  const [selectedMonthDay, setSelectedMonthDay] = useState<number>(new Date().getDate());

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
      const currentDate = new Date();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const taskDate = recurring === 'daily' ? 
        `${month}-${day}` : 
        date;

      const success = await DatabaseService.addTask(
        taskName, 
        category, 
        recurring, 
        taskDate, 
        time
      );
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

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(false);
    if (event.type === 'dismissed') return;

    const currentDate = selectedDate || (mode === 'date' ? selectedDate : selectedTime);
    if (currentDate) {
      if (mode === 'date') {
        setSelectedDate(currentDate);
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        setDate(`${month}-${day}`);
      } else {
        setSelectedTime(currentDate);
        const hours24 = currentDate.getHours().toString().padStart(2, '0');
        const minutes = currentDate.getMinutes().toString().padStart(2, '0');
        setTime(`${hours24}:${minutes}`);

        const hours12 = currentDate.getHours() % 12 || 12;
        const ampm = currentDate.getHours() >= 12 ? 'PM' : 'AM';
        const timeDisplay = `${hours12}:${minutes} ${ampm}`;
        setTimeDisplay(timeDisplay);
      }
    }
  };

  const showMode = (currentMode: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      setShow(false);
      setTimeout(() => {
        setShow(true);
        setMode(currentMode);
      }, 100);
    } else {
      setShow(true);
      setMode(currentMode);
    }
  };

  const handleShowDatePicker = () => showMode('date');
  const handleShowTimePicker = () => showMode('time');

  const handleRecurringChange = (value: string) => {
    Keyboard.dismiss();
    Haptics.selectionAsync();
    setRecurring(value as RecurringOption);
    setShow(false);
  };

  return (
    <ThemedView style={[styles.container, { 
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background 
    }]}>
      <ScrollView 
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
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

        <View style={styles.recurringSection}>
          <ThemedText style={[styles.sectionTitle, {
            color: isDark ? Colors.dark.text : Colors.light.text,
          }]}>
            How often should this task repeat?
          </ThemedText>
          <SegmentedButtons
            value={recurring}
            onValueChange={handleRecurringChange}
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

        {recurring === 'none' && (
          <Button
            mode="outlined"
            onPress={() => showMode('date')}
            style={[
              styles.pickerButton,
              {
                borderColor: isDark ? Colors.dark.border : Colors.light.border,
                backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
              }
            ]}
            icon="calendar"
            textColor={isDark ? Colors.dark.text : Colors.light.text}
            contentStyle={styles.pickerButtonContent}
          >
            {date || 'Select Date'}
          </Button>
        )}

        {recurring === 'weekly' && (
          <View style={styles.weekDayPicker}>
            <ThemedText style={styles.pickerTitle}>Select Day of Week</ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weekDayContainer}
            >
              {DAYS_OF_WEEK.map((day, index) => (
                <Pressable
                  key={day}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedWeekDay(index);
                    setDate(day);
                  }}
                  style={[
                    styles.weekDayButton,
                    {
                      backgroundColor: selectedWeekDay === index ? 
                        (isDark ? Colors.dark.primary : Colors.light.primary) : 
                        (isDark ? Colors.dark.card : Colors.light.card),
                    }
                  ]}
                >
                  <ThemedText style={[
                    styles.weekDayText,
                    selectedWeekDay === index && styles.selectedWeekDayText
                  ]}>
                    {day.slice(0, 3)}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {recurring === 'monthly' && (
          <View style={styles.monthDayPicker}>
            <ThemedText style={styles.pickerTitle}>Select Day of Month</ThemedText>
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              style={styles.monthDayContainer}
            >
              <View style={styles.monthDayGrid}>
                {DAYS_OF_MONTH.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedMonthDay(day);
                      setDate(day.toString());
                    }}
                    style={[
                      styles.monthDayButton,
                      {
                        backgroundColor: selectedMonthDay === day ? 
                          (isDark ? Colors.dark.primary : Colors.light.primary) : 
                          (isDark ? Colors.dark.card : Colors.light.card),
                      }
                    ]}
                  >
                    <ThemedText style={[
                      styles.monthDayText,
                      selectedMonthDay === day && styles.selectedMonthDayText
                    ]}>
                      {day}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {recurring && (
          <Button
            mode="outlined"
            onPress={() => showMode('time')}
            style={[
              styles.pickerButton,
              {
                borderColor: isDark ? Colors.dark.border : Colors.light.border,
                backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
              }
            ]}
            icon="clock"
            textColor={isDark ? Colors.dark.text : Colors.light.text}
            contentStyle={styles.pickerButtonContent}
          >
            {timeDisplay || 'Select Time'}
          </Button>
        )}

        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={mode === 'date' ? selectedDate : selectedTime}
            mode={mode}
            is24Hour={false}
            onChange={onChange}
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            maximumDate={new Date(new Date().getFullYear(), 11, 31)}
            minimumDate={new Date(new Date().getFullYear(), 0, 1)}
            style={{ width: 320 }}
            {...(Platform.OS === 'ios' && {
              textColor: isDark ? Colors.dark.text : Colors.light.text,
              accentColor: isDark ? Colors.dark.primary : Colors.light.primary,
            })}
            {...(Platform.OS === 'android' && {
              dateFormat: "dayofweek day month"
            })}
          />
        )}

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
      </ScrollView>

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
  modalContent: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    maxHeight: '80%',
  },
  timeList: {
    maxHeight: 300,
  },
  timeItem: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
  },
  pickerButton: {
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerButtonContent: {
    height: 48,
    paddingHorizontal: 16,
  },
  weekDayPicker: {
    marginBottom: 24,
  },
  weekDayContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  weekDayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  weekDayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedWeekDayText: {
    color: '#FFFFFF',
  },
  monthDayPicker: {
    marginBottom: 24,
  },
  monthDayContainer: {
    maxHeight: 200,
  },
  monthDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  monthDayButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  monthDayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedMonthDayText: {
    color: '#FFFFFF',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
}); 