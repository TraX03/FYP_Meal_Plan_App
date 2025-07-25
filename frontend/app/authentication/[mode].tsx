import { Stack, useLocalSearchParams } from "expo-router";
import AuthFormContainer from "./authForm/container";
import { AuthMode } from "./authForm/controller";

export default function AuthRouter() {
  const { mode } = useLocalSearchParams();
  const formMode: AuthMode = mode === "signUp" ? "signUp" : "signIn";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthFormContainer mode={formMode} />
    </>
  );
}
