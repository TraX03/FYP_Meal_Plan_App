import React, { useMemo } from "react";
import {
  Image,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

const imageSource = require("@/assets/images/add-button.png");

interface FloatingButtonProps extends TouchableOpacityProps {
  bottomOffset?: number;
}

const FloatingActionButton = ({
  bottomOffset = 22,
  testID = "fab-button",
  ...props
}: FloatingButtonProps) => {
  const { width, height } = Image.resolveAssetSource(imageSource);
  const aspectRatio = useMemo(() => width / height, [width, height]);

  return (
    <TouchableOpacity
      testID={testID}
      className="absolute bottom-7 z-10 self-center"
      style={{ bottom: bottomOffset }}
      activeOpacity={0.8}
      {...props}
    >
      <View className="overflow-hidden rounded-xl">
        <Image
          source={imageSource}
          style={{ height: 60, aspectRatio }}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default FloatingActionButton;
