import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../../src/shared/constants/design";
import { useTheme } from "../../src/shared/contexts/ThemeContext";
import {
  AboutSection,
  AppInfoCard,
  SettingsHeader,
  SettingsSection,
  ThemeSelector,
} from "../../src/features/settings/components";

export default function SettingsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={["top", "left", "right"]}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: SPACING.xl }}>
          {/* Header */}
          <SettingsHeader
            title="Settings"
            subtitle="Customize your app experience"
          />
          {/* Appearance Section */}
          <SettingsSection title="Appearance">
            <ThemeSelector />
          </SettingsSection>
          {/* About Section */}
          <SettingsSection title="About">
            <AboutSection />
          </SettingsSection>
          {/* App Info Card */}
          <AppInfoCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
