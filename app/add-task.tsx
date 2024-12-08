import React from 'react';
import { StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { Card } from 'react-native-paper';
import { router } from 'expo-router';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { BouncingArrow } from '../components/BouncingArrow';
import { Colors } from '../constants/Colors';

const categories = [
  { id: 1, name: 'Work', icon: '💼', color: '#FF9B9B' },
  { id: 2, name: 'Study', icon: '📚', color: '#9BB8FF' },
  { id: 3, name: 'Fitness', icon: '💪', color: '#A5FF9B' },
  { id: 4, name: 'Shopping', icon: '🛒', color: '#FFE59B' },
  { id: 5, name: 'Personal', icon: '🎯', color: '#D89BFF' },
];

export default function AddTaskScreen() {
  const colorScheme = useColorScheme() as 'light' | 'dark';

  const handleCategoryPress = (categoryId: number) => {
    router.push({
      pathname: '/create-task',
      params: { categoryId },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Choose Category
      </ThemedText>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <Card
            key={category.id}
            style={[
              styles.categoryCard,
              { backgroundColor: Colors[colorScheme].categoryColors[category.name.toLowerCase() as keyof typeof Colors.light.categoryColors] }
            ]}
            onPress={() => handleCategoryPress(category.id)}>
            <Card.Content style={styles.cardContent}>
              <ThemedText style={styles.emoji}>{category.icon}</ThemedText>
              <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
      <BouncingArrow />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  categoryCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '600',
  },
}); 