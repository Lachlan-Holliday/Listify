import { Tabs } from 'expo-router';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const tintColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
