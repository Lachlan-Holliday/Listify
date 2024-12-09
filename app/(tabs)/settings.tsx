import { StyleSheet } from 'react-native';
import { Switch } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ThemedView style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      <ThemedView style={[
        styles.section,
        { borderRadius: 12 }
      ]}>
        <ThemedText style={[
          styles.sectionTitle,
          { 
            color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText,
            fontSize: 16,
            fontWeight: '600',
          }
        ]}>
          Appearance
        </ThemedText>

        <ThemedView style={[
          styles.settingItem,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.settingsItem,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
            borderWidth: 1,
          }
        ]}>
          <ThemedText style={{ 
            color: isDark ? Colors.dark.text : Colors.light.text,
            fontSize: 16,
          }}>
            Dark Mode
          </ThemedText>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 32,
  },
  title: {
    marginBottom: 32,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
});
