import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] ?? Colors.light;

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Stack screenOptions={{
      headerStyle:{backgroundColor:theme.background},
      headerTintColor:theme.tint,
    }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
        <Stack.Screen name="+not-found" />
      </Stack>
);
}
