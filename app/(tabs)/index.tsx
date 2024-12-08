import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { FAB, Card } from 'react-native-paper';
import { Link, useFocusEffect } from 'expo-router';
import { DatabaseService } from '../../services/database';
import { Task } from '../../types/database';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);

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

  const renderTaskItem = ({ item }: { item: Task }) => (
    <Card
      style={[styles.taskCard, item.status === 'completed' && styles.completedTask]}
      onPress={() => handleCompleteTask(item.id)}>
      <Card.Content style={styles.cardContent}>
        <ThemedText style={styles.taskName}>{item.name}</ThemedText>
        {item.deadline && (
          <ThemedText style={styles.deadline}>
            Due: {new Date(item.deadline).toLocaleDateString()}
          </ThemedText>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        style={styles.list}
      />
      <Link href="/add-task" asChild>
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {}}
        />
      </Link>
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
    marginBottom: 8,
  },
  completedTask: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'column',
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
  },
  deadline: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
