import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';

export function BouncingArrow() {
  const translateY = new Animated.Value(0);
  const iconColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -10,
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

    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <ThemedText style={styles.text}>Swipe down to cancel</ThemedText>
      <Ionicons name="chevron-down" size={30} color={iconColor} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    alignItems: 'center',
  },
  text: {
    marginBottom: 8,
    opacity: 0.6,
  },
}); 