/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    primary: '#007AFF',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1C1C1E',
    border: '#E5E5EA',
    notification: '#FF3B30',
    cardBackground: '#FFFFFF',
    // Category colors
    categoryColors: {
      work: '#FF9B9B',
      study: '#9BB8FF',
      fitness: '#A5FF9B',
      shopping: '#FFE59B',
      personal: '#D89BFF',
    }
  },
  dark: {
    primary: '#0A84FF',
    background: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
    cardBackground: '#2C2C2E',
    // Category colors with darker shades
    categoryColors: {
      work: '#CC7272',
      study: '#7285CC',
      fitness: '#72CC7B',
      shopping: '#CCB872',
      personal: '#B072CC',
    }
  }
};
