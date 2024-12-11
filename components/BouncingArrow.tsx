import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import { ThemedText } from './ThemedText';

interface Props {
  onPress: () => void;
}

export function BouncingArrow({ onPress }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const translateY = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (isVisible) {
      animation.start();
    } else {
      animation.stop();
    }

    return () => animation.stop();
  }, [isVisible]);

  const handleLayout = (event: any) => {
    // Check if component is being overlaid by measuring its position
    const { y } = event.nativeEvent.layout;
    setIsVisible(y >= 0);
  };

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY }] }
      ]}
      onLayout={handleLayout}
    >
      <ThemedText style={[
        styles.text,
        { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
      ]}>
        Swipe down to cancel
      </ThemedText>
      <Pressable onPress={onPress}>
        <MaterialCommunityIcons
          name="chevron-down"
          size={24}
          color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
}); 