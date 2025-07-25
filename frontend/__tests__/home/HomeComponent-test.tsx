import HomeComponent, { Props } from "@/app/home/component";
import { HomeState } from "@/app/home/controller";
import { renderWithRedux } from "@/utility/renderWithRedux";
import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { testPost } from "../fixtures";

jest.mock("expo-router");

const mockHome: HomeState & {
  setFieldState: <K extends keyof HomeState>(
    field: K,
    value: HomeState[K]
  ) => void;
  setFields: (fields: Partial<HomeState>) => void;
  getFieldState: <K extends keyof HomeState>(field: K) => HomeState[K];
} = {
  activeTab: "Explore",
  activeSuggestion: "Recipe",
  posts: [],
  refreshing: false,
  hasLoadedOnce: true,
  setFieldState: jest.fn(),
  setFields: jest.fn(),
  getFieldState: jest.fn(),
};

const mockProps: Props = {
  suggestions: ["Recipe", "Communities"],
  filteredPosts: [],
  refreshing: false,
  interactionVersion: 1,
  onRefresh: jest.fn().mockResolvedValue(undefined),
  home: mockHome,
};

describe("<HomeComponent />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (props = mockProps) =>
    renderWithRedux(<HomeComponent {...props} />);

  it("renders Follow and Explore tabs", () => {
    const { getByText } = renderWithProvider();
    expect(getByText("Follow")).toBeTruthy();
    expect(getByText("Explore")).toBeTruthy();
  });

  it("renders all suggestions as pressables", () => {
    const { getByText } = renderWithProvider();
    expect(getByText("Recipe")).toBeTruthy();
    expect(getByText("Communities")).toBeTruthy();
  });

  it("calls setFieldState when suggestion is pressed", () => {
    const { getByText } = renderWithProvider();
    fireEvent.press(getByText("Communities"));
    expect(mockHome.setFieldState).toHaveBeenCalledWith(
      "activeSuggestion",
      "Communities"
    );
  });

  it("calls setFieldState when tab is pressed", () => {
    const { getByText } = renderWithProvider();
    fireEvent.press(getByText("Follow"));
    expect(mockHome.setFieldState).toHaveBeenCalledWith("activeTab", "Follow");
  });

  it("renders empty message when filteredPosts is empty and Communities is active", () => {
    const modifiedProps = {
      ...mockProps,
      home: {
        ...mockHome,
        activeSuggestion: "Communities",
      },
    };

    const { getByText } = renderWithProvider(modifiedProps);
    expect(getByText("Nothing to show here")).toBeTruthy();
  });

  it("navigates to Search screen when search icon is pressed", () => {
    const { getByTestId } = renderWithProvider();
    fireEvent.press(getByTestId("search-icon"));
    const { router } = require("expo-router");
    expect(router.push).toHaveBeenCalledWith("/search/container");
  });

  it("renders PostCard when filteredPosts contains data and Communities is active", () => {
    const modifiedProps: Props = {
      ...mockProps,
      filteredPosts: [testPost],
      home: {
        ...mockHome,
        activeSuggestion: "Communities",
      },
    };

    const { getByText } = renderWithProvider(modifiedProps);
    expect(getByText("Test Title")).toBeTruthy();
  });

  it("calls onRefresh when pull-to-refresh is triggered", () => {
    const modifiedProps = {
      ...mockProps,
      home: {
        ...mockHome,
        activeSuggestion: "Communities",
      },
    };

    const { UNSAFE_getByType } = renderWithProvider(modifiedProps);

    const refreshControl = UNSAFE_getByType(
      require("react-native").RefreshControl
    );
    refreshControl.props.onRefresh();
    expect(modifiedProps.onRefresh).toHaveBeenCalled();
  });
});
