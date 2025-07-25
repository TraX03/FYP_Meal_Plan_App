import { Stack, useLocalSearchParams } from "expo-router";
import EditFieldContainer from "./editField/container";

export default function EditRouter() {
  const { key = "", size = "", data = "" } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <EditFieldContainer
        keyName={String(key)}
        size={String(size)}
        data={String(data)}
      />
    </>
  );
}
