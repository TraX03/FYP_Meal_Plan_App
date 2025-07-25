import { RecipePost } from "@/app/content/posts/controller";
import { analyzeRecipe } from "@/services/SpoonacularApi";
import { MMKV } from "react-native-mmkv";

const nutritionStorage = new MMKV({ id: "nutrition" });
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export const getCachedNutrition = async (recipe: RecipePost) => {
  const cacheKey = `nutrition_${recipe.id}`;
  const cachedString = nutritionStorage.getString(cacheKey);

  if (cachedString) {
    const { timestamp, data } = JSON.parse(cachedString);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  const freshData = await analyzeRecipe(recipe);
  if (freshData) {
    nutritionStorage.set(
      cacheKey,
      JSON.stringify({
        timestamp: Date.now(),
        data: freshData,
      })
    );
  }

  return freshData;
};
