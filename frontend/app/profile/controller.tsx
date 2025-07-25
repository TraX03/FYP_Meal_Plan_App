import { Post } from "@/components/PostCard";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import { ProfileData } from "@/redux/slices/profileSlice";
import { fetchAllDocuments, fetchDocumentsByIds } from "@/services/Appwrite";
import { getImageUrl } from "@/utility/imageUtils";
import { parseMetadata } from "@/utility/metadataUtils";
import { fetchUsers } from "@/utility/userCacheUtils";
import { useMemo } from "react";
import { Query } from "react-native-appwrite";
import { mainTabs, subTabs } from "./component";

export interface ProfileState {
  activeTab: (typeof mainTabs)[number];
  posts: Post[];
  likedPosts: Post[];
  bookmarkedPosts: Post[];
  subTab: (typeof subTabs)[number];
  postLoading: boolean;
  viewedProfileData: ProfileData | null;
}

export const useProfileController = () => {
  const profile = useFieldState<ProfileState>({
    activeTab: "Posts",
    posts: [],
    likedPosts: [],
    bookmarkedPosts: [],
    subTab: "Recipe",
    postLoading: false,
    viewedProfileData: null,
  });

  const { viewedProfileData, setFieldState, setFields } = profile;

  const metadata = useMemo(
    () => parseMetadata(viewedProfileData?.metadata),
    [viewedProfileData]
  );
  const isBackgroundDark = metadata?.profileBg?.isDark ?? false;

  const fetchPostsByUser = async (userId: string) => {
    if (!userId) return;

    setFieldState("postLoading", true);

    try {
      const [recipesDocs, postsDocs] = await Promise.all([
        fetchAllDocuments(AppwriteConfig.RECIPES_COLLECTION_ID, [
          Query.equal("author_id", userId),
        ]),
        fetchAllDocuments(AppwriteConfig.POSTS_COLLECTION_ID, [
          Query.equal("author_id", userId),
        ]),
      ]);

      const formatPost = (doc: any, type?: string) => ({
        ...doc,
        id: doc.$id,
        image: getImageUrl(doc.image?.[0]),
        ...(type && { type }),
      });

      const userPosts = [
        ...recipesDocs.map((doc) => formatPost(doc, "recipe")),
        ...postsDocs.map((doc) => formatPost(doc)),
      ];

      setFields({
        posts: userPosts,
        postLoading: false,
      });

      const interactionsRes = await fetchAllDocuments(
        AppwriteConfig.INTERACTIONS_COLLECTION_ID,
        [Query.equal("user_id", userId)]
      );

      const likedIds = new Set(
        interactionsRes.filter((i) => i.type === "like").map((i) => i.item_id)
      );
      const bookmarkedIds = new Set(
        interactionsRes
          .filter((i) => i.type === "bookmark")
          .map((i) => i.item_id)
      );

      const interactionIds = Array.from(
        new Set([...likedIds, ...bookmarkedIds])
      );

      const [likedRecipeDocs, likedPostDocs] = await Promise.all([
        fetchDocumentsByIds(
          AppwriteConfig.RECIPES_COLLECTION_ID,
          interactionIds
        ),
        fetchDocumentsByIds(AppwriteConfig.POSTS_COLLECTION_ID, interactionIds),
      ]);

      const allInteractedPosts = [
        ...likedRecipeDocs.map((doc) => formatPost(doc, "recipe")),
        ...likedPostDocs.map((doc) => formatPost(doc)),
      ];

      const likedPosts = allInteractedPosts.filter((post) =>
        likedIds.has(post.id)
      );
      const bookmarkedPosts = allInteractedPosts.filter((post) =>
        bookmarkedIds.has(post.id)
      );

      const authorIds = new Set<string>();
      [...likedPosts, ...bookmarkedPosts].forEach((p) => {
        if (p?.author_id) authorIds.add(p.author_id);
      });

      const authors = await fetchUsers(Array.from(authorIds));

      const attachAuthor = (post: any) => ({
        ...post,
        authorInfo: {
          username: authors.get(post.author_id)?.username,
          avatarUrl: authors.get(post.author_id)?.avatarUrl,
        },
      });

      setFields({
        likedPosts: likedPosts.map(attachAuthor),
        bookmarkedPosts: bookmarkedPosts.map(attachAuthor),
      });
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setFieldState("postLoading", false);
    }
  };

  return {
    profile,
    fetchPostsByUser,
    isBackgroundDark,
  };
};

export default useProfileController;
