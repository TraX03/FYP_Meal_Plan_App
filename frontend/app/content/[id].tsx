import ErrorScreen from "@/components/ErrorScreen";
import { PostType } from "@/components/PostCard";
import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { setLoading } from "@/redux/slices/loadingSlice";
import { AppDispatch } from "@/redux/store";
import { getPostTypeById } from "@/services/Appwrite";
import { logUserView } from "@/services/FastApi";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CommunityContainer from "./community/container";
import PostContainer from "./posts/container";

export default function PostRouter() {
  const { id, source, isFromMealPlan, communityId, context } =
    useLocalSearchParams();
  const { currentUserId } = useReduxSelectors();
  const dispatch = useDispatch<AppDispatch>();
  const [postType, setPostType] = useState<PostType | null>(null);

  const fromMealPlan = isFromMealPlan === "true";

  useEffect(() => {
    if (typeof id !== "string") return;

    const fetchPostType = async () => {
      dispatch(setLoading(true));
      const type = await getPostTypeById(id);
      setPostType(type);

      if (currentUserId) {
        const itemType = (await getPostTypeById(id)) ?? "recipe";

        await logUserView(
          currentUserId,
          id,
          itemType,
          typeof source === "string" ? source : "homeFeed"
        );
      }
    };

    fetchPostType();
  }, [id, dispatch]);

  if (typeof id !== "string") {
    return <ErrorScreen message="Invalid post ID." />;
  }

  if (!postType) {
    return null;
  }

  return (
    <>
      {["recipe", "tips", "discussion"].includes(postType) ? (
        <PostContainer
          postId={id}
          postType={postType}
          isFromMealPlan={postType === "recipe" ? fromMealPlan : false}
          context={context as string}
          communityId={communityId as string}
        />
      ) : postType === "community" ? (
        <CommunityContainer communityId={id} />
      ) : (
        <ErrorScreen message="Something went wrong while loading the post. Please refresh or try again later." />
      )}
    </>
  );
}
