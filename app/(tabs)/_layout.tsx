import { Tabs } from 'expo-router';
import { Image, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { useFilter } from '../../contexts/FilterContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showFilter } = useFilter();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
        },
        headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
        tabBarStyle: {
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
        },
        tabBarActiveTintColor: isDark ? Colors.dark.primary : Colors.light.primary,
        headerLeft: () => (
          <Image
            source={require('../../assets/images/icon.png')}
            style={{
              width: 24,
              height: 24,
              marginLeft: 16,
            }}
          />
        ),
        headerTitleAlign: 'center',
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-line" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
          headerRight: () => (
            <Pressable
              onPress={showFilter}
              style={({ pressed }) => ({
                marginRight: 16,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={24}
                color={isDark ? Colors.dark.text : Colors.light.text}
              />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
