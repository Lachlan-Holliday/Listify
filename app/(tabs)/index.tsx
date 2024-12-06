import { useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { FAB, Card } from 'react-native-paper';
import { Link } from 'expo-router';
import { DatabaseService } from '../../services/database';
import { Task } from '../../types/database';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const tasksData = await DatabaseService.getTasks();
    setTasks(tasksData);
  };

  const handleCompleteTask = async (taskId: number) => {
    await DatabaseService.updateTaskStatus(taskId, 'completed');
    loadTasks();
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card
            style={styles.taskCard}
            onPress={() => handleCompleteTask(item.id)}>
            <Card.Content>
              <ThemedText>{item.name}</ThemedText>
              {item.deadline && (
                <ThemedText style={styles.deadline}>
                  Due: {new Date(item.deadline).toLocaleDateString()}
                </ThemedText>
              )}
            </Card.Content>
          </Card>
        )}
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
  taskCard: {
    margin: 8,
  },
  deadline: {
    fontSize: 12,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
