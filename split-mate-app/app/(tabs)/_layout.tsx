import { NativeTabs } from "expo-router/native-tabs";
import { DynamicColorIOS } from "react-native";
import { useTheme } from "../../src/shared/contexts/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      tintColor={DynamicColorIOS({
        dark: colors.accent.primary,
        light: colors.accent.primary,
      })}
    >
      <NativeTabs.Trigger name="mates">
        <NativeTabs.Trigger.Label>Mates</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.3.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="receipts">
        <NativeTabs.Trigger.Label>Receipts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="doc.text.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
