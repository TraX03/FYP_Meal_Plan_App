import useSearchController from "@/app/search/controller";
import { useFieldState } from "@/hooks/useFieldState";
import * as fetchUtils from "@/utility/fetchUtils";
import * as searchUtils from "@/utility/searchStorageUtils";
import { act, renderHook } from "@testing-library/react-native";

jest.mock("@/hooks/useFieldState");
jest.mock("@/utility/fetchUtils");
jest.mock("@/utility/searchStorageUtils");

describe("useSearchController", () => {
  const mockSetFieldState = jest.fn();
  const mockSetFields = jest.fn();
  const mockGetFieldState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useFieldState as jest.Mock).mockReturnValue({
      posts: [],
      users: [],
      searchText: "",
      isInitialized: false,
      setFieldState: mockSetFieldState,
      setFields: mockSetFields,
      getFieldState: mockGetFieldState,
    });

    (fetchUtils.fetchPosts as jest.Mock).mockResolvedValue([
      { title: "Mock Post" },
    ]);
    (fetchUtils.fetchUserList as jest.Mock).mockResolvedValue([
      { name: "Mock User" },
    ]);
    (searchUtils.getRecentSearches as jest.Mock).mockResolvedValue(["prev"]);
    (searchUtils.addRecentSearch as jest.Mock).mockResolvedValue(undefined);
    (searchUtils.clearRecentSearches as jest.Mock).mockResolvedValue(undefined);
  });

  it("initializes search state", async () => {
    const { result } = renderHook(() => useSearchController());

    await act(async () => {
      await result.current.init();
    });

    expect(fetchUtils.fetchPosts).toHaveBeenCalled();
    expect(fetchUtils.fetchUserList).toHaveBeenCalled();
    expect(mockSetFields).toHaveBeenCalledWith(
      expect.objectContaining({
        posts: expect.any(Array),
        users: expect.any(Array),
      })
    );
  });

  it("handles clear search", async () => {
    const { result } = renderHook(() => useSearchController());

    await act(async () => {
      await result.current.handleClear();
    });

    expect(searchUtils.clearRecentSearches).toHaveBeenCalled();
    expect(mockSetFieldState).toHaveBeenCalledWith("recentSearches", []);
  });

  it("does not search on empty input", async () => {
    const { result } = renderHook(() => useSearchController());

    await act(async () => {
      await result.current.handleSearch("");
    });

    expect(fetchUtils.fetchPosts).not.toHaveBeenCalled();
  });
});
