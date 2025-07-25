import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import ListingComponent from "./component";
import useListingController from "./controller";

export default function ListingContainer() {
  const { type, communityId, context } = useLocalSearchParams();
  const { currentUserId, interactionVersion } = useReduxSelectors();
  const {
    listing,
    fetchCreatedContent,
    fetchInteractedPosts,
    handleListingSearch,
    resetSearchResults,
  } = useListingController();

  useEffect(() => {
    async function fetchData() {
      if (!currentUserId) return;
      listing.setFieldState("showLoading", true);
      if (type === "created") {
        await fetchCreatedContent(currentUserId);
      } else if (type === "interactions") {
        await fetchInteractedPosts(currentUserId);
      }
      listing.setFieldState("showLoading", false);
    }

    fetchData();
  }, [type]);

  return (
    <ListingComponent
      type={type as string}
      context={context as string}
      communityId={communityId as string}
      listing={listing}
      interactionVersion={interactionVersion}
      handleListingSearch={handleListingSearch}
      resetSearchResults={resetSearchResults}
    />
  );
}
