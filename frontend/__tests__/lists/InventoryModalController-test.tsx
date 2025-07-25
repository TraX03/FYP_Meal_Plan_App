import useInventoryModalController from "@/app/lists/inventoryModal/controller";
import { useFieldState } from "@/hooks/useFieldState";
import { act, renderHook } from "@testing-library/react-native";

jest.mock("@/hooks/useFieldState", () => ({
  useFieldState: jest.fn(),
}));

describe("useInventoryModalController", () => {
  let setFieldStateMock: jest.Mock;
  let mockState: any;

  beforeEach(() => {
    setFieldStateMock = jest.fn();

    mockState = {
      setFieldState: setFieldStateMock,
      currentStepIndex: 0,
      formDrafts: [
        {
          quantityText: ["1", "2"],
          quantity: [1, 2],
          unit: ["g", "ml"],
          expiries: ["2025-01-01", ""],
        },
      ],
    };

    (useFieldState as jest.Mock).mockReturnValue(mockState);
  });

  it("returns true for expiry mismatch when multiple expiries filled but count mismatch", () => {
    const { result } = renderHook(() => useInventoryModalController(mockState));
    const mismatch = result.current.hasMismatch.hasExpiryMismatch(
      ["2025-01-01", "2025-02-01", ""],
      2
    );
    expect(mismatch).toBe(true);
  });

  it("returns false for expiry mismatch when lengths match and all filled", () => {
    const { result } = renderHook(() => useInventoryModalController(mockState));
    const mismatch = result.current.hasMismatch.hasExpiryMismatch(
      ["2025-01-01", "2025-02-01"],
      2
    );
    expect(mismatch).toBe(false);
  });

  it("returns true for quantity mismatch when partial fields are filled", () => {
    const { result } = renderHook(() => useInventoryModalController(mockState));
    const mismatch = result.current.hasMismatch.hasQuantityMismatch(
      ["1", ""],
      ["g", ""],
      2
    );
    expect(mismatch).toBe(true);
  });

  it("returns false for quantity mismatch when all empty", () => {
    const { result } = renderHook(() => useInventoryModalController(mockState));
    const mismatch = result.current.hasMismatch.hasQuantityMismatch(
      ["", ""],
      ["", ""],
      2
    );
    expect(mismatch).toBe(false);
  });

  it("returns false for quantity mismatch when all filled correctly", () => {
    const { result } = renderHook(() => useInventoryModalController(mockState));
    const mismatch = result.current.hasMismatch.hasQuantityMismatch(
      ["1", "2"],
      ["g", "ml"],
      2
    );
    expect(mismatch).toBe(false);
  });

  it("modifies draft field correctly (single update)", () => {
    const { result } = renderHook(() => useInventoryModalController(mockState));

    act(() => {
      result.current.modifyDraftFieldAtIndex({
        field: "quantityText",
        index: 1,
        value: "3",
      });
    });

    expect(setFieldStateMock).toHaveBeenCalledWith("formDrafts", {
      0: {
        quantityText: ["1", "3"],
        quantity: [1, 2],
        unit: ["g", "ml"],
        expiries: ["2025-01-01", ""],
      },
    });
  });

  it("modifies draft field correctly (batch insertAfter)", () => {
    const { result } = renderHook(() => useInventoryModalController(mockState));

    act(() => {
      result.current.modifyDraftFieldAtIndex({
        updates: [
          {
            field: "quantityText",
            index: 0,
            value: "5",
            insertAfter: true,
          },
          {
            field: "unit",
            index: 0,
            value: "kg",
            insertAfter: true,
          },
        ],
      });
    });

    expect(setFieldStateMock).toHaveBeenCalledWith("formDrafts", {
      0: {
        quantityText: ["1", "5", "2"],
        quantity: [1, 2],
        unit: ["g", "kg", "ml"],
        expiries: ["2025-01-01", ""],
      },
    });
  });
});
