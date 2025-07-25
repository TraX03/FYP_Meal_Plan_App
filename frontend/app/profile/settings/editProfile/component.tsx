import ErrorScreen from "@/components/ErrorScreen";
import HeaderBar from "@/components/HeaderBar";
import IconButton from "@/components/IconButton";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Routes } from "@/constants/Routes";
import { usePreventDoubleTap } from "@/hooks/usePreventDoubleTap";
import { ProfileData } from "@/redux/slices/profileSlice";
import { getOverlayStyle } from "@/utility/imageUtils";
import { styles } from "@/utility/profile/settings/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import { router, Stack } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  isBackgroundDark: boolean;
  profileData: ProfileData | null;
  loading: boolean;
  onChangeImagePress: (fieldKey: "profile_bg" | "avatar") => Promise<void>;
  getDisplayValue: (title: string, value: any, alwaysShow?: boolean) => string;
};

export default function EditProfileComponent({
  isBackgroundDark,
  profileData,
  loading,
  onChangeImagePress,
  getDisplayValue,
}: Props) {
  if (!profileData && loading) return null;
  if (!profileData) {
    return (
      <ErrorScreen message="Something went wrong while loading your profile data. Please refresh or try again later." />
    );
  }

  const handleEdit = usePreventDoubleTap(() =>
    router.push({
      pathname: Routes.EditFieldForm,
      params: {
        key: "username",
        size: 20,
        data: encodeURIComponent(JSON.stringify(profileData)),
      },
    })
  );

  const {
    username,
    avatarUrl,
    bio,
    gender,
    birthday,
    phone,
    email,
    profileBg,
  } = profileData;

  const fields = useMemo(
    () => [
      {
        title: "Username",
        value: username,
        alwaysShowValue: true,
        key: "username",
        size: 20,
      },
      { title: "Bio", value: bio, key: "bio", size: 160 },
      { title: "Gender", value: gender, key: "gender" },
      {
        title: "Birthday",
        value: birthday
          ? new Date(birthday).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : undefined,
        key: "birthday",
      },
      { title: "Phone Number", value: phone, key: "phone" },
      {
        title: "Email",
        value: email,
        alwaysShowValue: true,
        email,
        key: "email",
      },
    ],
    [username, bio, gender, birthday, phone, email]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={profileStyles.headerContainer}>
        <HeaderBar title="Edit Profile" />
        <ImageBackground
          source={{ uri: profileBg }}
          style={{
            backgroundColor: !profileBg ? Colors.brand.primaryDark : undefined,
          }}
          imageStyle={{ opacity: 0.8 }}
          className="justify-center items-center h-[210px]"
        >
          <View className="relative">
            <View style={profileStyles.avatarContainer}>
              <Image
                source={{ uri: avatarUrl }}
                style={profileStyles.avatar}
                resizeMode="cover"
              />
            </View>
            <IconButton
              name="pencil"
              iconSize={16}
              isBackgroundDark={isBackgroundDark}
              onPress={() => onChangeImagePress("avatar")}
              containerClassName="absolute -bottom-1 -right-1 rounded-full p-2 w-9 h-9 justify-center items-center"
            />
          </View>
          <TouchableOpacity
            style={[styles.changeBgButton, getOverlayStyle(isBackgroundDark)]}
            onPress={() => onChangeImagePress("profile_bg")}
          >
            <Text
              style={[
                styles.changeBgText,
                getOverlayStyle(isBackgroundDark, true),
              ]}
            >
              Change Background
            </Text>
            <IconSymbol
              name="photo"
              color={
                isBackgroundDark
                  ? Colors.brand.primary
                  : Colors.surface.backgroundSoft
              }
              size={20}
            />
          </TouchableOpacity>
        </ImageBackground>

        <View style={profileStyles.container}>
          {fields.map(({ title, value, alwaysShowValue, key, size }, index) => {
            const displayValue = getDisplayValue(title, value, alwaysShowValue);
            const isSetNow =
              displayValue === "Set Now" || displayValue === "Link Now";
            const shouldHaveGapAbove = key === "gender" || key === "phone";

            return (
              <Pressable
                key={key}
                onPress={handleEdit}
                className="border-b"
                style={[
                  styles.fieldTab,
                  {
                    marginTop: shouldHaveGapAbove ? 20 : 0,
                    borderTopWidth: shouldHaveGapAbove ? 1 : 0,
                  },
                ]}
              >
                <View className="flex-row justify-between items-center px-4 py-3">
                  <Text style={styles.tabTitleText}>{title}</Text>
                  <View className="flex-row items-center space-x-2">
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color: isSetNow
                            ? Colors.overlay.base
                            : Colors.text.primary,
                          maxWidth: title === "Bio" ? 180 : undefined,
                        },
                      ]}
                      ellipsizeMode={title === "Bio" ? "tail" : undefined}
                      numberOfLines={title === "Bio" ? 1 : undefined}
                    >
                      {displayValue}
                    </Text>
                    <IconSymbol
                      name="chevron.right"
                      color={Colors.overlay.base}
                      size={20}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}
