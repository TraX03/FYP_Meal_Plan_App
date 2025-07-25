import { Meal } from "@/app/planner/controller";
import ActionSheetModal from "@/components/ActionSheetModal";
import BottomSheetModal from "@/components/BottomSheetModal";
import ErrorScreen from "@/components/ErrorScreen";
import FullscreenImageViewer from "@/components/FullscreenImageViewer";
import IconButton from "@/components/IconButton";
import { PostType } from "@/components/PostCard";
import RecipeStep from "@/components/RecipeStep";
import ScreenWrapper from "@/components/ScreenWrapper";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { useInteraction } from "@/hooks/useInteraction";
import { usePreventDoubleTap } from "@/hooks/usePreventDoubleTap";
import { styles } from "@/utility/content/posts/styles";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PostState, RecipePost } from "./controller";
import ForumContainer from "./forum/container";
import RecipeContainer from "./recipe/container";
import RatingModalContainer from "./recipe/ratingModal/container";

type Props = {
  post: ReturnType<typeof useFieldState<PostState>>;
  actions: {
    getPost: (postId: string) => Promise<void>;
    confirmDeletePost: () => void;
  };
  postType: PostType;
  handleAuthorPress: (postAuthorId: string) => void;
  isFromMealPlan?: boolean;
  addRecipeToMealPlan:
    | ((
        recipe: Meal["recipes"][0],
        mealtime: string,
        targetDate: Date
      ) => Promise<void>)
    | undefined;
  context?: string;
  communityId?: string;
  assignToCommunity:
    | ((
        postId: string,
        postType: PostType,
        communityId: string
      ) => Promise<void>)
    | undefined;
  currentUserId: string | undefined;
};

