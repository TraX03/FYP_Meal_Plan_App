import usePlannerController from "@/app/planner/controller";
import { useFieldState } from "@/hooks/useFieldState";
import * as AppwriteService from "@/services/Appwrite";
import * as FastApiService from "@/services/FastApi";
import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@/services/Appwrite");
jest.mock("@/services/FastApi");
jest.mock("@/hooks/useFieldState");
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));
jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
}));

describe("usePlannerController", () => {
  const setFieldState = jest.fn();
  const getFieldState = jest.fn().mockReturnValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    (useFieldState as jest.Mock).mockReturnValue({
      getFieldState,
      setFieldState,
      selectedDate: new Date("2025-07-20"),
      mealsByDate: {},
    });
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() => usePlannerController());
    expect(result.current.date).toHaveProperty("minDate");
    expect(result.current.date).toHaveProperty("weekStart");
    expect(result.current.planner.setFieldState).toBe(setFieldState);
  });

  it("should handle week change", () => {
    const { result } = renderHook(() => usePlannerController());
    act(() => {
      result.current.actions.handleChangeWeek("next");
    });
    expect(setFieldState).toHaveBeenCalledWith(
      "selectedDate",
      expect.any(Date)
    );
  });

  it("should add mealtime to mealsByDate", () => {
    getFieldState.mockReturnValueOnce([]);
    const { result } = renderHook(() => usePlannerController());

    act(() => {
      result.current.actions.addMealtime("lunch");
    });

    expect(setFieldState).toHaveBeenCalledWith(
      "mealsByDate",
      expect.objectContaining({
        "2025-07-20": expect.arrayContaining([
          expect.objectContaining({ mealtime: "lunch" }),
        ]),
      })
    );
    expect(setFieldState).toHaveBeenCalledWith("showMealtimeModal", false);
  });

  it("should not add duplicate mealtime", () => {
    getFieldState.mockReturnValueOnce({
      "2025-07-20": [{ mealtime: "lunch", recipes: [] }],
    });
    const { result } = renderHook(() => usePlannerController());

    act(() => {
      result.current.actions.addMealtime("lunch");
    });

    expect(setFieldState).not.toHaveBeenCalledWith(
      "mealsByDate",
      expect.anything()
    );
  });

  it("should generate meals and update state", async () => {
    (AppwriteService.getCurrentUser as jest.Mock).mockResolvedValue({
      $id: "user123",
    });
    (FastApiService.fetchGeneratedMealPlan as jest.Mock).mockResolvedValue({
      meals: [
        {
          mealtime: "lunch",
          recipes: [{ id: "r1", title: "Recipe 1", image: "img1" }],
          session: JSON.stringify([{ id: "r1", mealtime: "lunch" }]),
        },
      ],
    });
    (AppwriteService.listDocuments as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => usePlannerController());

    await act(async () => {
      await result.current.actions.generateMeals(["lunch"]);
    });

    expect(setFieldState).toHaveBeenCalledWith("generateLoading", true);
    expect(setFieldState).toHaveBeenCalledWith(
      "mealsByDate",
      expect.objectContaining({
        "2025-07-20": [
          {
            mealtime: "lunch",
            recipes: [{ id: "r1", name: "Recipe 1", image: "img1" }],
          },
        ],
      })
    );
  });
});
