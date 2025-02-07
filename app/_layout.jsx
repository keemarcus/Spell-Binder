import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name="index" />
          <Stack.Screen name="todos/[id]" />
          <Stack.Screen name="card" />
          <Stack.Screen name="deck" />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
