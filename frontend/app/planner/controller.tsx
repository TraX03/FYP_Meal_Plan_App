import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { Routes } from "@/constants/Routes";
import { useFieldState } from "@/hooks/useFieldState";
import { setHasAddedInventory } from "@/redux/slices/mealplanSlice";
import { AppDispatch } from "@/redux/store";
import {
  createDocument,
  getCurrentUser,
  getDocumentById,
  listDocuments,
  updateDocument,
} from "@/services/Appwrite";
import {
  fetchGeneratedMealPlan,
  logMealplanInventoryFeedback,
} from "@/services/FastApi";
import { startOfUTCDay } from "@/utility/dateUtils";
import { getImageUrl } from "@/utility/imageUtils";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { router } from "expo-router";
import { Alert } from "react-native";
import { ID, Permission, Query, Role } from "react-native-appwrite";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

export const availableMealtimes = [
  {
    id: "breakfast",
    label: "Breakfast",
    categories: ["breakfast"],
  },
  {
    id: "lunch",
    label: "Lunch",
    categories: ["chicken", "beef", "vegetarian", "pasta"],
  },
  {
    id: "afternoonTea",
    label: "Afternoon Tea",
    categories: ["dessert", "miscellaneous", "side"],
  },
  {
    id: "dinner",
    label: "Dinner",
    categories: ["beef", "lamb", "pork", "seafood", "vegetarian"],
  },
  {
    id: "supper",
    label: "Supper",
    categories: ["pasta", "seafood", "pork", "lamb"],
  },
  {
    id: "snacks",
    label: "Snacks",
    categories: ["side", "dessert", "miscellaneous"],
  },
  { id: "all", label: "All", categories: [] },
];

export type Meal = {
  mealtime: string;
  recipes: {
    name: string;
    image: string;
    id: string;
  }[];
};

export interface PlannerState {
  showDatePicker: boolean;
  selectedDate: Date;
  mealsByDate: Record<string, Meal[]>;
  showMealtimeModal: boolean;
  planLoading: boolean;
  generateLoading: boolean;
  showSettingModal: boolean;
  selectedMealtime: string | null;
  showRegenerateButton: boolean;
  showDeleteButton: boolean;
  showAddOptionModal: boolean;
  showAddButton: boolean;
}

const today = startOfUTCDay(new Date());
const minDate = addDays(today, -30);
const clampDate = (date: Date) => (date < minDate ? minDate : date);
const getWeekStart = (date: Date) =>
  startOfUTCDay(addDays(date, -((date.getDay() + 6) % 7)));

