import { Colors } from "@/constants/Colors";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowBanner: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  useEffect(() => {
    registerForLocalNotifications();

    const notificationListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const { itemName, expiryDate, triggerDate } =
          notification.request.content.data;

        if (!itemName || !expiryDate || !triggerDate) return;

        console.log(
          `Received expiry notification: ${itemName} expiring on ${expiryDate}, triggered at ${triggerDate}`
        );
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification clicked:", response.notification);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
}

async function registerForLocalNotifications() {
  if (!Device.isDevice) {
    console.warn("Must use physical device for notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Notification permissions not granted!");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: Colors.brand.primary,
    });
  }
}
