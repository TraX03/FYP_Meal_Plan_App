import CreateFormComponent from "@/app/create/createForm/component";
import { fireEvent, render } from "@testing-library/react-native";

const baseCreate: any = {
  postType: "recipe",
  title: "",
  content: "",
  images: [],
  instructions: [],
  ingredient: [],
  category: [],
  area: [],
  mealtime: [],
  focusedIndexts: {
    ingredient: null,
    category: null,
    area: null,
  },
  keyboardVisible: false,
  setFieldState: jest.fn(),
  setFields: jest.fn(),
  getFieldState: jest.fn(),
};

const baseController = {
  updateEntry: jest.fn(),
  modifyEntry: jest.fn(),
  selectSuggestion: jest.fn(),
  updateInstruction: jest.fn(),
  updateInstructionImage: jest.fn(),
  modifyInstruction: jest.fn(),
  handleSubmit: jest.fn(),
  isFormValid: true,
};

jest.mock("@/components/HorizontalImagePicker", () => () => null);
jest.mock(
  "@/app/create/createForm/instructionForm/container",
  () => () => null
);

jest.mock("@/app/create/createForm/entryListForm/container", () => {
  const { Text, View } = require("react-native");
  return ({ label, placeholder }: { label: string; placeholder?: string }) => (
    <View>
      <Text>{label}</Text>
      {placeholder && <Text>{placeholder}</Text>}
    </View>
  );
});

describe("CreateFormComponent", () => {
  it("renders recipe-specific sections", () => {
    const { getByText, getByPlaceholderText } = render(
      <CreateFormComponent create={baseCreate} controller={baseController} />
    );

    expect(getByText("Create New Recipe")).toBeTruthy();
    expect(getByText("Ingredients")).toBeTruthy();
    +expect(getByText("Select mealtime")).toBeTruthy();
    expect(
      getByPlaceholderText("Add a short description of your recipe")
    ).toBeTruthy();
  });

  it("renders community-specific fields", () => {
    const create = { ...baseCreate, postType: "community" };
    const { getByText, getByPlaceholderText } = render(
      <CreateFormComponent create={create} controller={baseController} />
    );

    expect(getByText("Create New Community")).toBeTruthy();
    expect(getByPlaceholderText("Enter community name")).toBeTruthy();
    expect(
      getByPlaceholderText("Briefly introduce your community")
    ).toBeTruthy();
  });

  it("disables submit when form is invalid", () => {
    const controller = { ...baseController, isFormValid: false };
    const { getByTestId } = render(
      <CreateFormComponent create={baseCreate} controller={controller} />
    );

    const button = getByTestId("submit-button");
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it("calls setFieldState on text input", () => {
    const create = { ...baseCreate, setFieldState: jest.fn() };
    const { getByPlaceholderText } = render(
      <CreateFormComponent create={create} controller={baseController} />
    );

    const input = getByPlaceholderText("Enter post title");
    fireEvent.changeText(input, "My Recipe");

    expect(create.setFieldState).toHaveBeenCalledWith("title", "My Recipe");
  });
});
