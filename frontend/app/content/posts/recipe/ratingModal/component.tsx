import HorizontalImagePicker from "@/components/HorizontalImagePicker";
import InputBox from "@/components/InputBox";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { styles } from "@/utility/content/posts/recipe/styles";
import { styles as settingStyles } from "@/utility/profile/settings/styles";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RatingState } from "./controller";

const ratingMap: Record<number, string> = {
  0: "[N/A]",
  1: "Appalling",
  2: "Horrible",
  3: "Very Bad",
  4: "Bad",
  5: "Average",
  6: "Fine",
  7: "Good",
  8: "Very Good",
  9: "Great",
  10: "Masterpiece",
};

type Props = {
  rating: ReturnType<typeof useFieldState<RatingState>>;
  submitRating: () => Promise<void>;
};

export default function RatingModalComponent({ rating, submitRating }: Props) {
  const { images, score, text, setFieldState } = rating;

  const renderScoreOptions = () =>
    Object.entries(ratingMap).map(([value, label]) => {
      const numericValue = Number(value);
      const isSelected = score === numericValue;

      return (
        <Pressable
          key={value}
          onPress={() => setFieldState("score", numericValue)}
          style={[
            styles.ratingLabel,
            {
              backgroundColor: isSelected
                ? Colors.brand.primaryDark
                : "transparent",
              borderColor: isSelected ? "transparent" : Colors.text.primary,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 13,
              color: isSelected
                ? Colors.brand.onPrimary
                : Colors.brand.onBackground,
            }}
          >
            ({value}) {label}
          </Text>
        </Pressable>
      );
    });

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View>
          <Text style={styles.labelTitle}>Image</Text>
          <HorizontalImagePicker
            images={images}
            setImages={(newImages) => setFieldState("images", newImages)}
          />

          <Text style={styles.labelTitle}>Score</Text>
          <View className="flex-row flex-wrap gap-2 py-4">
            {renderScoreOptions()}
          </View>

          <Text style={[styles.labelTitle, { marginBottom: 10 }]}>Review</Text>
          <InputBox
            placeholder="Enter your review"
            value={text}
            onChangeText={(text) => setFieldState("text", text)}
            inputStyle={settingStyles.input}
            limit={1000}
            isMultiline
          />

          <TouchableOpacity
            style={settingStyles.saveButton}
            onPress={submitRating}
          >
            <Text style={settingStyles.saveButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
