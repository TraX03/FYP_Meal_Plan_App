import { Ingredient, Instruction } from "@/app/create/createForm/controller";
import { PostType } from "@/components/PostCard";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { Routes } from "@/constants/Routes";
import { useFieldState } from "@/hooks/useFieldState";
import { setLoading } from "@/redux/slices/loadingSlice";
import { setRefreshProfile } from "@/redux/slices/profileSlice";
import { AppDispatch } from "@/redux/store";
import {
  deleteDocument,
  getCurrentUser,
  getDocumentById,
  storage,
} from "@/services/Appwrite";
import { getImageUrl, isValidUrl } from "@/utility/imageUtils";
import { getInteractionStatus } from "@/utility/interactionUtils";
import { parseMetadata } from "@/utility/metadataUtils";
import { fetchUsers } from "@/utility/userCacheUtils";
import { router } from "expo-router";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

interface BasePost {
  id: string;
  title: string;
  author: string;
  authorId: string;
  images: string[];
  likesCount: number;
  bookmarksCount: number;
  description: string;
  createdAt: string;
  commentsCount: number;
}

export interface RecipePost extends BasePost {
  ingredients: Ingredient[];
  instructions: Instruction[];
  rating: number;
  ratingCount: number;
  category: string[];
}

export type ForumPost = BasePost;
export type PostData = RecipePost | ForumPost;

export interface PostState {
  postData: PostData | null;
  imageIndex: number;
  showModal: boolean;
  fullscreenImage: string | null;
  metadata: any;
  interactionState: {
    isLiked: boolean;
    likeDocId?: string;
    isBookmarked: boolean;
    bookmarkDocId?: string;
  };
  showStepsModal: boolean;
  showRatingModal: boolean;
  keyboardVisible: boolean;
}

export const usePostController = (
  type: PostType,
  interactionRecords?: Record<string, any>,
  currentUserId?: string
) => {
  const dispatch = useDispatch<AppDispatch>();

  const post = useFieldState<PostState>({
    postData: null,
    imageIndex: 0,
    showModal: false,
    fullscreenImage: null,
    metadata: null,
    interactionState: {
      isLiked: false,
      isBookmarked: false,
    },
    showStepsModal: false,
    showRatingModal: false,
    keyboardVisible: false,
  });

  const { setFields, setFieldState } = post;

  const parseJsonSafe = <T,>(json: string, fallback: T): T => {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  };

  const getPost = async (postId: string) => {
    try {
      const collectionId =
        type === "recipe"
          ? AppwriteConfig.RECIPES_COLLECTION_ID
          : AppwriteConfig.POSTS_COLLECTION_ID;

      const doc = await getDocumentById(collectionId, postId);
      const [usersMap, currentUser] = await Promise.all([
        fetchUsers([doc.author_id]),
        getCurrentUser().catch(() => null),
      ]);

      const baseData: BasePost = {
        id: doc.$id,
        title: doc.title,
        author: usersMap.get(doc.author_id)?.username ?? "Unknown",
        authorId: doc.author_id,
        images: Array.isArray(doc.image) ? doc.image.map(getImageUrl) : [],
        likesCount: doc.likes_count ?? 0,
        bookmarksCount: doc.bookmarks_count ?? 0,
        description: type === "recipe" ? doc.description : doc.content,
        createdAt: doc.$createdAt,
        commentsCount: doc.comments_count ?? 0,
      };

      const postData: PostData =
        type === "recipe"
          ? {
              ...baseData,
              ingredients: (doc.ingredients ?? []).map((i: string) =>
                parseJsonSafe<Ingredient>(i, { name: "", quantity: "" })
              ),
              instructions: (doc.instructions ?? []).map((i: string) => {
                const parsed = parseJsonSafe<Instruction>(i, { text: "" });
                return {
                  text: parsed.text,
                  image:
                    parsed.image && !isValidUrl(parsed.image)
                      ? getImageUrl(parsed.image)
                      : parsed.image,
                };
              }),
              rating: doc.rating ?? 0,
              ratingCount: doc.rating_count ?? 0,
              category: doc.category ?? [],
            }
          : baseData;

      if (currentUser && interactionRecords) {
        setFieldState(
          "interactionState",
          getInteractionStatus(doc.$id, interactionRecords)
        );
      }

      setFields({ postData, metadata: parseMetadata(doc.metadata) });
    } catch (error) {
      console.error("Failed to fetch post:", error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      dispatch(setLoading(true));

      const collectionId =
        type === "recipe"
          ? AppwriteConfig.RECIPES_COLLECTION_ID
          : AppwriteConfig.POSTS_COLLECTION_ID;

      const doc = await getDocumentById(collectionId, postId);

      const extractFileIds = (refs: string[]) =>
        refs
          .map((item) => item.split(" - ")[0].trim())
          .filter((id) => id && !isValidUrl(id));

      const imageFileIds = extractFileIds(doc.image ?? []);

      const instructionFileIds =
        type === "recipe"
          ? (doc.instructions ?? [])
              .map((i: string) => {
                const parsed = parseJsonSafe<{ image?: string }>(i, {});
                return parsed.image && !isValidUrl(parsed.image)
                  ? parsed.image.trim()
                  : null;
              })
              .filter((id: string | null): id is string => Boolean(id))
          : [];

      await Promise.all(
        [...imageFileIds, ...instructionFileIds].map((fileId) =>
          storage.deleteFile(AppwriteConfig.BUCKET_ID, fileId)
        )
      );

      await deleteDocument(collectionId, postId);
      setFieldState("postData", null);
      router.back();

      Toast.show({
        type: "success",
        text1: `${type === "recipe" ? "Recipe" : "Post"} deleted successfully.`,
      });
    } catch (error) {
      Alert.alert("Error", `Failed to delete the ${type}. Please try again.`);
    } finally {
      dispatch(setRefreshProfile(true));
      dispatch(setLoading(false));
    }
  };

  const confirmDeletePost = () => {
    setFieldState("showModal", false);
    setTimeout(() => {
      Alert.alert(
        `Delete ${type === "recipe" ? "Recipe" : "Post"}`,
        `Are you sure you want to delete this ${type}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              const id = post.postData?.id;
              if (id) deletePost(id);
            },
          },
        ]
      );
    }, 300);
  };

  const handleAuthorPress = (authorId: string) => {
    router.push(
      authorId === currentUserId
        ? Routes.ProfileTab
        : { pathname: Routes.UserDetail, params: { id: authorId } }
    );
  };

  return {
    post,
    actions: { getPost, confirmDeletePost },
    handleAuthorPress,
  };
};

export default usePostController;
