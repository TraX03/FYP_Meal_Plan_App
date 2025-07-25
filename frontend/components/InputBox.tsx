import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { styles as profileStyles } from "@/utility/profile/styles";
import React from "react";
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type InputBoxProps = TextInputProps & {
  icon?: IconSymbolName;
  iconColor?: string;
  iconSize?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  isPassword?: boolean;
  limit?: number;
  isMultiline?: boolean;
  lines?: number;
  value: string;
  onChangeText: (text: string) => void;
  clearColor?: string;
  keyboardType?: string;
  showClearButton?: boolean;
};

const InputBox = ({
  icon,
  iconColor = Colors.brand.primary,
  iconSize = 20,
  containerStyle,
  inputStyle,
  isPassword = false,
  limit,
  isMultiline = false,
  lines,
  value,
  onChangeText,
  clearColor,
  keyboardType,
  showClearButton = true,
  ...props
}: InputBoxProps) => (
  <>
    <View style={containerStyle} className="relative">
      {!!icon && (
        <IconSymbol
          name={icon}
          size={iconSize}
          color={iconColor}
          style={{ marginRight: 8 }}
        />
      )}

      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        className={containerStyle ? "flex-1 pr-8" : undefined}
        secureTextEntry={isPassword || props.secureTextEntry}
        multiline={isMultiline}
        numberOfLines={lines}
        maxLength={limit}
        style={inputStyle}
        keyboardType={keyboardType}
        placeholderTextColor={Colors.text.disabled}
      />

      {showClearButton && value.length > 0 && (
        <TouchableOpacity
          testID="clear-button"
          onPress={() => onChangeText("")}
          className={
            containerStyle
              ? "absolute right-5 top-3"
              : "absolute right-5 top-1/2 transform -translate-y-1/2 self-center"
          }
        >
          <IconSymbol
            name="multiply.circle"
            color={clearColor || Colors.overlay.base}
            size={18}
          />
        </TouchableOpacity>
      )}
    </View>

    {limit && (
      <Text style={profileStyles.indicatorText}>
        {value.length}/{limit} characters
      </Text>
    )}
  </>
);

export default InputBox;
