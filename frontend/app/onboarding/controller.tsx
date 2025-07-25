import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { Routes } from "@/constants/Routes";
import { useFieldState } from "@/hooks/useFieldState";
import { setOnboarded } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
import {
  createDocument,
  getCurrentUser,
  updateDocument,
} from "@/services/Appwrite";
import { fetchColdstartRecommendations } from "@/services/FastApi";
import { cleanPreferencesByType } from "@/services/GeminiApi";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { INTERACTION_SCORES, InteractionLabel, pages } from "./component";

type Recommendation = {
  recipeIds: string[];
  titles: string[];
  images: string[];
};

type Rating = {
  item_id: string;
  score: number;
  created_at: string;
};

export interface OnboardingState {
  currentPage: number;
  ingredientAvoid: string[];
  diet: string[];
  region: string[];
  customSuggestions: string[][];
  showSearchModal: boolean;
  recommendations: Recommendation | null;
  currentRatingIndex: number;
  showLottie: boolean;
  keyboardVisible: boolean;
  ratings: Rating[];
}

const fieldKeys: (keyof OnboardingState)[] = [
  "ingredientAvoid",
  "diet",
  "region",
];

export const useOnboardingController = () => {
  const dispatch = useDispatch<AppDispatch>();
  const onboarding = useFieldState<OnboardingState>({
    currentPage: 1,
    ingredientAvoid: [],
    diet: [],
    region: [],
    customSuggestions: Array(pages.length).fill([]),
    showSearchModal: false,
    recommendations: null,
    currentRatingIndex: 0,
    showLottie: false,
    keyboardVisible: false,
    ratings: [],
  });

  const {
    currentPage,
    ingredientAvoid,
    diet,
    region,
    customSuggestions,
    setFieldState,
    setFields,
    recommendations,
    currentRatingIndex,
  } = onboarding;

  const selectedStates = [ingredientAvoid, diet, region];
  const pageIndex = currentPage - 1;
  const currentField = fieldKeys[pageIndex];
  const selectedItems = selectedStates[pageIndex];

  const normalize = (text: string) => text.toLowerCase();
  const allSuggestions = [
    ...(pages[pageIndex].suggestions ?? []),
    ...customSuggestions[pageIndex],
  ].map(normalize);

  const handleSelectItem = (item: string) => {
    const itemNormalized = normalize(item);
    const isNew = !allSuggestions.includes(itemNormalized);
    const isSelected = selectedItems.map(normalize).includes(itemNormalized);

    if (isNew) addCustomSuggestion(pageIndex, item);

    if (!isSelected) {
      setFieldState(currentField, [...selectedItems, item]);
    } else {
      Toast.show({ type: "info", text1: `"${item}" is already selected` });
    }

    setFieldState("showSearchModal", false);
  };

  const toggleItemSelection = (item: string) => {
    const updated = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item];

    setFieldState(currentField, updated);
  };

  const getPageSuggestions = () => [
    ...new Set([
      ...(pages[pageIndex].suggestions ?? []),
      ...customSuggestions[pageIndex],
    ]),
  ];

  const addCustomSuggestion = (page: number, suggestion: string) => {
    const updated = [...customSuggestions];
    updated[page] = [...new Set([...updated[page], suggestion])];
    setFieldState("customSuggestions", updated);
  };

  const saveOnboardingData = async () => {
    try {
      const user = await getCurrentUser();

      const cleanedIngredients = await cleanPreferencesByType(
        ingredientAvoid,
        "ingredient"
      );
      const cleanedDiet = await cleanPreferencesByType(diet, "diet");
      const cleanedRegion = await cleanPreferencesByType(region, "region");

      await updateDocument(AppwriteConfig.USERS_COLLECTION_ID, user.$id, {
        avoid_ingredients: cleanedIngredients.map((i) =>
          i.toLowerCase().trim()
        ),
        diet: cleanedDiet.map((d) => d.toLowerCase().trim()),
        region_pref: cleanedRegion.map((r) => r.toLowerCase().trim()),
      });
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }
  };

  const handleRating = async (label: InteractionLabel) => {
    const recipeId = recommendations?.recipeIds[currentRatingIndex];
    if (!recipeId) return;

    const newRating = {
      item_id: recipeId,
      score: INTERACTION_SCORES[label],
      created_at: new Date().toISOString(),
    };

    const updatedRatings = [...onboarding.ratings, newRating];
    setFieldState("ratings", updatedRatings);

    const nextIndex = currentRatingIndex + 1;
    const isLastRating = nextIndex >= recommendations!.titles.length;

    if (isLastRating) {
      await submitAllRatings(updatedRatings);
    } else {
      setFieldState("currentRatingIndex", nextIndex);
    }
  };

  const submitAllRatings = async (ratings: Rating[]) => {
    const user = await getCurrentUser();

    await Promise.all(
      ratings.map((r) =>
        createDocument(AppwriteConfig.INTERACTIONS_COLLECTION_ID, {
          user_id: user.$id,
          item_id: r.item_id,
          type: "coldstart",
          item_type: "recipe",
          score: r.score,
          created_at: r.created_at,
        })
      )
    );

    await updateDocument(AppwriteConfig.USERS_COLLECTION_ID, user.$id, {
      is_onboarded: true,
    });

    dispatch(setOnboarded(true));
    router.replace(Routes.Home);
  };

  const handleNext = async () => {
    if (currentPage === pages.length - 1) {
      setFieldState("showLottie", true);
      await saveOnboardingData();
      const user = await getCurrentUser();
      const data = await fetchColdstartRecommendations(user.$id);

      setFields({
        recommendations: {
          recipeIds: data.post_ids,
          titles: data.titles,
          images: data.images,
        },
        currentRatingIndex: 0,
      });
    }
    setFields({ showLottie: false, currentPage: currentPage + 1 });
  };

  const handlePrevious = () => {
    if (currentPage > 1) setFieldState("currentPage", currentPage - 1);
  };

  const isNextEnabled = Array.isArray(selectedItems)
    ? selectedItems.length > 0
    : false;

  return {
    onboarding,
    isNextEnabled,
    actions: {
      handleNext,
      handlePrevious,
      handleSelectItem,
      toggleItemSelection,
      getPageSuggestions,
      handleRating,
    },
  };
};

export default useOnboardingController;