export default function PostComponent({
  post,
  actions,
  postType,
  handleAuthorPress,
  isFromMealPlan,
  addRecipeToMealPlan,
  communityId,
  assignToCommunity,
  currentUserId,
  context,
}: Props) {
  const {
    postData,
    showStepsModal,
    showRatingModal,
    fullscreenImage,
    imageIndex,
    showModal,
    metadata,
    setFieldState,
    keyboardVisible,
    interactionState,
  } = post;

  if (!postData) return <ErrorScreen message="Post not found or invalid." />;

  const onAuthorPress = usePreventDoubleTap(() =>
    handleAuthorPress(postData.authorId)
  );

  const handleAdd = usePreventDoubleTap(() => {
    if (isFromMealPlan && addRecipeToMealPlan && recipeData) {
      addRecipeToMealPlan(
        {
          id: recipeData.id,
          name: recipeData.title,
          image: recipeData.images[0],
        },
        mealtime,
        selectedDate
      );
    } else if (communityId && assignToCommunity && postData) {
      assignToCommunity(postData.id, postType, communityId);
    }
  });

  const { isLiked, isBookmarked, toggleLike, toggleBookmark } = useInteraction(
    postData.id,
    interactionState
  );

  const { width } = Dimensions.get("window");
  const isDark = metadata.images?.[imageIndex]?.isDark ?? false;
  const recipeData = postType === "recipe" ? (postData as RecipePost) : null;

  const parsedContext = useMemo(() => {
    try {
      return context ? JSON.parse(context as string) : {};
    } catch {
      return {};
    }
  }, [context]);

  const mealtime = parsedContext.mealtime as string;
  const selectedDate = parsedContext.selectedDate;

  const handleImageScroll = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setFieldState("imageIndex", newIndex);
  };

  const renderImages = () => (
    <View className="relative">
      <FlatList
        data={postData.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => `${i}`}
        onMomentumScrollEnd={handleImageScroll}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width, height: 320 }}
            resizeMode="cover"
          />
        )}
      />
      {postData.images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {postData.images.map((_, idx) => (
            <View
              key={idx}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: isDark
                  ? imageIndex === idx
                    ? Colors.brand.onPrimary
                    : Colors.overlay.white
                  : imageIndex === idx
                  ? Colors.surface.disabled
                  : Colors.overlay.light,
              }}
            />
          ))}
        </View>
      )}
      <View style={styles.overlayContainer}>
        <IconButton
          name="chevron.left"
          onPress={router.back}
          isBackgroundDark={isDark}
        />
        <View className="flex-row gap-4">
          <IconButton
            name="arrow.clockwise.circle"
            onPress={() => actions.getPost(postData.id)}
            isBackgroundDark={isDark}
          />
          <IconButton
            name="arrow.up.left.and.arrow.down.right"
            onPress={() =>
              setFieldState("fullscreenImage", postData.images[imageIndex])
            }
            isBackgroundDark={isDark}
          />
          <IconButton
            name="ellipsis"
            onPress={() => setFieldState("showModal", !showModal)}
            isBackgroundDark={isDark}
          />
        </View>
      </View>
    </View>
  );

  const renderAuthor = () => (
    <Text style={styles.authorText}>
      by{" "}
      <Text style={styles.authorName} onPress={onAuthorPress}>
        {postData.author}
      </Text>
    </Text>
  );

  const renderStats = () => (
    <View className="items-end">
      <View className="flex-row gap-1.5">
        <Pressable onPress={toggleLike}>
          <IconSymbol
            name={isLiked ? "heart.fill" : "heart"}
            color={Colors.brand.primary}
          />
        </Pressable>
        <Pressable onPress={toggleBookmark}>
          <IconSymbol
            name={isBookmarked ? "bookmark.fill" : "bookmark"}
            color={Colors.brand.primary}
          />
        </Pressable>
      </View>
      <Text style={styles.statsText}>
        {`${postData.likesCount} Likes | ${postData.bookmarksCount} Saves`}
      </Text>
    </View>
  );

  const renderSpecificContent = () => {
    if (recipeData) return <RecipeContainer post={post} />;
    if (postType === "tips" || postType === "discussion")
      return <ForumContainer post={post} />;
    return null;
  };

  return (
    <>
      <FullscreenImageViewer
        imageUri={fullscreenImage}
        onClose={() => setFieldState("fullscreenImage", null)}
      />

      <ActionSheetModal
        visible={showModal}
        onClose={() => setFieldState("showModal", false)}
        options={[
          ...(postData.authorId === currentUserId
            ? [
                {
                  label: "Edit Post",
                },
              ]
            : []),
          { label: "Share Post" },
          { label: "Report Post" },
          ...(postData.authorId === currentUserId
            ? [
                {
                  label: "Delete Post",
                  action: actions.confirmDeletePost,
                  isDestructive: true,
                },
              ]
            : []),
        ]}
      />

      {postType === "recipe" && (
        <>
          <BottomSheetModal
            isVisible={showStepsModal}
            onClose={() => setFieldState("showStepsModal", false)}
            modalStyle={styles.instructionModal}
            zIndex={10}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalHeader}>All Steps</Text>
              {recipeData?.instructions?.filter(Boolean).map((step, index) => (
                <RecipeStep key={index} index={index} step={step} />
              ))}
            </ScrollView>
          </BottomSheetModal>

          <BottomSheetModal
            isVisible={showRatingModal}
            onClose={() => setFieldState("showRatingModal", false)}
            modalStyle={[
              styles.instructionModal,
              keyboardVisible ? { flex: 1 } : { height: "80%" },
            ]}
            zIndex={10}
          >
            <RatingModalContainer postData={postData} post={post} />
          </BottomSheetModal>
        </>
      )}

      <GestureHandlerRootView>
        <ScreenWrapper>
          <KeyboardAvoidingView
            behavior="height"
            style={!keyboardVisible && { flexGrow: 1 }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={[
                styles.container,
                { backgroundColor: Colors.surface.background },
              ]}
              contentContainerStyle={{
                paddingBottom:
                  postType === "recipe" && (isFromMealPlan || communityId)
                    ? 100
                    : 10,
              }}
            >
              {renderImages()}

              <View style={styles.contentContainer}>
                {postType !== "recipe" && (
                  <Text style={styles.recipeTitle}>{postData.title}</Text>
                )}

                <View
                  className={`flex-row justify-between ${
                    postType === "recipe" ? "items-end" : "items-center"
                  }`}
                >
                  <View className="flex-1 pr-3">
                    {postType === "recipe" && (
                      <Text style={styles.recipeTitle}>{postData.title}</Text>
                    )}
                    {renderAuthor()}
                  </View>
                  {renderStats()}
                </View>
              </View>

              {renderSpecificContent()}
            </ScrollView>
          </KeyboardAvoidingView>

          {(isFromMealPlan || communityId) && (
            <View style={styles.fixedContainer}>
              <Pressable onPress={handleAdd} style={styles.mealPlanButton}>
                <Text style={styles.ratingButtonText}>
                  {isFromMealPlan ? "Add to Meal Plan" : "Add to Community"}
                </Text>
              </Pressable>
            </View>
          )}
        </ScreenWrapper>
      </GestureHandlerRootView>
    </>
  );
}
