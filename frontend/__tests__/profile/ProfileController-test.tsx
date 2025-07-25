import useProfileController from "@/app/profile/controller";
import * as AppwriteService from "@/services/Appwrite";
import * as imageUtils from "@/utility/imageUtils";
import * as metadataUtils from "@/utility/metadataUtils";
import * as userUtils from "@/utility/userCacheUtils";
import { act, renderHook } from "@testing-library/react-native";

jest.mock("@/services/Appwrite");
jest.mock("@/utility/imageUtils");
jest.mock("@/utility/userCacheUtils");
jest.mock("@/utility/metadataUtils");

const mockRecipes = [{ $id: "r1", author_id: "user1", image: ["img1"] }];
const mockPosts = [{ $id: "p1", author_id: "user1", image: ["img2"] }];
const mockInteractions = [
  { type: "like", item_id: "r1" },
  { type: "bookmark", item_id: "p1" },
];

const mockAuthors = new Map([
  ["user1", { username: "testuser", avatarUrl: "url" }],
]);

const mockGetImageUrl = (img: string) => `url/${img}`;
const mockMetadata = { profileBg: { isDark: true } };

describe("useProfileController", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (AppwriteService.fetchAllDocuments as jest.Mock)
      .mockResolvedValueOnce(mockRecipes)
      .mockResolvedValueOnce(mockPosts)
      .mockResolvedValueOnce(mockInteractions);

    (AppwriteService.fetchDocumentsByIds as jest.Mock).mockImplementation(
      (_collectionId, ids: string[]) => {
        const all = [...mockRecipes, ...mockPosts];
        return Promise.resolve(all.filter((doc) => ids.includes(doc.$id)));
      }
    );

    (userUtils.fetchUsers as jest.Mock).mockResolvedValue(mockAuthors);
    (imageUtils.getImageUrl as jest.Mock).mockImplementation(mockGetImageUrl);
    (metadataUtils.parseMetadata as jest.Mock).mockReturnValue(mockMetadata);
  });

  it("returns initial state", () => {
    const { result } = renderHook(() => useProfileController());
    const {
      activeTab,
      posts,
      likedPosts,
      bookmarkedPosts,
      subTab,
      postLoading,
      viewedProfileData,
    } = result.current.profile;

    expect({
      activeTab,
      posts,
      likedPosts,
      bookmarkedPosts,
      subTab,
      postLoading,
      viewedProfileData,
    }).toEqual({
      activeTab: "Posts",
      posts: [],
      likedPosts: [],
      bookmarkedPosts: [],
      subTab: "Recipe",
      postLoading: false,
      viewedProfileData: null,
    });
  });

  it("parses isBackgroundDark from metadata", () => {
    const { result } = renderHook(() => useProfileController());
    act(() => {
      result.current.profile.setFieldState("viewedProfileData", {
        metadata: {},
      } as any);
    });
    expect(result.current.isBackgroundDark).toBe(true);
  });

  it("fetches and sets posts, likedPosts, and bookmarkedPosts", async () => {
    const { result } = renderHook(() => useProfileController());

    await act(async () => {
      await result.current.fetchPostsByUser("user1");
    });

    const state = result.current.profile;
    expect(state.postLoading).toBe(false);
    expect(state.posts).toHaveLength(2);
    expect(state.likedPosts[0]).toMatchObject({
      id: "r1",
      authorInfo: {
        username: "testuser",
        avatarUrl: "url",
      },
    });
    expect(state.bookmarkedPosts[0]).toMatchObject({
      id: "p1",
      authorInfo: {
        username: "testuser",
        avatarUrl: "url",
      },
    });
  });

  it("handles error and resets loading state", async () => {
    (AppwriteService.fetchAllDocuments as jest.Mock).mockRejectedValueOnce(
      new Error("fail")
    );

    const { result } = renderHook(() => useProfileController());

    await act(async () => {
      await result.current.fetchPostsByUser("user1");
    });

    expect(result.current.profile.postLoading).toBe(false);
  });
});
