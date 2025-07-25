import BottomSheetModal from "@/components/BottomSheetModal";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Animated } from "react-native";

jest.useFakeTimers();

describe("BottomSheetModal", () => {
  const mockOptions = [
    { key: "edit", label: "Edit", onPress: jest.fn() },
    { key: "delete", label: "Delete", onPress: jest.fn() },
  ];

  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when isVisible is false", () => {
    const { queryByText } = render(
      <BottomSheetModal
        isVisible={false}
        onClose={onClose}
        options={mockOptions}
      />
    );
    expect(queryByText("Edit")).toBeNull();
    expect(queryByText("Delete")).toBeNull();
  });

  it("renders modal and options when isVisible is true", () => {
    const { getByText } = render(
      <BottomSheetModal
        isVisible={true}
        onClose={onClose}
        options={mockOptions}
      />
    );
    expect(getByText("Edit")).toBeTruthy();
    expect(getByText("Delete")).toBeTruthy();
  });

  it("pressing option hides modal and calls action after delay", () => {
    const { getByText } = render(
      <BottomSheetModal
        isVisible={true}
        onClose={onClose}
        options={mockOptions}
      />
    );

    fireEvent.press(getByText("Edit"));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(mockOptions[0].onPress).toHaveBeenCalled();
  });

  it("renders children instead of options if children are provided", () => {
    const { getByText, queryByText } = render(
      <BottomSheetModal isVisible={true} onClose={onClose}>
        <Animated.Text>Custom Content</Animated.Text>
      </BottomSheetModal>
    );
    expect(getByText("Custom Content")).toBeTruthy();
    expect(queryByText("Edit")).toBeNull();
  });
});
