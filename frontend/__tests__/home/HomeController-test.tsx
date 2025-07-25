import useHomeController, { SUGGESTIONS } from "@/app/home/controller";
import { Post } from "@/components/PostCard";
import * as AppwriteService from "@/services/Appwrite";
import * as fetchUtils from "@/utility/fetchUtils";
import { act, renderHook } from "@testing-library/react-native";
import { testPost } from "../fixtures";

const mockUser = { $id: "user123" };
const mockPosts: Post[] = [
  {
    ...testPost,
    id: "post-1",
    type: "recipe",
    authorId: "userA",
    created_at: "2024-01-01",
  },
  {
    ...testPost,
    id: "post-2",
    type: "tips",
    authorId: "userB",
    created_at: "2024-01-02",
  },
];

let mockInitialState = {
  activeTab: "Explore",
  activeSuggestion: "Recipe",
  posts: [],
  refreshing: false,
  hasLoadedOnce: false,
};

jest.mock("@/hooks/useFieldState", () => {
  const React = require("react");
  return {
    useFieldState: () => {
      const [state, setState] = React.useState(mockInitialState);

      return {
        ...state,
        getFieldState: (key: keyof typeof state) => state[key],
        setFieldState: jest.fn((key, value) =>
          setState((prev: any) => ({ ...prev, [key]: value }))
        ),
        setFields: jest.fn((fields) =>
          setState((prev: any) => ({ ...prev, ...fields }))
        ),
      };
    },
  };
});

jest.mock("@/services/Appwrite");
jest.mock("@/services/FastApi");
jest.mock("@/utility/fetchUtils");

describe("useHomeController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitialState = {
      activeTab: "Explore",
      activeSuggestion: "Recipe",
      posts: [],
      refreshing: false,
      hasLoadedOnce: true,
    };
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useHomeController());

    expect(result.current.suggestions).toEqual(SUGGESTIONS);
    expect(result.current.filteredPosts).toEqual([]);
    expect(result.current.refreshing).toBe(false);
  });

  it("should refresh posts for Explore tab with user logged in", async () => {
    (AppwriteService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (fetchUtils.fetchHomeFeedPosts as jest.Mock).mockResolvedValue(mockPosts);

    const { result } = renderHook(() => useHomeController());

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(AppwriteService.getCurrentUser).toHaveBeenCalled();
    expect(fetchUtils.fetchHomeFeedPosts).toHaveBeenCalledWith("user123");
    expect(result.current.filteredPosts).toEqual([mockPosts[0]]);
  });

  it("should refresh posts for Follow tab with followed users", async () => {
    mockInitialState = {
      activeTab: "Follow",
      activeSuggestion: "Recipe",
      posts: [],
      refreshing: false,
      hasLoadedOnce: true,
    };

    const followedInteractions = [{ item_id: "userA" }, { item_id: "userC" }];

    const followedPosts: Post[] = [
      {
        id: "1",
        type: "recipe",
        authorId: "userA",
        created_at: "2024-01-01",
      } as Post,
      {
        id: "2",
        type: "recipe",
        authorId: "userC",
        created_at: "2024-01-03",
      } as Post,
    ];

    (AppwriteService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (AppwriteService.fetchAllDocuments as jest.Mock).mockResolvedValue(
      followedInteractions
    );
    (fetchUtils.fetchPosts as jest.Mock).mockResolvedValue(followedPosts);

    const { result } = renderHook(() => useHomeController());

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(AppwriteService.fetchAllDocuments).toHaveBeenCalled();
    expect(fetchUtils.fetchPosts).toHaveBeenCalledWith(false, false);
    expect(result.current.filteredPosts).toEqual([
      followedPosts[1],
      followedPosts[0],
    ]);
  });
});
