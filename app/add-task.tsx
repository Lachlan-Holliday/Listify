import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Pressable } from 'react-native';
import { Card, FAB } from 'react-native-paper';
import { router } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { DatabaseService } from '../services/database';
import { Category } from '../types/database';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import * as Haptics from 'expo-haptics';
import { Animated as RNAnimated } from 'react-native';

export default function AddTaskScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const cats = await DatabaseService.getCategories();
    setCategories(cats);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await DatabaseService.deleteCategory(categoryId);
    loadCategories();
  };

  const renderRightActions = (categoryId: number, dragX: RNAnimated.AnimatedInterpolation<number>) => {
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
          onPress={() => handleDeleteCategory(categoryId)}
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

  return (
    <ThemedView style={[styles.container, { 
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background 
    }]}>
      <ThemedText type="title" style={styles.title}>
        Categories
      </ThemedText>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <Swipeable
            key={category.id}
            renderRightActions={(_, dragX) => renderRightActions(category.id, dragX)}
            overshootRight={false}
            rightThreshold={40}
          >
            <Card
              style={[
                styles.categoryCard,
                { backgroundColor: category.color }
              ]}
              onPress={() => router.push({
                pathname: '/create-task',
                params: { category: category.name }
              })}>
              <Card.Content style={styles.cardContent}>
                <ThemedText style={styles.emoji}>{category.icon}</ThemedText>
                <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
              </Card.Content>
            </Card>
          </Swipeable>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, {
          backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
        }]}
        color="#FFFFFF"
        onPress={() => router.push('/add-category')}
      />
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
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 