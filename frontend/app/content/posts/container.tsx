import usePlannerController from "@/app/planner/controller";
import { PostType } from "@/components/PostCard";
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";
import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { setLoading } from "@/redux/slices/loadingSlice";
import { AppDispatch } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import useCommunityController from "../community/controller";
import PostComponent from "./component";
import { usePostController } from "./controller";

type Props = {
  postId: string;
  postType: PostType;
  isFromMealPlan?: boolean;
  communityId?: string;
  context?: string;
};

export default function PostContainer({
  postId,
  postType,
  isFromMealPlan,
  communityId,
  context,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { interactionRecords, currentUserId } = useReduxSelectors();
  const { post, actions, handleAuthorPress } = usePostController(
    postType,
    interactionRecords,
    currentUserId
  );
  const planner = usePlannerController();
  const addRecipeToMealPlan = isFromMealPlan
    ? planner.addRecipeToMealPlan
    : undefined;

  const community = useCommunityController();
  const assignToCommunity = communityId
    ? community.assignToCommunity
    : undefined;

  useKeyboardVisibility((visible) =>
    post.setFieldState("keyboardVisible", visible)
  );

  useEffect(() => {
    (async () => {
      try {
        await actions.getPost(postId);
      } catch (error) {
        console.error("Failed to load post:", error);
      } finally {
        dispatch(setLoading(false));
      }
    })();
  }, [postId]);

  return (
    <PostComponent
      post={post}
      actions={actions}
      postType={postType}
      currentUserId={currentUserId}
      handleAuthorPress={handleAuthorPress}
      isFromMealPlan={isFromMealPlan}
      addRecipeToMealPlan={addRecipeToMealPlan}
      communityId={communityId}
      context={context}
      assignToCommunity={assignToCommunity}
    />
  );
}
