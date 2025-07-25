import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { setInteractionRecords } from "@/redux/slices/interactionSlice";
import { AppDispatch } from "@/redux/store";
import { fetchAllDocuments, getCurrentUser } from "@/services/Appwrite";
import { Query } from "react-native-appwrite";

export const fetchInteractions = async (): Promise<Record<string, any>> => {
  const user = await getCurrentUser();
  const interactions = await fetchAllDocuments(
    AppwriteConfig.INTERACTIONS_COLLECTION_ID,
    [Query.equal("user_id", user.$id)]
  );

  const result: Record<string, any> = {};

  interactions.forEach((doc) => {
    const key = `${doc.type}_${doc.item_id}`;
    result[key] = doc;
  });

  return result;
};

export const getInteractionStatus = (
  itemId: string,
  interactions: Record<string, any>
) => {
  const like = interactions[`like_${itemId}`];
  const bookmark = interactions[`bookmark_${itemId}`];
  const follow = interactions[`follow_${itemId}`];

  return {
    isLiked: !!like,
    likeDocId: like?.$id,
    isBookmarked: !!bookmark,
    bookmarkDocId: bookmark?.$id,
    isFollowing: !!follow,
    followDocId: follow?.$id,
  };
};

export const refreshInteractionRecords = async (dispatch: AppDispatch) => {
  const interactionRecords = await fetchInteractions();
  dispatch(setInteractionRecords(interactionRecords));
};
