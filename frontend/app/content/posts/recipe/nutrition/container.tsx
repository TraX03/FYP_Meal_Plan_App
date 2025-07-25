import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import NutritionComponent from "./component";
import useNutritionController from "./controller";

export default function NutritionContainer() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const { nutritionData, fetchFromCache } = useNutritionController();

  useEffect(() => {
    if (recipeId) {
      fetchFromCache(recipeId);
    }
  }, [recipeId]);

  return <NutritionComponent nutritionData={nutritionData} />;
}
