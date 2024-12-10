import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { ThemedView } from '../components/ThemedView';
import { DatabaseService } from '../services/database';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '../components/ThemedText';

const PRESET_COLORS = [
  '#FF9B9B', // Red
  '#FFB74D', // Orange
  '#FFE59B', // Yellow
  '#A5FF9B', // Green
  '#9BB8FF', // Blue
  '#D89BFF', // Purple
  '#FF9BDB', // Pink
  '#9BFFF3', // Cyan
];

export default function AddCategoryScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleColorSelect = (color: string) => {
    Haptics.selectionAsync();
    setSelectedColor(color);
  };

  const handleAddCategory = async () => {
    if (!name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await DatabaseService.addCategory(
        name,
        icon || '📝',
        selectedColor
      );
      if (success) {
        router.back();
      }
    } catch (error) {
      console.error('Add category error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { 
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background 
    }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TextInput
          label="Category Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          textColor={isDark ? Colors.dark.text : Colors.light.text}
          outlineColor={isDark ? Colors.dark.border : Colors.light.border}
          activeOutlineColor={isDark ? Colors.dark.primary : Colors.light.primary}
          autoFocus
        />
        <TextInput
          label="Icon (emoji)"
          value={icon}
          onChangeText={setIcon}
          style={styles.input}
          placeholder="📝"
          mode="outlined"
          textColor={isDark ? Colors.dark.text : Colors.light.text}
          outlineColor={isDark ? Colors.dark.border : Colors.light.border}
          activeOutlineColor={isDark ? Colors.dark.primary : Colors.light.primary}
        />

        <View style={styles.colorSection}>
          <ThemedText style={styles.colorTitle}>Select Color</ThemedText>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => handleColorSelect(color)}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
              />
            ))}
          </View>
        </View>

        <Button 
          mode="contained" 
          onPress={handleAddCategory}
          style={[styles.button, {
            backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
          }]}
          labelStyle={styles.buttonLabel}
          disabled={!name.trim() || isSubmitting}
          loading={isSubmitting}
        >
          Add Category
        </Button>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 24,
    borderRadius: 12,
  },
  colorSection: {
    marginBottom: 24,
  },
  colorTitle: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingVertical: 8,
  },
}); 