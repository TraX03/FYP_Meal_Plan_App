import CreateFormComponent from "@/app/create/createForm/component";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
}));

jest.mock("@/components/HeaderBar", () => "HeaderBar");
jest.mock("@/components/HorizontalImagePicker", () => "HorizontalImagePicker");
jest.mock("@/components/InputBox", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return (props: any) => (
    <TextInput
      placeholder={props.placeholder}
      value={props.value}
      onChangeText={props.onChangeText}
    />
  );
});
jest.mock("@/components/RadioSelect", () => "RadioSelect");
jest.mock("@/components/ScreenWrapper", () => (props: any) => props.children);
jest.mock("@/hooks/useFieldState", () => ({
  useFieldState: () => ({
    title: "",
    content: "",
    images: [],
    postType: "recipe",
    ingredient: [{ name: "", quantity: "", note: "" }],
    instructions: [{ text: "" }],
    category: [],
    area: "",
    mealtime: [],
    focusedIndex: {},
    keyboardVisible: false,
    setFieldState: jest.fn(),
    setFields: jest.fn(),
  }),
}));

describe("CreateFormComponent (Integration)", () => {
  const mockCreate: any = {
    title: "",
    content: "",
    images: [],
    postType: "recipe",
    ingredient: [{ name: "Salt", quantity: "1 tsp", note: "" }],
    instructions: [{ text: "Mix well" }],
    category: [{ name: "Dinner" }],
    area: "Italian",
    mealtime: [{ name: "Lunch" }],
    focusedIndex: {},
    keyboardVisible: false,
    setFieldState: jest.fn(),
    setFields: jest.fn(),
  };

  const mockController = {
    updateEntry: jest.fn(),
    modifyEntry: jest.fn(),
    selectSuggestion: jest.fn(),
    handleSubmit: jest.fn(),
    updateInstruction: jest.fn(),
    updateInstructionImage: jest.fn(),
    modifyInstruction: jest.fn(),
    isFormValid: true,
  };

  it("renders the recipe form and submits with valid data", async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <CreateFormComponent create={mockCreate} controller={mockController} />
    );

    const titleInput = getByPlaceholderText("Enter post title");
    const contentInput = getByPlaceholderText(
      "Add a short description of your recipe"
    );

    fireEvent.changeText(titleInput, "My New Recipe");
    fireEvent.changeText(contentInput, "This is a test recipe");

    expect(mockCreate.setFieldState).toHaveBeenCalledWith(
      "title",
      "My New Recipe"
    );
    expect(mockCreate.setFieldState).toHaveBeenCalledWith(
      "content",
      "This is a test recipe"
    );

    const submitBtn = getByTestId("submit-button");
    expect(submitBtn).toBeTruthy();

    fireEvent.press(submitBtn);
    expect(mockController.handleSubmit).toHaveBeenCalled();
  });

  it("renders the tips form and submits with valid data", async () => {
    const tipsCreate = {
      ...mockCreate,
      postType: "tips",
    };

    const { getByPlaceholderText, getByTestId } = render(
      <CreateFormComponent create={tipsCreate} controller={mockController} />
    );

    const titleInput = getByPlaceholderText("Enter post title");
    const contentInput = getByPlaceholderText(
      "Share your thoughts or ask a question"
    );

    fireEvent.changeText(titleInput, "Quick Cooking Tip");
    fireEvent.changeText(contentInput, "Use cold butter for flakier biscuits");

    const submitBtn = getByTestId("submit-button");
    fireEvent.press(submitBtn);

    expect(mockController.handleSubmit).toHaveBeenCalled();
  });

  it("renders the community post form and submits successfully", async () => {
    const communityCreate = {
      ...mockCreate,
      postType: "community",
    };

    const { getByPlaceholderText, getByTestId } = render(
      <CreateFormComponent
        create={communityCreate}
        controller={mockController}
      />
    );

    fireEvent.changeText(
      getByPlaceholderText("Enter community name"),
      "Fermentation Fans"
    );

    fireEvent.changeText(
      getByPlaceholderText("Briefly introduce your community"),
      "A group for sharing tips and recipes on fermentation"
    );

    const submitBtn = getByTestId("submit-button");
    fireEvent.press(submitBtn);

    expect(mockController.handleSubmit).toHaveBeenCalled();
  });

  it("disables submit button when form is invalid", () => {
    const controllerWithInvalidForm = { ...mockController, isFormValid: false };
    const { getByTestId } = render(
      <CreateFormComponent
        create={mockCreate}
        controller={controllerWithInvalidForm}
      />
    );

    const submitBtn = getByTestId("submit-button");
    expect(submitBtn.props.accessibilityState.disabled).toBe(true);
  });
});
