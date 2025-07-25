import PostComponent from "@/app/content/posts/component";
import { PostData } from "@/app/content/posts/controller";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router");
jest.mock("react-native-safe-area-context");
jest.mock("@/hooks/useInteraction", () => ({
  useInteraction: jest.fn(() => ({
    isLiked: false,
    isBookmarked: false,
    toggleLike: jest.fn(),
    toggleBookmark: jest.fn(),
  })),
}));

jest.mock("@/components/FullscreenImageViewer", () => () => null);
jest.mock("@/components/ActionSheetModal", () => () => null);
jest.mock("@/components/BottomSheetModal", () => () => null);
jest.mock("../../app/content/posts/recipe/container", () => () => null);
jest.mock("../../app/content/posts/forum/container", () => () => null);
jest.mock(
  "../../app/content/posts/recipe/ratingModal/container",
  () => () => null
);

const mockDeletePost = jest.fn();
const mockGetPost = jest.fn();
const mockHandleAuthorPress = jest.fn();

const completePostData: PostData = {
  id: "post1",
  title: "Test Post Title",
  author: "John Doe",
  authorId: "author1",
  images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  commentsCount: 5,
  description: "This is a test description",
  createdAt: "2023-07-15T12:00:00Z",
  likesCount: 10,
  bookmarksCount: 3,
};

const useFieldStateMock = {
  postData: completePostData,
  showStepsModal: false,
  showRatingModal: false,
  fullscreenImage: null,
  imageIndex: 0,
  showModal: false,
  metadata: { images: [{ isDark: false }, { isDark: true }] },
  setFieldState: jest.fn(),
  setFields: jest.fn(),
  getFieldState: jest.fn(),
  keyboardVisible: false,
  interactionState: {
    isLiked: false,
    isBookmarked: false,
  },
};

describe("PostComponent", () => {
  it("renders without crashing and displays post title and author", () => {
    const { getByText } = render(
      <PostComponent
        post={{ ...useFieldStateMock }}
        actions={{
          getPost: mockGetPost,
          confirmDeletePost: mockDeletePost,
        }}
        postType="tips"
        handleAuthorPress={mockHandleAuthorPress}
        addRecipeToMealPlan={undefined}
        assignToCommunity={undefined}
        currentUserId="user123"
      />
    );

    expect(getByText("Test Post Title")).toBeTruthy();
    expect(getByText("by John Doe")).toBeTruthy();
  });

  it("calls handleAuthorPress when author name pressed", () => {
    const { getByText } = render(
      <PostComponent
        post={{ ...useFieldStateMock }}
        actions={{
          getPost: mockGetPost,
          confirmDeletePost: mockDeletePost,
        }}
        postType="tips"
        handleAuthorPress={mockHandleAuthorPress}
        addRecipeToMealPlan={undefined}
        assignToCommunity={undefined}
        currentUserId="user123"
      />
    );

    fireEvent.press(getByText("John Doe"));
    expect(mockHandleAuthorPress).toHaveBeenCalledWith("author1");
  });

  it("toggles like and bookmark when pressed", () => {
    const toggleLike = jest.fn();
    const toggleBookmark = jest.fn();
    jest
      .mocked(require("@/hooks/useInteraction").useInteraction)
      .mockReturnValue({
        isLiked: false,
        isBookmarked: false,
        toggleLike,
        toggleBookmark,
      });

    const {
      getByTestId,
      getByRole,
      getAllByRole,
      getByText,
      getByTestId: _getByTestId,
    } = render(
      <PostComponent
        post={{ ...useFieldStateMock }}
        actions={{
          getPost: mockGetPost,
          confirmDeletePost: mockDeletePost,
        }}
        postType="tips"
        handleAuthorPress={mockHandleAuthorPress}
        addRecipeToMealPlan={undefined}
        assignToCommunity={undefined}
        currentUserId="user123"
      />
    );
  });

  it("renders error screen if postData is null", () => {
    const { getByText } = render(
      <PostComponent
        post={{ ...useFieldStateMock, postData: null }}
        actions={{
          getPost: mockGetPost,
          confirmDeletePost: mockDeletePost,
        }}
        postType="tips"
        handleAuthorPress={mockHandleAuthorPress}
        addRecipeToMealPlan={undefined}
        assignToCommunity={undefined}
        currentUserId="user123"
      />
    );

    expect(getByText("Post not found or invalid.")).toBeTruthy();
  });
});
