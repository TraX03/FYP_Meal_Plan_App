import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import { setLoading } from "@/redux/slices/loadingSlice";
import { ProfileData, updateProfileField } from "@/redux/slices/profileSlice";
import { AppDispatch } from "@/redux/store";
import { getCurrentUser, updateDocument } from "@/services/Appwrite";
import { router } from "expo-router";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

export interface EditFieldState {
  value: string;
  showDatePicker: boolean;
}

const fieldLabels: Record<string, string> = {
  username: "Username",
  bio: "Bio",
  gender: "Gender",
  birthday: "Birthday",
  phone: "Phone Number",
  email: "Email",
};

export const useEditFieldController = (
  key: string,
  initialData: string,
  maxLength?: number
) => {
  const dispatch = useDispatch<AppDispatch>();

  const parsedValue = (() => {
    try {
      const parsed = JSON.parse(decodeURIComponent(initialData || "{}"));
      return parsed[key] || "";
    } catch {
      return "";
    }
  })();

  const edit = useFieldState<EditFieldState>({
    value: parsedValue,
    showDatePicker: false,
  });

  const label = fieldLabels[key] || "Unknown Field";

  const handleSave = async () => {
    if (!key) return;
    dispatch(setLoading(true));

    try {
      const user = await getCurrentUser();
      await updateDocument(AppwriteConfig.USERS_COLLECTION_ID, user.$id, {
        [key]: edit.value,
      });

      dispatch(
        updateProfileField({ key: key as keyof ProfileData, value: edit.value })
      );

      Toast.show({
        type: "success",
        text1: `${label} updated successfully.`,
      });
      router.back();
    } catch (err) {
      Alert.alert("Error", `Failed to update ${label}. Please try again.`);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    edit,
    keyName: key,
    label,
    handleSave,
    maxLength,
  };
};

export default useEditFieldController;
