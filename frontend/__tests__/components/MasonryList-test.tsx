import MasonryList from "@/components/MasonryList";
import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { testPost } from "../fixtures";

const mockPosts = [
  { ...testPost, id: "post-1", title: "Post 1" },
  { ...testPost, id: "post-2", title: "Post 2" },
  { ...testPost, id: "post-3", title: "Post 3" },
];

jest.mock("@/components/PostCard", () => {
  const { Text } = require("react-native");
  return ({ post }: any) => <Text>{post.title}</Text>;
});

describe("MasonryList", () => {
  it("renders posts in two columns", () => {
    const { getByText } = render(
      <MasonryList posts={mockPosts} interactionVersion={1} />
    );
    expect(getByText("Post 1")).toBeTruthy();
    expect(getByText("Post 2")).toBeTruthy();
    expect(getByText("Post 3")).toBeTruthy();
  });

  it("shows 'You're at the end' when posts exist", () => {
    const { getByText } = render(
      <MasonryList posts={mockPosts} interactionVersion={1} />
    );
    expect(getByText("You're at the end")).toBeTruthy();
  });

  it("shows 'Nothing to show here' when post list is empty", () => {
    const { getByText } = render(
      <MasonryList posts={[]} interactionVersion={1} />
    );
    expect(getByText("Nothing to show here")).toBeTruthy();
  });

  it("renders custom header if provided", () => {
    const { getByText } = render(
      <MasonryList
        posts={mockPosts}
        interactionVersion={1}
        header={<Text>Header</Text>}
      />
    );
    expect(getByText("Header")).toBeTruthy();
  });

  it("calls onRefresh when pulling down", () => {
    const onRefresh = jest.fn();
    const { getByTestId } = render(
      <MasonryList
        posts={mockPosts}
        interactionVersion={1}
        onRefresh={onRefresh}
        refreshing={false}
      />
    );

    const scrollView = getByTestId("ScrollView");
    scrollView.props.refreshControl.props.onRefresh();
    expect(onRefresh).toHaveBeenCalled();
  });
});
