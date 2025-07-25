import { useFieldState } from "@/hooks/useFieldState";
import { MMKV } from "react-native-mmkv";

interface NutritionState {
  nutritionData?: any;
}

export const useNutritionController = () => {
  const nutritionStorage = new MMKV({ id: "nutrition" });

  const nutrition = useFieldState<NutritionState>({
    nutritionData: null,
  });

  const { nutritionData } = nutrition;

  const fetchFromCache = (recipeId: string) => {
    const cacheKey = `nutrition_${recipeId}`;
    const cachedString = nutritionStorage.getString(cacheKey);

    if (!cachedString) return null;

    const { timestamp, data } = JSON.parse(cachedString);
    const isExpired = Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000;

    nutrition.setFieldState("nutritionData", isExpired ? null : data);
  };

  return {
    nutritionData,
    fetchFromCache,
  };
};

export default useNutritionController;
