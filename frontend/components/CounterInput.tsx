import { Colors } from "@/constants/Colors";
import { Pressable, Text, View } from "react-native";
import { styles } from "./styles";
import { IconSymbol } from "./ui/IconSymbol";

type CounterInputProps = {
  label?: string;
  value?: number;
  onDecrement: () => void;
  onIncrement: () => void;
  noMarginTop?: boolean;
};

const CounterInput = ({
  label,
  value,
  onDecrement,
  onIncrement,
  noMarginTop,
}: CounterInputProps) => (
  <View className={`flex-row items-center gap-2 ${noMarginTop ? "" : "mt-2"}`}>
    <Text className="text-[15px]">{label}</Text>
    <Pressable testID="decrement-button" onPress={onDecrement}>
      <IconSymbol
        name="minus.square.fill"
        color={Colors.brand.primaryDark}
        size={23}
      />
    </Pressable>
    <View style={styles.counterContainer}>
      <Text>{value}</Text>
    </View>
    <Pressable testID="increment-button" onPress={onIncrement}>
      <IconSymbol
        name="plus.square.fill"
        color={Colors.brand.primaryDark}
        size={23}
      />
    </Pressable>
  </View>
);

export default CounterInput;
