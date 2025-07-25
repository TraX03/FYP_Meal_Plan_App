import FullscreenImageViewer from "@/components/FullscreenImageViewer";
import InputBox from "@/components/InputBox";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { styles } from "@/utility/create/styles";
import { styles as settingStyles } from "@/utility/profile/settings/styles";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { ContainerProps } from "./container";

type Props = ContainerProps & {
  fullscreenImage: string | null;
  setFullscreenImage: (uri: string | null) => void;
};

export default function InstructionsFormComponent({
  instructions,
  modifyInstruction,
  updateInstruction,
  updateInstructionImage,
  fullscreenImage,
  setFullscreenImage,
}: Props) {
  return (
    <>
      <FullscreenImageViewer
        imageUri={fullscreenImage}
        onClose={() => setFullscreenImage(null)}
      />
      <View className="mt-4 space-y-4">
        <Text style={styles.inputTitle}>Instructions</Text>
        {instructions.map((step, index) => (
          <View key={index} className="mb-4">
            <View className="flex-row justify-between items-center">
              <Text style={styles.stepText}>Step {index + 1}</Text>
              {index != 0 && (
                <TouchableOpacity
                  onPress={() => {
                    modifyInstruction("remove", index);
                  }}
                  className="items-end"
                >
                  <Text style={styles.linkText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {step.image ? (
              <View className="mb-2 relative">
                <Image
                  source={{ uri: step.image }}
                  className="w-full h-40 rounded"
                  resizeMode="cover"
                />

                <TouchableOpacity
                  className="absolute top-3 right-3 p-1 rounded-full"
                  style={{ backgroundColor: Colors.overlay.light }}
                  onPress={() => setFullscreenImage(step.image!)}
                >
                  <IconSymbol
                    name="arrow.up.left.and.arrow.down.right"
                    size={25}
                    color={Colors.brand.onBackground}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  className="absolute top-3 right-14 p-1 rounded-full"
                  style={{ backgroundColor: Colors.overlay.light }}
                  onPress={() => updateInstructionImage(index, true)}
                >
                  <IconSymbol
                    name="trash"
                    size={25}
                    color={Colors.brand.onBackground}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="w-full h-40 justify-center items-center rounded mb-2"
                style={{ backgroundColor: Colors.surface.buttonSecondary }}
                onPress={() => {
                  updateInstructionImage(index);
                }}
              >
                <Text>Add Image (Optional)</Text>
              </TouchableOpacity>
            )}

            <InputBox
              placeholder={"Describe this step"}
              value={step.text}
              onChangeText={(text) => updateInstruction(index, text)}
              inputStyle={settingStyles.input}
              isMultiline
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={() => modifyInstruction("add")}
          style={styles.addStepButton}
        >
          <Text style={styles.stepButtonText}>Add Step</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
