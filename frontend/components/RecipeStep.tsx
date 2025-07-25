import { Instruction } from "@/app/create/createForm/controller";
import { Colors } from "@/constants/Colors";
import { getImageUrl } from "@/utility/imageUtils";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import FullscreenImageViewer from "./FullscreenImageViewer";
import { styles } from "./styles";
import { IconSymbol } from "./ui/IconSymbol";

interface RecipeStepProps {
  index: number;
  step: Instruction;
}

const RecipeStep = ({ index, step }: RecipeStepProps) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const formatInstruction = (text: string) => {
    if (!text) return "";
    const cleaned = text.replace(/^step\s*\d+[:.\s-]*/i, "");
    const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return /[.!?]$/.test(capitalized) ? capitalized : capitalized + ".";
  };

  const finalText = formatInstruction(step.text || "");
  const imageUri = step.image ? getImageUrl(step.image) : null;

  return (
    <>
      <FullscreenImageViewer
        imageUri={fullscreenImage}
        onClose={() => setFullscreenImage(null)}
      />
      <View className="mb-7">
        <Text style={styles.stepText}>STEP {index + 1}</Text>

        {imageUri && (
          <View className="mb-2 relative">
            <Image
              testID="step-image"
              source={{ uri: imageUri }}
              style={styles.stepImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              testID="fullscreen-button"
              className="absolute top-3 right-3 p-1 rounded-full"
              style={{ backgroundColor: Colors.overlay.light }}
              onPress={() => setFullscreenImage(imageUri)}
            >
              <IconSymbol
                name="arrow.up.left.and.arrow.down.right"
                size={25}
                color={Colors.brand.onBackground}
              />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.stepDescription}>{finalText}</Text>
      </View>
    </>
  );
};

export default RecipeStep;
