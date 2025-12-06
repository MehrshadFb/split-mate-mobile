// app/(tabs)/_layout.tsx
// Tab navigation layout

import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      labelStyle={{
        color: DynamicColorIOS({
          dark: colors.text.primary,
          light: colors.text.primary,
        }),
      }}
      tintColor={DynamicColorIOS({
        dark: colors.accent.primary,
        light: colors.accent.primary,
      })}
    >
      <NativeTabs.Trigger name="mates">
        <Label>Mates</Label>
        <Icon sf="person.3.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="receipts">
        <Label>Receipts</Label>
        <Icon sf="doc.text.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon sf="gearshape.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
