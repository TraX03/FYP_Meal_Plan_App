import { useFieldState } from "@/hooks/useFieldState";
import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useEffect } from "react";
import { PostState } from "../controller";
import ForumComponent from "./component";
import useForumController from "./controller";

type Props = {
  post: ReturnType<typeof useFieldState<PostState>>;
};

export default function ForumContainer({ post }: Props) {
  const { currentUserProfile, currentUserId } = useReduxSelectors();
  const { checkLogin } = useRequireLogin();
  const { forum, getUpdatedText, handleSubmit, getComments, toggleReplies } =
    useForumController(post.postData?.id, currentUserId);

  useEffect(() => {
    getComments();
  }, [post.postData?.id]);

  return (
    <ForumComponent
      post={post}
      forum={forum}
      getUpdatedText={getUpdatedText}
      currentUserProfile={currentUserProfile}
      handleSubmit={handleSubmit}
      checkLogin={checkLogin}
      toggleReplies={toggleReplies}
    />
  );
}
