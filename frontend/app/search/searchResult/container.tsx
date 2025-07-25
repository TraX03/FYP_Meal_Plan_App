import { Post } from "@/components/PostCard";
import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { User } from "@/utility/fetchUtils";
import { useEffect } from "react";
import SearchResultComponent from "./component";
import useSearchResultController from "./controller";

interface Props {
  allFilteredPosts: Post[];
  filteredUsers: User[];
  postLoading: boolean;
  isFromMealPlan: boolean;
  context?: string;
}

export default function SearchResultContainer({
  allFilteredPosts,
  filteredUsers,
  postLoading,
  isFromMealPlan,
  context,
}: Props) {
  const { searchResult, getFilteredPostsByTab } =
    useSearchResultController(allFilteredPosts);
  const { interactionVersion } = useReduxSelectors();

  useEffect(() => {
    const filtered = getFilteredPostsByTab();
    searchResult.setFieldState("filteredPosts", filtered);
  }, [searchResult.activeTab, postLoading]);

  return (
    <SearchResultComponent
      searchResult={searchResult}
      filteredUsers={filteredUsers}
      interactionVersion={interactionVersion}
      postLoading={postLoading}
      isFromMealPlan={isFromMealPlan}
      context={context}
    />
  );
}
