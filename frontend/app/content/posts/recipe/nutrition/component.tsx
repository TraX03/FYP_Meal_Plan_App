import HeaderBar from "@/components/HeaderBar";
import LegendItem from "@/components/LegendItem";
import ScoreCircle from "@/components/ScoreCircle";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { styles } from "@/utility/content/posts/recipe/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import { Stack } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import useRecipeController from "../controller";

type NutritionItem = {
  name: string;
  amount: number;
  unit: string;
};

type Props = {
  nutritionData: {
    healthScore?: number;
    nutrition?: {
      nutrients?: NutritionItem[];
      properties?: NutritionItem[];
      flavonoids?: NutritionItem[];
    };
  };
};

export default function NutritionComponent({ nutritionData }: Props) {
  const { getNutritionEntry } = useRecipeController();

  const nutritionScore = getNutritionEntry(
    nutritionData,
    "properties",
    "Nutrition Score"
  );

  const { nutrition } = nutritionData || {};
  const { nutrients, properties, flavonoids } = nutrition || {};
  const filteredProperties = properties?.filter(
    (p) => p.name !== "Nutrition Score"
  );

  const NutritionList = ({
    title,
    items,
  }: {
    title: string;
    items?: NutritionItem[];
  }) => {
    if (!items || items.length === 0) return null;

    return (
      <View className="mt-5">
        <Text style={styles.subHeader}>{title}</Text>
        {items.map((item, idx) => (
          <View
            key={`${title}-${item.name}-${idx}`}
            style={styles.infoContainer}
          >
            <Text style={styles.itemLabel}>{item.name}</Text>
            <Text style={styles.amount}>
              {Math.round(item.amount)} {item.unit}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenWrapper>
        <View style={profileStyles.headerContainer}>
          <HeaderBar />
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="px-6"
            contentContainerClassName="pb-7"
          >
            <Text style={styles.header}>Score</Text>
            <View className="flex-row justify-center mt-5 gap-[45px]">
              <ScoreCircle score={nutritionData?.healthScore ?? 0} size={120} />
              <ScoreCircle
                score={nutritionScore.amount}
                size={120}
                label="Nutrition Score"
              />
            </View>

            <View className="flex-row items-center justify-center gap-5 py-8 mb-3">
              <LegendItem color={Colors.feedback.success} label="Good (≥ 80)" />
              <LegendItem
                color={Colors.feedback.warning}
                label="Moderate (50–79)"
              />
              <LegendItem color={Colors.feedback.error} label="Poor (< 50)" />
            </View>

            <Text style={styles.header}>Nutrition Details</Text>

            <NutritionList title="Nutrients" items={nutrients} />
            <NutritionList title="Properties" items={filteredProperties} />
            <NutritionList title="Flavonoids" items={flavonoids} />
          </ScrollView>
        </View>
      </ScreenWrapper>
    </>
  );
}
