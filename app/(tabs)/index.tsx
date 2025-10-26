// app/(tabs)/index.tsx
// Redirect to mates tab

import { Redirect } from "expo-router";

export default function TabIndex() {
  return <Redirect href="/(tabs)/mates" />;
}
