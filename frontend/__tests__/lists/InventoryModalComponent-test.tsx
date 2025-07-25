import InventoryModalComponent from "@/app/lists/inventoryModal/component";
import { Colors } from "@/constants/Colors";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

jest.mock("@/components/CustomPicker", () => "CustomPicker");
jest.mock("@/components/InputBox", () => "InputBox");
jest.mock("@/components/ui/IconSymbol", () => "IconSymbol");
jest.mock("@/hooks/useFieldState", () => ({
  useFieldState: jest.fn(),
}));
jest.mock("@/services/GeminiApi", () => ({
  fetchPredictedExpiry: jest.fn(),
  fetchSuggestions: jest.fn(),
}));

const baseProps: any = {
  lists: {
    currentStepIndex: 0,
    formDrafts: [
      {
        quantity: [1],
        quantityText: ["1"],
        unit: ["kg"],
        expiries: ["2025-08-01T00:00:00.000Z"],
      },
    ],
    showLoading: false,
    showDatePicker: false,
    datePickerIndex: 0,
    setFieldState: jest.fn(),
  },
  checkedItems: [{ name: "Carrot", checkedCount: 1 }],
  modal: {
    newItemDraft: {
      itemName: "Apple",
      itemCount: "1",
      quantity: [0],
      quantityText: [""],
      unit: [""],
      expiries: [""],
    },
    setFieldState: jest.fn(),
    isFocus: false,
    searchText: "",
  },
  modifyDraftFieldAtIndex: jest.fn(),
  modifyNewItemDraftField: jest.fn(),
  handleMoveToInventory: jest.fn(),
  getSuggestions: jest.fn(() => ["Apple", "Banana"]),
  selectSuggestion: jest.fn(),
  hasMismatch: {
    hasExpiryMismatch: jest.fn(() => false),
    hasQuantityMismatch: jest.fn(() => false),
  },
};

describe("InventoryModalComponent", () => {
  it("renders correctly with default props (from checkedItems)", () => {
    const { getByText } = render(<InventoryModalComponent {...baseProps} />);
    expect(getByText("Item: Carrot")).toBeTruthy();
    expect(getByText("(x1)")).toBeTruthy();
  });

  it("disables 'Submit' if has mismatch", () => {
    const props = {
      ...baseProps,
      hasMismatch: {
        hasExpiryMismatch: () => true,
        hasQuantityMismatch: () => false,
      },
    };

    const { getByText } = render(<InventoryModalComponent {...props} />);
    const submitBtn = getByText("Submit");

    expect(submitBtn.props.style.color).toBe(Colors.text.disabled);
  });

  it("shows suggestions when focused and suggestions exist", () => {
    const props = {
      ...baseProps,
      isFromInventory: true,
      modal: {
        ...baseProps.modal,
        isFocus: true,
        searchText: "a",
      },
    };

    const { getByText } = render(<InventoryModalComponent {...props} />);
    expect(getByText("Apple")).toBeTruthy();
    expect(getByText("Banana")).toBeTruthy();
  });

  it("calls selectSuggestion when suggestion is pressed", () => {
    const props = {
      ...baseProps,
      isFromInventory: true,
      modal: {
        ...baseProps.modal,
        isFocus: true,
        searchText: "a",
      },
    };

    const { getByText } = render(<InventoryModalComponent {...props} />);
    fireEvent.press(getByText("Apple"));
    expect(props.selectSuggestion).toHaveBeenCalledWith("Apple");
  });

  it("calls handleMoveToInventory on submit (non-inventory mode)", () => {
    const props = {
      ...baseProps,
      lists: {
        ...baseProps.lists,
        currentStepIndex: 1,
        formDrafts: [
          baseProps.lists.formDrafts[0],
          baseProps.lists.formDrafts[0],
        ],
      },
      checkedItems: [
        { name: "Carrot", checkedCount: 1 },
        { name: "Potato", checkedCount: 1 },
      ],
    };

    const { getByText } = render(<InventoryModalComponent {...props} />);
    fireEvent.press(getByText("Submit"));
    expect(props.handleMoveToInventory).toHaveBeenCalled();
  });

  it("adds expiry when + Add Expiry Date pressed", () => {
    const props = {
      ...baseProps,
      isFromInventory: true,
      modal: {
        ...baseProps.modal,
        newItemDraft: {
          ...baseProps.modal.newItemDraft,
          expiries: [""],
        },
      },
    };

    const { getByText } = render(<InventoryModalComponent {...props} />);
    fireEvent.press(getByText("+ Add Expiry Date"));
    expect(props.modifyNewItemDraftField).toHaveBeenCalledWith({
      field: "expiries",
      index: 0,
      value: "",
      insertAfter: true,
    });
  });

  it("resets item state after Add to Inventory", () => {
    const props = {
      ...baseProps,
      isFromInventory: true,
    };

    const { getByText } = render(<InventoryModalComponent {...props} />);
    fireEvent.press(getByText("Add to Inventory"));

    expect(props.handleMoveToInventory).toHaveBeenCalledWith(
      props.modal.newItemDraft
    );
    expect(props.modal.setFieldState).toHaveBeenCalledWith("newItemDraft", {
      itemName: "",
      itemCount: "1",
      quantity: [0],
      quantityText: [""],
      unit: [""],
      expiries: [""],
    });
  });

  it("shows loading indicator if showLoading is true", () => {
    const props = {
      ...baseProps,
      lists: { ...baseProps.lists, showLoading: true },
    };
    const { getByTestId } = render(<InventoryModalComponent {...props} />);
    expect(getByTestId("activity-indicator")).toBeTruthy();
  });
});
