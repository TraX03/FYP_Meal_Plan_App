import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import { useMediaHandler } from "@/hooks/useMediaHandler";
import { setLoading } from "@/redux/slices/loadingSlice";
import { AppDispatch } from "@/redux/store";
import {
  createDocument,
  fetchAllDocuments,
  getCurrentUser,
  getPostTypeById,
  updateDocument,
} from "@/services/Appwrite";
import { Alert } from "react-native";
import { Query } from "react-native-appwrite";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { PostData, PostState } from "../../controller";

export interface RatingState {
  score: number;
  text: string;
  images: string[];
}

export const useRatingModalController = (
  postData: PostData,
  post: ReturnType<typeof useFieldState<PostState>>
) => {
  const rating = useFieldState<RatingState>({
    score: 0,
    text: "",
    images: [],
  });

  const dispatch = useDispatch<AppDispatch>();
  const { uploadFile } = useMediaHandler();

  const submitRating = async () => {
    dispatch(setLoading(true));
    const timestamp = new Date().toISOString();

    try {
      const user = await getCurrentUser();
      const type = await getPostTypeById(postData.id);
      const { text, images, score } = rating;
      const hasReview = text.trim() !== "" || images.length > 0;

      const uploadedImageIds = hasReview
        ? (
            await Promise.all(
              images.map((uri) => uploadFile({ uri }, user.$id))
            )
          ).filter((id): id is string => !!id)
        : [];

      const ratingDoc = await createDocument(
        AppwriteConfig.INTERACTIONS_COLLECTION_ID,
        {
          user_id: user.$id,
          item_id: postData.id,
          item_type: type,
          type: "rating",
          created_at: timestamp,
          score,
          has_review: hasReview,
        }
      );

      if (hasReview && ratingDoc?.$id) {
        await createDocument(AppwriteConfig.COMMENTS_COLLECTION_ID, {
          author_id: user.$id,
          post_id: postData.id,
          created_at: timestamp,
          content: text.trim(),
          images: uploadedImageIds,
          is_review: true,
          rating_id: ratingDoc.$id,
        });
      }

      post.setFieldState("showRatingModal", false);
      dispatch(setLoading(false));

      Toast.show({
        type: "success",
        text1: "Rating posted successfully!",
      });

      await updateRecipeRating(postData.id);
    } catch (error) {
      console.warn("Failed to submit rating:", error);
      dispatch(setLoading(false));
      Alert.alert("Error", "Failed to post rating. Please try again.");
    }
  };

  const updateRecipeRating = async (recipeId: string) => {
    const ratings = await fetchAllDocuments(
      AppwriteConfig.INTERACTIONS_COLLECTION_ID,
      [Query.equal("item_id", recipeId), Query.equal("type", "rating")]
    );

    const scores = ratings
      .map((r) => r.score)
      .filter((s): s is number => typeof s === "number");

    if (!scores.length) return;

    const average = Number(
      (scores.reduce((sum, val) => sum + val, 0) / scores.length).toFixed(2)
    );

    await updateDocument(AppwriteConfig.RECIPES_COLLECTION_ID, recipeId, {
      rating: average,
      rating_count: scores.length,
    });
  };

  return { rating, submitRating };
};

export default useRatingModalController;
