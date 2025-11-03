// app/(tabs)/receipts/_layout.tsx
// Stack layout for receipts section

import { Stack } from "expo-router";

export default function ReceiptsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
