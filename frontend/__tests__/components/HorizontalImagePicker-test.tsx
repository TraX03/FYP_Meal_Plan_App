import HorizontalImagePicker from "@/components/HorizontalImagePicker";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@/hooks/useMediaHandler", () => ({
  useMediaHandler: () => ({
    pickImageFile: jest.fn(() => Promise.resolve({ uri: "mocked-uri" })),
  }),
}));

describe("HorizontalImagePicker", () => {
  it("renders images passed in props", () => {
    const { getByTestId } = render(
      <HorizontalImagePicker images={["uri1", "uri2"]} setImages={jest.fn()} />
    );

    expect(getByTestId("image-0")).toBeTruthy();
    expect(getByTestId("image-1")).toBeTruthy();
  });

  it("calls setImages to remove an image", () => {
    const setImages = jest.fn();
    const { getByTestId } = render(
      <HorizontalImagePicker images={["uri1"]} setImages={setImages} />
    );

    const removeButton = getByTestId("remove-button-0");
    fireEvent.press(removeButton);
    expect(setImages).toHaveBeenCalledWith([]);
  });

  it("calls pickImageFile and adds image", async () => {
    const setImages = jest.fn();
    const { getByTestId } = render(
      <HorizontalImagePicker images={[]} setImages={setImages} />
    );

    const addButton = getByTestId("add-image-button");
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(setImages).toHaveBeenCalledWith(["mocked-uri"]);
    });
  });

  it("hides add button if maxImages reached", () => {
    const { queryByRole } = render(
      <HorizontalImagePicker
        images={["1", "2", "3", "4", "5"]}
        setImages={jest.fn()}
        maxImages={5}
      />
    );

    expect(queryByRole("button")).toBeNull();
  });

  it("only allows 1 image in singleImageMode", () => {
    const { queryByRole } = render(
      <HorizontalImagePicker
        images={["only-one"]}
        setImages={jest.fn()}
        singleImageMode
      />
    );

    expect(queryByRole("button")).toBeNull();
  });
});
