import React from "react";
import { Modal, ModalProps, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

interface CustomModalProps extends ModalProps {
  visible: boolean;
  close: () => void;
  children: React.ReactNode;
}

const CustomModal = ({
  visible,
  close,
  children,
  ...rest
}: CustomModalProps) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={close}
      statusBarTranslucent
      {...rest}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={close}
      >
        <View style={styles.modalContent}>{children}</View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomModal;
