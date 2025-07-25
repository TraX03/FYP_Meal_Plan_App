import ErrorScreen from "@/components/ErrorScreen";
import HeaderBar from "@/components/HeaderBar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Routes } from "@/constants/Routes";
import { usePreventDoubleTap } from "@/hooks/usePreventDoubleTap";
import { ProfileData } from "@/redux/slices/profileSlice";
import { styles } from "@/utility/profile/settings/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import { router, Stack } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  profileData: ProfileData | null;
  onLogout: () => void;
};

export default function SettingsComponent({ profileData, onLogout }: Props) {
  if (!profileData) {
    return (
      <ErrorScreen message="Something went wrong while loading your profile data. Please refresh or try again later." />
    );
  }

  const { avatarUrl, username } = profileData;
  const goToCuisine = usePreventDoubleTap(() =>
    router.push({
      pathname: Routes.EditPreferencesForm,
      params: { key: "cuisine" },
    })
  );

  const goToAvoidIngredients = usePreventDoubleTap(() =>
    router.push({
      pathname: Routes.EditPreferencesForm,
      params: { key: "avoidIngredients" },
    })
  );

  const goToDiet = usePreventDoubleTap(() =>
    router.push({
      pathname: Routes.EditPreferencesForm,
      params: { key: "diet" },
    })
  );

  const PreferenceItem = ({
    label,
    onPress,
    isTop = false,
    isBottom = false,
  }: {
    label: string;
    onPress: () => void;
    isTop?: boolean;
    isBottom?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.fieldTab,
        isTop && { borderTopWidth: 1 },
        isBottom && { borderBottomWidth: 1 },
      ]}
    >
      <View className="flex-row justify-between items-center px-4 py-3">
        <Text style={styles.tabTitleText}>{label}</Text>
        <IconSymbol
          name="chevron.right"
          color={Colors.overlay.base}
          size={20}
        />
      </View>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={profileStyles.headerContainer}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <HeaderBar title="Settings" />
        <TouchableOpacity onPress={() => router.push(Routes.EditProfile)}>
          <View style={styles.settingsTab}>
            <View
              style={[
                profileStyles.avatarContainer,
                { width: 70, height: 70, elevation: 4 },
              ]}
            >
              <Image
                source={{ uri: avatarUrl }}
                style={profileStyles.avatar}
                resizeMode="cover"
              />
            </View>

            <View className="flex-1 flex-col ml-6">
              <Text className="mb-3 font-semibold text-[16px]">{username}</Text>
              <Text>Edit Profile</Text>
            </View>

            <IconSymbol
              name="chevron.right"
              color={Colors.overlay.base}
              size={20}
            />
          </View>
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: "RobotoMedium",
            fontSize: 18,
            marginTop: 20,
            marginBottom: 8,
            marginLeft: 10,
          }}
        >
          Preferences
        </Text>

        <PreferenceItem label="Cuisine" isTop onPress={goToCuisine} />
        <PreferenceItem
          label="Avoided Ingredients"
          onPress={goToAvoidIngredients}
        />
        <PreferenceItem label="Diet" isBottom onPress={goToDiet} />

        <Pressable
          onPress={onLogout}
          style={[
            styles.fieldTab,
            {
              borderWidth: 1,
              marginTop: 20,
            },
          ]}
        >
          <View className="flex-row justify-between items-center px-4 py-3">
            <Text style={styles.tabTitleText}>Logout</Text>
            <IconSymbol
              name="chevron.right"
              color={Colors.overlay.base}
              size={20}
            />
          </View>
        </Pressable>
      </ScrollView>
    </>
  );
}
