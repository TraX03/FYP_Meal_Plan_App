import { Post } from "@/components/PostCard";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import { fetchAllDocuments } from "@/services/Appwrite";
import { getImageUrl } from "@/utility/imageUtils";
import { fetchUsers } from "@/utility/userCacheUtils";
import Fuse from "fuse.js";
import { useRef } from "react";
import { Query } from "react-native-appwrite";

export const mainTabs = ["Likes", "Collections", "Viewed"] as const;
export type MainTab = (typeof mainTabs)[number];

export const subTabs = ["Recipes", "Tips", "Discussions"] as const;
export type SubTab = (typeof subTabs)[number];

export interface ListingState {
  posts: Post[];
  likedPosts: Post[];
  bookmarkPosts: Post[];
  viewedPosts: Post[];
  activeTab: MainTab;
  showLoading: boolean;
  searchText: string;
  activeSubTab: SubTab;
}

export const useListingController = () => {
  const listing = useFieldState<ListingState>({
    posts: [],
    likedPosts: [],
    bookmarkPosts: [],
    viewedPosts: [],
    activeTab: "Likes",
    showLoading: false,
    searchText: "",
    activeSubTab: "Recipes",
  });

  const { setFieldState, getFieldState, activeSubTab, activeTab } = listing;

  const originalPostsRef = useRef<Post[]>([]);
  const originalLikedRef = useRef<Post[]>([]);
  const originalBookmarkRef = useRef<Post[]>([]);
  const originalViewedRef = useRef<Post[]>([]);

  const enrichPostsWithAuthors = async (posts: Post[]) => {
    const authorIds = Array.from(
      new Set(posts.map((p) => p.author).filter(Boolean))
    ) as string[];

    if (authorIds.length === 0) return posts;

    const authors = await fetchUsers(authorIds);

    return posts.map((post) => ({
      ...post,
      author: authors.get(post.author ?? "")?.username ?? "Unknown",
      profilePic: authors.get(post.author ?? "")?.avatarUrl,
    }));
  };

  const fetchCreatedContent = async (userId: string) => {
    if (!userId) return;

    try {
      const [recipeDocs, postDocs] = await Promise.all([
        fetchAllDocuments(AppwriteConfig.RECIPES_COLLECTION_ID, [
          Query.equal("author_id", userId),
        ]),
        fetchAllDocuments(AppwriteConfig.POSTS_COLLECTION_ID, [
          Query.equal("author_id", userId),
        ]),
      ]);

      const formatPost = (doc: any, typeOverride?: string): Post => ({
        id: doc.$id,
        type: typeOverride ?? doc.type ?? "unknown",
        title: doc.title,
        image: getImageUrl(doc.image?.[0]),
        created_at: doc.created_at,
        author: doc.author_id,
      });

      const recipePosts = recipeDocs.map((doc) => formatPost(doc, "recipe"));
      const contentPosts = postDocs.map((doc) => formatPost(doc));

      let posts = [...recipePosts, ...contentPosts].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      posts = await enrichPostsWithAuthors(posts);

      originalPostsRef.current = posts;
      setFieldState("posts", posts);
    } catch (error) {
      console.error("Failed to fetch created posts and recipes:", error);
    }
  };

  const fetchInteractedPosts = async (userId: string) => {
    if (!userId) return;

    try {
      const interactions = await fetchAllDocuments(
        AppwriteConfig.INTERACTIONS_COLLECTION_ID,
        [
          Query.equal("user_id", userId),
          Query.or([
            Query.equal("type", "bookmark"),
            Query.equal("type", "like"),
            Query.equal("type", "view"),
          ]),
        ]
      );

      if (interactions.length === 0) {
        setFieldState("bookmarkPosts", []);
        setFieldState("likedPosts", []);
        setFieldState("viewedPosts", []);
        return;
      }

      const [recipes, posts] = await Promise.all([
        fetchAllDocuments(AppwriteConfig.RECIPES_COLLECTION_ID),
        fetchAllDocuments(AppwriteConfig.POSTS_COLLECTION_ID),
      ]);

      const formatPost = (doc: any, type?: "recipe"): Post => ({
        id: doc.$id,
        type: doc.type ?? type ?? "discussion",
        title: doc.title,
        image: getImageUrl(doc.image?.[0]),
        created_at: doc.created_at,
        author: doc.author_id,
      });

      const allPosts = [
        ...recipes.map((doc) => formatPost(doc, "recipe")),
        ...posts.map((doc) => formatPost(doc)),
      ];

      const postMap = new Map(allPosts.map((p) => [p.id, p]));

      const separateInteractions = (type: string) =>
        interactions.filter((i) => i.type === type);

      const mapPosts = (interactionList: typeof interactions) => {
        const timeMap = new Map(
          interactionList.map((doc: any) => [
            doc.item_id,
            doc.timestamps?.at(-1) ?? doc.created_at,
          ])
        );

        const postsList = interactionList
          .map((i) => postMap.get(i.item_id))
          .filter((p): p is Post => !!p);

        return { postsList, timeMap };
      };

      const { postsList: bookmarkedPosts, timeMap: bookmarkMap } = mapPosts(
        separateInteractions("bookmark")
      );
      const { postsList: likedPosts, timeMap: likeMap } = mapPosts(
        separateInteractions("like")
      );
      const { postsList: viewedPosts, timeMap: viewMap } = mapPosts(
        separateInteractions("view")
      );

      const allInteractedPosts = [
        ...bookmarkedPosts,
        ...likedPosts,
        ...viewedPosts,
      ];

      const uniquePostsMap = new Map<string, Post>();
      allInteractedPosts.forEach((post) => {
        if (!uniquePostsMap.has(post.id)) {
          uniquePostsMap.set(post.id, post);
        }
      });

      const uniquePosts = Array.from(uniquePostsMap.values());

      const enrichedPosts = await enrichPostsWithAuthors(uniquePosts);

      const enrichedBookmarked = enrichedPosts.filter((p) =>
        bookmarkedPosts.some((bp) => bp.id === p.id)
      );
      const enrichedLiked = enrichedPosts.filter((p) =>
        likedPosts.some((lp) => lp.id === p.id)
      );
      const enrichedViewed = enrichedPosts.filter((p) =>
        viewedPosts.some((vp) => vp.id === p.id)
      );

      const sortByTimeDesc = (postsArr: Post[], map: Map<string, string>) =>
        postsArr.sort(
          (a, b) =>
            new Date(map.get(b.id) ?? 0).getTime() -
            new Date(map.get(a.id) ?? 0).getTime()
        );

      originalLikedRef.current = sortByTimeDesc(enrichedLiked, likeMap);
      originalBookmarkRef.current = sortByTimeDesc(
        enrichedBookmarked,
        bookmarkMap
      );
      originalViewedRef.current = sortByTimeDesc(enrichedViewed, viewMap);

      setFieldState("likedPosts", originalLikedRef.current);
      setFieldState("bookmarkPosts", originalBookmarkRef.current);
      setFieldState("viewedPosts", originalViewedRef.current);
    } catch (error) {
      console.error("Failed to fetch bookmarks/likes/views:", error);
    }
  };

  const resetSearchResults = (type: string) => {
    setFieldState("searchText", "");

    if (type === "created") {
      setFieldState("posts", originalPostsRef.current);
      return;
    }

    setFieldState("likedPosts", originalLikedRef.current);
    setFieldState("bookmarkPosts", originalBookmarkRef.current);
    setFieldState("viewedPosts", originalViewedRef.current);
  };

  const handleListingSearch = (type: string, query: string) => {
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
          { name: "category", weight: 0.2 },
          { name: "description", weight: 0.2 },
        ],
      });

    if (type === "created") {
      const fuse = getFuse(getFieldState("posts"));
      const results = fuse.search(trimmed).map((r) => r.item);
      setFieldState("posts", results);
      return;
    }

    const activeTab = getFieldState("activeTab");

    const sourceMap = {
      Likes: "likedPosts",
      Collections: "bookmarkPosts",
      Viewed: "viewedPosts",
    } as const;

    const sourceKey = sourceMap[activeTab];
    const sourceList = getFieldState(sourceKey);

    const fuse = getFuse(sourceList);
    const filtered = fuse.search(trimmed).map((r) => r.item);

    setFieldState(sourceKey, filtered);
  };

  return {
    listing,
    fetchCreatedContent,
    fetchInteractedPosts,
    handleListingSearch,
    resetSearchResults,
  };
};

export default useListingController;
