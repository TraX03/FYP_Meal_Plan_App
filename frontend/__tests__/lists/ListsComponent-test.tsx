import ListsComponent from "@/app/lists/component";
import { renderWithRedux } from "@/utility/renderWithRedux";
import { fireEvent } from "@testing-library/react-native";
import React from "react";

jest.mock("@/services/GeminiApi", () => ({
  generateSuggestions: jest.fn(() => Promise.resolve([])),
}));

const mockCheckLogin = jest.fn((fn) => fn());

let mockCurrentEditing = false;

jest.mock("@/hooks/useFieldState", () => ({
  useFieldState: () => ({
    isEditing: mockCurrentEditing,
    setFieldState: (key: string, value: boolean) => {
      if (key === "isEditing") mockCurrentEditing = value;
    },
  }),
}));

describe("ListsComponent", () => {
  const mockLists: any = {
    activeTab: "shopping",
    showAddModal: false,
    showInventoryModal: false,
    showAmountModal: false,
    keyboardVisible: false,
    get isEditing() {
      return mockCurrentEditing;
    },
    showSyncLoading: false,
    setFieldState: jest.fn(),
    setFields: jest.fn(),
  };

  const mockActions = {
    addItemToList: jest.fn(),
    handleShoppingCheck: jest.fn(),
    handleMoveToInventory: jest.fn(),
    handleClearItems: jest.fn(),
    handleInventoryCheck: jest.fn(),
    getExpiryStatus: jest.fn(() => ({ label: "Soon", color: "red" })),
    handleQuantityChange: jest.fn(),
    saveQuantityChange: jest.fn(),
    handleRemoveItem: jest.fn(),
    loadItems: jest.fn(),
  };

  const baseItem = {
    id: "1",
    name: "chicken",
    unit: "pcs",
    type: "shopping",
    checked: false,
    checkedCount: 1,
    quantityDisplay: 2,
    expiredQuantity: 1,
    expiredUnit: "pcs",
    expiries: [],
  };

  const mockListData: any = {
    checkedItems: [],
    uncheckedItems: [baseItem],
    expiredItems: [],
  };

  const setup = (overrideProps = {}) =>
    renderWithRedux(
      <ListsComponent
        lists={{ ...mockLists, ...overrideProps }}
        actions={mockActions}
        listData={mockListData}
        checkLogin={mockCheckLogin}
      />
    );

  it("renders tabs and default items", () => {
    const { getByText } = setup();

    expect(getByText("Shopping")).toBeTruthy();
    expect(getByText("Inventory")).toBeTruthy();
    expect(getByText("Chicken")).toBeTruthy();
  });

  it("calls setFieldState when tab is changed", () => {
    const { getByText } = setup();

    fireEvent.press(getByText("Inventory"));
    expect(mockLists.setFieldState).toHaveBeenCalledWith(
      "activeTab",
      "inventory"
    );
  });

  it("shows the Add Item modal when empty list and + Add Items pressed", () => {
    const { getByTestId } = renderWithRedux(
      <ListsComponent
        lists={{ ...mockLists, showAddModal: false }}
        actions={mockActions}
        listData={{
          checkedItems: [],
          uncheckedItems: [],
          expiredItems: [],
        }}
        checkLogin={mockCheckLogin}
      />
    );

    fireEvent.press(getByTestId("add-items-button"));
    expect(mockLists.setFieldState).toHaveBeenCalledWith("showAddModal", true);
  });

  it("marks an item as checked", () => {
    const { getByTestId } = setup();

    fireEvent.press(getByTestId("checkbox-1"));
    expect(mockActions.handleShoppingCheck).toHaveBeenCalledWith("1", true);
  });

  it("toggles edit mode and calls saveQuantityChange on exit", async () => {
    mockCurrentEditing = false;

    const { getByTestId, unmount } = setup();

    fireEvent.press(getByTestId("edit-mode-toggle"));
    expect(mockLists.setFieldState).toHaveBeenCalledWith("isEditing", true);

    mockCurrentEditing = true;

    unmount();
    const { getByTestId: getByTestId2 } = setup();

    fireEvent.press(getByTestId2("edit-mode-done"));
    expect(mockLists.setFieldState).toHaveBeenCalledWith("isEditing", false);
    expect(mockActions.saveQuantityChange).toHaveBeenCalledWith(baseItem);
  });

  it("clears expired items", () => {
    const expiredItem = { ...baseItem, id: "2", name: "milk" };
    const { getByText } = renderWithRedux(
      <ListsComponent
        lists={mockLists}
        actions={mockActions}
        listData={{
          ...mockListData,
          expiredItems: [expiredItem],
        }}
        checkLogin={mockCheckLogin}
      />
    );

    fireEvent.press(getByText("Clear"));
    expect(mockActions.handleClearItems).toHaveBeenCalledWith(
      [expiredItem],
      true
    );
  });

  it("calls handleRemoveItem when trash icon is pressed", () => {
    const { getByTestId } = setup({
      isEditing: true,
    });

    const trashButton = getByTestId("trash-1");
    fireEvent.press(trashButton);
    expect(mockActions.handleRemoveItem).toHaveBeenCalledWith("1");
  });

  it("adds to inventory when Add to Inventory is pressed", () => {
    const { getByText } = renderWithRedux(
      <ListsComponent
        lists={mockLists}
        actions={mockActions}
        listData={{
          ...mockListData,
          checkedItems: [{ ...baseItem, checked: true }],
        }}
        checkLogin={mockCheckLogin}
      />
    );

    fireEvent.press(getByText("Add to Inventory"));
    expect(mockLists.setFieldState).toHaveBeenCalledWith(
      "showInventoryModal",
      true
    );
  });
});
