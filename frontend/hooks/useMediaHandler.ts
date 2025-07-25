import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { storage } from "@/services/Appwrite";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import { ID, Permission, Role } from "react-native-appwrite";

export type FileToUpload = {
  uri: string;
  name?: string;
  type?: string;
};

export function useMediaHandler() {
  const pickImageFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled || result.assets.length === 0) return null;

    const asset = result.assets[0];
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    const mimeType = mime.getType(asset.uri) || "application/octet-stream";

    return {
      name: asset.fileName || `image_${Date.now()}`,
      type: mimeType,
      size: fileInfo.exists ? fileInfo.size ?? 0 : 0,
      uri: asset.uri,
    };
  };

  const uploadFile = async (
    file: FileToUpload,
    userId: string,
    permissions?: string[]
  ): Promise<string | null> => {
    try {
      const { uri } = file;

      const name = file.name ?? uri.split("/").pop() ?? `file-${Date.now()}`;
      const type = file.type ?? mime.getType(uri) ?? "application/octet-stream";

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.warn(`File at URI ${uri} does not exist.`);
        return null;
      }

      const uploaded = await storage.createFile(
        AppwriteConfig.BUCKET_ID,
        ID.unique(),
        {
          uri,
          name,
          type,
          size: fileInfo.size ?? 0,
        },
        permissions ?? [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
        ]
      );

      return uploaded.$id;
    } catch (err) {
      console.error(`Failed to upload file: ${file.name ?? file.uri}`, err);
      return null;
    }
  };

  return { pickImageFile, uploadFile };
}
