// app/(tabs)/split.tsx
// Settings screen - app preferences and information

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/contexts/ThemeContext";

const APP_VERSION = "1.0.0";
const APP_BUILD = "1";

export default function SettingsScreen() {
  const { theme, colorScheme, setTheme, colors } = useTheme();

  const handleThemeChange = async (newTheme: "light" | "dark" | "auto") => {
    try {
      await setTheme(newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header */}
          <View className="mb-8">
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              Settings
            </Text>
            <Text style={{ fontSize: 18, color: colors.text.secondary }}>
              Customize your app experience
            </Text>
          </View>

          {/* Appearance Section */}
          <View className="mb-6">
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: colors.text.primary,
                marginBottom: 16,
              }}
            >
              Appearance
            </Text>

            <View
              style={{
                backgroundColor: colors.background.secondary,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Light Theme Option */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
                activeOpacity={0.7}
                onPress={() => handleThemeChange("light")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="sunny"
                    size={24}
                    color={colors.accent.primary}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: "500",
                        fontSize: 16,
                      }}
                    >
                      Light
                    </Text>
                  </View>
                </View>
                {theme === "light" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accent.primary}
                  />
                )}
              </TouchableOpacity>

              {/* Dark Theme Option */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
                activeOpacity={0.7}
                onPress={() => handleThemeChange("dark")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="moon"
                    size={24}
                    color={colors.accent.primary}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: "500",
                        fontSize: 16,
                      }}
                    >
                      Dark
                    </Text>
                  </View>
                </View>
                {theme === "dark" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accent.primary}
                  />
                )}
              </TouchableOpacity>

              {/* Automatic Theme Option */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                }}
                activeOpacity={0.7}
                onPress={() => handleThemeChange("auto")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="phone-portrait"
                    size={24}
                    color={colors.accent.primary}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: "500",
                        fontSize: 16,
                      }}
                    >
                      Automatic
                    </Text>
                    <Text
                      style={{
                        color: colors.text.tertiary,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {theme === "auto"
                        ? `Currently ${colorScheme}`
                        : "Match system settings"}
                    </Text>
                  </View>
                </View>
                {theme === "auto" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accent.primary}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* About Section */}
          <View className="mb-6">
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: colors.text.primary,
                marginBottom: 16,
              }}
            >
              About
            </Text>

            <View
              style={{
                backgroundColor: colors.background.secondary,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={24}
                    color={colors.accent.primary}
                  />
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontWeight: "500",
                      fontSize: 16,
                      marginLeft: 12,
                    }}
                  >
                    Version
                  </Text>
                </View>
                <Text style={{ color: colors.text.secondary }}>
                  {APP_VERSION} ({APP_BUILD})
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
                onPress={() =>
                  Linking.openURL(
                    "https://github.com/MehrshadFb/SplitMate-Mobile"
                  )
                }
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="logo-github"
                    size={24}
                    color={colors.accent.primary}
                  />
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontWeight: "500",
                      fontSize: 16,
                      marginLeft: 12,
                    }}
                  >
                    Source Code
                  </Text>
                </View>
                <Ionicons
                  name="open-outline"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
                onPress={() => {
                  const subject = encodeURIComponent("SplitMate Bug Report");
                  const body = encodeURIComponent(
                    `App Version: ${APP_VERSION} (${APP_BUILD})\n\n` +
                      `Description of the bug:\n\n\n` +
                      `Steps to reproduce:\n1. \n2. \n3. \n\n` +
                      `Expected behavior:\n\n\n` +
                      `Actual behavior:\n\n`
                  );
                  Linking.openURL(
                    `mailto:mehrshad.farahbakhsh@gmail.com?subject=${subject}&body=${body}`
                  );
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="bug"
                    size={24}
                    color={colors.accent.primary}
                  />
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontWeight: "500",
                      fontSize: 16,
                      marginLeft: 12,
                    }}
                  >
                    Report a Bug
                  </Text>
                </View>
                <Ionicons
                  name="open-outline"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                }}
                onPress={() =>
                  Linking.openURL("https://yourdomain.com/privacy")
                }
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={24}
                    color={colors.accent.primary}
                  />
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontWeight: "500",
                      fontSize: 16,
                      marginLeft: 12,
                    }}
                  >
                    Privacy Policy
                  </Text>
                </View>
                <Ionicons
                  name="open-outline"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info */}
          <View
            style={{
              backgroundColor: colors.accent.light,
              borderRadius: 12,
              padding: 16,
              marginTop: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Ionicons
                name="sparkles"
                size={20}
                color={colors.accent.primary}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    color: colors.accent.hover,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  About SplitMate
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                  SplitMate uses AI to help you split bills fairly. Upload
                  receipts, assign items, and see who owes what - all in
                  seconds.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
