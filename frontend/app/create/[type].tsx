import { Stack } from "expo-router";
import CreateFormContainer from "./createForm/container";

export default function CreateRouter() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CreateFormContainer />
    </>
  );
}
