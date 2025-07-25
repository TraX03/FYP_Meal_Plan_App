import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import {
  getCurrentUser,
  getDocumentById,
  updateDocument,
} from "@/services/Appwrite";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { availableMealtimes } from "../controller";

export const stapleTypes = [
  "rice",
  "noodles",
  "pasta",
  "sandwich",
  "none",
] as const;
export type StapleType = (typeof stapleTypes)[number];

export type MealPreference = {
  dishCount: number;
  staples?: StapleType;
  meatCount?: number;
  vegeCount?: number;
  soup?: boolean;
  side?: boolean;
  soupCount?: number;
  sideCount?: number;
};

export type AllMealtimeIds = (typeof availableMealtimes)[number]["id"];
export type MealtimeKey = Exclude<AllMealtimeIds, "all">;
export type PlannerConfig = Record<MealtimeKey, MealPreference>;
export type ExpandState = Record<MealtimeKey, boolean>;

export interface ConfigState {
  servings: number;
  meal_config: PlannerConfig;
  expandedSections: ExpandState;
}

export const useMealConfigController = () => {
  const config = useFieldState<ConfigState>({
    servings: 1,
    meal_config: {
      breakfast: { dishCount: 1 },
      lunch: {
        dishCount: 1,
        staples: "none",
        meatCount: 1,
        vegeCount: 1,
        soupCount: 1,
        sideCount: 1,
      },
      dinner: {
        dishCount: 1,
        staples: "none",
        meatCount: 1,
        vegeCount: 1,
        soupCount: 1,
        sideCount: 1,
      },
      supper: {
        dishCount: 1,
        staples: "none",
        meatCount: 1,
        vegeCount: 1,
        soupCount: 1,
        sideCount: 1,
      },
      afternoonTea: { dishCount: 1 },
      snacks: { dishCount: 1 },
    },
    expandedSections: {
      breakfast: false,
      lunch: false,
      dinner: false,
      supper: false,
      afternoonTea: false,
      snacks: false,
    },
  });

  const { setFieldState, meal_config, expandedSections, servings } = config;

  const loadInitialConfig = async () => {
    try {
      const user = await getCurrentUser();
      const doc = await getDocumentById(
        AppwriteConfig.USERS_COLLECTION_ID,
        user.$id
      );

      setFieldState("servings", doc.servings);
      const savedConfig = doc.meal_config;

      if (savedConfig) {
        const parsed: PlannerConfig = JSON.parse(savedConfig);

        setFieldState("meal_config", parsed);
      }
    } catch (err) {
      console.error("Failed to load config:", err);
    }
  };

  const updateMealCount = (
    mealtime: MealtimeKey,
    field: keyof MealPreference,
    newValue: number
  ) => {
    const nonRequiredMin = ["meatCount", "vegeCount", "soupCount", "sideCount"];
    const value = Math.max(nonRequiredMin.includes(field) ? 0 : 1, newValue);

    setFieldState("meal_config", {
      ...meal_config,
      [mealtime]: {
        ...meal_config[mealtime],
        [field]: value,
      },
    });
  };

  const toggleMealOption = (
    mealtime: MealtimeKey,
    option: keyof MealPreference
  ) => {
    const current = meal_config[mealtime][option] ?? false;
    setFieldState("meal_config", {
      ...meal_config,
      [mealtime]: {
        ...meal_config[mealtime],
        [option]: !current,
      },
    });
  };

  const toggleSection = (mealtime: MealtimeKey) => {
    setFieldState("expandedSections", {
      ...expandedSections,
      [mealtime]: !expandedSections[mealtime],
    });
  };

  const getInvalidMealSections = (cfg: PlannerConfig): MealtimeKey[] =>
    (["lunch", "dinner", "supper"] as MealtimeKey[]).filter((mealtime) => {
      const {
        staples,
        soup,
        soupCount = 0,
        side,
        sideCount = 0,
        meatCount = 0,
        vegeCount = 0,
      } = cfg[mealtime];

      const stapleDish = staples && staples !== "none" ? 1 : 0;
      const totalDishes =
        stapleDish +
        (soup ? soupCount : 0) +
        (side ? sideCount : 0) +
        meatCount +
        vegeCount;

      return totalDishes < 1;
    });

  const invalidMealtimes = getInvalidMealSections(meal_config);
  const isFormValid = invalidMealtimes.length === 0;

  const handleSave = async () => {
    if (!isFormValid) {
      const formatted = invalidMealtimes
        .map((key) => key[0].toUpperCase() + key.slice(1))
        .join(", ");
      Alert.alert(
        "Missing Dishes",
        `Please set at least one dish for ${formatted}.`
      );
      return;
    }

    try {
      const user = await getCurrentUser();
      await updateDocument(AppwriteConfig.USERS_COLLECTION_ID, user.$id, {
        meal_config: JSON.stringify(meal_config),
        servings,
      });
      Toast.show({
        type: "success",
        text1: "Configuration saved successfully.",
      });
    } catch (err) {
      console.error("Save failed:", err);
      Alert.alert("Error", "Something went wrong while saving.");
    }
  };

  return {
    config,
    updateMealCount,
    toggleMealOption,
    toggleSection,
    handleSave,
    loadInitialConfig,
  };
};

export default useMealConfigController;
