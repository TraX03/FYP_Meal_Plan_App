import SearchWithSuggestion from "@/components/SearchWithSuggestions";
import { useSuggestionList } from "@/hooks/useSuggestionList";
import { fetchSuggestions } from "@/services/DatamuseApi";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

jest.mock("@/services/DatamuseApi", () => ({
  fetchSuggestions: jest.fn(),
}));

jest.mock("@/hooks/useSuggestionList", () => ({
  useSuggestionList: jest.fn(),
}));

jest.useFakeTimers();

describe("SearchWithSuggestion", () => {
  const mockOnSelectItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input and mode indicator", () => {
    (useSuggestionList as jest.Mock).mockReturnValue({
      getSuggestions: () => [],
    });

    const { getByPlaceholderText, getByText } = render(
      <SearchWithSuggestion onSelectItem={mockOnSelectItem} />
    );

    expect(getByPlaceholderText("Search item...")).toBeTruthy();
    expect(getByText("Showing custom suggestions.")).toBeTruthy();
  });

  it("updates searchText on input", () => {
    (useSuggestionList as jest.Mock).mockReturnValue({
      getSuggestions: () => [],
    });

    const { getByPlaceholderText } = render(
      <SearchWithSuggestion onSelectItem={mockOnSelectItem} />
    );

    const input = getByPlaceholderText("Search item...");
    fireEvent.changeText(input, "apple");
    expect(input.props.value).toBe("apple");
  });

  it("shows custom suggestions", () => {
    (useSuggestionList as jest.Mock).mockReturnValue({
      getSuggestions: (text: string) =>
        text.startsWith("app") ? ["Apple", "Applesauce"] : [],
    });

    const { getByPlaceholderText, queryByText } = render(
      <SearchWithSuggestion
        onSelectItem={jest.fn()}
        suggestionType="ingredient"
      />
    );

    fireEvent.changeText(getByPlaceholderText("Search item..."), "app");

    expect(queryByText("Apple")).toBeTruthy();
    expect(queryByText("Applesauce")).toBeTruthy();
  });

  it("calls fetchSuggestions and shows datamuse results", async () => {
    (useSuggestionList as jest.Mock).mockReturnValue({
      getSuggestions: () => [],
    });

    (fetchSuggestions as jest.Mock).mockResolvedValue(["fruit", "food"]);

    const { getByPlaceholderText, getByText, getByRole } = render(
      <SearchWithSuggestion
        onSelectItem={mockOnSelectItem}
        mode="datamuse-only"
      />
    );

    const input = getByPlaceholderText("Enter item...");
    fireEvent.changeText(input, "apple");

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(fetchSuggestions).toHaveBeenCalledWith("apple");
      expect(getByText("Fruit")).toBeTruthy();
      expect(getByText("Food")).toBeTruthy();
    });
  });

  it("shows and triggers add button in datamuse-only mode", () => {
    (useSuggestionList as jest.Mock).mockReturnValue({
      getSuggestions: () => [],
    });

    const { getByPlaceholderText, getByTestId } = render(
      <SearchWithSuggestion
        onSelectItem={mockOnSelectItem}
        mode="datamuse-only"
      />
    );

    const input = getByPlaceholderText("Enter item...");
    fireEvent.changeText(input, "apple");

    const button = getByTestId("add-button");
    fireEvent.press(button);

    expect(mockOnSelectItem).toHaveBeenCalledWith("apple");
  });

  it("selects suggestion from list", () => {
    (useSuggestionList as jest.Mock).mockReturnValue({
      getSuggestions: (text: string) =>
        text.startsWith("ba") ? ["Banana", "Barley"] : [],
    });

    const mockOnSelectItem = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <SearchWithSuggestion
        onSelectItem={mockOnSelectItem}
        suggestionType="ingredient"
      />
    );

    fireEvent.changeText(getByPlaceholderText("Search item..."), "ba");

    const item = getByText("Banana");
    fireEvent.press(item);

    expect(mockOnSelectItem).toHaveBeenCalledWith("Banana");
  });

  it("toggles mode and shows add it yourself prompt", () => {
    (useSuggestionList as jest.Mock).mockReturnValue({
      getSuggestions: () => [],
    });

    const { getByText, queryByText, getByPlaceholderText } = render(
      <SearchWithSuggestion onSelectItem={mockOnSelectItem} />
    );

    const changeButton = getByText("Change");
    fireEvent.press(changeButton);

    expect(getByText("Showing dictionary suggestions.")).toBeTruthy();

    fireEvent.press(changeButton);

    fireEvent.changeText(
      getByPlaceholderText(/(Search|Enter) item\.\.\./),
      "something"
    );

    expect(queryByText("Didn't find what you're looking for?")).toBeTruthy();
    expect(getByText("Add it yourself!")).toBeTruthy();
  });
});
