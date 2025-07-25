import CustomModal from "@/components/CustomModal";
import FullscreenImageViewer from "@/components/FullscreenImageViewer";
import RatingCard from "@/components/RatingCard";
import RecipeStep from "@/components/RecipeStep";
import ScoreCircle from "@/components/ScoreCircle";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Routes } from "@/constants/Routes";
import { useFieldState } from "@/hooks/useFieldState";
import { usePreventDoubleTap } from "@/hooks/usePreventDoubleTap";
import { capitalize, titleCase } from "@/utility/capitalize";
import { styles } from "@/utility/content/posts/recipe/styles";
import { styles as postStyles } from "@/utility/content/posts/styles";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PostState, RecipePost } from "../controller";
import { RecipeState } from "./controller";

type Props = {
  post: ReturnType<typeof useFieldState<PostState>>;
  recipe: ReturnType<typeof useFieldState<RecipeState>>;
  recipeData: RecipePost;
  getNutritionEntry: (
    data: any,
    key: "nutrients" | "properties",
    name: string
  ) => {
    amount: number;
    unit: string;
  };
  currentUserId: string | undefined;
  handleIngredientPress: (ingredientName: string) => Promise<void>;
  getCustomServings: (recipeData: RecipePost) => Promise<void>;
  checkLogin: (next: string | (() => void)) => void;
};

