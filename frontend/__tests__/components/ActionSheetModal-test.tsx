import ActionSheetModal from "@/components/ActionSheetModal";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("ActionSheetModal", () => {
  const options = [
    { label: "Edit", action: jest.fn() },
    { label: "Delete", action: jest.fn(), isDestructive: true },
  ];
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when visible is false", () => {
    const { queryByText } = render(
      <ActionSheetModal visible={false} onClose={onClose} options={options} />
    );
    expect(queryByText("Edit")).toBeNull();
    expect(queryByText("Delete")).toBeNull();
  });

  it("renders options when visible is true", () => {
    const { getByText } = render(
      <ActionSheetModal visible={true} onClose={onClose} options={options} />
    );
    expect(getByText("Edit")).toBeTruthy();
    expect(getByText("Delete")).toBeTruthy();
  });

  it("calls option action and onClose when pressed", () => {
    const { getByText } = render(
      <ActionSheetModal visible={true} onClose={onClose} options={options} />
    );

    fireEvent.press(getByText("Edit"));
    expect(options[0].action).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();

    fireEvent.press(getByText("Delete"));
    expect(options[1].action).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("applies red text color for destructive option", () => {
    const { getByText } = render(
      <ActionSheetModal visible={true} onClose={onClose} options={options} />
    );

    const deleteText = getByText("Delete");
    expect(deleteText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: 16 }),
        expect.objectContaining({ color: "red" }),
      ])
    );
  });
});
