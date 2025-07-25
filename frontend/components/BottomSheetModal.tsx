import { Colors } from "@/constants/Colors";
import { useSlide } from "@/hooks/useSlide";
import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { styles } from "./styles";

type Option = {
  key: string;
  label: string;
  onPress: () => void;
  testID?: string;
};

type BottomSheetModalProps = {
  isVisible: boolean;
  onClose: () => void;
  options?: Option[];
  zIndex?: number;
  modalStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const BottomSheetModal = ({
  isVisible,
  onClose,
  options,
  zIndex = 0,
  modalStyle,
  children,
}: BottomSheetModalProps) => {
  const [internalVisible, setInternalVisible] = useState(isVisible);
  const [overlayColor, setOverlayColor] = useState(Colors.overlay.base);

  const { translateY, shouldRender } = useSlide(internalVisible, () => {
    onClose();
  });

  useEffect(() => {
    if (isVisible) {
      setInternalVisible(true);
      setOverlayColor(Colors.overlay.base);
    } else {
      setOverlayColor("transparent");
      setInternalVisible(false);
    }
  }, [isVisible]);

  const handleOverlayPress = () => {
    setOverlayColor("transparent");
    setInternalVisible(false);
  };

  if (!shouldRender) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { zIndex, justifyContent: "flex-end" },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleOverlayPress}
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: overlayColor },
        ]}
      />
      <Animated.View
        style={[
          styles.slideModalSheet,
          { transform: [{ translateY }] },
          modalStyle,
        ]}
      >
        <View style={styles.divider} />
        {children ??
          options?.map(({ key, label, onPress, testID }) => (
            <TouchableOpacity
              key={key}
              testID={testID}
              className="py-1"
              onPress={() => {
                setOverlayColor("transparent");
                setInternalVisible(false);
                setTimeout(() => {
                  onPress();
                }, 300);
              }}
            >
              <Animated.Text style={styles.addModalText}>{label}</Animated.Text>
            </TouchableOpacity>
          ))}
      </Animated.View>
    </View>
  );
};

export default BottomSheetModal;
