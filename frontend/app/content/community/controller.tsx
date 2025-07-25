import { subTabs } from "@/app/profile/component";
import { Post, PostType } from "@/components/PostCard";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { Routes } from "@/constants/Routes";
import { useFieldState } from "@/hooks/useFieldState";
import {
  fetchAllDocuments,
  getDocumentById,
  updateDocument,
} from "@/services/Appwrite";
import { capitalize } from "@/utility/capitalize";
import { getImageUrl } from "@/utility/imageUtils";
import { parseMetadata } from "@/utility/metadataUtils";
import { router } from "expo-router";
import Fuse from "fuse.js";
import { useRef } from "react";
import { Query } from "react-native-appwrite";
import Toast from "react-native-toast-message";

interface Community {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  membersCount: number;
  image: string;
  postsCount: number;
}

export interface CommunityState {
  communityData: Community | null;
  metadata: any;
  activeTab: (typeof subTabs)[number];
  searchText: string;
  showAddOptionModal: boolean;
  recipePosts: Post[];
  tipsPosts: Post[];
  discussionPosts: Post[];
}

export const useCommunityController = () => {
  const community = useFieldState<CommunityState>({
    communityData: null,
    metadata: null,
    activeTab: "Recipe",
    searchText: "",
    showAddOptionModal: false,
    recipePosts: [],
    tipsPosts: [],
    discussionPosts: [],
  });

  const originalRecipeRef = useRef<Post[]>([]);
  const originalTipsRef = useRef<Post[]>([]);
  const originalDiscussionRef = useRef<Post[]>([]);

  const { setFields, setFieldState, getFieldState } = community;

  const getCommunity = async (communityId: string) => {
    if (!communityId) return;

    try {
      const doc = await getDocumentById(
        AppwriteConfig.COMMUNITIES_COLLECTION_ID,
        communityId
      );

      setFields({
        communityData: {
          id: communityId,
          name: doc.name,
          description: doc.description,
          creatorId: doc.creator_id,
          membersCount: doc.members_count ?? 0,
          image: getImageUrl(doc.image),
          postsCount: doc.posts_count ?? 0,
        },
        metadata: parseMetadata(doc.metadata),
      });

      getCommunityContent(communityId);
    } catch (error) {
      console.error("Failed to fetch community:", error);
    }
  };

  const getCommunityContent = async (communityId: string) => {
    if (!communityId) return;

    try {
      const [recipes, posts] = await Promise.all([
        fetchAllDocuments(AppwriteConfig.RECIPES_COLLECTION_ID, [
          Query.contains("community_id", communityId),
        ]),
        fetchAllDocuments(AppwriteConfig.POSTS_COLLECTION_ID, [
          Query.contains("community_id", communityId),
        ]),
      ]);

      const allPosts = [...recipes, ...posts];

      const authorIds = Array.from(
        new Set(allPosts.map((p) => p.author_id).filter(Boolean))
      );

      const authorMap: Record<string, { name: string; profilePic: string }> =
        {};
      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const user = await getDocumentById(
              AppwriteConfig.USERS_COLLECTION_ID,
              authorId
            );
            authorMap[authorId] = {
              name: user.username ?? "Unknown",
              profilePic: user.avatar ?? "",
            };
          } catch (e) {
            console.warn(`Failed to fetch user ${authorId}`, e);
          }
        })
      );

      const mapPost = (
        doc: any,
        type: "recipe" | "tips" | "discussion"
      ): Post => {
        const authorId = doc.author_id;
        const authorInfo = authorMap[authorId] || {};

        return {
          id: doc.$id,
          type,
          title: doc.title,
          image: Array.isArray(doc.image)
            ? getImageUrl(doc.image[0])
            : getImageUrl(doc.image),
          area: doc.area ?? "",
          author: authorInfo.name ?? "",
          authorId,
          profilePic: getImageUrl(authorInfo.profilePic) ?? "",
          created_at: doc.created_at,
        };
      };

      const recipePosts: Post[] = recipes.map((doc) => mapPost(doc, "recipe"));
      const tipsPosts: Post[] = posts
        .filter((doc) => doc.type === "tips")
        .map((doc) => mapPost(doc, "tips"));

      const discussionPosts: Post[] = posts
        .filter((doc) => doc.type === "discussion")
        .map((doc) => mapPost(doc, "discussion"));

      originalRecipeRef.current = recipePosts;
      originalTipsRef.current = tipsPosts;
      originalDiscussionRef.current = discussionPosts;

      setFields({
        recipePosts,
        tipsPosts,
        discussionPosts,
      });
    } catch (error) {
      console.error("Failed to fetch community content:", error);
    }
  };

  const assignToCommunity = async (
    postId: string,
    postType: PostType,
    communityId: string
  ) => {
    if (!communityId) {
      console.warn("No community selected.");
      return;
    }

    const collectionMap = {
      recipe: AppwriteConfig.RECIPES_COLLECTION_ID,
      tips: AppwriteConfig.POSTS_COLLECTION_ID,
      discussion: AppwriteConfig.POSTS_COLLECTION_ID,
      community: "",
    };
    const collectionId = collectionMap[postType];

    try {
      const doc = await getDocumentById(collectionId, postId);
      if (!doc) return;

      const existingCommunityIds: string[] = doc.community_id ?? [];

      if (existingCommunityIds.includes(communityId)) {
        Toast.show({
          type: "info",
          text1: "Already in this community",
        });
        return;
      }

      await updateDocument(collectionId, postId, {
        community_id: [...existingCommunityIds, communityId],
      });

      Toast.show({
        type: "success",
        text1: `${capitalize(postType)} added to community`,
      });

      const community = await getDocumentById(
        AppwriteConfig.COMMUNITIES_COLLECTION_ID,
        communityId
      );

      const currentCount = community.posts_count ?? 0;

      await updateDocument(
        AppwriteConfig.COMMUNITIES_COLLECTION_ID,
        communityId,
        {
          posts_count: currentCount + 1,
        }
      );

      router.replace(Routes.Home);
      router.push({
        pathname: Routes.PostDetail,
        params: { id: communityId },
      });
    } catch (error) {
      console.error("Failed to assign recipe to community:", error);
    }
  };

  const handleCommunitySearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setFieldState("searchText", trimmed);

    const getFuse = (list: Post[]) =>
      new Fuse(list, {
        includeScore: true,
        threshold: 0.3,
        ignoreLocation: true,
        keys: [
          { name: "title", weight: 0.6 },
          { name: "area", weight: 0.2 },
          { name: "author", weight: 0.2 },
        ],
      });

    const activeTab = getFieldState("activeTab");

    if (activeTab === "Recipe") {
      const fuse = getFuse(originalRecipeRef.current);
      const results = fuse.search(trimmed).map((r) => r.item);
      setFieldState("recipePosts", results);
    } else if (activeTab === "Tips") {
      const fuse = getFuse(originalTipsRef.current);
      const results = fuse.search(trimmed).map((r) => r.item);
      setFieldState("tipsPosts", results);
    } else if (activeTab === "Discussion") {
      const fuse = getFuse(originalDiscussionRef.current);
      const results = fuse.search(trimmed).map((r) => r.item);
      setFieldState("discussionPosts", results);
    }
  };

  const resetCommunitySearch = () => {
    setFieldState("searchText", "");

    setFields({
      recipePosts: originalRecipeRef.current,
      tipsPosts: originalTipsRef.current,
      discussionPosts: originalDiscussionRef.current,
    });
  };

  return {
    community,
    getCommunity,
    assignToCommunity,
    handleCommunitySearch,
    resetCommunitySearch,
  };
};

export default useCommunityController;
