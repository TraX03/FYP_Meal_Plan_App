import ProfileComponent from "@/app/profile/component";
import { renderWithRedux } from "@/utility/renderWithRedux";
import { fireEvent } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router");
jest.mock("@/components/ErrorScreen", () => "ErrorScreen");
jest.mock("@/components/MasonryList", () => "MasonryList");
jest.mock("@/components/ScreenWrapper", () => "ScreenWrapper");

const mockProps: any = {
  profileData: {
    id: "user-1",
    username: "testuser",
    avatarUrl: "https://example.com/avatar.png",
    followersCount: 12,
    followingCount: 5,
    profileBg: "https://example.com/bg.png",
    bio: "Test bio",
  },
  isLoading: false,
  isLoggedIn: true,
  checkLogin: jest.fn(),
  profile: {
    activeTab: "Posts",
    posts: [
      {
        id: "post-1",
        type: "recipe",
        created_at: "2025-01-01T00:00:00Z",
      },
    ],
    likedPosts: [],
    bookmarkedPosts: [],
    subTab: "Recipe",
    setFieldState: jest.fn(),
    postLoading: false,
  },
  isOwnProfile: true,
  isBackgroundDark: false,
  interactionData: {
    interactionRecords: {},
    interactionVersion: 1,
  },
  fetchPostsByUser: jest.fn(),
};

describe("ProfileComponent", () => {
  it("renders correctly when profileData is present", () => {
    const { getByText } = renderWithRedux(<ProfileComponent {...mockProps} />);
    expect(getByText("testuser")).toBeTruthy();
    expect(getByText("12 Followers | 5 Following")).toBeTruthy();
    expect(getByText("Test bio")).toBeTruthy();
  });

  it("calls checkLogin when edit button is pressed", () => {
    const { getByTestId } = renderWithRedux(
      <ProfileComponent {...mockProps} />
    );
    fireEvent.press(getByTestId("edit-button"));
    expect(mockProps.checkLogin).toHaveBeenCalled();
  });

  it("renders tab headers and triggers setFieldState on tab press", () => {
    const { getByText } = renderWithRedux(<ProfileComponent {...mockProps} />);
    fireEvent.press(getByText("Likes"));
    expect(mockProps.profile.setFieldState).toHaveBeenCalledWith(
      "activeTab",
      "Likes"
    );
    fireEvent.press(getByText("Discussion"));
    expect(mockProps.profile.setFieldState).toHaveBeenCalledWith(
      "subTab",
      "Discussion"
    );
  });

  it("shows loading indicator if postLoading is true", () => {
    const { getByTestId } = renderWithRedux(
      <ProfileComponent
        {...mockProps}
        profile={{ ...mockProps.profile, postLoading: true }}
      />
    );
    expect(getByTestId("activity-indicator")).toBeTruthy();
  });

  it("calls fetchPostsByUser when refresh icon is pressed", () => {
    const { getByTestId } = renderWithRedux(
      <ProfileComponent {...mockProps} />
    );
    fireEvent.press(getByTestId("refresh-button"));
    expect(mockProps.fetchPostsByUser).toHaveBeenCalledWith("user-1");
  });
});
