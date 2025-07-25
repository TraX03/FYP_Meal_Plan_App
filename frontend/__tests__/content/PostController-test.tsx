import usePostController from "@/app/content/posts/controller";
import * as AppwriteService from "@/services/Appwrite";
import * as imageUtils from "@/utility/imageUtils";
import * as interactionUtils from "@/utility/interactionUtils";
import * as metadataUtils from "@/utility/metadataUtils";
import * as userUtils from "@/utility/userCacheUtils";
import { act, renderHook } from "@testing-library/react-native";
import * as router from "expo-router";
import { Alert } from "react-native";

jest.mock("expo-router");
jest.mock("@/utility/userCacheUtils");
jest.mock("@/utility/interactionUtils");
jest.mock("@/utility/imageUtils");
jest.mock("@/services/Appwrite");
jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
}));
jest.mock("@/utility/metadataUtils", () => ({
  parseMetadata: jest.fn(),
}));

describe("usePostController", () => {
  const mockGetDoc = {
    $id: "post1",
    title: "Post Title",
    content: "Post Content",
    description: "Post Description",
    author_id: "user123",
    image: ["img1", "img2"],
    comments_count: 3,
    $createdAt: "2023-01-01T00:00:00.000Z",
    ingredients: ['{"name":"Egg","quantity":"2"}'],
    instructions: ['{"text":"Boil","image":"img3"}'],
    rating: 4.5,
    rating_count: 20,
    category: ["breakfast"],
    metadata: '{"images":[{"isDark":true}]}',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AppwriteService.getDocumentById as jest.Mock).mockResolvedValue(
      mockGetDoc
    );
    (userUtils.fetchUsers as jest.Mock).mockResolvedValue(
      new Map([["user123", { username: "TestUser" }]])
    );
    (AppwriteService.getCurrentUser as jest.Mock).mockResolvedValue({
      $id: "user123",
    });
    (interactionUtils.getInteractionStatus as jest.Mock).mockReturnValue({
      isLiked: true,
      likeDocId: "like1",
      isBookmarked: false,
    });
    (metadataUtils.parseMetadata as jest.Mock).mockReturnValue({
      images: [{ isDark: true }],
    });
    (imageUtils.getImageUrl as jest.Mock).mockImplementation(
      (id) => `https://cdn/${id}`
    );
    (imageUtils.isValidUrl as jest.Mock).mockImplementation((url) =>
      url.startsWith("http")
    );
  });

  it("loads a recipe post correctly", async () => {
    const { result } = renderHook(() =>
      usePostController("recipe", new Map(), "user123")
    );

    await act(() => result.current.actions.getPost("post1"));

    const postData = result.current.post.postData;

    expect(AppwriteService.getDocumentById).toHaveBeenCalled();
    expect(postData?.title).toBe("Post Title");
    expect(postData?.author).toBe("TestUser");
    expect(postData?.images).toEqual(["https://cdn/img1", "https://cdn/img2"]);

    if (postData && "instructions" in postData) {
      expect(postData.instructions[0].image).toBe("https://cdn/img3");
    } else {
      throw new Error("Expected RecipePost with instructions");
    }

    expect(result.current.post.metadata).toEqual({
      images: [{ isDark: true }],
    });
  });

  it("calls confirmDeletePost and triggers Alert", () => {
    jest.useFakeTimers();

    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        const deleteButton = buttons?.find((b) => b.text === "Delete");
        deleteButton?.onPress?.();
      });

    const { result } = renderHook(() =>
      usePostController("discussion", new Map(), "user123")
    );

    act(() => {
      result.current.post.setFieldState("postData", { id: "post1" } as any);
      result.current.actions.confirmDeletePost();
    });

    jest.runAllTimers();

    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("navigates correctly on handleAuthorPress", () => {
    const push = router.router.push as jest.Mock;
    const { result } = renderHook(() =>
      usePostController("discussion", new Map(), "user123")
    );
    act(() => result.current.handleAuthorPress("user123"));
    expect(push).toHaveBeenCalledWith(expect.anything());

    act(() => result.current.handleAuthorPress("user999"));
    expect(push).toHaveBeenCalledWith({
      pathname: expect.any(String),
      params: { id: "user999" },
    });
  });
});
