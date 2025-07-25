import { useProfileData } from "@/hooks/useProfileData";
import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useEffect } from "react";
import ProfileComponent from "./component";
import SettingsController from "./controller";

export default function SettingsContainer() {
  const { fetchProfile } = useProfileData();
  const { handleLogout } = SettingsController();
  const { currentUserProfile } = useReduxSelectors();

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileComponent
      profileData={currentUserProfile}
      onLogout={handleLogout}
    />
  );
}
