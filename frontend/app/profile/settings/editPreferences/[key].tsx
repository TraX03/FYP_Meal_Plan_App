import { Stack, useLocalSearchParams } from "expo-router";
import EditPreferencesContainer from "./container";

export default function EditRouter() {
  const { key = "" } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <EditPreferencesContainer keyName={String(key)} />
    </>
  );
}
