import { Routes } from "@/constants/Routes";
import { useRouter } from "expo-router";
import { useReduxSelectors } from "./useReduxSelectors";

export function useRequireLogin() {
  const { isLoggedIn } = useReduxSelectors();
  const router = useRouter();

  const checkLogin = (next: string | (() => void)) => {
    if (isLoggedIn) {
      typeof next === "function" ? next() : router.push(next as never);
    } else {
      const redirectTo = typeof next === "string" ? next : Routes.Home;
      router.push(
        `/authentication/sign-in?redirect=${encodeURIComponent(redirectTo)}`
      );
    }
  };

  return { checkLogin };
}
