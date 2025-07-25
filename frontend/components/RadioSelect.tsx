import { Colors } from "@/constants/Colors";
import { capitalize } from "@/utility/capitalize";
import { styles as settingStyles } from "@/utility/profile/settings/styles";
import { Text, TouchableOpacity, View } from "react-native";

type RadioSelectProps<T extends string> = {
  options: [T, string][];
  value: T;
  onSelect: (val: T) => void;
};

const RadioSelect = <T extends string>({
  options,
  value,
  onSelect,
}: RadioSelectProps<T>) => {
  return (
    <View className="flex-row mb-6 gap-3 flex-wrap">
      {options.map(([option, label]) => {
        const isSelected = value === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            className="flex-row items-center px-4 py-2 rounded-full border"
            style={{
              borderColor: isSelected
                ? Colors.brand.primary
                : Colors.text.placeholder,
            }}
          >
            <View
              className="w-5 h-5 rounded-full border items-center justify-center mr-2"
              style={{
                borderColor: isSelected
                  ? Colors.brand.primary
                  : Colors.text.placeholder,
              }}
            >
              {isSelected && <View style={settingStyles.radioButton} />}
            </View>
            <Text>{capitalize(label)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default RadioSelect;
