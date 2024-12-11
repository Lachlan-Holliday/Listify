import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import * as Haptics from 'expo-haptics';

export type FilterOption = 'all' | 'none' | 'daily' | 'weekly' | 'monthly';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  selectedFilter: FilterOption;
  onFilterSelect: (filter: FilterOption) => void;
}

const FILTER_OPTIONS: { value: FilterOption; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { value: 'all', label: 'All Tasks', icon: 'format-list-bulleted' },
  { value: 'none', label: 'One-time Tasks', icon: 'calendar-blank' },
  { value: 'daily', label: 'Daily Tasks', icon: 'calendar-refresh' },
  { value: 'weekly', label: 'Weekly Tasks', icon: 'calendar-week' },
  { value: 'monthly', label: 'Monthly Tasks', icon: 'calendar-month' },
];

export function FilterBottomSheet({ visible, onDismiss, selectedFilter, onFilterSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSelect = (filter: FilterOption) => {
    Haptics.selectionAsync();
    onFilterSelect(filter);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
        ]}
      >
        <View style={styles.handle} />
        <ThemedText style={styles.title}>Filter Tasks</ThemedText>
        <ScrollView style={styles.content}>
          {FILTER_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor: selectedFilter === option.value
                    ? (isDark ? Colors.dark.primary : Colors.light.primary)
                    : (isDark ? Colors.dark.card : Colors.light.card)
                }
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <MaterialCommunityIcons
                name={option.icon}
                size={24}
                color={selectedFilter === option.value
                  ? '#FFFFFF'
                  : (isDark ? Colors.dark.text : Colors.light.text)
                }
              />
              <ThemedText style={[
                styles.optionText,
                selectedFilter === option.value && styles.selectedText
              ]}>
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  content: {
    paddingHorizontal: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  selectedText: {
    color: '#FFFFFF',
  },
}); 