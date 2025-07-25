import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useEffect } from "react";
import CommunityListComponent from "./component";
import { useCommunityListController } from "./controller";

export default function CommunityListContainer() {
  const { currentUserId } = useReduxSelectors();
  const {
    comList,
    fetchCreatedCommunities,
    fetchJoinedCommunities,
    handleCommunitySearch,
    resetCommunitySearch,
  } = useCommunityListController();

  useEffect(() => {
    async function fetchData() {
      if (!currentUserId) return;
      comList.setFieldState("showLoading", true);
      await fetchCreatedCommunities(currentUserId);
      await fetchJoinedCommunities(currentUserId);
      comList.setFieldState("showLoading", false);
    }

    fetchData();
  }, []);

  return (
    <CommunityListComponent
      comList={comList}
      handleCommunitySearch={handleCommunitySearch}
      resetCommunitySearch={resetCommunitySearch}
    />
  );
}
