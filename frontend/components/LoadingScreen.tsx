import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { styles } from "@/utility/profile/styles";
import { Image } from "expo-image";
import React from "react";
import { Modal, View } from "react-native";

const LoadingScreen = () => {
  const { loading } = useReduxSelectors();

  return (
    <Modal
      visible={loading}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.centeredContainer}>
        <Image
          source={require("@/assets/animations/fancy-loading.gif")}
          style={{ width: 240, height: 240 }}
        />
      </View>
    </Modal>
  );
};

export default LoadingScreen;
