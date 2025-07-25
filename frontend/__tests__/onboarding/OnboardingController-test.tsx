import useOnboardingController from "@/app/onboarding/controller";
import * as Appwrite from "@/services/Appwrite";
import * as FastApi from "@/services/FastApi";
import { renderHook } from "@testing-library/react-native";
import { act } from "react";

jest.mock("@/services/Appwrite", () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({ $id: "user-1" })),
  updateDocument: jest.fn(() => Promise.resolve()),
  createDocument: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/services/GeminiApi", () => ({
  cleanPreferencesByType: jest.fn(() => Promise.resolve(["cleaned"])),
}));

jest.mock("@/services/FastApi", () => ({
  fetchColdstartRecommendations: jest.fn(() =>
    Promise.resolve({
      post_ids: ["p1"],
      titles: ["T1"],
      images: ["I1"],
    })
  ),
}));

jest.mock("@/constants/AppwriteConfig", () => ({
  AppwriteConfig: {
    USERS_COLLECTION_ID: "users-collection-id",
    INTERACTIONS_COLLECTION_ID: "interactions-collection-id",
  },
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
}));

describe("useOnboardingController", () => {
  it("initializes with correct defaults", () => {
    const { result } = renderHook(() => useOnboardingController());

    expect(result.current.onboarding.currentPage).toBe(1);
    expect(result.current.onboarding.diet).toEqual([]);
  });

  it("adds new item via handleSelectItem", () => {
    const { result } = renderHook(() => useOnboardingController());

    act(() => {
      result.current.actions.handleSelectItem("Apple");
    });

    expect(result.current.onboarding.ingredientAvoid).toContain("Apple");
    expect(result.current.onboarding.customSuggestions[0]).toContain("Apple");
  });

  it("toggles item selection", () => {
    const { result } = renderHook(() => useOnboardingController());

    act(() => {
      result.current.actions.handleSelectItem("Mango");
    });

    act(() => {
      result.current.actions.toggleItemSelection("Mango");
    });

    expect(result.current.onboarding.ingredientAvoid).not.toContain("Mango");
  });

  it("returns correct page suggestions", () => {
    const { result } = renderHook(() => useOnboardingController());

    act(() => {
      result.current.actions.handleSelectItem("Orange");
    });

    const suggestions = result.current.actions.getPageSuggestions();
    expect(suggestions).toContain("Orange");
  });

  it("advances to recommendations and fetches data", async () => {
    const { result } = renderHook(() => useOnboardingController());

    act(() => {
      result.current.onboarding.setFieldState("ingredientAvoid", ["Salt"]);
      result.current.onboarding.setFieldState("currentPage", 3);
    });

    await act(async () => {
      await result.current.actions.handleNext();
    });

    expect(FastApi.fetchColdstartRecommendations).toHaveBeenCalledWith(
      "user-1"
    );
    expect(result.current.onboarding.recommendations?.titles).toContain("T1");
  });

  it("handles rating and progresses", async () => {
    const { result } = renderHook(() => useOnboardingController());

    act(() => {
      result.current.onboarding.setFields({
        currentPage: 4,
        recommendations: {
          recipeIds: ["p1"],
          titles: ["Recipe 1"],
          images: ["img1"],
        },
      });
    });

    await act(async () => {
      await result.current.actions.handleRating("like");
    });

    expect(Appwrite.createDocument).toHaveBeenCalledWith(
      "interactions-collection-id",
      expect.objectContaining({
        item_id: "p1",
        score: 1,
        user_id: "user-1",
      })
    );
  });

  it("calls updateDocument on saveOnboardingData", async () => {
    const { result } = renderHook(() => useOnboardingController());

    act(() => {
      result.current.onboarding.setFields({
        ingredientAvoid: ["A"],
        diet: ["B"],
        region: ["C"],
      });
    });

    await act(async () => {
      await result.current.actions.handleNext();
    });

    expect(Appwrite.updateDocument).toHaveBeenCalledWith(
      "users-collection-id",
      "user-1",
      expect.objectContaining({
        avoid_ingredients: ["cleaned"],
      })
    );
  });
});