export const usePlannerController = () => {
  const planner = useFieldState<PlannerState>({
    showDatePicker: false,
    selectedDate: today,
    mealsByDate: {},
    showMealtimeModal: false,
    planLoading: false,
    generateLoading: false,
    showSettingModal: false,
    selectedMealtime: null,
    showRegenerateButton: false,
    showDeleteButton: false,
    showAddOptionModal: false,
    showAddButton: false,
  });

  const dispatch = useDispatch<AppDispatch>();
  const { selectedDate, mealsByDate, setFieldState } = planner;
  const weekStart = getWeekStart(selectedDate);
  const dateKey = format(selectedDate, "yyyy-MM-dd");

  const handleChangeWeek = (dir: "prev" | "next") => {
    const offset = dir === "prev" ? -7 : 7;
    const newStart = addDays(weekStart, offset);
    const newSelected = clampDate(
      addDays(newStart, differenceInCalendarDays(selectedDate, weekStart))
    );
    setFieldState("selectedDate", newSelected);
  };

  const getCachedMealsForDate = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    const meals = planner.getFieldState("mealsByDate")[key] || [];
    const order = availableMealtimes
      .map((m) => m.id)
      .filter((id) => id !== "all");
    return meals.sort(
      (a, b) => order.indexOf(a.mealtime) - order.indexOf(b.mealtime)
    );
  };

  const addMealtime = (mealtime: string) => {
    const existing = getCachedMealsForDate(selectedDate);
    if (existing.some((meal) => meal.mealtime === mealtime)) return;
    setFieldState("mealsByDate", {
      ...mealsByDate,
      [dateKey]: [...existing, { mealtime, recipes: [] }],
    });
    setFieldState("showMealtimeModal", false);
  };

  const fetchMealsForDate = async (date: Date) => {
    try {
      const user = await getCurrentUser();
      const key = format(date, "yyyy-MM-dd");
      const [doc] = await listDocuments(AppwriteConfig.MEALPLAN_COLLECTION_ID, [
        Query.equal("user_id", user.$id),
        Query.equal("date", date.toISOString()),
        Query.limit(1),
      ]);
      if (!doc) return;

      const meals = await Promise.all(
        doc.meals.map(async (mealStr: string) => {
          const { mealtime, recipes: ids } = JSON.parse(mealStr);
          const recipes = await Promise.all(
            ids.map(async (id: string) => {
              const [r] = await listDocuments(
                AppwriteConfig.RECIPES_COLLECTION_ID,
                [Query.equal("$id", id), Query.limit(1)]
              );
              return {
                name: r.title,
                image: getImageUrl(r.image[0]),
                id: r.$id,
              };
            })
          );
          return { mealtime, recipes };
        })
      );

      setFieldState("mealsByDate", { ...mealsByDate, [key]: meals });
    } catch (e) {
      console.error("Error fetching meal plan for date:", e);
    } finally {
      setFieldState("planLoading", false);
    }
  };

  const generateMeals = async (
    mealtimes: string[],
    targetId?: string,
    isRegenerate = false
  ) => {
    try {
      const user = await getCurrentUser();
      const iso = selectedDate.toISOString().split("T")[0];
      setFieldState("generateLoading", true);

      if (isRegenerate) {
        await logMealplanInventoryFeedback(
          user.$id,
          iso,
          mealtimes,
          targetId,
          true
        );
      }

      const res = await fetchGeneratedMealPlan(
        user.$id,
        iso,
        mealtimes,
        targetId
      );

      const updated: Meal[] = res.meals.map((meal: any) => ({
        mealtime: meal.mealtime,
        recipes: meal.recipes.map((r: any) => ({
          id: r.id,
          name: r.title,
          image: r.image,
        })),
      }));

      const current = getCachedMealsForDate(selectedDate);
      const merged: Meal[] = current.map((meal) => {
        const update = updated.find((m) => m.mealtime === meal.mealtime);
        if (!update) return meal;

        if (targetId) {
          const replacement = update.recipes.find((r) => r.id !== targetId);
          if (!replacement) return meal;
          return {
            ...meal,
            recipes: meal.recipes.map((r) =>
              r.id === targetId ? replacement : r
            ),
          };
        }

        return update;
      });

      const newMeals = updated.filter(
        (m) => !current.some((c) => c.mealtime === m.mealtime)
      );
      const allMeals = [...merged, ...newMeals];

      const mealsPayload = allMeals
        .filter((m) => m.recipes.length > 0)
        .map((m) =>
          JSON.stringify({
            mealtime: m.mealtime,
            recipes: m.recipes.map((r) => r.id),
          })
        );

      const recommendedIds = allMeals.flatMap((m) =>
        m.recipes.map((r) => r.id)
      );

      const [existing] = await listDocuments(
        AppwriteConfig.MEALPLAN_COLLECTION_ID,
        [
          Query.equal("user_id", user.$id),
          Query.equal("date", iso),
          Query.limit(1),
        ]
      );

      let sessionData: string[] = [];
      const existingSession = existing?.session_data ?? [];

      const newSession = res.meals.flatMap((meal: any) => {
        try {
          const entries = JSON.parse(meal.session);
          return entries.map((e: any) => JSON.stringify([e]));
        } catch {
          return [];
        }
      });

      if (targetId) {
        sessionData = [
          ...existingSession.filter((s: string) => {
            try {
              return JSON.parse(s)[0].id !== targetId;
            } catch {
              return true;
            }
          }),
          ...newSession,
        ];
      } else if (mealtimes.length === 1) {
        const mt = mealtimes[0];
        sessionData = [
          ...existingSession.filter((s: string) => {
            try {
              return JSON.parse(s)[0].mealtime !== mt;
            } catch {
              return true;
            }
          }),
          ...newSession,
        ];
      } else {
        sessionData = newSession;
      }

      const docPayload = {
        meals: mealsPayload,
        recommended_ids: Array.from(
          new Set([...(existing?.recommended_ids ?? []), ...recommendedIds])
        ),
        recommended_ts: new Date().toISOString(),
        session_data: sessionData,
      };

      if (existing) {
        await updateDocument(
          AppwriteConfig.MEALPLAN_COLLECTION_ID,
          existing.$id,
          docPayload
        );
      } else {
        await createDocument(
          AppwriteConfig.MEALPLAN_COLLECTION_ID,
          {
            ...docPayload,
            user_id: user.$id,
            date: iso,
            created_at: new Date().toISOString(),
          },
          ID.unique(),
          [
            Permission.read(Role.user(user.$id)),
            Permission.write(Role.user(user.$id)),
          ]
        );
      }

      setFieldState("mealsByDate", { ...mealsByDate, [dateKey]: allMeals });
    } catch (e) {
      console.error("Error generating meal plan:", e);
    } finally {
      setFieldState("generateLoading", false);
    }
  };

  const deleteFromMealplan = async (mealtime: string, recipeId?: string) => {
    try {
      const user = await getCurrentUser();
      const iso = selectedDate.toISOString().split("T")[0];
      const key = format(selectedDate, "yyyy-MM-dd");
      const currentMeals = mealsByDate[key] || [];

      const updatedLocalMeals = recipeId
        ? currentMeals
            .map((m) =>
              m.mealtime !== mealtime
                ? m
                : { ...m, recipes: m.recipes.filter((r) => r.id !== recipeId) }
            )
            .filter((m) => m.recipes.length)
        : currentMeals.filter((m) => m.mealtime !== mealtime);

      const newMealsByDate = { ...mealsByDate };
      if (updatedLocalMeals.length === 0) {
        delete newMealsByDate[key];
      } else {
        newMealsByDate[key] = updatedLocalMeals;
      }

      const mealStillExists = updatedLocalMeals.some((m) =>
        recipeId
          ? m.recipes.some((r) => r.id === recipeId)
          : m.mealtime === mealtime
      );

      if (!mealStillExists) {
        setFieldState("mealsByDate", newMealsByDate);
        return;
      }

      const [doc] = await listDocuments(AppwriteConfig.MEALPLAN_COLLECTION_ID, [
        Query.equal("user_id", user.$id),
        Query.equal("date", iso),
        Query.limit(1),
      ]);
      if (!doc) return;

      let mealsRaw: string[], session: string[];

      if (recipeId) {
        mealsRaw = doc.meals
          .map((m: string) => JSON.parse(m))
          .map((m: any) => {
            if (m.mealtime !== mealtime) return m;
            return {
              ...m,
              recipes: m.recipes.filter((id: string) => id !== recipeId),
            };
          })
          .filter((m: any) => m.recipes.length)
          .map((m: Meal) => JSON.stringify(m));

        session = (doc.session_data ?? []).filter((s: string) => {
          try {
            return JSON.parse(s)[0].id !== recipeId;
          } catch {
            return true;
          }
        });
      } else {
        mealsRaw = doc.meals.filter(
          (m: string) => JSON.parse(m).mealtime !== mealtime
        );
        session = (doc.session_data ?? []).filter((s: string) => {
          try {
            return JSON.parse(s)[0].mealtime !== mealtime;
          } catch {
            return true;
          }
        });

        await logMealplanInventoryFeedback(
          user.$id,
          iso,
          [mealtime],
          undefined,
          true
        );
      }

      await updateDocument(AppwriteConfig.MEALPLAN_COLLECTION_ID, doc.$id, {
        meals: mealsRaw,
        session_data: session,
      });

      let updated = getCachedMealsForDate(selectedDate);
      updated = recipeId
        ? updated
            .map((m) =>
              m.mealtime !== mealtime
                ? m
                : { ...m, recipes: m.recipes.filter((r) => r.id !== recipeId) }
            )
            .filter((m) => m.recipes.length)
        : updated.filter((m) => m.mealtime !== mealtime);

      setFieldState("mealsByDate", { ...mealsByDate, [key]: updated });
    } catch (e) {
      console.error("Failed to delete from mealplan:", e);
    }
  };

  const addRecipeToMealPlan = async (
    recipe: Meal["recipes"][0],
    mealtime: string,
    targetDate: Date
  ) => {
    try {
      const user = await getCurrentUser();
      const isoDate = format(targetDate, "yyyy-MM-dd");
      const [existingDoc] = await listDocuments(
        AppwriteConfig.MEALPLAN_COLLECTION_ID,
        [
          Query.equal("user_id", user.$id),
          Query.equal("date", isoDate),
          Query.limit(1),
        ]
      );

      let existingMeals: { mealtime: string; recipes: any[] }[] = [];
      if (existingDoc?.meals && Array.isArray(existingDoc.meals)) {
        existingMeals = existingDoc.meals.map((m: string) => JSON.parse(m));
      }

      const updatedMeals = [...existingMeals];
      const targetMealIndex = updatedMeals.findIndex(
        (meal) => meal.mealtime === mealtime
      );

      if (targetMealIndex > -1) {
        const meal = updatedMeals[targetMealIndex];
        const exists = meal.recipes.some((r) =>
          typeof r === "string" ? r === recipe.id : r.id === recipe.id
        );

        if (!exists) {
          updatedMeals[targetMealIndex] = {
            ...meal,
            recipes: [...meal.recipes, recipe],
          };
        }
      } else {
        updatedMeals.push({
          mealtime,
          recipes: [recipe],
        });
      }

      const mealsPayload = updatedMeals
        .filter((m) => m.recipes.length > 0)
        .map((m) =>
          JSON.stringify({
            mealtime: m.mealtime,
            recipes: m.recipes.map((r) => (typeof r === "string" ? r : r.id)),
          })
        );

      const docPayload = {
        meals: mealsPayload,
        recommended_ids: Array.from(
          new Set([...(existingDoc?.recommended_ids ?? []), recipe.id])
        ),
        recommended_ts: new Date().toISOString(),
        session_data: existingDoc?.session_data ?? [],
      };

      if (existingDoc) {
        await updateDocument(
          AppwriteConfig.MEALPLAN_COLLECTION_ID,
          existingDoc.$id,
          docPayload
        );
      } else {
        await createDocument(
          AppwriteConfig.MEALPLAN_COLLECTION_ID,
          {
            ...docPayload,
            user_id: user.$id,
            date: isoDate,
            created_at: new Date().toISOString(),
          },
          ID.unique(),
          [
            Permission.read(Role.user(user.$id)),
            Permission.write(Role.user(user.$id)),
          ]
        );
      }

      router.replace({
        pathname: Routes.PlannerTab,
        params: { targetDate: new Date(targetDate).toISOString() },
      });
    } catch (error) {
      console.error("Failed to add recipe to meal plan:", error);
    }
  };

  const addMealToInventory = async (mealtime: string, recipeId?: string) => {
    if (!mealtime) return;

    try {
      const user = await getCurrentUser();
      const userDoc = await getDocumentById(
        AppwriteConfig.USERS_COLLECTION_ID,
        user.$id
      );

      const meals = getCachedMealsForDate(selectedDate);
      const selected = meals.find((m) => m.mealtime === mealtime);
      if (!selected) return;

      let recipesToAdd;

      if (recipeId) {
        const recipe = selected.recipes.find((r) => r.id === recipeId);
        if (!recipe) return;
        recipesToAdd = [recipe];
      } else {
        recipesToAdd = selected.recipes;
      }

      const existingIds = userDoc.inventory_recipes || [];
      const recipeIds = recipesToAdd.map((r) => r.id);
      const duplicates = recipesToAdd.filter((r) => existingIds.includes(r.id));

      if (duplicates.length > 0) {
        const duplicateNames = duplicates.map((r) => `• ${r.name}`).join("\n");

        Alert.alert(
          "Recipes Already in Queue",
          `The following recipes are already in your adding queue:\n\n${duplicateNames}\n\nDo you want to add them again?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Add Anyway",
              style: "default",
              onPress: async () => {
                await addRecipesToInventory(user.$id, recipeIds);
                Toast.show({
                  type: "success",
                  text1: recipeId
                    ? "Recipe added to inventory."
                    : "Mealtime added to inventory.",
                });
              },
            },
          ]
        );
      } else {
        await addRecipesToInventory(user.$id, recipeIds);
        Toast.show({
          type: "success",
          text1: recipeId
            ? "Recipe added to inventory."
            : "Mealtime added to inventory.",
        });
      }
    } catch (e) {
      console.error("Error adding meal to inventory:", e);
    }
  };

  const addRecipesToInventory = async (userId: string, recipeIds: string[]) => {
    const userDoc = await getDocumentById(
      AppwriteConfig.USERS_COLLECTION_ID,
      userId
    );
    if (!userDoc) return;

    const currentInventory = userDoc.inventory_recipes || [];
    const updated = Array.from(new Set([...currentInventory, ...recipeIds]));

    await updateDocument(AppwriteConfig.USERS_COLLECTION_ID, userId, {
      inventory_recipes: updated,
    });

    dispatch(setHasAddedInventory(true));
  };

  return {
    date: { minDate, weekStart },
    planner,
    fetchMealsForDate,
    actions: {
      generateMeals,
      handleChangeWeek,
      getCachedMealsForDate,
      addMealtime,
      deleteFromMealplan,
      addMealToInventory,
    },
    addRecipeToMealPlan,
  };
};

export default usePlannerController;