export default function RecipeComponent({
  post,
  recipe,
  recipeData,
  getNutritionEntry,
  currentUserId,
  handleIngredientPress,
  getCustomServings,
  checkLogin,
}: Props) {
  const { postData } = post;
  const {
    nutritionData,
    expanded,
    isInstructionsOverflow,
    fullscreenImage,
    setFieldState,
    selectedIngredient,
    showLoading,
    showSubstituteModal,
    showCustomQty,
    customIngredients,
    showServeLoading,
  } = recipe;

  const nutrients = {
    calories: getNutritionEntry(nutritionData, "nutrients", "Calories"),
    fat: getNutritionEntry(nutritionData, "nutrients", "Fat"),
    carbs: getNutritionEntry(nutritionData, "nutrients", "Carbohydrates"),
  };

  const rounded = {
    calories: Math.round(nutrients.calories.amount),
    fat: Math.round(nutrients.fat.amount),
    carbs: Math.round(nutrients.carbs.amount),
  };

  const userReview = recipe.reviews?.find((r) => r.userId === currentUserId);

  const handleNavigateToRating = usePreventDoubleTap(() => {
    router.push({
      pathname: Routes.Rating,
      params: {
        recipeId: recipeData.id,
        ratingCount: recipeData.ratingCount,
        rating: recipeData.rating,
      },
    });
  });

  return (
    <>
      <FullscreenImageViewer
        imageUri={fullscreenImage}
        onClose={() => setFieldState("fullscreenImage", "")}
      />

      <CustomModal
        visible={showSubstituteModal}
        close={() => setFieldState("showSubstituteModal", false)}
      >
        <View className="py-4 px-6">
          <Text className="text-xl font-semibold mb-3">
            Substitutes for {titleCase(selectedIngredient)}
          </Text>

          {showLoading ? (
            <ActivityIndicator size="large" color={Colors.brand.primary} />
          ) : recipe.ingredientSubstitutes &&
            recipe.ingredientSubstitutes.length > 0 ? (
            <View className="gap-2">
              {recipe.ingredientSubstitutes.map((sub, index) => (
                <Text key={index} className="text-base">
                  {capitalize(sub)}
                </Text>
              ))}
            </View>
          ) : (
            <Text className="text-base text-gray-500">
              No substitutes found.
            </Text>
          )}
        </View>
      </CustomModal>

      {!!postData?.description && (
        <View style={postStyles.contentContainer}>
          <Text className="text-base">{postData.description}</Text>
        </View>
      )}

      <View style={{ backgroundColor: Colors.brand.onPrimary }}>
        <TouchableOpacity
          style={styles.nutrientContainer}
          onPress={() =>
            router.push({
              pathname: Routes.Nutrition,
              params: { recipeId: recipeData.id },
            })
          }
        >
          <View className="flex-col flex-1">
            <View className="flex-row items-center">
              <View className="flex-row items-center px-7 flex-1">
                <ScoreCircle score={nutritionData?.healthScore ?? 0} />

                <View className="ml-8 gap-3">
                  <View className="items-center mx-2">
                    <Text className="text-[15px]">
                      {rounded.calories} {nutrients.calories.unit}
                    </Text>
                    <Text style={styles.nutrientLabel}>Calories</Text>
                  </View>

                  <View className="flex-row gap-4">
                    {[
                      {
                        label: "Carbs",
                        value: rounded.carbs,
                        unit: nutrients.carbs.unit,
                      },
                      {
                        label: "Fat",
                        value: rounded.fat,
                        unit: nutrients.fat.unit,
                      },
                    ].map(({ label, value, unit }) => (
                      <View key={label} className="items-center mx-2">
                        <Text className="text-[15px]">{`${value} ${unit}`}</Text>
                        <Text style={styles.nutrientLabel}>{label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <IconSymbol
                name="chevron.right"
                color={Colors.overlay.base}
                size={25}
              />
            </View>
            <Text style={styles.disclaimerText}>
              Nutrient data is auto-generated and may be inaccurate.
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View
        style={[
          postStyles.contentContainer,
          { borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
        ]}
      >
        <View className="flex-row justify-between mb-2 items-center">
          <Text style={postStyles.sectionTitle}>Ingredients</Text>
          <Pressable
            onPress={() => {
              setFieldState("showCustomQty", !showCustomQty);
              if (!customIngredients || customIngredients.length === 0) {
                getCustomServings(recipeData);
              }
            }}
          >
            <Text
              className="text-base"
              style={{
                color: showCustomQty
                  ? Colors.feedback.success
                  : Colors.feedback.unknown,
              }}
            >
              Custom Qty
            </Text>
          </Pressable>
        </View>

        <View
          style={!expanded ? { maxHeight: 150, overflow: "hidden" } : undefined}
        >
          {showServeLoading ? (
            <ActivityIndicator
              size="large"
              color={Colors.brand.primary}
              className="my-4"
            />
          ) : (
            (showCustomQty ? customIngredients : recipeData.ingredients).map(
              ({ name, quantity, note }, index) => (
                <View key={index} className="flex-col mb-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-[30px]">
                      <TouchableOpacity
                        onPress={() => handleIngredientPress(name)}
                      >
                        <View className="flex-row flex-wrap gap-2 items-center">
                          <Text style={styles.ingredientName}>
                            {capitalize(name)}
                          </Text>
                          <IconSymbol
                            name="info.circle"
                            color={Colors.brand.primary}
                            size={15}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                    <View style={{ width: "25%" }}>
                      <Text
                        style={[
                          styles.quantityName,
                          {
                            color: showCustomQty
                              ? Colors.feedback.success
                              : undefined,
                          },
                        ]}
                      >
                        {quantity}
                      </Text>
                    </View>
                  </View>

                  {note && (
                    <Text style={styles.noteText}>{capitalize(note)}</Text>
                  )}
                </View>
              )
            )
          )}
        </View>

        {recipeData.ingredients.length > 5 && (
          <TouchableOpacity
            onPress={() => setFieldState("expanded", !expanded)}
            className="mt-3 self-end"
          >
            <Text style={styles.buttonText}>
              {expanded ? "View Less" : "View More"}
            </Text>
          </TouchableOpacity>
        )}

        <View className="mt-7">
          <Text style={postStyles.sectionTitle}>Instructions</Text>

          <View className="max-h-[270px]">
            <ScrollView
              scrollEnabled={false}
              onContentSizeChange={(_, height) =>
                setFieldState("isInstructionsOverflow", height > 270)
              }
            >
              {recipeData.instructions.filter(Boolean).map((step, index) => (
                <RecipeStep key={index} index={index} step={step} />
              ))}
            </ScrollView>
          </View>

          {isInstructionsOverflow && (
            <TouchableOpacity
              onPress={() => post.setFieldState("showStepsModal", true)}
              className="mt-4 mb-10 self-end"
            >
              <Text style={styles.buttonText}>View All Steps</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[postStyles.contentContainer, styles.ratingContainer]}>
        <View className="flex-row items-center justify-between flex-1">
          <View className="flex-row items-baseline gap-2">
            <Text style={styles.rating}>
              {recipeData.rating !== 0 ? recipeData.rating?.toFixed(1) : "n/a"}
            </Text>
            <IconSymbol
              name="star.fill"
              color={Colors.feedback.warning}
              size={22}
            />
            <Text style={styles.ratingTitle}>
              Ratings ({recipeData.ratingCount})
            </Text>
          </View>

          {recipe.reviews && recipe.reviews.length > 0 && (
            <Pressable onPress={handleNavigateToRating}>
              <IconSymbol name="chevron.right" color={Colors.brand.primary} />
            </Pressable>
          )}
        </View>

        {recipe.reviews && recipe.reviews.length > 0 ? (
          <ScrollView
            className="max-h-[300px] overflow-hidden"
            showsVerticalScrollIndicator={false}
          >
            <View className="mt-5">
              {recipe.reviews.map((review, index) => (
                <RatingCard
                  key={index}
                  review={review}
                  onImagePress={(img) => setFieldState("fullscreenImage", img)}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.noRating}>No ratings yet.</Text>
        )}

        <Pressable
          onPress={() =>
            checkLogin(() => {
              if (!userReview) post.setFieldState("showRatingModal", true);
            })
          }
          style={styles.ratingButton}
        >
          <Text style={postStyles.ratingButtonText}>
            {userReview ? "View Your Rating" : "Leave a Rating"}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
