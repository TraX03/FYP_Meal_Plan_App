import { pages } from "@/app/onboarding/component";
import HeaderBar from "@/components/HeaderBar";
import SearchWithSuggestion from "@/components/SearchWithSuggestions";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { capitalize } from "@/utility/capitalize";
import { styles } from "@/utility/profile/settings/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import { Stack } from "expo-router";
import {
  KeyboardAvoidingView,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EditPreferenceState } from "./controller";

type Props = {
  keyName: string;
  editPref: ReturnType<typeof useFieldState<EditPreferenceState>>;
  handleSave: (keyName: string, newPreferences: string[]) => Promise<void>;
  addItemToList: (item: string) => void;
  removeItemFromList: (item: string) => void;
};

export default function EditPreferencesComponent({
  keyName,
  editPref,
  handleSave,
  addItemToList,
  removeItemFromList,
}: Props) {
  const { selectedPreferences, title } = editPref;
  const config = pages.find((p) => p.keyName === keyName);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={profileStyles.headerContainer}>
        <HeaderBar title={`Edit ${title}`} />
        <View className="p-5">
          {selectedPreferences.length > 0 ? (
            <View style={styles.listContainer}>
              {selectedPreferences.map((prefs, index) => (
                <View key={index} style={styles.selectedContainer}>
                  <Text style={{ color: Colors.text.primary }}>
                    {capitalize(prefs)}
                  </Text>
                  <Pressable onPress={() => removeItemFromList(prefs)}>
                    <IconSymbol
                      name="multiply.circle"
                      color={Colors.brand.primary}
                      size={16}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ color: Colors.text.label }}>
              No preferences found.
            </Text>
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleSave(keyName, selectedPreferences)}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <SearchWithSuggestion
          onSelectItem={(itemName: string) => addItemToList(itemName)}
          mode={config?.mode}
          placeholder={config?.placeholder}
          suggestionType={config?.suggestionType}
        />
      </KeyboardAvoidingView>
    </>
  );
}
