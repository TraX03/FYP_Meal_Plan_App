import { Post } from "@/components/PostCard";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import { setLoading } from "@/redux/slices/loadingSlice";
import { AppDispatch } from "@/redux/store";
import { fetchAllDocuments } from "@/services/Appwrite";
import { getImageUrl } from "@/utility/imageUtils";
import { fetchUsers } from "@/utility/userCacheUtils";
import { Query } from "react-native-appwrite";
import { useDispatch } from "react-redux";

export interface HistoryState {
  posts: Post[];
}

export const useHistoryController = () => {
  const history = useFieldState<HistoryState>({
    posts: [],
  });

  const dispatch = useDispatch<AppDispatch>();

  const fetchHistory = async (userId: string) => {
    if (!userId) return;
    dispatch(setLoading(true));

    try {
      const interactions = await fetchAllDocuments(
        AppwriteConfig.INTERACTIONS_COLLECTION_ID,
        [Query.equal("user_id", userId), Query.equal("type", "view")]
      );

      const viewedIds = interactions
        .map((doc: any) => doc.item_id)
        .filter((id: string) => !!id);

      if (viewedIds.length === 0) return;

      const [recipes, posts] = await Promise.all([
        fetchAllDocuments(AppwriteConfig.RECIPES_COLLECTION_ID),
        fetchAllDocuments(AppwriteConfig.POSTS_COLLECTION_ID),
      ]);

      const formatPost = (
        doc: any,
        type: "recipe" | undefined = undefined
      ): Post => ({
        id: doc.$id,
        type: type ?? doc.type ?? "discussion",
        title: doc.title,
        image: getImageUrl(doc.image?.[0]),
        created_at: doc.created_at,
        author: doc.author_id,
      });

      const all = [
        ...recipes.map((r) => formatPost(r, "recipe")),
        ...posts.map((p) => formatPost(p)),
      ];

      const postMap = new Map<string, Post>(all.map((p) => [p.id, p]));

      const viewMap = new Map<string, string>(
        interactions.map((doc: any) => [
          doc.item_id,
          doc.timestamps?.at(-1) ?? doc.created_at,
        ])
      );

      const historyPosts = viewedIds
        .map((id) => postMap.get(id))
        .filter((p): p is Post => !!p);

      const authorIds = Array.from(
        new Set(historyPosts.map((p) => p.author).filter(Boolean))
      ) as string[];

      let enrichedPosts = historyPosts;

      if (authorIds.length > 0) {
        const authors = await fetchUsers(authorIds);
        enrichedPosts = historyPosts.map((post) => ({
          ...post,
          author: authors.get(post.author ?? "")?.username ?? "Unknown",
          profilePic: authors.get(post.author ?? "")?.avatarUrl,
        }));
      }

      enrichedPosts.sort((a, b) => {
        const aTime = new Date(viewMap.get(a.id) ?? 0).getTime();
        const bTime = new Date(viewMap.get(b.id) ?? 0).getTime();
        return bTime - aTime;
      });

      history.setFieldState("posts", enrichedPosts);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    history,
    fetchHistory,
  };
};

export default useHistoryController;
