// src/features/settings/components/AboutSection.tsx
// About app section with version info and links

import React from "react";
import { Linking } from "react-native";
import { APP_BUILD, APP_LINKS, APP_VERSION } from "../constants/appInfo";
import { SettingsCard } from "./SettingsCard";
import { SettingsItem } from "./SettingsItem";

export const AboutSection: React.FC = () => {
  const handleReportBug = () => {
    const subject = encodeURIComponent("SplitMate Bug Report");
    const body = encodeURIComponent(
      `App Version: ${APP_VERSION} (${APP_BUILD})\n\n` +
        `Description of the bug:\n\n\n` +
        `Steps to reproduce:\n1. \n2. \n3. \n\n` +
        `Expected behavior:\n\n\n` +
        `Actual behavior:\n\n`
    );
    Linking.openURL(
      `mailto:${APP_LINKS.support}?subject=${subject}&body=${body}`
    );
  };

  return (
    <SettingsCard>
      <SettingsItem
        icon="information-circle"
        label="Version"
        value={`${APP_VERSION} (${APP_BUILD})`}
      />
      <SettingsItem
        icon="logo-github"
        label="Source Code"
        onPress={() => Linking.openURL(APP_LINKS.github)}
        showChevron
      />
      <SettingsItem
        icon="bug"
        label="Report a Bug"
        onPress={handleReportBug}
        showChevron
      />
      <SettingsItem
        icon="shield-checkmark"
        label="Privacy Policy"
        onPress={() => Linking.openURL(APP_LINKS.privacy)}
        showChevron
        showBorder={false}
      />
    </SettingsCard>
  );
};
