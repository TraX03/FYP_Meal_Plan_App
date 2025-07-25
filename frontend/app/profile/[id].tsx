import { Stack, useLocalSearchParams } from "expo-router";
import ProfileContainer from "./container";

export default function ProfileRouter() {
  const { id } = useLocalSearchParams();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProfileContainer profileId={id as string} />
    </>
  );
}
