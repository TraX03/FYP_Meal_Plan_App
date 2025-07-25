import ErrorScreen from "@/components/ErrorScreen";
import MasonryList from "@/components/MasonryList";
import ScreenWrapper from "@/components/ScreenWrapper";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Routes } from "@/constants/Routes";
import { useFieldState } from "@/hooks/useFieldState";
import { useInteraction } from "@/hooks/useInteraction";
import { ProfileData } from "@/redux/slices/profileSlice";
import { getOverlayStyle } from "@/utility/imageUtils";
import { styles } from "@/utility/profile/styles";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProfileState } from "./controller";

type Props = {
  profileData: ProfileData | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  checkLogin: (intendedPage: string) => void;
  profile: ReturnType<typeof useFieldState<ProfileState>>;
  isOwnProfile: boolean;
  isBackgroundDark: boolean;
  interactionData: {
    interactionRecords: Record<string, any>;
    interactionVersion: number;
  };
  fetchPostsByUser: (userId: string) => Promise<void>;
};

const menuOptions = [
  {
    title: "History",
    icon: "clock",
    action: () => router.push(Routes.History),
  },
  {
    title: "Community",
    icon: "person.2.fill",
    action: () => router.push(Routes.CommunityList),
  },
] as const;

export const mainTabs = ["Posts", "Collections", "Likes"] as const;
export const subTabs = ["Recipe", "Tips", "Discussion"] as const;

