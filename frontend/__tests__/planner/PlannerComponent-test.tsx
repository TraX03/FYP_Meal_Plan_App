import PlannerComponent from "@/app/planner/component";
import { Routes } from "@/constants/Routes";
import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

const mockCheckLogin = jest.fn((fn) => fn());

const mockPlanner: any = {
  selectedDate: new Date(),
  showDatePicker: false,
  showMealtimeModal: false,
  showSettingModal: false,
  showRegenerateButton: false,
  showDeleteButton: false,
  showAddButton: false,
  showAddOptionModal: false,
  selectedMealtime: "",
  planLoading: false,
  generateLoading: false,
  setFieldState: jest.fn(),
  setFields: jest.fn(),
};

const mockDate = {
  minDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  weekStart: new Date(),
};

const mockActions = {
  generateMeals: jest.fn(),
  handleChangeWeek: jest.fn(),
  getCachedMealsForDate: jest.fn(() => [
    {
      mealtime: "lunch",
      recipes: [{ id: "recipe-1", name: "Spaghetti", image: "image.jpg" }],
    },
  ]),
  addMealtime: jest.fn(),
  deleteFromMealplan: jest.fn(),
  addMealToInventory: jest.fn(),
};

const fetchMealsForDate = jest.fn();

describe("PlannerComponent", () => {
  it("renders without crashing", () => {
    const { getByText } = render(
      <PlannerComponent
        planner={mockPlanner}
        date={mockDate}
        actions={mockActions}
        fetchMealsForDate={fetchMealsForDate}
        checkLogin={mockCheckLogin}
      />
    );

    expect(getByText("Meal Planner")).toBeTruthy();
  });

  it("navigates to MealConfiguration when config button is pressed", () => {
    const { getByTestId } = render(
      <PlannerComponent
        planner={mockPlanner}
        date={mockDate}
        actions={mockActions}
        fetchMealsForDate={fetchMealsForDate}
        checkLogin={mockCheckLogin}
      />
    );

    fireEvent.press(getByTestId("meal-config-button"));
    expect(router.push).toHaveBeenCalledWith(Routes.MealConfiguration);
  });

  it("calls generateMeals when planner-generate-button is pressed", () => {
    const { getByTestId } = render(
      <PlannerComponent
        planner={mockPlanner}
        date={mockDate}
        actions={mockActions}
        fetchMealsForDate={fetchMealsForDate}
        checkLogin={mockCheckLogin}
      />
    );

    fireEvent.press(getByTestId("planner-generate-button"));
    expect(mockActions.generateMeals).toHaveBeenCalledWith(["lunch"]);
  });

  it("opens recipe detail on card press", () => {
    const { getByTestId } = render(
      <PlannerComponent
        planner={mockPlanner}
        date={mockDate}
        actions={mockActions}
        fetchMealsForDate={fetchMealsForDate}
        checkLogin={mockCheckLogin}
      />
    );

    fireEvent.press(getByTestId("recipe-card-recipe-1"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: Routes.PostDetail,
      params: { id: "recipe-1" },
    });
  });

  it("handles add mealtime button", () => {
    const { getByText } = render(
      <PlannerComponent
        planner={mockPlanner}
        date={mockDate}
        actions={mockActions}
        fetchMealsForDate={fetchMealsForDate}
        checkLogin={mockCheckLogin}
      />
    );

    fireEvent.press(getByText("Add Mealtime"));
    expect(mockPlanner.setFieldState).toHaveBeenCalledWith(
      "showMealtimeModal",
      true
    );
  });
});
