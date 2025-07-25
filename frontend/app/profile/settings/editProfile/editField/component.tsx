import HeaderBar from "@/components/HeaderBar";
import InputBox from "@/components/InputBox";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { capitalize } from "@/utility/capitalize";
import { styles } from "@/utility/profile/settings/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EditFieldState } from "./controller";

type Props = {
  edit: ReturnType<typeof useFieldState<EditFieldState>>;
  keyName: string;
  label: string;
  handleSave: () => void;
  maxLength?: number;
};

const genderOptions = ["female", "male", "prefer_not_to_say", "other"];

export default function EditFieldComponent({
  edit,
  keyName,
  label,
  handleSave,
  maxLength,
}: Props) {
  const { value, showDatePicker, setFieldState } = edit;

  return (
    <KeyboardAvoidingView style={profileStyles.headerContainer}>
      <HeaderBar title={`Edit ${label}`} />
      <View className="flex-1 px-4">
        {keyName === "gender" ? (
          <View className="mt-4 space-y-3">
            {genderOptions.map((option) => {
              const isSelected = value === option;
              return (
                <TouchableOpacity
                  key={option}
                  className="flex-row justify-between items-center px-2 py-2 rounded-lg"
                  onPress={() => setFieldState("value", option)}
                >
                  <Text style={styles.genderOptionText}>
                    {capitalize(option)}
                  </Text>
                  <View
                    className="w-5 h-5 rounded-full border items-center justify-center"
                    style={{
                      borderColor: isSelected
                        ? Colors.brand.primary
                        : Colors.text.placeholder,
                    }}
                  >
                    {isSelected && <View style={styles.radioButton} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : keyName === "birthday" ? (
          <>
            <TouchableOpacity
              onPress={() => setFieldState("showDatePicker", true)}
              style={styles.inputBox}
            >
              <Text style={styles.inputPlaceholder}>
                {value
                  ? new Date(value).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Select your birthday"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setFieldState("showDatePicker", false);
                  if (event.type === "set" && selectedDate) {
                    setFieldState("value", selectedDate.toISOString());
                  }
                }}
              />
            )}
          </>
        ) : (
          <View className="mt-4">
            <InputBox
              placeholder={`Enter your ${label.toLowerCase()}`}
              value={value}
              onChangeText={(text) => setFieldState("value", text)}
              inputStyle={styles.input}
              lines={4}
              limit={maxLength}
              isMultiline
            />
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
