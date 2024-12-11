import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Pressable, useWindowDimensions } from 'react-native';
import { FAB, Card } from 'react-native-paper';
import { Link, useFocusEffect } from 'expo-router';
import { DatabaseService } from '../../services/database';
import { Task } from '../../types/database';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import * as Haptics from 'expo-haptics';
import { Animated as RNAnimated } from 'react-native';
import { TaskCountdown } from '../../components/TaskCountdown';
import { FilterBottomSheet, FilterOption } from '../../components/FilterBottomSheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFilter } from '../../contexts/FilterContext';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

// Add a type for countdown status
type CountdownStatus = {
  value: number;  // Milliseconds until deadline
  display: string; // The display string (e.g., "1h", "2d", "Overdue")
};

// Create a new TaskCard component
const TaskCard = ({ item, onComplete, onDelete }: { 
  item: Task; 
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [categoryColor, setCategoryColor] = useState<string>('');
  const [countdownStatus, setCountdownStatus] = useState<CountdownStatus>({ value: 0, display: '' });

  useEffect(() => {
    const fetchCategoryColor = async () => {
      const categories = await DatabaseService.getCategories();
      const category = categories.find(c => c.name === item.category);
      if (category) {
        setCategoryColor(category.color);
      }
    };
    fetchCategoryColor();
  }, [item.category]);

  const handleCountdownChange = (status: string) => {
    setCountdownStatus({
      value: status === 'Overdue' ? -1 : 0,
      display: status
    });
  };

  return (
    <Card
      style={[
        styles.taskCard,
        {
          backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
          elevation: 0,
          borderBottomWidth: 4,
          borderBottomColor: categoryColor,
        },
        item.completed && styles.completedTask
      ]}
      mode="contained"
      onPress={() => onComplete(item.id)}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.taskHeader}>
          <View style={styles.leftContainer}>
            <ThemedText 
              style={[
                styles.taskName,
                { color: isDark ? Colors.dark.text : Colors.light.text },
                item.completed && {
                  color: '#4CAF50',
                  textDecorationLine: 'line-through',
                  textDecorationColor: '#4CAF50',
                },
                !item.completed && countdownStatus.display === 'Overdue' && {
                  color: '#FF3B30',
                }
              ]}
            >
              {item.name}
            </ThemedText>
            <View style={styles.timeInfo}>
              {item.date && (
                <ThemedText style={[
                  styles.timeText,
                  { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
                ]}>
                  {formatDisplayDate(item.date, item.recurring)}
                </ThemedText>
              )}
              {item.time && (
                <ThemedText style={[
                  styles.timeText,
                  { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
                ]}>
                  {formatTime(item.time)}
                </ThemedText>
              )}
            </View>
          </View>
          <View style={styles.countdownContainer}>
            <TaskCountdown 
              date={item.date} 
              time={item.time} 
              isCompleted={item.completed}
              onCountdownChange={handleCountdownChange}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isFilterVisible, hideFilter } = useFilter();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const calculateCountdown = (date?: string, time?: string): number => {
    if (!date && !time) return Number.MAX_VALUE;
    const now = new Date();
    let targetDate = new Date();

    if (date === 'DAILY') {
      targetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        time ? parseInt(time.split(':')[0]) : 23,
        time ? parseInt(time.split(':')[1]) : 59
      );
      if (targetDate.getTime() <= now.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    } else if (date) {
      const [month, day, year] = date.split('-');
      const taskTime = time ? time.split(':') : ['23', '59'];
      targetDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(taskTime[0]),
        parseInt(taskTime[1])
      );
      if (targetDate.getTime() <= now.getTime()) return -1;
    }
    return targetDate.getTime() - now.getTime();
  };

  const loadTasks = async () => {
    const tasks = await DatabaseService.getTasks();
    const countdownMap = new Map<number, number>();
    
    for (const task of tasks) {
      if (task.completed) {
        countdownMap.set(task.id, Number.MAX_VALUE);
        continue;
      }
      const countdown = calculateCountdown(task.date, task.time);
      countdownMap.set(task.id, countdown);
    }
    
    const sortedTasks = tasks.sort((a, b) => {
      const aValue = countdownMap.get(a.id) ?? Number.MAX_VALUE;
      const bValue = countdownMap.get(b.id) ?? Number.MAX_VALUE;
      return aValue - bValue;
    });
    
    setTasks(sortedTasks);
  };

  const fabStyle = {
    backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
  };

  const { width } = useWindowDimensions();
  const SWIPE_THRESHOLD = -width * 0.3;  // 30% of screen width

  useEffect(() => {
    // Initial load
    loadTasks();

    // Set up auto-refresh timer
    const refreshTimer = setInterval(() => {
      loadTasks();
    }, 60000); // Refresh every minute

    // Cleanup timer on unmount
    return () => clearInterval(refreshTimer);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  const handleCompleteTask = async (taskId: number) => {
    await DatabaseService.toggleTask(taskId);
    loadTasks();
  };

  const handleDeleteTask = async (taskId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await DatabaseService.deleteTask(taskId);
    loadTasks();
  };

  const renderRightActions = (taskId: number, dragX: RNAnimated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <RNAnimated.View 
        style={[
          styles.deleteActionContainer,
          { transform: [{ scale }] }
        ]}
      >
        <Pressable
          onPress={() => handleDeleteTask(taskId)}
          style={({ pressed }) => [
            styles.deleteAction,
            { transform: [{ scale: pressed ? 0.95 : 1 }] }
          ]}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true }}
        >
          <ThemedText style={styles.deleteText}>Delete</ThemedText>
        </Pressable>
      </RNAnimated.View>
    );
  };

  // Update renderTaskItem to use the new component
  const renderTaskItem = ({ item }: { item: Task }) => (
    <Swipeable
      renderRightActions={(_, dragX) => renderRightActions(item.id, dragX)}
      overshootRight={false}
      rightThreshold={40}
      friction={2}
      hitSlop={{ left: 2 }}
      onSwipeableWillOpen={() => {
        if (item.completed) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          handleDeleteTask(item.id);
        }
      }}
    >
      <TaskCard 
        item={item}
        onComplete={handleCompleteTask}
        onDelete={handleDeleteTask}
      />
    </Swipeable>
  );

  const getFilteredTasks = (tasks: Task[]) => {
    if (activeFilter === 'all') return tasks;
    return tasks.filter(task => task.recurring === activeFilter);
  };

  return (
    <ThemedView style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      <FlatList
        data={getFilteredTasks(tasks)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        style={styles.list}
      />
      <View style={styles.fabContainer}>
        <Link href="/add-task" asChild>
          <FAB
            icon="plus"
            style={styles.fab}
            color="#FFFFFF"
          />
        </Link>
      </View>
      <FilterBottomSheet
        visible={isFilterVisible}
        onDismiss={hideFilter}
        selectedFilter={activeFilter}
        onFilterSelect={setActiveFilter}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 12,
    height: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  completedTask: {
    opacity: 0.7,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  cardContent: {
    padding: 12,
    height: '100%',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '100%',
    gap: 12,
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  taskName: {
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  timeText: {
    fontSize: 13,
    opacity: 0.7,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
  },
  deleteActionContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
    height: 'auto',
    alignSelf: 'stretch',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 26,
    height: '85%',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginBottom: 12,
  },
  deleteText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  fab: {
    borderRadius: 16,
    width: '100%',
    height: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: Colors.dark.primary,
  },
  countdownContainer: {
    height: '100%',
    justifyContent: 'center',
    minWidth: 60,
    alignItems: 'flex-end',
  },
});

const formatDisplayDate = (date: string | undefined, recurring: string): string => {
  if (!date) return '';

  switch (recurring) {
    case 'daily':
      return 'Every day';
      
    case 'weekly':
      const [_, dayNum] = date.split('-');
      return `Every ${DAYS_OF_WEEK[parseInt(dayNum)]}`;
      
    case 'monthly':
      const [__, dayOfMonth] = date.split('-');
      return `Monthly on day ${dayOfMonth}`;
      
    default:
      const [month, day, year] = date.split('-');
      return new Date(`${year}-${month}-${day}`).toLocaleDateString();
  }
};

const formatTime = (time: string | undefined): string => {
  if (!time) return '';
  
  const [hours24, minutes] = time.split(':');
  const hours = parseInt(hours24);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${minutes} ${ampm}`;
};
