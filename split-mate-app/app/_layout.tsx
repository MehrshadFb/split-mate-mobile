import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "../src/shared/contexts/ThemeContext";
import { useInvoiceStore } from "../src/shared/stores/invoiceStore";
import "./globals.css";

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { colors, colorScheme, isThemeLoaded } = useTheme();
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const onLayoutRootView = useCallback(() => {
    setIsLayoutReady(true);
  }, []);

  useEffect(() => {
    if (isThemeLoaded && isLayoutReady) {
      SplashScreen.hideAsync();
    }
  }, [isThemeLoaded, isLayoutReady]);

  return (
    <View
      onLayout={onLayoutRootView}
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: "slide_from_right",
          gestureDirection: "horizontal",
          fullScreenGestureEnabled: false,
          animationDuration: 250,
          contentStyle: {
            backgroundColor: colors.background.primary,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="upload" />
        <Stack.Screen name="assign-items" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        void useInvoiceStore.getState().flushPendingSave();
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
