// src/contexts/ThemeContext.tsx
// Theme context for managing app-wide theme

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark" | "auto";
type ColorScheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => Promise<void>;
  colors: typeof lightColors;
}

const lightColors = {
  background: {
    primary: "#FFFFFF",
    secondary: "#F5F5F4",
    tertiary: "#E7E5E4",
  },
  text: {
    primary: "#1C1917",
    secondary: "#57534E",
    tertiary: "#78716C",
    inverse: "#FFFFFF",
  },
  accent: {
    primary: "#D97757",
    hover: "#C45A35",
    light: "#FFF4ED",
  },
  border: "#E7E5E4",
  error: "#EF4444",
  success: "#10B981",
  neutral: {
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
  },
};

const darkColors = {
  background: {
    primary: "#1C1917",
    secondary: "#292524",
    tertiary: "#44403C",
  },
  text: {
    primary: "#FAFAF9",
    secondary: "#D6D3D1",
    tertiary: "#A8A29E",
    inverse: "#1C1917",
  },
  accent: {
    primary: "#FB923C",
    hover: "#F97316",
    light: "#431407",
  },
  border: "#44403C",
  error: "#F87171",
  success: "#34D399",
  neutral: {
    100: "#292524",
    200: "#44403C",
    300: "#57534E",
  },
};

const THEME_STORAGE_KEY = "@splitmate_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("auto");
  const [isLoading, setIsLoading] = useState(true);

  // Determine actual color scheme based on theme setting
  const colorScheme: ColorScheme =
    theme === "auto"
      ? systemColorScheme || "light"
      : theme === "dark"
      ? "dark"
      : "light";

  const colors = colorScheme === "dark" ? darkColors : lightColors;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "auto"
      ) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
      throw error;
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
