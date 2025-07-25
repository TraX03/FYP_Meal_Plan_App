import { Colors } from "@/constants/Colors";
import { useMediaHandler } from "@/hooks/useMediaHandler";
import { useCallback } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";
import { IconSymbol } from "./ui/IconSymbol";

interface HorizontalImagePickerProps {
  images: string[];
  setImages: (images: string[]) => void;
  maxImages?: number;
  singleImageMode?: boolean;
}

const HorizontalImagePicker: React.FC<HorizontalImagePickerProps> = ({
  images,
  setImages,
  maxImages = 5,
  singleImageMode = false,
}) => {
  const { pickImageFile } = useMediaHandler();

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  const handleAdd = useCallback(async () => {
    if (images.length >= maxImages) return;
    const file = await pickImageFile();
    if (file) setImages([...images, file.uri]);
  }, [images, setImages]);

  const showAddButton = singleImageMode
    ? images.length === 0
    : images.length < maxImages;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row items-center mb-7 pt-2.5">
        {images.map((uri, index) => (
          <View key={index} className="relative mr-4">
            <Image
              testID={`image-${index}`}
              source={{ uri }}
              className="w-32 h-32 rounded"
              resizeMode="cover"
            />
            <TouchableOpacity
              testID={`remove-button-${index}`}
              onPress={() => handleRemove(index)}
              style={styles.removeButton}
            >
              <IconSymbol
                name="multiply.circle"
                color={Colors.brand.primaryLight}
                size={24}
              />
            </TouchableOpacity>
          </View>
        ))}

        {showAddButton && (
          <TouchableOpacity
            testID="add-image-button"
            onPress={handleAdd}
            style={styles.addImageButton}
          >
            <IconSymbol name="plus" color={Colors.overlay.base} size={30} />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default HorizontalImagePicker;
