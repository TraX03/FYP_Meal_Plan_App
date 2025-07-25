import CustomToast from "@/components/CustomToast";
import LoadingScreen from "@/components/LoadingScreen";
import { useHydrateAppState } from "@/hooks/useHydrateAppState";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import store from "@/redux/store";
import { subscribeToUserUpdates } from "@/utility/userCacheUtils";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast, { BaseToastProps } from "react-native-toast-message";
import { Provider } from "react-redux";
import "./global.css";

SplashScreen.preventAutoHideAsync();

function RootContent() {
  useHydrateAppState();
  usePushNotifications();

  useEffect(() => {
    const unsubscribe = subscribeToUserUpdates();
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      <LoadingScreen />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    RobotoLight: require("../assets/fonts/Roboto-Light.ttf"),
    RobotoMedium: require("../assets/fonts/Roboto-Medium.ttf"),
    RobotoRegular: require("../assets/fonts/Roboto-Regular.ttf"),
    RobotoSemiBold: require("../assets/fonts/Roboto-SemiBold.ttf"),
    RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"),
    RobotoSemiCondensed: require("../assets/fonts/Roboto_SemiCondensed-Regular.ttf"),
    SignikaNegativeSC: require("../assets/fonts/SignikaNegativeSC-Regular.ttf"),
    SignikaNegativeSCSemiBold: require("../assets/fonts/SignikaNegativeSC-SemiBold.ttf"),
    Afacad: require("../assets/fonts/Afacad-Regular.ttf"),
    AfacadMedium: require("../assets/fonts/Afacad-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const toastConfig = {
    info: (props: BaseToastProps) => <CustomToast {...props} />,
    success: (props: BaseToastProps) => <CustomToast {...props} />,
    error: (props: BaseToastProps) => <CustomToast {...props} />,
  };

  return (
    <Provider store={store}>
      <RootContent />
      <Toast config={toastConfig} />
    </Provider>
  );
}
