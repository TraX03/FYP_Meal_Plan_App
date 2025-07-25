import BottomSheetModal from "@/components/BottomSheetModal";
import SearchWithSuggestion, { Mode } from "@/components/SearchWithSuggestions";
import SelectionList from "@/components/SelectionList";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { SuggestionType } from "@/hooks/useSuggestionList";
import { getImageUrl } from "@/utility/imageUtils";
import { styles } from "@/utility/onboarding/styles";
import { Stack } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OnboardingState } from "./controller";

export const INTERACTION_LABELS = ["like", "neutral", "dislike"] as const;
export type InteractionLabel = (typeof INTERACTION_LABELS)[number];

export const INTERACTION_SCORES: Record<InteractionLabel, number> = {
  like: 1.0,
  neutral: 0.5,
  dislike: 0.0,
};

export const pages: {
  keyName?: string;
  title: string;
  description?: string;
  suggestions?: string[];
  placeholder?: string;
  mode?: Mode;
  suggestionType?: SuggestionType;
}[] = [
  {
    keyName: "avoidIngredients",
    title: "Any ingredient to avoid?",
    description:
      "Tell us if there are any ingredients you'd like to avoid, and we'll tailor your meal plan accordingly.",
    suggestions: [
      "Chicken",
      "Beef",
      "Eggs",
      "Soy",
      "Peanuts",
      "Wheat",
      "Milk",
      "Fish",
    ],
    placeholder: "Ingredient",
    mode: "suggestion-then-custom",
    suggestionType: "ingredient",
  },
  {
    keyName: "diet",
    title: "Do you follow any of these diets?",
    description:
      "Share your diet preferences so we can personalize your meal plan to match your needs.",
    suggestions: [
      "Vegan",
      "Paleo",
      "Low-Carb",
      "Vegetarian",
      "Keto",
      "Mediterranean",
      "Dairy Free",
      "Gluten Free",
    ],
    placeholder: "Diet",
    mode: "datamuse-only",
  },
  {
    keyName: "cuisine",
    title: "Which cuisine best matches your daily meals?",
    description:
      "Tell us which cuisine you eat most often so we can personalize your meal plan.",
    suggestions: [
      "Italian",
      "British",
      "Thai",
      "Indian",
      "Japanese",
      "Chinese",
      "Malaysian",
      "American",
    ],
    placeholder: "Cuisine",
    mode: "suggestion-then-custom",
    suggestionType: "area",
  },
  {
    title: "Rate Each Recipe with a Tap!",
  },
];

type Props = {
  onboarding: ReturnType<typeof useFieldState<OnboardingState>>;
  isNextEnabled: boolean;
  actions: {
    handleSelectItem: (item: string) => void;
    toggleItemSelection: (item: string) => void;
    getPageSuggestions: () => string[];
    handleNext: () => void;
    handlePrevious: () => void;
    handleRating: (value: "like" | "neutral" | "dislike") => Promise<void>;
  };
};

