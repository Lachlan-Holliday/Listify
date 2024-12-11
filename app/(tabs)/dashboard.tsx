import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { DatabaseService } from '../../services/database';
import { LineChart } from 'react-native-chart-kit';
import { Task } from '../../types/database';

type StatsData = {
  totalTasks: number;
  completedTasks: number;
  completionRate: string;
  weeklyData: number[];
  labels: string[];
};

export default function DashboardScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<StatsData>({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: '0%',
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const tasks = await DatabaseService.getTasks();
    const completedTasks = tasks.filter(task => task.completed).length;
    const weeklyData = calculateWeeklyCompletions(tasks);

    setStats({
      totalTasks: tasks.length,
      completedTasks,
      completionRate: tasks.length ? `${Math.round((completedTasks / tasks.length) * 100)}%` : '0%',
      weeklyData: weeklyData,
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    });
  };

  const calculateWeeklyCompletions = (tasks: Task[]): number[] => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weeklyData = new Array(7).fill(0);
    
    tasks.forEach(task => {
      if (task.completed) {
        const completedDate = new Date(task.created_at);
        const dayDiff = Math.floor((completedDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          weeklyData[dayDiff]++;
        }
      }
    });
    
    return weeklyData;
  };

  const chartConfig = {
    backgroundGradientFrom: isDark ? Colors.dark.card : Colors.light.card,
    backgroundGradientTo: isDark ? Colors.dark.card : Colors.light.card,
    color: (opacity = 1) => isDark ? 
      `rgba(255, 255, 255, ${opacity})` : 
      `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <Card style={[styles.statsCard, { 
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card 
          }]}>
            <Card.Content>
              <ThemedText style={styles.statsTitle}>Total Tasks</ThemedText>
              <ThemedText style={styles.statsNumber}>{stats.totalTasks}</ThemedText>
            </Card.Content>
          </Card>

          <Card style={[styles.statsCard, { 
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card 
          }]}>
            <Card.Content>
              <ThemedText style={styles.statsTitle}>Completed</ThemedText>
              <ThemedText style={styles.statsNumber}>{stats.completedTasks}</ThemedText>
            </Card.Content>
          </Card>

          <Card style={[styles.statsCard, { 
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card 
          }]}>
            <Card.Content>
              <ThemedText style={styles.statsTitle}>Completion Rate</ThemedText>
              <ThemedText style={styles.statsNumber}>{stats.completionRate}</ThemedText>
            </Card.Content>
          </Card>
        </View>

        <Card style={[styles.chartCard, { 
          backgroundColor: isDark ? Colors.dark.card : Colors.light.card 
        }]}>
          <Card.Content>
            <ThemedText style={styles.chartTitle}>Weekly Completions</ThemedText>
            <LineChart
              data={{
                labels: stats.labels,
                datasets: [{
                  data: stats.weeklyData,
                  color: (opacity = 1) => isDark ? 
                    `rgba(147, 197, 253, ${opacity})` : // Blue shade
                    `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 2,
                }],
              }}
              width={Dimensions.get('window').width - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={true}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statsCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    paddingRight: 16,
  },
}); 