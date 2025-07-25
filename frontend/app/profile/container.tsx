import { useLiveUserProfile } from "@/hooks/useLiveUserProfile";
import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { setRefreshProfile } from "@/redux/slices/profileSlice";
import { AppDispatch } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ProfileComponent from "./component";
import { useProfileController } from "./controller";

type Props = {
  profileId?: string;
};

export default function ProfileContainer({ profileId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { checkLogin } = useRequireLogin();
  const { profile, fetchPostsByUser, isBackgroundDark } =
    useProfileController();

  const {
    user,
    interactionRecords,
    interactionVersion,
    currentUserId,
    currentUserProfile,
    refreshProfile,
    loading,
  } = useReduxSelectors();

  const isOwnProfile = !profileId || profileId === currentUserId;
  const viewedUserLive = useLiveUserProfile(
    !isOwnProfile ? profileId : undefined
  );

  useEffect(() => {
    if (!isOwnProfile && viewedUserLive) {
      profile.setFieldState("viewedProfileData", {
        ...viewedUserLive,
        id: profileId,
      });
    }
  }, [isOwnProfile, viewedUserLive, profileId]);

  useEffect(() => {
    if (isOwnProfile) {
      if (currentUserId && profile.posts.length === 0) {
        fetchPostsByUser(currentUserId);
      }
    } else if (profileId) {
      fetchPostsByUser(profileId);
    }
  }, [profileId, isOwnProfile, currentUserId, user]);

  useEffect(() => {
    if (isOwnProfile && refreshProfile && currentUserId) {
      fetchPostsByUser(currentUserId);
      dispatch(setRefreshProfile(false));
    }
  }, [refreshProfile, isOwnProfile, currentUserId]);

  const profileData = isOwnProfile
    ? currentUserProfile
    : profile.viewedProfileData;

  return (
    <ProfileComponent
      profileData={profileData}
      isLoading={loading}
      isLoggedIn={Boolean(user)}
      checkLogin={checkLogin}
      profile={profile}
      isOwnProfile={isOwnProfile}
      isBackgroundDark={isBackgroundDark}
      interactionData={{
        interactionRecords,
        interactionVersion,
      }}
      fetchPostsByUser={fetchPostsByUser}
    />
  );
}
