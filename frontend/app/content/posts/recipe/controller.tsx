import { Ingredient } from "@/app/create/createForm/controller";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import {
  fetchAllDocuments,
  getCurrentUser,
  getDocumentById,
} from "@/services/Appwrite";
import {
  adjustIngredientsByServing,
  getIngredientSubstitutes,
} from "@/services/GeminiApi";
import { fetchUsers } from "@/utility/userCacheUtils";
import { Query } from "react-native-appwrite";
import { RecipePost } from "../controller";

export type Review = {
  score: number;
  content: string;
  images: string[];
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  userId: string;
};

export interface RecipeState {
  isInstructionsOverflow?: boolean;
  nutritionData?: any;
  expanded?: boolean;
  reviews?: Review[];
  fullscreenImage: string;
  showSubstituteModal: boolean;
  ingredientSubstitutes: string[];
  selectedIngredient: string;
  showLoading: boolean;
  showCustomQty: boolean;
  showServeLoading: boolean;
  customIngredients: Ingredient[];
}

export const useRecipeController = () => {
  const recipe = useFieldState<RecipeState>({
    isInstructionsOverflow: false,
    nutritionData: null,
    expanded: false,
    fullscreenImage: "",
    showSubstituteModal: false,
    ingredientSubstitutes: [],
    selectedIngredient: "",
    showLoading: false,
    showCustomQty: false,
    showServeLoading: false,
    customIngredients: [],
  });

  const { setFieldState, setFields } = recipe;

  const getNutritionEntry = (
    data: any,
    key: "nutrients" | "properties",
    name: string
  ): { amount: number; unit: string } => {
    const found = data?.nutrition?.[key]?.find(
      (item: any) => item.name === name
    );
    return {
      amount: found?.amount ?? 0,
      unit: found?.unit ?? "",
    };
  };

  const getRecipeRatings = async (recipeId: string) => {
    try {
      const [interactions, comments] = await Promise.all([
        fetchAllDocuments(AppwriteConfig.INTERACTIONS_COLLECTION_ID, [
          Query.equal("item_id", recipeId),
          Query.equal("type", "rating"),
        ]),
        fetchAllDocuments(AppwriteConfig.COMMENTS_COLLECTION_ID, [
          Query.equal("post_id", recipeId),
          Query.equal("is_review", true),
        ]),
      ]);

      const commentMap = new Map<string, any>();
      for (const comment of comments) {
        if (comment.rating_id) {
          commentMap.set(comment.rating_id, comment);
        }
      }

      const userIds = [...new Set(interactions.map((i: any) => i.user_id))];
      const users = await fetchUsers(userIds);

      const reviews = interactions.map((interaction: any) => {
        const comment = commentMap.get(interaction.$id);
        const user = users.get(interaction.user_id);

        return {
          score: interaction.score,
          createdAt: interaction.created_at,
          content: comment?.content ?? "",
          images: Array.isArray(comment?.images) ? comment.images : [],
          username: user?.username ?? "Unknown",
          avatarUrl: user?.avatarUrl ?? null,
          userId: interaction.user_id,
        };
      });

      setFieldState("reviews", reviews);
      return reviews;
    } catch (error) {
      console.error("Failed to fetch recipe ratings:", error);
      return [];
    }
  };

  const handleIngredientPress = async (ingredientName: string) => {
    setFields({
      showSubstituteModal: true,
      selectedIngredient: ingredientName,
      showLoading: true,
    });

    try {
      const substitutes = await getIngredientSubstitutes(ingredientName);
      setFields({
        ingredientSubstitutes: substitutes,
        showLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch ingredient substitutes:", err);
    }
  };

  const getCustomServings = async (recipeData: RecipePost) => {
    setFieldState("showServeLoading", true);

    try {
      const user = await getCurrentUser();
      const userDoc = await getDocumentById(
        AppwriteConfig.USERS_COLLECTION_ID,
        user.$id
      );

      const adjustedIngredients = await adjustIngredientsByServing(
        recipeData.title,
        userDoc.servings,
        recipeData.ingredients
      );

      setFieldState("customIngredients", adjustedIngredients);
    } catch (err) {
      console.error("Failed to get adjusted ingredients by servings:", err);
    } finally {
      setFieldState("showServeLoading", false);
    }
  };

  return {
    recipe,
    getNutritionEntry,
    getRecipeRatings,
    handleIngredientPress,
    getCustomServings,
  };
};

export default useRecipeController;
