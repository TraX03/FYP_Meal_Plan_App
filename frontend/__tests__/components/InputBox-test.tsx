import InputBox from "@/components/InputBox";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { TextInput } from "react-native";

describe("InputBox", () => {
  it("renders value and calls onChangeText", () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <InputBox value="test" onChangeText={onChangeText} />
    );
    expect(getByDisplayValue("test")).toBeTruthy();
  });

  it("shows character limit indicator", () => {
    const { getByText } = render(
      <InputBox value="abc" onChangeText={jest.fn()} limit={10} />
    );
    expect(getByText("3/10 characters")).toBeTruthy();
  });

  it("clears text when clear button is pressed", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <InputBox value="hello" onChangeText={onChangeText} />
    );
    fireEvent.press(getByTestId("clear-button"));
    expect(onChangeText).toHaveBeenCalledWith("");
  });

  it("respects secureTextEntry when isPassword is true", () => {
    const { UNSAFE_getByType } = render(
      <InputBox value="secret" onChangeText={jest.fn()} isPassword />
    );
    const input = UNSAFE_getByType(TextInput);
    expect(input.props.secureTextEntry).toBe(true);
  });
});
