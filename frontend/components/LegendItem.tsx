import { Colors } from "@/constants/Colors";
import { Text, View } from "react-native";

type LegendItemProps = {
  color: string;
  label: string;
};

const LegendItem = ({ color, label }: LegendItemProps) => (
  <View className="flex-row items-center gap-1.5">
    <View
      className="w-3 h-3 rounded-sm"
      style={{
        backgroundColor: color,
      }}
    />
    <Text style={{ fontSize: 12, color: Colors.text.primary }}>{label}</Text>
  </View>
);

export default LegendItem;
