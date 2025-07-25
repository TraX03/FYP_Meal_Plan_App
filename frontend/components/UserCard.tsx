import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Routes } from "@/constants/Routes";
import { usePreventDoubleTap } from "@/hooks/usePreventDoubleTap";
import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { User } from "@/utility/fetchUtils";
import { styles as profileStyles } from "@/utility/profile/styles";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

type UserCardProps = {
  user: User;
};

export default function UserCard({ user }: UserCardProps) {
  const { currentUserId } = useReduxSelectors();
  const handleUserPress = usePreventDoubleTap(() => {
    if (!user?.id) return;

    router.push(
      user.id === currentUserId
        ? Routes.ProfileTab
        : { pathname: Routes.UserDetail, params: { id: user.id } }
    );
  });

  return (
    <TouchableOpacity
      style={styles.userCardContainer}
      onPress={handleUserPress}
    >
      <View className="flex-row items-center flex-1">
        <View
          style={[
            profileStyles.avatarContainer,
            { width: 60, height: 60, marginRight: 20, elevation: 4 },
          ]}
        >
          <Image
            source={{ uri: user.profilePic }}
            style={profileStyles.avatar}
            resizeMode="cover"
          />
        </View>
        <View className="flex-shrink">
          <Text style={styles.usernameText}>{user.name}</Text>
          <Text style={styles.bioText} numberOfLines={1} ellipsizeMode="tail">
            {user.bio}
          </Text>
        </View>
      </View>

      <IconSymbol name="chevron.right" color={Colors.overlay.base} size={20} />
    </TouchableOpacity>
  );
}
