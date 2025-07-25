import InputBox from "@/components/InputBox";
import { styles } from "@/utility/lists/styles";
import { styles as onboardingStyles } from "@/utility/onboarding/styles";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { Props } from "./container";

export default function AmountModalComponent({
  lists,
  handleInventoryCheck,
}: Props) {
  const { setFieldState, setFields, amountText, amount, modalItem } = lists;

  if (!modalItem) return null;
  const isRevert = modalItem.checked === true;

  const closeModal = () => {
    setFieldState("showAmountModal", false);
    setFields({
      amount: 0,
      amountText: "",
    });
  };

  return (
    <TouchableOpacity onPressOut={closeModal} style={styles.overlay}>
      <View style={styles.amountContainer}>
        <Text style={styles.label}>
          {isRevert ? "Revert from Finished" : "Use from Inventory"}
        </Text>
        <Text className="mb-2 mt-2">
          {`Available: ${
            isRevert ? modalItem.checkedCount : modalItem.quantityDisplay
          } ${modalItem.unit ?? ""}`}
        </Text>

        <InputBox
          keyboardType="decimal-pad"
          value={amountText ?? ""}
          onChangeText={(text) => {
            const parsed = parseFloat(text.replace(",", "."));
            setFields({
              amountText: text,
              amount: isNaN(parsed) ? undefined : parsed,
            });
          }}
          placeholder={"Amount"}
          containerStyle={[styles.inputContainer, { flex: 0 }]}
        />

        <View className="flex-row justify-between mt-4">
          <Pressable style={[styles.button]} onPress={closeModal}>
            <Text style={onboardingStyles.buttonText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.button]}
            onPress={() => {
              if (!amount) {
                alert("Please enter a valid number.");
                return;
              }
              handleInventoryCheck(modalItem.id!, amount, isRevert);
              closeModal();
            }}
          >
            <Text style={onboardingStyles.buttonText}>Confirm</Text>
          </Pressable>
        </View>
      </View>
    </TouchableOpacity>
  );
}
