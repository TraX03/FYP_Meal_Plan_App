import CounterInput from "@/components/CounterInput";
import HeaderBar from "@/components/HeaderBar";
import RadioSelect from "@/components/RadioSelect";
import ScreenWrapper from "@/components/ScreenWrapper";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { styles } from "@/utility/planner/styles";
import { styles as settingStyles } from "@/utility/profile/settings/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import { Stack } from "expo-router";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { availableMealtimes } from "../controller";
import {
  ConfigState,
  MealPreference,
  MealtimeKey,
  PlannerConfig,
  StapleType,
  stapleTypes,
} from "./controller";

type Props = {
  config: ReturnType<typeof useFieldState<ConfigState>>;
  updateMealCount: (
    mealtime: MealtimeKey,
    field: keyof MealPreference,
    newValue: number
  ) => void;
  toggleMealOption: (
    mealtime: keyof PlannerConfig,
    option: keyof MealPreference
  ) => void;
  toggleSection: (mealtime: MealtimeKey) => void;
  handleSave: () => Promise<void>;
};

export default function MealConfigComponent({
  config,
  updateMealCount,
  toggleMealOption,
  toggleSection,
  handleSave,
}: Props) {
  const { servings, meal_config, expandedSections, setFieldState } = config;

  const isMainMeal = (key: MealtimeKey) =>
    ["lunch", "dinner", "supper"].includes(key);

  const renderMealtimeSection = (
    title: string,
    mealtime: MealtimeKey,
    showAdvancedOptions = false,
    isFirst = false
  ) => {
    const meal = meal_config[mealtime];
    const expanded = expandedSections[mealtime];

    return (
      <View className={isFirst ? "" : "mt-7"}>
        <Pressable
          onPress={() => toggleSection(mealtime)}
          className="flex-row justify-between items-center"
        >
          <Text style={styles.mealtimeTitle}>{title}</Text>
          <IconSymbol
            name={expanded ? "chevron.up" : "chevron.down"}
            color={Colors.brand.primary}
          />
        </Pressable>

        {expanded && (
          <View className="mt-2">
            {showAdvancedOptions && (
              <>
                <Text className="text-[15px] mb-2.5">Staple Selection:</Text>
                <RadioSelect
                  options={stapleTypes.map((type) =>
                    type === "sandwich"
                      ? [type, "sandwich / Burger"]
                      : [type, type]
                  )}
                  value={meal.staples ?? ""}
                  onSelect={(val) =>
                    setFieldState("meal_config", {
                      ...meal_config,
                      [mealtime]: { ...meal, staples: val as StapleType },
                    })
                  }
                />
              </>
            )}

            {(!isMainMeal(mealtime) || meal.staples !== "none") && (
              <CounterInput
                label={
                  isMainMeal(mealtime) ? "Staple Dish:" : "Number of Dishes:"
                }
                value={meal.dishCount}
                onDecrement={() =>
                  updateMealCount(mealtime, "dishCount", meal.dishCount - 1)
                }
                onIncrement={() =>
                  updateMealCount(mealtime, "dishCount", meal.dishCount + 1)
                }
              />
            )}

            {showAdvancedOptions && (
              <>
                <View className="mb-4">
                  {(["meatCount", "vegeCount"] as const).map((field) => (
                    <CounterInput
                      key={field}
                      label={
                        field === "meatCount" ? "Meat Dish:" : "Vege Dish:"
                      }
                      value={meal[field] ?? 0}
                      onDecrement={() =>
                        updateMealCount(mealtime, field, (meal[field] ?? 0) - 1)
                      }
                      onIncrement={() =>
                        updateMealCount(mealtime, field, (meal[field] ?? 0) + 1)
                      }
                    />
                  ))}
                </View>

                <Text className="text-[15px] my-2">Include:</Text>
                <View className="flex-row gap-5 mb-4">
                  {(["soup", "side"] as const).map((option) => (
                    <Pressable
                      key={option}
                      className="flex-row items-center gap-2"
                      onPress={() => toggleMealOption(mealtime, option)}
                    >
                      <IconSymbol
                        name={
                          meal[option]
                            ? "checkmark.square.fill"
                            : "checkmark.square"
                        }
                        color={Colors.brand.primary}
                        size={25}
                      />
                      <Text>
                        {option === "side" ? "Side / Dessert" : "Soup"}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View className="mb-4">
                  {meal.soup && (
                    <CounterInput
                      label="Soup:"
                      value={meal.soupCount ?? 0}
                      onDecrement={() =>
                        updateMealCount(
                          mealtime,
                          "soupCount",
                          (meal.soupCount ?? 0) - 1
                        )
                      }
                      onIncrement={() =>
                        updateMealCount(
                          mealtime,
                          "soupCount",
                          (meal.soupCount ?? 0) + 1
                        )
                      }
                    />
                  )}
                  {meal.side && (
                    <CounterInput
                      label="Side / Dessert:"
                      value={meal.sideCount ?? 0}
                      onDecrement={() =>
                        updateMealCount(
                          mealtime,
                          "sideCount",
                          (meal.sideCount ?? 0) - 1
                        )
                      }
                      onIncrement={() =>
                        updateMealCount(
                          mealtime,
                          "sideCount",
                          (meal.sideCount ?? 0) + 1
                        )
                      }
                    />
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenWrapper>
        <ScrollView
          style={profileStyles.headerContainer}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <HeaderBar title="Meal Configuration" />
          <View className="px-4">
            <Text style={styles.sectionTitle}>Servings</Text>
            <View className="flex-row gap-2 mt-2 mb-5">
              <Pressable
                onPress={() =>
                  setFieldState("servings", Math.max(1, servings - 1))
                }
              >
                <IconSymbol
                  name="minus.square.fill"
                  color={Colors.brand.primaryDark}
                  size={28}
                />
              </Pressable>

              <View style={styles.counterContainer}>
                <Text>{servings}</Text>
              </View>

              <Pressable
                onPress={() => setFieldState("servings", servings + 1)}
              >
                <IconSymbol
                  name="plus.square.fill"
                  color={Colors.brand.primaryDark}
                  size={28}
                />
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Mealtime</Text>
            {availableMealtimes
              .filter((meal) => meal.id !== "all")
              .map(({ id, label }, index) => (
                <View key={id}>
                  {renderMealtimeSection(
                    label,
                    id as MealtimeKey,
                    isMainMeal(id as MealtimeKey),
                    index === 0
                  )}
                </View>
              ))}

            <TouchableOpacity
              style={[settingStyles.saveButton, { marginTop: 60 }]}
              onPress={handleSave}
            >
              <Text style={settingStyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenWrapper>
    </>
  );
}
