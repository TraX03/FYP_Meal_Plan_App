import CustomPicker from "@/components/CustomPicker";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("CustomPicker", () => {
  const options = ["kg", "g", "lb"];

  it("renders placeholder when no value is selected", () => {
    const { getByText } = render(
      <CustomPicker
        selectedValue=""
        onValueChange={jest.fn()}
        options={options}
      />
    );
    expect(getByText("Unit")).toBeTruthy();
  });

  it("renders selected value when present", () => {
    const { getByText } = render(
      <CustomPicker
        selectedValue="kg"
        onValueChange={jest.fn()}
        options={options}
      />
    );
    expect(getByText("kg")).toBeTruthy();
  });

  it("opens modal and shows options on press", () => {
    const { getByText, queryByText } = render(
      <CustomPicker
        selectedValue=""
        onValueChange={jest.fn()}
        options={options}
      />
    );
    fireEvent.press(getByText("Unit"));
    expect(queryByText("kg")).toBeTruthy();
    expect(queryByText("g")).toBeTruthy();
  });

  it("calls onValueChange and closes modal on option select", () => {
    const onValueChange = jest.fn();
    const { getByText } = render(
      <CustomPicker
        selectedValue=""
        onValueChange={onValueChange}
        options={["kg", "g"]}
      />
    );

    fireEvent.press(getByText("Unit"));
    fireEvent.press(getByText("kg"));

    expect(onValueChange).toHaveBeenCalledWith("kg");
  });

  it("includes empty option if includeEmptyOption is true", () => {
    const { getAllByText, getByText } = render(
      <CustomPicker
        selectedValue=""
        onValueChange={jest.fn()}
        options={options}
        includeEmptyOption={true}
      />
    );
    fireEvent.press(getByText("Unit"));

    expect(getAllByText("Unit").length).toBeGreaterThan(1);
  });
});
