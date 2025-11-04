// app/(tabs)/_layout.tsx
// Tab navigation layout

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../../src/contexts/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border,
        },
        animation: "shift", // Default tab animation
        lazy: true, // Only render tabs when they're focused
      }}
      initialRouteName="mates"
    >
      <Tabs.Screen
        name="mates"
        options={{
          title: "Mates",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          // Prevent issues with rapid tapping
          freezeOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          title: "Receipts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
          // Prevent issues with rapid tapping
          freezeOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          // Prevent issues with rapid tapping
          freezeOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
