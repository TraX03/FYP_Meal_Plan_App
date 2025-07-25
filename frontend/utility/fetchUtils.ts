import { Post } from "@/components/PostCard";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { fetchAllDocuments, getDocumentById } from "@/services/Appwrite";
import { fetchHomeFeedRecommendations } from "@/services/FastApi";
import { getImageUrl } from "./imageUtils";
import { fetchUsers } from "./userCacheUtils";

export interface User {
  id: string;
  name: string;
  profilePic?: string;
  bio?: string;
}

export const fetchPosts = async (
  limit: boolean = true,
  shuffle: boolean = true
): Promise<Post[]> => {
  const shuffleArray = <T>(array: T[]): T[] =>
    array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

  const maybeShuffle = <T>(array: T[]): T[] =>
    shuffle ? shuffleArray(array) : array;

  const applyLimit = <T>(arr: T[], lim?: number): T[] =>
    lim ? arr.slice(0, lim) : arr;

  const mapPost = (doc: any, usersMap: Map<string, any>): Post => {
    const author = usersMap.get(doc.author_id);
    const ingredients = Array.isArray(doc.ingredients)
      ? doc.ingredients
          .map((ing: any) => {
            try {
              const parsed = typeof ing === "string" ? JSON.parse(ing) : ing;
              return parsed?.name;
            } catch (err) {
              console.warn("❌ Failed to parse ingredient:", ing, err);
              return null;
            }
          })
          .filter(Boolean)
      : [];

    return {
      id: doc.$id,
      type: doc.type || "recipe",
      title: doc.title,
      image: getImageUrl(doc.image?.[0]),
      author: author?.username || "Unknown",
      authorId: doc.author_id,
      profilePic: author?.avatarUrl,
      area: doc.area,
      description: !doc.type ? doc.description : doc.content,
      created_at: doc.$createdAt,
      category: doc.category,
      ingredients,
      mealtime: doc.mealtime,
      tags: doc.tags,
    };
  };

  const mapCommunity = (doc: any): Post => ({
    id: doc.$id,
    type: "community",
    title: doc.name,
    image: getImageUrl(doc.image),
    membersCount: doc.members_count,
    postsCount: doc.posts_count,
    created_at: doc.$createdAt,
    description: doc.description,
  });

  const processPosts = (
    docs: any[],
    type: string,
    usersMap: Map<string, any>,
    lim?: number
  ): Post[] =>
    applyLimit(
      maybeShuffle(
        docs.filter((d) => d.type === type).map((d) => mapPost(d, usersMap))
      ),
      lim
    );

  try {
    const [postDocs, recipeDocs, communityDocs] = await Promise.all([
      fetchAllDocuments(AppwriteConfig.POSTS_COLLECTION_ID),
      fetchAllDocuments(AppwriteConfig.RECIPES_COLLECTION_ID),
      fetchAllDocuments(AppwriteConfig.COMMUNITIES_COLLECTION_ID),
    ]);

    const authorIds = Array.from(
      new Set(
        [...postDocs, ...recipeDocs].map((doc) => doc.author_id).filter(Boolean)
      )
    );

    const usersMap = await fetchUsers(authorIds);

    const limits = {
      recipe: limit ? 100 : undefined,
      tips: limit ? 100 : undefined,
      discussion: limit ? 100 : undefined,
      community: limit ? 30 : undefined,
    };

    const posts: Post[] = [
      ...applyLimit(
        maybeShuffle(recipeDocs.map((d) => mapPost(d, usersMap))),
        limits.recipe
      ),
      ...processPosts(postDocs, "tips", usersMap, limits.tips),
      ...processPosts(postDocs, "discussion", usersMap, limits.discussion),
      ...applyLimit(
        maybeShuffle(communityDocs.map(mapCommunity)),
        limits.community
      ),
    ];

    return posts;
  } catch (error) {
    console.error("Failed to fetch posts", error);
    return [];
  }
};

export const fetchHomeFeedPosts = async (userId: string): Promise<Post[]> => {
  try {
    const recs = await fetchHomeFeedRecommendations(userId);

    const allSections = [
      { ...recs.recipe, type: "recipe" },
      { ...recs.tip, type: "tips" },
      { ...recs.discussion, type: "discussion" },
      { ...recs.community, type: "community" },
    ];

    const allAuthorIds = allSections
      .flatMap((section) => section.author_ids ?? [])
      .filter(Boolean);

    const uniqueAuthorIds = Array.from(new Set(allAuthorIds));
    const usersMap = await fetchUsers(uniqueAuthorIds);

    const communityIds = recs.community?.post_ids ?? [];
    const communityDocs = await Promise.all(
      communityIds.map((id: string) =>
        getDocumentById(AppwriteConfig.COMMUNITIES_COLLECTION_ID, id)
      )
    );

    const allPosts: Post[] = allSections.flatMap((section) => {
      if (section.type === "community") {
        return communityDocs.map((doc: any) => ({
          id: doc.$id,
          type: "community",
          title: doc.name,
          image: getImageUrl(doc.image),
          membersCount: doc.members_count,
          postsCount: doc.posts_count,
          created_at: doc.$createdAt,
          description: doc.description,
        }));
      }

      return section.post_ids.map((id: string, index: number) => {
        const authorId = section.author_ids[index];
        const authorInfo = usersMap.get(authorId);

        return {
          id,
          type: section.type,
          title: section.titles[index],
          image: getImageUrl(section.images[index]),
          author: authorInfo?.username || "Unknown",
          profilePic: getImageUrl(authorInfo?.avatarUrl),
          authorId,
        };
      });
    });

    return allPosts;
  } catch (err) {
    console.error("Failed to fetch home feed", err);
    return [];
  }
};

export const fetchUserList = async (): Promise<User[]> => {
  try {
    const userDocs = await fetchAllDocuments(
      AppwriteConfig.USERS_COLLECTION_ID
    );

    return userDocs.map((doc) => ({
      id: doc.$id,
      name: doc.username,
      profilePic: getImageUrl(doc.avatar),
      bio: doc.bio,
    }));
  } catch (error) {
    console.error("Failed to fetch user list", error);
    return [];
  }
};
