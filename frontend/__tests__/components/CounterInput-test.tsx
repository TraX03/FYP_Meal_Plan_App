import CounterInput from "@/components/CounterInput";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("CounterInput", () => {
  it("renders label and value", () => {
    const { getByText } = render(
      <CounterInput
        label="Quantity"
        value={3}
        onIncrement={jest.fn()}
        onDecrement={jest.fn()}
      />
    );

    expect(getByText("Quantity")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
  });

  it("calls onIncrement when plus button is pressed", () => {
    const onIncrement = jest.fn();
    const { getByTestId } = render(
      <CounterInput
        label="Qty"
        value={1}
        onIncrement={onIncrement}
        onDecrement={jest.fn()}
      />
    );

    fireEvent.press(getByTestId("increment-button"));
    expect(onIncrement).toHaveBeenCalled();
  });

  it("calls onDecrement when minus button is pressed", () => {
    const onDecrement = jest.fn();
    const { getByTestId } = render(
      <CounterInput
        label="Qty"
        value={1}
        onIncrement={jest.fn()}
        onDecrement={onDecrement}
      />
    );

    fireEvent.press(getByTestId("decrement-button"));
    expect(onDecrement).toHaveBeenCalled();
  });
});
