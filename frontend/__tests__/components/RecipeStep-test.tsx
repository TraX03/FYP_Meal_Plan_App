import RecipeStep from "@/components/RecipeStep";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

jest.mock("@/components/FullscreenImageViewer", () => {
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ imageUri, onClose }: any) =>
      imageUri ? <Text onPress={onClose}>Fullscreen</Text> : null,
  };
});

jest.mock("@/utility/imageUtils", () => ({
  getImageUrl: (path: string) => `https://cdn.example.com/${path}`,
}));

const mockStepWithImage = {
  text: "step 1: chop the onions",
  image: "onions.jpg",
};

const mockStepNoImage = {
  text: "boil the water",
  image: undefined,
};

describe("RecipeStep", () => {
  it("renders step number and formatted text", () => {
    const { getByText } = render(
      <RecipeStep index={0} step={mockStepNoImage} />
    );
    expect(getByText("STEP 1")).toBeTruthy();
    expect(getByText("Boil the water.")).toBeTruthy();
  });

  it("renders image if present", () => {
    const { getByTestId } = render(
      <RecipeStep index={1} step={mockStepWithImage} />
    );
    expect(getByTestId("step-image")).toBeTruthy();
  });

  it("opens fullscreen viewer when image is pressed", () => {
    const { getByText, getByTestId } = render(
      <RecipeStep index={1} step={mockStepWithImage} />
    );
    fireEvent.press(getByTestId("fullscreen-button"));
    expect(getByText("Fullscreen")).toBeTruthy();
  });

  it("closes fullscreen viewer on viewer press", () => {
    const { getByTestId, getByText, queryByText } = render(
      <RecipeStep index={1} step={mockStepWithImage} />
    );
    fireEvent.press(getByTestId("fullscreen-button"));
    fireEvent.press(getByText("Fullscreen"));
    expect(queryByText("Fullscreen")).toBeNull();
  });

  it("handles empty text", () => {
    const { getByText } = render(
      <RecipeStep index={2} step={{ text: "", image: undefined }} />
    );
    expect(getByText("STEP 3")).toBeTruthy();
    expect(getByText("")).toBeTruthy();
  });
});
