import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { Colors } from "@/constants/Colors";
import ImageColors from "react-native-image-colors";

export const isValidUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getImageUrl = (image?: string): string =>
  isValidUrl(image)
    ? image!
    : image
    ? `${AppwriteConfig.ENDPOINT}/storage/buckets/${AppwriteConfig.BUCKET_ID}/files/${image}/view?project=${AppwriteConfig.PROJECT_ID}`
    : "";

const isColorDark = (hex: string) => {
  const rgb = parseInt(hex.substring(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 128;
};

export const detectBackgroundDarkness = async (
  imageUrl: string,
  fallbackColor = Colors.brand.onBackground
): Promise<boolean> => {
  try {
    const result = await ImageColors.getColors(getImageUrl(imageUrl), {
      fallback: fallbackColor,
      cache: true,
      key: imageUrl,
    });

    const dominantColor =
      result.platform === "android" ? result.dominant : fallbackColor;

    return isColorDark(dominantColor ?? fallbackColor);
  } catch (error) {
    console.warn("Failed to get image colors:", error);
    return false;
  }
};

export const getOverlayStyle = (isDark: boolean, isIcon?: boolean) => {
  if (isIcon) {
    return {
      color: isDark
        ? Colors.surface.buttonPrimary
        : Colors.surface.backgroundSoft,
    };
  }

  return {
    backgroundColor: isDark ? Colors.overlay.light : Colors.overlay.dark,
    borderColor: isDark ? Colors.surface.buttonPrimary : "transparent",
    borderWidth: 1.5,
  };
};
