import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { FileToUpload, useMediaHandler } from "@/hooks/useMediaHandler";
import { setLoading } from "@/redux/slices/loadingSlice";
import { guestPicture, updateProfileField } from "@/redux/slices/profileSlice";
import { AppDispatch } from "@/redux/store";
import {
  getCurrentUser,
  getDocumentById,
  storage,
  updateDocument,
} from "@/services/Appwrite";
import { capitalize } from "@/utility/capitalize";
import { detectBackgroundDarkness, getImageUrl } from "@/utility/imageUtils";
import { maskEmail } from "@/utility/maskUtils";
import { parseMetadata, setNestedMetadata } from "@/utility/metadataUtils";
import { useMemo } from "react";
import { useDispatch } from "react-redux";

export const useEditProfileController = (profileData: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { pickImageFile, uploadFile } = useMediaHandler();

  const metadata = useMemo(
    () => parseMetadata(profileData?.metadata),
    [profileData]
  );
  const isBackgroundDark = metadata?.profileBg?.isDark ?? false;

  const getDisplayValue = (title: string, value: any, alwaysShow?: boolean) => {
    if (alwaysShow || value) {
      if (title === "Email") return maskEmail(String(value));
      if (title === "Gender") return capitalize(String(value));
      return String(value);
    }
    return title === "Phone Number" ? "Link Now" : "Set Now";
  };

  const uploadFileAndUpdateProfile = async (
    file: FileToUpload,
    userId: string,
    fieldKey: "profile_bg" | "avatar"
  ) => {
    const userDoc = await getDocumentById(
      AppwriteConfig.USERS_COLLECTION_ID,
      userId
    );

    const oldFileId = userDoc[fieldKey];
    const isGuestImage = oldFileId === guestPicture;

    if (oldFileId && !isGuestImage) {
      storage.deleteFile(AppwriteConfig.BUCKET_ID, oldFileId).catch((err) => {
        console.warn("Failed to delete old file:", err);
      });
    }

    const uploadedId = await uploadFile(file, userId);
    if (!uploadedId) return;

    const updatePayload: Record<string, any> = {
      [fieldKey]: uploadedId,
    };

    let updatedMetadata: any;
    if (fieldKey === "profile_bg") {
      const existingMetadata = parseMetadata(userDoc.metadata);
      const isDark = await detectBackgroundDarkness(file.uri);

      updatedMetadata = setNestedMetadata(
        existingMetadata,
        ["profileBg", "isDark"],
        isDark
      );

      updatePayload.metadata = JSON.stringify(updatedMetadata);
    }

    await updateDocument(
      AppwriteConfig.USERS_COLLECTION_ID,
      userId,
      updatePayload
    );

    dispatch(
      updateProfileField({
        key: fieldKey === "avatar" ? "avatarUrl" : "profileBg",
        value: getImageUrl(uploadedId),
      })
    );

    if (fieldKey === "profile_bg" && updatedMetadata) {
      dispatch(
        updateProfileField({
          key: "metadata",
          value: JSON.stringify(updatedMetadata),
        })
      );
    }
  };

  const onChangeImagePress = async (fieldKey: "profile_bg" | "avatar") => {
    const file = await pickImageFile();
    if (!file) return;

    dispatch(setLoading(true));
    try {
      const user = await getCurrentUser();
      await uploadFileAndUpdateProfile(file, user.$id, fieldKey);
    } catch (error) {
      console.error(`Failed to update ${fieldKey}:`, error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    isBackgroundDark,
    onChangeImagePress,
    getDisplayValue,
  };
};

export default useEditProfileController;