export default function ProfileComponent({
  profileData,
  isLoading,
  isLoggedIn,
  checkLogin,
  profile,
  isOwnProfile,
  isBackgroundDark,
  interactionData,
  fetchPostsByUser,
}: Props) {
  if (isLoading && !profileData) return null;

  if (!profileData)
    return (
      <ErrorScreen message="Something went wrong while loading your profile data. Please refresh or try again later." />
    );

  const { interactionRecords, interactionVersion } = interactionData;

  const {
    activeTab,
    posts,
    likedPosts,
    bookmarkedPosts,
    subTab: postSubTab,
    setFieldState,
    postLoading,
  } = profile;

  const {
    id,
    username,
    avatarUrl,
    followersCount,
    followingCount,
    profileBg,
    bio,
  } = profileData;

  const interaction = useInteraction(id ?? "", {
    isFollowing: interactionRecords[`follow_${id}`]?.$id != null,
    followDocId: interactionRecords[`follow_${id}`]?.$id,
  });

  const isFollowing = interaction?.isFollowing ?? false;
  const toggleFollow = interaction?.toggleFollow ?? (() => {});

  const sourcePosts =
    activeTab === "Likes"
      ? likedPosts
      : activeTab === "Collections"
      ? bookmarkedPosts
      : posts;

  const filteredPosts = sourcePosts.filter((p) =>
    postSubTab === "Recipe"
      ? p.type === "recipe"
      : p.type?.toLowerCase() === postSubTab.toLowerCase()
  );

  const sortedPosts = filteredPosts.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const content = (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={profileBg ? { uri: profileBg } : undefined}
        style={[
          styles.profileSection,
          { backgroundColor: profileBg ? undefined : Colors.brand.primary },
        ]}
      >
        <LinearGradient
          colors={["transparent", Colors.overlay.subtleDark]}
          locations={[0, 0.3]}
          style={StyleSheet.absoluteFillObject}
        />

        <View className="flex-row justify-between items-center mb-[16px]">
          {isOwnProfile ? (
            <View className="w-[28px]" />
          ) : (
            <Pressable onPress={() => router.back()}>
              <IconSymbol
                name="chevron.left"
                size={28}
                color={Colors.brand.onPrimary}
              />
            </Pressable>
          )}

          <View className="flex-row items-center gap-[12px]">
            <TouchableOpacity
              testID="refresh-button"
              onPress={() => profileData.id && fetchPostsByUser(profileData.id)}
            >
              <IconSymbol
                name="arrow.clockwise.circle"
                size={32}
                color={Colors.brand.onPrimary}
              />
            </TouchableOpacity>

            {isOwnProfile ? (
              <>
                <TouchableOpacity
                  testID="edit-button"
                  onPress={() => checkLogin(Routes.EditProfile)}
                >
                  <IconSymbol
                    name="pencil.circle"
                    size={28}
                    color={Colors.brand.onPrimary}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => checkLogin(Routes.Settings)}>
                  <IconSymbol
                    name="square.grid.2x2"
                    size={27}
                    color={Colors.brand.onPrimary}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => console.log("Ellipsis options")}>
                <IconSymbol
                  name="ellipsis"
                  size={26}
                  color={Colors.brand.onPrimary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <View className="ml-7 flex-1">
            <View className="flex-row items-center gap-2">
              <Text style={styles.username}>{username}</Text>
              {!isLoggedIn && isOwnProfile && (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: Routes.AuthForm,
                      params: { mode: "sign-in" },
                    })
                  }
                  style={styles.loginButton}
                >
                  <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.followInfo}>
              {followersCount} Followers | {followingCount} Following
            </Text>
          </View>
        </View>

        {isLoggedIn || !isOwnProfile ? (
          <Text style={styles.bioText}>{bio}</Text>
        ) : null}

        {isOwnProfile && isLoggedIn ? (
          <View className="flex-row justify-start mt-5">
            {menuOptions.map(({ title, icon, action }) => (
              <TouchableOpacity
                key={title}
                style={styles.profileTab}
                activeOpacity={0.8}
                onPress={action}
              >
                <IconSymbol
                  name={icon}
                  size={26}
                  color={Colors.brand.onPrimary}
                />
                <Text style={styles.profileTabText}>{title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : !isOwnProfile ? (
          <View className="flex-row justify-end mt-5">
            <TouchableOpacity
              style={[getOverlayStyle(isBackgroundDark), styles.followButton]}
              onPress={toggleFollow}
            >
              <Text
                style={[
                  getOverlayStyle(isBackgroundDark, true),
                  { fontFamily: "RobotoRegular" },
                ]}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="h-5" />
        )}
      </ImageBackground>

      <View style={styles.postListContainer}>
        <View style={styles.tabHeader}>
          {mainTabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() =>
                setFieldState("activeTab", tab as ProfileState["activeTab"])
              }
            >
              <Text
                style={{
                  fontSize: 17,
                  color:
                    activeTab === tab
                      ? Colors.brand.primary
                      : Colors.text.disabled,
                  fontFamily:
                    activeTab === tab ? "RobotoBold" : "RobotoRegular",
                }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.subTabHeader}>
          {subTabs.map((sub) => (
            <Pressable
              key={sub}
              onPress={() =>
                setFieldState("subTab", sub as ProfileState["subTab"])
              }
            >
              <Text
                style={{
                  fontSize: 15,
                  color:
                    postSubTab === sub
                      ? Colors.brand.primary
                      : Colors.text.disabled,
                  fontFamily:
                    postSubTab === sub ? "RobotoBold" : "RobotoRegular",
                }}
              >
                {sub}
              </Text>
            </Pressable>
          ))}
        </View>

        <View>
          {postLoading ? (
            <View style={styles.loadingContianer}>
              <ActivityIndicator
                testID="activity-indicator"
                size="large"
                color={Colors.brand.primary}
              />
            </View>
          ) : (
            <MasonryList
              posts={sortedPosts.map((post) => ({
                ...post,
                author: (post as any).authorInfo?.username ?? username,
                profilePic: (post as any).authorInfo?.avatarUrl ?? avatarUrl,
              }))}
              interactionVersion={interactionVersion}
              source={"profilePage"}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );

  return isOwnProfile ? content : <ScreenWrapper>{content}</ScreenWrapper>;
}
