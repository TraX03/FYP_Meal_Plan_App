import { Text, TouchableOpacity, View } from "react-native";
import CustomModal from "./CustomModal";

type ActionSheetOption = {
  label: string;
  action?: () => void;
  isDestructive?: boolean;
};

type ActionSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
};

const ActionSheetModal = ({
  visible,
  onClose,
  options,
}: ActionSheetModalProps) => (
  <CustomModal visible={visible} close={onClose}>
    <View className="p-4 gap-3">
      {options.map(({ label, action, isDestructive }) => (
        <TouchableOpacity
          key={label}
          onPress={() => {
            action?.();
            onClose();
          }}
        >
          <Text style={[{ fontSize: 16 }, isDestructive && { color: "red" }]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </CustomModal>
);

export default ActionSheetModal;
