import React, { useState } from 'react';
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

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fabStyle = {
    backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
  };

  const { width } = useWindowDimensions();
  const SWIPE_THRESHOLD = -width * 0.3;  // 30% of screen width

  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    const tasks = await DatabaseService.getTasks();
    setTasks(tasks);
  };

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

  const renderTaskItem = ({ item }: { item: Task }) => (
    <Swipeable
      renderRightActions={(_, dragX) => renderRightActions(item.id, dragX)}
      overshootRight={false}
      rightThreshold={40}
      onSwipeableWillOpen={() => {
        if (item.completed) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          handleDeleteTask(item.id);
        }
      }}
    >
      <Card
        style={[
          styles.taskCard,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
            borderWidth: 1,
          },
          item.completed && styles.completedTask
        ]}
        onPress={() => handleCompleteTask(item.id)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.taskHeader}>
            <ThemedText 
              style={[
                styles.taskName,
                { color: isDark ? Colors.dark.text : Colors.light.text },
                item.completed && {
                  color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText,
                  textDecorationLine: 'line-through'
                }
              ]}
            >
              {item.name}
            </ThemedText>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: item.completed ? 
                (isDark ? Colors.dark.primary : Colors.light.primary) : 
                '#4CAF50' 
              }
            ]} />
          </View>
          {item.deadline && (
            <ThemedText style={[
              styles.deadline,
              { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
            ]}>
              Due: {new Date(item.deadline).toLocaleDateString()}
            </ThemedText>
          )}
        </Card.Content>
      </Card>
    </Swipeable>
  );

  return (
    <ThemedView style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      <FlatList
        data={tasks}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedTask: {
    opacity: 0.7,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  cardContent: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  deadline: {
    fontSize: 14,
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
    marginLeft: 8,
    height: 'auto',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
});
