import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";

type HeaderBarProps = {
  title?: string;
  titleComponent?: React.ReactNode;
  onBackPress?: () => void;
};

const HeaderBar = ({ title, titleComponent, onBackPress }: HeaderBarProps) => {
  const router = useRouter();

  return (
    <View className="flex-row items-center px-4 py-3">
      <Pressable onPress={onBackPress ?? (() => router.back())}>
        <IconSymbol
          name="chevron.left"
          color={Colors.brand.primaryDark}
          size={30}
        />
      </Pressable>
      <View className="flex-1 ml-4">
        {titleComponent ? (
          titleComponent
        ) : (
          <Text className="text-xl font-semibold">{title}</Text>
        )}
      </View>
    </View>
  );
};

export default HeaderBar;
