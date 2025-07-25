import SearchComponent from "@/app/search/component";
import { renderWithRedux } from "@/utility/renderWithRedux";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("SearchComponent", () => {
  const baseState: any = {
    allFilteredPosts: [],
    filteredUsers: [],
    recentSearches: [
      "chicken",
      "beef",
      "pasta",
      "dessert",
      "salad",
      "tofu",
      "rice",
      "noodle",
    ],
    searchText: "",
    hasSearched: false,
    expanded: false,
    postLoading: false,
    setFieldState: jest.fn(),
  };

  it("renders recent searches", () => {
    const { getByText } = render(
      <SearchComponent
        search={baseState}
        handleSearch={jest.fn()}
        handleClear={jest.fn()}
        isFromMealPlan={false}
      />
    );
    expect(getByText("Recent Searches")).toBeTruthy();
    expect(getByText("chicken")).toBeTruthy();
  });

  it("shows more when 'Show More' is pressed", () => {
    const setFieldState = jest.fn();
    const { getByText } = render(
      <SearchComponent
        search={{ ...baseState, setFieldState }}
        handleSearch={jest.fn()}
        handleClear={jest.fn()}
        isFromMealPlan={false}
      />
    );
    fireEvent.press(getByText("Show More"));
    expect(setFieldState).toHaveBeenCalledWith("expanded", true);
  });

  it("calls handleSearch when a recent search is tapped", () => {
    const handleSearch = jest.fn();
    const { getByText } = render(
      <SearchComponent
        search={baseState}
        handleSearch={handleSearch}
        handleClear={jest.fn()}
        isFromMealPlan={false}
      />
    );
    fireEvent.press(getByText("chicken"));
    expect(handleSearch).toHaveBeenCalledWith("chicken");
  });

  it("calls handleClear when trash icon is pressed", () => {
    const handleClear = jest.fn();
    const { getByTestId } = render(
      <SearchComponent
        search={baseState}
        handleSearch={jest.fn()}
        handleClear={handleClear}
        isFromMealPlan={false}
      />
    );
    const button = getByTestId("clear-button");
    fireEvent.press(button);
    expect(handleClear).toHaveBeenCalled();
  });

  it("updates searchText on input change", () => {
    const setFieldState = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchComponent
        search={{ ...baseState, setFieldState }}
        handleSearch={jest.fn()}
        handleClear={jest.fn()}
        isFromMealPlan={false}
      />
    );
    fireEvent.changeText(getByPlaceholderText("Search..."), "tofu");
    expect(setFieldState).toHaveBeenCalledWith("searchText", "tofu");
  });

  it("calls handleSearch on input submit", () => {
    const handleSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchComponent
        search={baseState}
        handleSearch={handleSearch}
        handleClear={jest.fn()}
        isFromMealPlan={false}
      />
    );
    fireEvent(getByPlaceholderText("Search..."), "submitEditing");
    expect(handleSearch).toHaveBeenCalled();
  });

  it("renders SearchResultContainer when hasSearched is true", () => {
    const { getByTestId } = renderWithRedux(
      <SearchComponent
        search={{ ...baseState, hasSearched: true }}
        handleSearch={jest.fn()}
        handleClear={jest.fn()}
        isFromMealPlan={false}
      />
    );

    expect(getByTestId("search-result-container")).toBeTruthy();
  });
});
