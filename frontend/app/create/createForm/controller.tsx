import { PostType } from "@/components/PostCard";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import { useMediaHandler } from "@/hooks/useMediaHandler";
import { setLoading } from "@/redux/slices/loadingSlice";
import { AppDispatch } from "@/redux/store";
import {
  createDocument,
  getCurrentUser,
  getDocumentById,
  updateDocument,
} from "@/services/Appwrite";
import { generateTagsWithGemini } from "@/services/GeminiApi";
import { detectBackgroundDarkness, isValidUrl } from "@/utility/imageUtils";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { Alert, Keyboard } from "react-native";
import { ID, Permission, Role } from "react-native-appwrite";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { EntryItem, EntryType } from "./entryListForm/controller";

export interface Ingredient {
  name: string;
  quantity: string;
  note?: string;
}

export interface Instruction {
  text: string;
  image?: string;
}

export interface CreateFormState {
  title: string;
  content: string;
  images: string[];
  postType: PostType;
  ingredient: Ingredient[];
  instructions: Instruction[];
  category: { name: string }[];
  area: string;
  mealtime: { name: string }[];
  focusedIndex: { [K in EntryType]?: number | null };
  keyboardVisible: boolean;
}

export const useCreateFormController = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { uploadFile } = useMediaHandler();
  const { type, communityId } = useLocalSearchParams<{
    type: string;
    communityId: string;
  }>();

  const create = useFieldState<CreateFormState>({
    title: "",
    content: "",
    images: [],
    postType: (type || "discussion") as PostType,
    ingredient: [],
    instructions: [{ text: "" }],
    category: [],
    area: "",
    mealtime: [],
    focusedIndex: {},
    keyboardVisible: false,
  });

  const handleSubmit = useCallback(async () => {
    dispatch(setLoading(true));

    try {
      const user = await getCurrentUser();
      const userId = user.$id;

      const [uploadedImageIds, metadata, tags] = await Promise.all([
        Promise.all(
          create.images.map((uri) => uploadFile({ uri }, userId))
        ).then((ids) => ids.filter((id): id is string => !!id)),

        Promise.all(
          create.images.map(async (uri) => {
            try {
              const isDark = await detectBackgroundDarkness(uri);
              return { isDark };
            } catch {
              return { isDark: false };
            }
          })
        ).then((images) => ({ images })),

        generateTagsWithGemini(create.postType, create),
      ]);

      const commonFields = {
        image: uploadedImageIds,
        created_at: new Date().toISOString(),
        metadata: JSON.stringify(metadata),
        tags,
      };

      const payloadMap: Record<PostType, any> = {
        discussion: {
          ...commonFields,
          title: create.title,
          content: create.content,
          type: create.postType,
          author_id: userId,
          ...(communityId ? { community_id: [communityId] } : {}),
        },
        tips: {
          ...commonFields,
          title: create.title,
          content: create.content,
          type: create.postType,
          author_id: userId,
          ...(communityId ? { community_id: [communityId] } : {}),
        },
        community: {
          ...commonFields,
          name: create.title,
          description: create.content,
          image: uploadedImageIds[0],
          creator_id: userId,
        },
        recipe: {
          ...commonFields,
          title: create.title,
          description: create.content,
          author_id: userId,
          ingredients: create.ingredient.map((i) => JSON.stringify(i)),
          instructions: await Promise.all(
            create.instructions.map(async ({ image, text }) => {
              const uploadedImage =
                image && !isValidUrl(image)
                  ? await uploadFile({ uri: image }, userId)
                  : image;

              return JSON.stringify({
                text,
                image: uploadedImage ?? undefined,
              });
            })
          ),
          category: create.category.map((c) => c.name.toLowerCase()),
          area: create.area.toLowerCase(),
          mealtime: create.mealtime.map((mt) => mt.name),
          ...(communityId ? { community_id: [communityId] } : {}),
        },
      };

      const collectionMap: Record<PostType, string> = {
        recipe: AppwriteConfig.RECIPES_COLLECTION_ID,
        discussion: AppwriteConfig.POSTS_COLLECTION_ID,
        tips: AppwriteConfig.POSTS_COLLECTION_ID,
        community: AppwriteConfig.COMMUNITIES_COLLECTION_ID,
      };

      await createDocument(
        collectionMap[create.postType],
        payloadMap[create.postType],
        ID.unique(),
        [Permission.write(Role.user(userId))]
      );

      if (communityId) {
        try {
          const community = await getDocumentById(
            AppwriteConfig.COMMUNITIES_COLLECTION_ID,
            communityId
          );
          const currentCount = community?.posts_count ?? 0;

          await updateDocument(
            AppwriteConfig.COMMUNITIES_COLLECTION_ID,
            communityId,
            {
              posts_count: currentCount + 1,
            }
          );
        } catch (err) {
          console.warn("Failed to update community post count:", err);
        }
      }

      Toast.show({
        type: "success",
        text1: `${
          create.postType[0].toUpperCase() + create.postType.slice(1)
        } created successfully!`,
      });

      router.back();
    } catch (err) {
      console.warn("Failed to create post:", err);
      Alert.alert(
        "Error",
        `Failed to create ${create.postType}. Please try again.`
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [create, dispatch, getCurrentUser]);

  const isFormValid = useMemo(() => {
    const hasText = (str: string) => str.trim().length > 0;
    const {
      title,
      content,
      images,
      ingredient,
      instructions,
      area,
      category,
      postType,
      mealtime,
    } = create;

    if (postType === "recipe") {
      return (
        hasText(title) &&
        ingredient.length > 0 &&
        ingredient.every((i) => hasText(i.name) && hasText(i.quantity)) &&
        instructions.length > 0 &&
        instructions.every((i) => hasText(i.text)) &&
        hasText(area) &&
        category.length > 0 &&
        category.every((c) => hasText(c.name)) &&
        mealtime.length > 0 &&
        mealtime.every((mt) => hasText(mt.name))
      );
    }

    return hasText(title) && hasText(content) && images.length > 0;
  }, [create]);

  const updateEntry = useCallback(
    (
      type: keyof CreateFormState,
      index: number,
      field: keyof EntryItem,
      value: string
    ) => {
      if (type === "area" && field === "name") {
        create.setFieldState("area", value.trim());
        return;
      }

      const updated = [...(create[type] as any[])];

      if (
        (field === "quantity" || field === "note") &&
        updated[index]?.[field] === undefined
      ) {
        return;
      }

      updated[index][field] = value.trim();
      create.setFieldState(type, updated);
    },
    [create]
  );

  const modifyEntry = useCallback(
    (type: keyof CreateFormState, action: "add" | "remove", index?: number) => {
      if (type === "area") return;
      const updated = [...(create[type] as any[])];
      if (action === "add") {
        updated.push(
          type === "ingredient"
            ? { name: "", quantity: "", note: "" }
            : { name: "" }
        );
      } else if (action === "remove" && index !== undefined) {
        updated.splice(index, 1);
      }
      create.setFieldState(type, updated);
    },
    [create]
  );

  const selectSuggestion = useCallback(
    (type: keyof CreateFormState, index: number, suggestion: string) => {
      if (type === "area") {
        create.setFields({
          area: suggestion,
          focusedIndex: { ...create.focusedIndex, [type]: null },
        });
        Keyboard.dismiss();
        return;
      }
      const updated = [...(create[type] as any[])];
      updated[index].name = suggestion;
      create.setFields({
        [type]: updated,
        focusedIndex: { ...create.focusedIndex, [type]: null },
      });
      Keyboard.dismiss();
    },
    [create]
  );

  const modifyInstruction = useCallback(
    (action: "add" | "remove", index?: number) => {
      const updated = [...create.instructions];
      if (action === "add") updated.push({ text: "" });
      else if (action === "remove" && index !== undefined)
        updated.splice(index, 1);
      create.setFieldState("instructions", updated);
    },
    [create]
  );

  const updateInstruction = useCallback(
    (index: number, text: string) => {
      const updated = [...create.instructions];
      updated[index].text = text;
      create.setFieldState("instructions", updated);
    },
    [create]
  );

  const updateInstructionImage = useCallback(
    async (index: number, shouldRemove = false) => {
      const updated = [...create.instructions];
      if (shouldRemove) {
        updated[index].image = undefined;
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          quality: 1,
        });
        if (!result.canceled && result.assets.length > 0) {
          updated[index].image = result.assets[0].uri;
        }
      }
      create.setFieldState("instructions", updated);
    },
    [create]
  );

  return {
    create,
    controller: {
      handleSubmit,
      updateEntry,
      modifyEntry,
      selectSuggestion,
      modifyInstruction,
      updateInstruction,
      updateInstructionImage,
      isFormValid,
    },
  };
};

export default useCreateFormController;
