import { Routes } from "@/constants/Routes";
import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import HomeContainer from "../home/container";

if (__DEV__) {
  require("@/ReactotronConfig");
}

export default function HomeScreenRoute() {
  const router = useRouter();
  const { user, onboarded } = useReduxSelectors();
  useEffect(() => {
    if (user && onboarded === false) {
      router.replace(Routes.Onboarding);
    }
  }, [user, onboarded]);
  return <HomeContainer />;
}
