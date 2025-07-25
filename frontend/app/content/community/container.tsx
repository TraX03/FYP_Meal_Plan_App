import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { setLoading } from "@/redux/slices/loadingSlice";
import { AppDispatch } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import CommunityComponent from "./component";
import useCommunityController from "./controller";

type Props = {
  communityId: string;
};

export default function CommunityContainer({ communityId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { interactionVersion, interactionRecords, currentUserId } =
    useReduxSelectors();
  const { checkLogin } = useRequireLogin();

  const {
    community,
    getCommunity,
    handleCommunitySearch,
    resetCommunitySearch,
  } = useCommunityController();

  useEffect(() => {
    (async () => {
      try {
        await getCommunity(communityId);
      } catch (error) {
        console.error("Failed to load community:", error);
      } finally {
        dispatch(setLoading(false));
      }
    })();
  }, [communityId]);

  return (
    <CommunityComponent
      community={community}
      interactionVersion={interactionVersion}
      handleCommunitySearch={handleCommunitySearch}
      resetCommunitySearch={resetCommunitySearch}
      getCommunity={getCommunity}
      interactionRecords={interactionRecords}
      currentUserId={currentUserId}
      checkLogin={checkLogin}
    />
  );
}
