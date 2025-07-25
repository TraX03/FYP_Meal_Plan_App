import { useAuthentication } from "@/hooks/useAuthentication";
import * as Notifications from "expo-notifications";

export const useSettingsController = () => {
  const { logout } = useAuthentication();

  const handleLogout = async () => {
    logout();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚪 Logged Out",
        body: "You have been logged out!",
        sound: true,
        data: { reason: "logout" },
      },
      trigger: null,
    });
  };

  return {
    handleLogout,
  };
};

export default useSettingsController;
