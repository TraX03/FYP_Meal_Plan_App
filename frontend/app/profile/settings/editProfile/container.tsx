import { useProfileData } from "@/hooks/useProfileData";
import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import React, { useEffect } from "react";
import EditProfileComponent from "./component";
import { useEditProfileController } from "./controller";

export default function EditProfileContainer() {
  const { fetchProfile } = useProfileData();
  const { currentUserProfile, loading } = useReduxSelectors();

  const { onChangeImagePress, getDisplayValue, isBackgroundDark } =
    useEditProfileController(currentUserProfile);

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <EditProfileComponent
      isBackgroundDark={isBackgroundDark}
      profileData={currentUserProfile}
      loading={loading}
      onChangeImagePress={onChangeImagePress}
      getDisplayValue={getDisplayValue}
    />
  );
}
