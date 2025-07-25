import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { updateProfileField } from "@/redux/slices/profileSlice";
import { AppDispatch } from "@/redux/store";
import {
  createDocument,
  deleteDocument,
  getCurrentUser,
  getDocumentById,
  getPostTypeById,
  updateDocument,
} from "@/services/Appwrite";
import { refreshInteractionRecords } from "@/utility/interactionUtils";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { useRequireLogin } from "./useRequireLogin";

type InteractionType = "like" | "bookmark" | "follow" | "join";

export type InteractionResult = {
  isLiked: boolean;
  likeDocId?: string;
  isBookmarked: boolean;
  bookmarkDocId?: string;
  isFollowing: boolean;
  followDocId?: string;
  isJoining: boolean;
  joinDocId?: string;
};

export function useInteraction(
  targetId: string,
  initial?: Partial<InteractionResult>
) {
  const dispatch = useDispatch<AppDispatch>();
  const { checkLogin } = useRequireLogin();
  const [state, setState] = useState<InteractionResult>({
    isLiked: initial?.isLiked ?? false,
    likeDocId: initial?.likeDocId,
    isBookmarked: initial?.isBookmarked ?? false,
    bookmarkDocId: initial?.bookmarkDocId,
    isFollowing: initial?.isFollowing ?? false,
    followDocId: initial?.followDocId,
    isJoining: initial?.isJoining ?? false,
    joinDocId: initial?.joinDocId,
  });

  const getTargetCollectionAndField = (
    itemType: string,
    interaction: InteractionType
  ) => {
    const collection =
      itemType === "recipe"
        ? AppwriteConfig.RECIPES_COLLECTION_ID
        : AppwriteConfig.POSTS_COLLECTION_ID;

    const field =
      interaction === "like"
        ? "likes_count"
        : interaction === "bookmark"
        ? "bookmarks_count"
        : null;

    return { collection, field };
  };

  const updateCount = async ({
    collectionId,
    documentId,
    fieldName,
    delta,
    onSuccess,
    onError,
  }: {
    collectionId: string;
    documentId: string;
    fieldName: string;
    delta: 1 | -1;
    onSuccess?: (newCount: number) => void;
    onError?: (err: any) => void;
  }) => {
    try {
      const doc = await getDocumentById(collectionId, documentId);
      const updatedCount = Math.max(0, (doc?.[fieldName] ?? 0) + delta);

      await updateDocument(collectionId, documentId, {
        [fieldName]: updatedCount,
      });

      onSuccess?.(updatedCount);
    } catch (err) {
      console.warn(`Failed to update ${fieldName} count:`, err);
      onError?.(err);
    }
  };

  const updateItemCount = async (
    targetId: string,
    itemType: string,
    interaction: InteractionType,
    delta: 1 | -1
  ) => {
    const { collection, field } = getTargetCollectionAndField(
      itemType,
      interaction
    );
    if (!collection || !field) return;

    await updateCount({
      collectionId: collection,
      documentId: targetId,
      fieldName: field,
      delta,
    });
  };

  const updateFollowCounts = async (
    currentUserId: string,
    targetUserId: string,
    delta: 1 | -1
  ) => {
    const currentUserCollection = AppwriteConfig.USERS_COLLECTION_ID;

    await Promise.all([
      updateCount({
        collectionId: currentUserCollection,
        documentId: currentUserId,
        fieldName: "following_count",
        delta,
        onSuccess: (count) => {
          dispatch(updateProfileField({ key: "followingCount", value: count }));
        },
      }),
      updateCount({
        collectionId: currentUserCollection,
        documentId: targetUserId,
        fieldName: "followers_count",
        delta,
      }),
    ]);
  };

  const updateCommunityMemberCount = async (
    communityId: string,
    delta: 1 | -1
  ) => {
    await updateCount({
      collectionId: AppwriteConfig.COMMUNITIES_COLLECTION_ID,
      documentId: communityId,
      fieldName: "members_count",
      delta,
    });
  };

  const toggleInteraction = async (type: InteractionType) => {
    try {
      const currentUser = await getCurrentUser();
      const collection = AppwriteConfig.INTERACTIONS_COLLECTION_ID;

      const records = {
        like: {
          active: state.isLiked,
          docId: state.likeDocId,
          update: (v: boolean, id?: string) =>
            setState((p) => ({ ...p, isLiked: v, likeDocId: id })),
          toast: { added: "Added to Likes", removed: "Removed from Likes" },
        },
        bookmark: {
          active: state.isBookmarked,
          docId: state.bookmarkDocId,
          update: (v: boolean, id?: string) =>
            setState((p) => ({ ...p, isBookmarked: v, bookmarkDocId: id })),
          toast: {
            added: "Added to Bookmarks",
            removed: "Removed from Bookmarks",
          },
        },
        follow: {
          active: state.isFollowing,
          docId: state.followDocId,
          update: (v: boolean, id?: string) =>
            setState((p) => ({ ...p, isFollowing: v, followDocId: id })),
        },
        join: {
          active: state.isJoining,
          docId: state.joinDocId,
          update: (v: boolean, id?: string) =>
            setState((p) => ({ ...p, isJoining: v, joinDocId: id })),
        },
      };

      const { active, docId, update } = records[type];

      if (active && docId) {
        await deleteDocument(collection, docId);
        update(false, undefined);

        if (type === "follow")
          await updateFollowCounts(currentUser.$id, targetId, -1);
        if (type === "join") await updateCommunityMemberCount(targetId, -1);
        if (type === "like" || type === "bookmark") {
          const itemType = await getPostTypeById(targetId);
          await updateItemCount(targetId, itemType ?? "recipe", type, -1);
        }

        if ("toast" in records[type]) {
          Toast.show({
            type: "success",
            text1: (records[type] as any).toast.removed,
          });
        }
      } else {
        const itemType =
          type === "follow"
            ? "user"
            : type === "join"
            ? "community"
            : (await getPostTypeById(targetId)) ?? "recipe";

        const newDoc = await createDocument(collection, {
          user_id: currentUser.$id,
          item_id: targetId,
          item_type: itemType,
          type,
          created_at: new Date().toISOString(),
        });

        update(true, newDoc.$id);

        if (type === "follow")
          await updateFollowCounts(currentUser.$id, targetId, 1);
        if (type === "join") await updateCommunityMemberCount(targetId, 1);
        if (type === "like" || type === "bookmark") {
          await updateItemCount(targetId, itemType, type, 1);
        }

        if ("toast" in records[type]) {
          Toast.show({
            type: "success",
            text1: (records[type] as any).toast.added,
          });
        }
      }

      refreshInteractionRecords(dispatch);
    } catch (err) {
      console.warn(`Failed to toggle ${type}:`, err);
    }
  };

  return {
    isLiked: state.isLiked,
    isBookmarked: state.isBookmarked,
    isFollowing: state.isFollowing,
    isJoining: state.isJoining,
    toggleLike: () => checkLogin(() => toggleInteraction("like")),
    toggleBookmark: () => checkLogin(() => toggleInteraction("bookmark")),
    toggleFollow: () => checkLogin(() => toggleInteraction("follow")),
    toggleJoin: () => checkLogin(() => toggleInteraction("join")),
  };
}
