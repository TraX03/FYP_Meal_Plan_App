import { Post } from "@/components/PostCard";
import { useFieldState } from "@/hooks/useFieldState";

export const tabs = [
  "Recipes",
  "Tips & Advice",
  "Discussions",
  "Communities",
  "Users",
] as const;

export type Tab = (typeof tabs)[number];

export interface SearchResultState {
  activeTab: Tab;
  filteredPosts: Post[];
}

const useSearchResultController = (allFilteredPosts: Post[]) => {
  const searchResult = useFieldState<SearchResultState>({
    activeTab: tabs[0],
    filteredPosts: [],
  });

  const { activeTab } = searchResult;

  const getFilteredPostsByTab = () => {
    if (!allFilteredPosts) return [];
    return allFilteredPosts.filter((post) => {
      switch (activeTab) {
        case "Recipes":
          return post.type === "recipe";
        case "Tips & Advice":
          return post.type === "tips";
        case "Discussions":
          return post.type === "discussion";
        case "Communities":
          return post.type === "community";
        default:
          return false;
      }
    });
  };

  return {
    searchResult,
    getFilteredPostsByTab,
  };
};

export default useSearchResultController;
