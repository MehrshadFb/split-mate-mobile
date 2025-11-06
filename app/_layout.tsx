// app/_layout.tsx
// Root layout - providers and navigation setup

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../src/contexts/ThemeContext";
import { queryClient } from "../src/services/queryClient";
import "./globals.css";

function RootStack() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "default",
        contentStyle: {
          backgroundColor: colors.background.primary,
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="assign-items" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RootStack />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
