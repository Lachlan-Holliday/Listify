import React, { useState, useRef } from 'react';
import { StyleSheet, ScrollView, View, Pressable} from 'react-native';
import { Card, FAB, Button } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { DatabaseService } from '../services/database';
import { Category } from '../types/database';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import * as Haptics from 'expo-haptics';
import { Animated as RNAnimated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddTaskScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasUndoAction, setHasUndoAction] = useState(false);
  const swipeRef = useRef(false);
  const swipeTimeoutRef = useRef<NodeJS.Timeout>();

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  const checkUndoAvailability = async () => {
    const hasUndo = await DatabaseService.hasUndoAction();
    setHasUndoAction(hasUndo);
  };

  const loadCategories = async () => {
    const cats = await DatabaseService.getCategories();
    setCategories(cats);
    checkUndoAvailability();
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

  const handlePress = (categoryName: string) => {
    if (!swipeRef.current) {
      router.push({
        pathname: '/create-task',
        params: { category: categoryName }
      });
    }
  };

  return (
    <ThemedView style={[styles.container, { 
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background 
    }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <Swipeable
            key={category.id}
            renderRightActions={(_, dragX) => renderRightActions(category.id, dragX)}
            overshootRight={false}
            rightThreshold={40}
            onSwipeableWillOpen={() => {
              swipeRef.current = true;
            }}
            onSwipeableClose={() => {
              if (swipeTimeoutRef.current) {
                clearTimeout(swipeTimeoutRef.current);
              }
              swipeTimeoutRef.current = setTimeout(() => {
                swipeRef.current = false;
              }, 500);
            }}
          >
            <Pressable
              onPress={() => handlePress(category.name)}
            >
              <Card
                style={[
                  styles.categoryCard,
                  { 
                    backgroundColor: category.color,
                    elevation: 0,
                  }
                ]}
                mode="contained"
              >
                <Card.Content style={styles.cardContent}>
                  <ThemedText style={styles.emoji}>{category.icon}</ThemedText>
                  <ThemedText style={[
                    styles.categoryName,
                    { color: '#000000' }
                  ]}>
                    {category.name}
                  </ThemedText>
                </Card.Content>
              </Card>
            </Pressable>
          </Swipeable>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.buttonGroup}>
          <Button
            mode="outlined"
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await DatabaseService.resetCategories();
              loadCategories();
            }}
            style={[styles.resetButton, {
              borderColor: isDark ? Colors.dark.border : Colors.light.border,
            }]}
            textColor={isDark ? Colors.dark.text : Colors.light.text}
            labelStyle={{ color: isDark ? Colors.dark.text : Colors.light.text }}
          >
            Reset Categories
          </Button>

          {hasUndoAction && (
            <FAB
              icon={props => (
                <MaterialCommunityIcons
                  name="restore"
                  size={24}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                />
              )}
              size="small"
              style={styles.undoFab}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await DatabaseService.undoLastAction();
                loadCategories();
              }}
            />
          )}
        </View>

        <FAB
          icon="plus"
          style={[styles.fab, {
            backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
          }]}
          color="#FFFFFF"
          onPress={() => router.push('/add-category')}
        />
      </View>
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
  },
  scrollView: {
    flex: 1,
  },
  categoryCard: {
    marginBottom: 16,
    borderRadius: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android shadow
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 70,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
    lineHeight: 36,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
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
  bottomContainer: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButton: {
    borderRadius: 8,
    borderWidth: 1,
  },
  undoFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowColor: 'transparent',
  },
  fab: {
    borderRadius: 16,
    width: 56,
    height: 56,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 