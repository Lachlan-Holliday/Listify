import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { router } from 'expo-router';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { BouncingArrow } from '../components/BouncingArrow';

const categories = [
  { id: 1, name: 'Work', icon: '💼', color: '#FF9B9B' },
  { id: 2, name: 'Study', icon: '📚', color: '#9BB8FF' },
  { id: 3, name: 'Fitness', icon: '💪', color: '#A5FF9B' },
  { id: 4, name: 'Shopping', icon: '🛒', color: '#FFE59B' },
  { id: 5, name: 'Personal', icon: '🎯', color: '#D89BFF' },
];

export default function AddTaskScreen() {
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
      <ScrollView style={styles.scrollView}>
        {categories.map((category) => (
          <Card
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: category.color }]}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  categoryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 