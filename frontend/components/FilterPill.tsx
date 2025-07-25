import { Colors } from "@/constants/Colors";
import React from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { styles } from "./styles";

type FilterPillProps = {
  active?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  highlight?: boolean;
};

const FilterPill = ({
  active = false,
  onPress,
  children,
  style,
  highlight = false,
}: FilterPillProps) => {
  const backgroundColor =
    highlight && active ? Colors.brand.primaryLight : undefined;

  const pillStyle: ViewStyle = {
    borderColor: Colors.brand.primaryLight,
    backgroundColor,
  };

  const content = (
    <View style={[styles.pillContainer, pillStyle, style]}>{children}</View>
  );

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
};

export default FilterPill;
