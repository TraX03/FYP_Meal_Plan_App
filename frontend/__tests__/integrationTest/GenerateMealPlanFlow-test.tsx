import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

import PlannerComponent from "@/app/planner/component";
import MealConfigComponent from "@/app/planner/mealConfig/component";
import { renderWithRedux } from "@/utility/renderWithRedux";

jest.mock("@/services/Appwrite", () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({ $id: "test_user_id" })),
  listDocuments: jest.fn(() => Promise.resolve([])),
  createDocument: jest.fn(() => Promise.resolve({})),
  updateDocument: jest.fn(() => Promise.resolve({})),
  getDocumentById: jest.fn(() => Promise.resolve({})),
}));

jest.mock("@/services/FastApi", () => ({
  fetchGeneratedMealPlan: jest.fn(() =>
    Promise.resolve({
      meals: [
        {
          mealtime: "breakfast",
          recipes: [{ id: "recipe1", title: "Pancakes", image: "image1.jpg" }],
          session: JSON.stringify([{ id: "recipe1", mealtime: "breakfast" }]),
        },
      ],
    })
  ),
  logMealplanInventoryFeedback: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
  Stack: { Screen: () => null },
}));
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));
jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

const mockCheckLogin = jest.fn((fn) => fn());

const defaultMealConfig = {
  lunch: {
    staples: "none",
    meatCount: 1,
    vegeCount: 1,
    soupCount: 1,
    sideCount: 1,
  },
  dinner: {
    staples: "none",
    meatCount: 1,
    vegeCount: 1,
    soupCount: 1,
    sideCount: 1,
  },
  supper: {
    staples: "none",
    meatCount: 1,
    vegeCount: 1,
    soupCount: 1,
    sideCount: 1,
  },
};

jest.mock("@/app/planner/mealConfig/controller", () => ({
  __esModule: true,
  default: () => ({
    config: {
      servings: 1,
      meal_config: {
        ...defaultMealConfig,
        breakfast: { dishCount: 1 },
        afternoonTea: { dishCount: 1 },
        snacks: { dishCount: 1 },
      },
      expandedSections: {
        lunch: false,
        dinner: false,
        supper: false,
        breakfast: false,
        afternoonTea: false,
        snacks: false,
      },
    },
    updateMealCount: jest.fn(),
    toggleMealOption: jest.fn(),
    toggleSection: jest.fn(),
    handleSave: jest.fn(async () => {
      const { updateDocument } = require("@/services/Appwrite");
      await updateDocument("mock_collection_id", "test_user_id", {
        meal_config: JSON.stringify(defaultMealConfig),
      });

      const Toast = require("react-native-toast-message");
      Toast.show({
        type: "success",
        text1: "Configuration saved successfully.",
      });
    }),
  }),
}));

describe("Full Meal Planning Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("flows from meal config to generating meals", async () => {
    const {
      config,
      updateMealCount,
      toggleMealOption,
      toggleSection,
      handleSave,
    } = require("@/app/planner/mealConfig/controller").default();

    const { getByText } = renderWithRedux(
      <MealConfigComponent
        config={config}
        updateMealCount={updateMealCount}
        toggleMealOption={toggleMealOption}
        toggleSection={toggleSection}
        handleSave={handleSave}
      />
    );

    fireEvent.press(getByText("Save"));

    await waitFor(() => {
      const { updateDocument } = require("@/services/Appwrite");
      expect(updateDocument).toHaveBeenCalledWith(
        expect.any(String),
        "test_user_id",
        {
          meal_config: JSON.stringify(defaultMealConfig),
        }
      );
      expect(Toast.show).toHaveBeenCalledWith({
        type: "success",
        text1: "Configuration saved successfully.",
      });
    });

    const mockGenerateMeals = jest.fn();
    const mockPlanner: any = {
      selectedDate: new Date("2025-07-18"),
      showDatePicker: false,
      showMealtimeModal: false,
      selectedMealtime: null,
      showRegenerateButton: false,
      showDeleteButton: false,
      planLoading: false,
      generateLoading: false,
      setFieldState: jest.fn(),
      setFields: jest.fn(),
      getFieldState: jest.fn(),
    };

    const { getByTestId } = renderWithRedux(
      <PlannerComponent
        planner={mockPlanner}
        date={{
          minDate: new Date("2025-06-16T00:00:00Z"),
          weekStart: new Date("2025-07-14T00:00:00Z"),
        }}
        fetchMealsForDate={jest.fn()}
        checkLogin={mockCheckLogin}
        actions={{
          generateMeals: mockGenerateMeals,
          handleChangeWeek: jest.fn(),
          getCachedMealsForDate: jest.fn().mockReturnValue([
            {
              mealtime: "breakfast",
              recipes: [
                { id: "recipe1", title: "Pancakes", image: "image1.jpg" },
              ],
            },
          ]),
          addMealtime: jest.fn(),
          deleteFromMealplan: jest.fn(),
          addMealToInventory: jest.fn(),
        }}
      />
    );

    fireEvent.press(getByTestId("planner-generate-button"));

    await waitFor(() => {
      expect(mockGenerateMeals).toHaveBeenCalled();
    });
  });
});
