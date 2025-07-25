import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import useRecipeController from "../controller";
import RatingComponent from "./component";
import useRatingController from "./controller";

export default function RatingContainer() {
  const { recipeId, rating, ratingCount } = useLocalSearchParams<{
    recipeId: string;
    rating: string;
    ratingCount: string;
  }>();

  const { getRecipeRatings } = useRecipeController();
  const { rate, getStarDistribution, getFilteredReviews, actions } =
    useRatingController();

  useEffect(() => {
    if (recipeId) {
      getRecipeRatings(recipeId).then((reviews) => {
        rate.setFieldState("reviews", reviews);
      });
    }
  }, [recipeId]);

  return (
    <RatingComponent
      rate={rate}
      rating={parseFloat(rating)}
      ratingCount={parseInt(ratingCount)}
      getStarDistribution={getStarDistribution}
      getFilteredReviews={getFilteredReviews}
      actions={actions}
    />
  );
}
