import OnboardingComponent, {
  INTERACTION_LABELS,
} from "@/app/onboarding/component";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

jest.mock("@/services/MealDbApi", () => ({
  fetchMealDBList: jest
    .fn()
    .mockResolvedValue(["Mocked Ingredient", "Mocked Region", "Mocked Diet"]),
}));

const mockSetFieldState = jest.fn();
const mockHandleNext = jest.fn();
const mockHandlePrevious = jest.fn();
const mockHandleSelectItem = jest.fn();
const mockToggleItemSelection = jest.fn();
const mockGetPageSuggestions = jest.fn(() => ["Test1", "Test2"]);
const mockHandleRating = jest.fn(() => Promise.resolve());

const baseOnboarding: any = {
  currentPage: 1,
  ingredientAvoid: [],
  diet: [],
  region: [],
  showSearchModal: false,
  setFieldState: mockSetFieldState,
  recommendations: {
    images: ["image1.jpg", "image2.jpg"],
    titles: ["Recipe 1", "Recipe 2"],
  },
  currentRatingIndex: 0,
  showLottie: false,
  keyboardVisible: false,
};

const actions = {
  handleSelectItem: mockHandleSelectItem,
  toggleItemSelection: mockToggleItemSelection,
  getPageSuggestions: mockGetPageSuggestions,
  handleNext: mockHandleNext,
  handlePrevious: mockHandlePrevious,
  handleRating: mockHandleRating,
};

describe("OnboardingComponent", () => {
  it("renders step indicators", () => {
    const { getAllByText } = render(
      <OnboardingComponent
        onboarding={baseOnboarding}
        isNextEnabled={true}
        actions={actions}
      />
    );
    expect(getAllByText(/^\d$/).length).toBe(4);
  });

  it("calls handleNext when Skip is pressed", () => {
    const { getByText } = render(
      <OnboardingComponent
        onboarding={baseOnboarding}
        isNextEnabled={true}
        actions={actions}
      />
    );
    fireEvent.press(getByText("Skip"));
    expect(mockHandleNext).toHaveBeenCalled();
  });

  it("disables Next when isNextEnabled is false", () => {
    const { getByTestId } = render(
      <OnboardingComponent
        onboarding={baseOnboarding}
        isNextEnabled={false}
        actions={actions}
      />
    );

    const nextButton = getByTestId("next-button");
    expect(nextButton).toHaveStyle({ opacity: 0.5 });
  });

  it("calls handlePrevious on Previous press", () => {
    const onboarding = { ...baseOnboarding, currentPage: 2 };
    const { getByText } = render(
      <OnboardingComponent
        onboarding={onboarding}
        isNextEnabled={true}
        actions={actions}
      />
    );
    fireEvent.press(getByText("Previous"));
    expect(mockHandlePrevious).toHaveBeenCalled();
  });

  it("renders recommendation rating page and buttons", () => {
    const onboarding = { ...baseOnboarding, currentPage: 4 };
    const { getAllByText } = render(
      <OnboardingComponent
        onboarding={onboarding}
        isNextEnabled={true}
        actions={actions}
      />
    );
    INTERACTION_LABELS.forEach((label) => {
      expect(getAllByText(new RegExp(label, "i")).length).toBeGreaterThan(0);
    });
  });

  it("calls handleRating when interaction button is pressed", () => {
    const onboarding = { ...baseOnboarding, currentPage: 4 };
    const { getByText } = render(
      <OnboardingComponent
        onboarding={onboarding}
        isNextEnabled={true}
        actions={actions}
      />
    );
    fireEvent.press(getByText("Like"));
    expect(mockHandleRating).toHaveBeenCalledWith("like");
  });

  it("shows Lottie animation when showLottie is true on page 3", () => {
    const onboarding = { ...baseOnboarding, currentPage: 3, showLottie: true };
    const { getByTestId } = render(
      <OnboardingComponent
        onboarding={onboarding}
        isNextEnabled={true}
        actions={actions}
      />
    );
    expect(getByTestId("LottieView")).toBeTruthy();
  });

  it("opens modal when setFieldState showSearchModal is true", () => {
    const onboarding = { ...baseOnboarding, showSearchModal: true };
    const { getByPlaceholderText } = render(
      <OnboardingComponent
        onboarding={onboarding}
        isNextEnabled={true}
        actions={actions}
      />
    );
    expect(getByPlaceholderText("Search ingredient...")).toBeTruthy();
  });
});