export default function OnboardingComponent({
  onboarding,
  isNextEnabled,
  actions,
}: Props) {
  const {
    handleSelectItem,
    toggleItemSelection,
    getPageSuggestions,
    handleNext,
    handlePrevious,
    handleRating,
  } = actions;

  const {
    currentPage,
    ingredientAvoid,
    diet,
    region,
    showSearchModal,
    setFieldState,
    recommendations,
    currentRatingIndex,
    showLottie,
    keyboardVisible,
  } = onboarding;

  const pageIndex = currentPage - 1;
  const selectedStates = [ingredientAvoid, diet, region];
  const currentPageData = pages[pageIndex];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {pageIndex < 3 && (
        <BottomSheetModal
          isVisible={showSearchModal}
          onClose={() => setFieldState("showSearchModal", false)}
          modalStyle={[
            styles.optionModal,
            keyboardVisible && { height: "85%" },
          ]}
          zIndex={10}
        >
          <SearchWithSuggestion
            onSelectItem={handleSelectItem}
            mode={currentPageData.mode!}
            placeholder={currentPageData.placeholder!}
            suggestionType={currentPageData.suggestionType}
          />
        </BottomSheetModal>
      )}

      <View style={styles.container}>
        <View className="flex-row justify-between items-center mb-6 mt-4">
          <View className="flex-row gap-2">
            {pages.map((_, i) => {
              const step = i + 1;
              const isCurrent = step === currentPage;
              const isCompleted = step < currentPage;

              return (
                <View
                  key={step}
                  className="w-7 h-7 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isCurrent
                      ? Colors.surface.buttonPrimary
                      : isCompleted
                      ? Colors.brand.onPrimary
                      : Colors.surface.backgroundMuted,
                    borderWidth: isCompleted ? 1 : 0,
                    borderColor: isCompleted
                      ? Colors.brand.onBackground
                      : "transparent",
                  }}
                >
                  <Text
                    style={[
                      styles.numText,
                      {
                        color: isCurrent
                          ? Colors.brand.onPrimary
                          : Colors.brand.onBackground,
                      },
                    ]}
                  >
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>

          {pageIndex < 3 && (
            <Pressable onPress={handleNext}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
        </View>

        {currentPageData && (
          <>
            <Text style={styles.title}>{currentPageData.title}</Text>

            {pageIndex < 3 ? (
              <>
                <Text style={styles.description}>
                  {currentPageData.description}
                </Text>

                <View className="mt-7 flex-1">
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerClassName="flex-row flex-wrap gap-2.5"
                  >
                    <SelectionList
                      getPageSuggestions={getPageSuggestions}
                      toggleItemSelection={toggleItemSelection}
                      selectedItems={selectedStates[pageIndex]}
                      onOpenModal={() => setFieldState("showSearchModal", true)}
                    />
                  </ScrollView>
                </View>
              </>
            ) : (
              <>
                {recommendations && (
                  <>
                    <View className="w-full px-3 mt-3">
                      <ImageBackground
                        source={{
                          uri: getImageUrl(
                            recommendations.images[currentRatingIndex]
                          ),
                        }}
                        className="w-full h-60 rounded-2xl overflow-hidden justify-end"
                        resizeMode="cover"
                      >
                        <View style={styles.nameOverlay}>
                          <Text style={styles.name}>
                            {recommendations.titles[currentRatingIndex]}
                          </Text>
                        </View>
                      </ImageBackground>
                    </View>

                    <View className="m-8 flex-row items-center justify-center gap-4 px-4">
                      {INTERACTION_LABELS.map((type) => {
                        const label =
                          type.charAt(0).toUpperCase() + type.slice(1);
                        const icon =
                          type === "like"
                            ? "heart.fill"
                            : type === "neutral"
                            ? "minus.circle.fill"
                            : "heart.slash.fill";
                        const bgColor =
                          type === "like"
                            ? Colors.brand.primary
                            : type === "neutral"
                            ? Colors.feedback.unknown
                            : Colors.text.light;

                        return (
                          <TouchableOpacity
                            key={type}
                            className="w-[105px] px-5 py-3 rounded-2xl flex-row gap-2 items-center justify-center"
                            style={{ backgroundColor: bgColor }}
                            onPress={() => handleRating(type)}
                          >
                            <IconSymbol
                              name={icon}
                              color={Colors.brand.onPrimary}
                            />
                            <Text style={{ color: Colors.brand.onPrimary }}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}
              </>
            )}
          </>
        )}

        <View className="flex-row justify-between items-center mt-6">
          {currentPage > 1 ? (
            <Pressable
              style={[
                styles.button,
                { backgroundColor: Colors.surface.buttonSecondary },
              ]}
              onPress={handlePrevious}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: Colors.brand.onBackground },
                ]}
              >
                Previous
              </Text>
            </Pressable>
          ) : (
            <View className="w-[100px]" />
          )}

          {pageIndex < 3 && !showLottie && (
            <Pressable
              testID="next-button"
              style={[styles.button, { opacity: isNextEnabled ? 1 : 0.5 }]}
              onPress={isNextEnabled ? handleNext : undefined}
              disabled={!isNextEnabled}
            >
              <Text style={styles.buttonText}>Next</Text>
            </Pressable>
          )}

          {pageIndex === 2 && showLottie && (
            <View style={styles.loadingContainer}>
              <LottieView
                testID="LottieView"
                source={require("@/assets/animations/dot-loading.json")}
                autoPlay
                loop
                style={{ width: 150, height: 150 }}
              />
            </View>
          )}
        </View>
      </View>
    </>
  );
}
