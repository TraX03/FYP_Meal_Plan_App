import { getImageUrl } from "@/utility/imageUtils";
import React from "react";
import { Image, Modal, TouchableOpacity } from "react-native";
import { styles } from "./styles";

type FullscreenImageViewerProps = {
  imageUri: string | null;
  onClose: () => void;
};

const FullscreenImageViewer = ({
  imageUri,
  onClose,
}: FullscreenImageViewerProps) => {
  if (!imageUri) return null;

  return (
    <Modal visible transparent statusBarTranslucent>
      <TouchableOpacity style={styles.modalContainer} onPress={onClose}>
        <Image
          source={{ uri: getImageUrl(imageUri) }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Modal>
  );
};

export default FullscreenImageViewer;
