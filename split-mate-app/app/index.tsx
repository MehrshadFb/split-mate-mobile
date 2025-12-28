// app/index.tsx
// Root redirect to tabs

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(tabs)/mates" />;
}
