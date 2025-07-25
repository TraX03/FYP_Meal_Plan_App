import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import { setLoading } from "@/redux/slices/loadingSlice";
import { AppDispatch } from "@/redux/store";
import {
  getCurrentUser,
  getDocumentById,
  updateDocument,
} from "@/services/Appwrite";
import { cleanPreferencesByType } from "@/services/GeminiApi";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";

export interface EditPreferenceState {
  selectedPreferences: string[];
  title: string;
}

export const useEditPreferencesController = () => {
  const dispatch = useDispatch<AppDispatch>();
  const editPref = useFieldState<EditPreferenceState>({
    selectedPreferences: [],
    title: "",
  });

  const { selectedPreferences, setFieldState, setFields } = editPref;

  const fetchPreferences = async (keyName: string) => {
    try {
      const currentUser = await getCurrentUser();
      const document = await getDocumentById(
        AppwriteConfig.USERS_COLLECTION_ID,
        currentUser.$id
      );

      const preferenceMap: Record<string, { value: string[]; label: string }> =
        {
          cuisine: {
            value: document.region_pref ?? [],
            label: "Cuisine",
          },
          avoidIngredients: {
            value: document.avoid_ingredients ?? [],
            label: "Avoided Ingredients",
          },
          diet: {
            value: document.diet ?? [],
            label: "Diet",
          },
        };

      const selected = preferenceMap[keyName] ?? { value: [], label: keyName };

      setFields({
        selectedPreferences: selected.value,
        title: selected.label,
      });
    } catch (error) {
      console.warn("Failed to fetch preferences", error);
    }
  };

  const addItemToList = (item: string) => {
    if (!selectedPreferences.includes(item)) {
      setFieldState("selectedPreferences", [...selectedPreferences, item]);
    }
  };

  const removeItemFromList = (item: string) => {
    setFieldState(
      "selectedPreferences",
      selectedPreferences.filter((i) => i !== item)
    );
  };

  const handleSave = async (keyName: string, newPreferences: string[]) => {
    dispatch(setLoading(true));
    try {
      const currentUser = await getCurrentUser();
      const fieldMap: Record<string, string> = {
        cuisine: "region_pref",
        avoidIngredients: "avoid_ingredients",
        diet: "diet",
      };
      const field = fieldMap[keyName];

      if (!field) {
        console.warn("Unknown preference key:", keyName);
        return;
      }

      if (keyName === "avoidIngredients") {
        newPreferences = await cleanPreferencesByType(
          newPreferences,
          "ingredient"
        );
      } else if (keyName === "diet") {
        newPreferences = await cleanPreferencesByType(newPreferences, "diet");
      } else if (keyName === "cuisine") {
        newPreferences = await cleanPreferencesByType(newPreferences, "region");
      }

      dispatch(setLoading(false));

      await updateDocument(
        AppwriteConfig.USERS_COLLECTION_ID,
        currentUser.$id,
        {
          [field]: newPreferences.map((pref) => pref.trim().toLowerCase()),
        }
      );

      Alert.alert("Saved", "Your preferences have been updated and tuned.");
    } catch (err) {
      console.error("Error updating preferences:", err);
      Alert.alert(
        "Error",
        "Failed to update your preferences. Please try again."
      );
    }
  };

  return {
    editPref,
    fetchPreferences,
    handleSave,
    addItemToList,
    removeItemFromList,
  };
};

export default useEditPreferencesController;
