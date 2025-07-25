import EntryListFormComponent from "@/app/create/createForm/entryListForm/component";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("EntryListFormComponent", () => {
  const baseCreate: any = {
    focusedIndex: {},
    setFieldState: jest.fn(),
    area: "",
    ingredient: [
      { name: "Salt", quantity: "1 tsp", note: "fine" },
      { name: "Pepper", quantity: "1/2 tsp", note: "" },
    ],
    category: [],
    mealtime: [],
  };

  const baseController: any = {
    modifyEntry: jest.fn(),
    selectSuggestion: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders entries and 'Clear All' button correctly", () => {
    const { getByText, getByDisplayValue } = render(
      <EntryListFormComponent
        type="ingredient"
        create={baseCreate}
        controller={baseController}
        placeholder="Enter ingredient"
        label="Ingredients"
        getSuggestions={() => []}
        handleFocus={() => {}}
        handleChange={() => {}}
      />
    );

    expect(getByText("Clear All")).toBeTruthy();
    expect(getByText("+ Add ingredient")).toBeTruthy();
    expect(getByDisplayValue("Salt")).toBeTruthy();
    expect(getByDisplayValue("Pepper")).toBeTruthy();
  });

  it("calls setFieldState with empty array when Clear All clicked", () => {
    const { getByText } = render(
      <EntryListFormComponent
        type="ingredient"
        create={baseCreate}
        controller={baseController}
        placeholder="Enter ingredient"
        label="Ingredients"
        getSuggestions={() => []}
        handleFocus={() => {}}
        handleChange={() => {}}
      />
    );

    fireEvent.press(getByText("Clear All"));
    expect(baseCreate.setFieldState).toHaveBeenCalledWith("ingredient", []);
  });

  it("calls controller.modifyEntry when Add button pressed", () => {
    const { getByText } = render(
      <EntryListFormComponent
        type="ingredient"
        create={baseCreate}
        controller={baseController}
        placeholder="Enter ingredient"
        label="Ingredients"
        getSuggestions={() => []}
        handleFocus={() => {}}
        handleChange={() => {}}
      />
    );

    fireEvent.press(getByText("+ Add ingredient"));
    expect(baseController.modifyEntry).toHaveBeenCalledWith(
      "ingredient",
      "add"
    );
  });

  it("calls controller.modifyEntry when Remove icon pressed", () => {
    const { getByTestId } = render(
      <EntryListFormComponent
        type="ingredient"
        create={baseCreate}
        controller={baseController}
        placeholder="Enter ingredient"
        label="Ingredients"
        getSuggestions={() => []}
        handleFocus={() => {}}
        handleChange={() => {}}
      />
    );

    const removeButton = getByTestId("remove-button-1");
    fireEvent.press(removeButton);
    expect(baseController.modifyEntry).toHaveBeenCalledWith(
      "ingredient",
      "remove",
      1
    );
  });

  it("renders suggestions when focused and calls selectSuggestion on press", () => {
    const create = {
      ...baseCreate,
      focusedIndex: { ingredient: 0 },
    };
    const getSuggestions = jest.fn(() => ["Sug1", "Sug2"]);

    const { getByText } = render(
      <EntryListFormComponent
        type="ingredient"
        create={create}
        controller={baseController}
        placeholder="Enter ingredient"
        label="Ingredients"
        getSuggestions={getSuggestions}
        handleFocus={() => {}}
        handleChange={() => {}}
      />
    );

    expect(getByText("Sug1")).toBeTruthy();
    expect(getByText("Sug2")).toBeTruthy();

    fireEvent.press(getByText("Sug1"));
    expect(baseController.selectSuggestion).toHaveBeenCalledWith(
      "ingredient",
      0,
      "Sug1"
    );
  });

  it("calls handleChange on text input change", () => {
    const handleChange = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <EntryListFormComponent
        type="ingredient"
        create={baseCreate}
        controller={baseController}
        placeholder="Enter ingredient"
        label="Ingredients"
        getSuggestions={() => []}
        handleFocus={() => {}}
        handleChange={handleChange}
      />
    );

    const nameInput = getByTestId("name-input-0");
    fireEvent.changeText(nameInput, "New Ingredient");
    expect(handleChange).toHaveBeenCalledWith(0, "name", "New Ingredient");

    const quantityInput = getByTestId("ingredient-quantity-input-0");
    fireEvent.changeText(quantityInput, "2 cups");
    expect(handleChange).toHaveBeenCalledWith(0, "quantity", "2 cups");

    const noteInput = getByTestId("ingredient-note-input-0");
    fireEvent.changeText(noteInput, "Fresh");
    expect(handleChange).toHaveBeenCalledWith(0, "note", "Fresh");
  });

  it("renders CustomPicker for mealtime type and handles selection", () => {
    const create = {
      ...baseCreate,
      mealtime: [{ name: "Lunch" }],
      focusedIndex: { mealtime: 0 },
      setFieldState: jest.fn(),
    };
    const handleChange = jest.fn();

    const { getByText } = render(
      <EntryListFormComponent
        type="mealtime"
        create={create}
        controller={baseController}
        placeholder="Select mealtime"
        label="Mealtime"
        getSuggestions={() => []}
        handleFocus={() => {}}
        handleChange={handleChange}
      />
    );

    expect(getByText("Lunch")).toBeTruthy();
  });

  it("renders 'Clear All' button for single entry (area) and clears on press", () => {
    const create = {
      ...baseCreate,
      area: "Asia",
      focusedIndex: {},
      setFieldState: jest.fn(),
    };

    const { getByText } = render(
      <EntryListFormComponent
        type="area"
        create={create}
        controller={baseController}
        placeholder="Enter area"
        label="Area"
        getSuggestions={() => []}
        handleFocus={() => {}}
        handleChange={() => {}}
      />
    );

    expect(getByText("Area")).toBeTruthy();
    expect(getByText("Clear All")).toBeTruthy();

    fireEvent.press(getByText("Clear All"));
    expect(create.setFieldState).toHaveBeenCalledWith("area", "");
  });
});
