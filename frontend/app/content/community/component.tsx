import { subTabs } from "@/app/profile/component";
import ActionSheetModal from "@/components/ActionSheetModal";
import ErrorScreen from "@/components/ErrorScreen";
import IconButton from "@/components/IconButton";
import InputBox from "@/components/InputBox";
import MasonryList from "@/components/MasonryList";
import ScreenWrapper from "@/components/ScreenWrapper";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Routes } from "@/constants/Routes";
import { useFieldState } from "@/hooks/useFieldState";
import { useInteraction } from "@/hooks/useInteraction";
import { styles } from "@/utility/content/community/styles";
import { styles as postStyles } from "@/utility/content/posts/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import { styles as searchStyles } from "@/utility/search/styles";
import { router } from "expo-router";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { CommunityState } from "./controller";

type Props = {
  community: ReturnType<typeof useFieldState<CommunityState>>;
  interactionVersion: number;
  handleCommunitySearch: (query: string) => void;
  resetCommunitySearch: () => void;
  interactionRecords: Record<string, any>;
  getCommunity: (communityId: string) => Promise<void>;
  currentUserId: string | undefined;
  checkLogin: (next: string | (() => void)) => void;
};

export default function CommunityComponent({
  community,
  interactionVersion,
  handleCommunitySearch,
  resetCommunitySearch,
  interactionRecords,
  getCommunity,
  currentUserId,
  checkLogin,
}: Props) {
  const {
    communityData,
    metadata,
    activeTab,
    setFieldState,
    searchText,
    showAddOptionModal,
    recipePosts,
    tipsPosts,
    discussionPosts,
  } = community;

  if (!communityData)
    return <ErrorScreen message="Community not found or invalid." />;

  const { name, description, membersCount, image, postsCount } = communityData;
  const { width } = Dimensions.get("window");
  const isBackgroundDark = metadata?.images?.[0]?.isDark ?? false;

  const interaction = useInteraction(communityData.id ?? "", {
    isJoining: interactionRecords?.[`join_${communityData.id}`]?.$id != null,
    joinDocId: interactionRecords?.[`join_${communityData.id}`]?.$id,
  });

  const isJoined = interaction?.isJoining ?? false;
  const toggleJoin = interaction?.toggleJoin ?? (() => {});

  const postsToDisplay =
    activeTab === "Recipe"
      ? recipePosts
      : activeTab === "Tips"
      ? tipsPosts
      : activeTab === "Discussion"
      ? discussionPosts
      : [];

  return (
    <>
      <ActionSheetModal
        visible={showAddOptionModal}
        onClose={() => setFieldState("showAddOptionModal", false)}
        options={[
          {
            label: "From Your Posts",
            action: () =>
              router.push({
                pathname: Routes.Listing,
                params: { type: "created", communityId: communityData.id },
              }),
          },
          {
            label: "Create New Recipe",
            action: () =>
              router.push({
                pathname: Routes.CreateForm,
                params: { type: "recipe", communityId: communityData.id },
              }),
          },
          {
            label: "Create New Post",
            action: () =>
              router.push({
                pathname: Routes.CreateForm,
                params: { type: "tips", communityId: communityData.id },
              }),
          },
        ]}
      />

      <ScreenWrapper>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="relative">
            <Image
              source={{ uri: image }}
              style={{ width, height: 320 }}
              resizeMode="cover"
            />
            <View style={postStyles.overlayContainer}>
              <IconButton
                name="chevron.left"
                onPress={router.back}
                isBackgroundDark={isBackgroundDark}
              />
              <View className="flex-row gap-3">
                <IconButton
                  name="arrow.clockwise.circle"
                  onPress={() => getCommunity(communityData.id)}
                  isBackgroundDark={isBackgroundDark}
                />
                <IconButton
                  name="ellipsis"
                  onPress={() => {}}
                  isBackgroundDark={isBackgroundDark}
                />
              </View>
            </View>
          </View>

          <View style={[styles.info, { width }]}>
            <View className="px-5">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-[15px]">
                  <Text style={styles.title}>{name}</Text>
                </View>
                {communityData.creatorId !== currentUserId && (
                  <Pressable onPress={toggleJoin} style={styles.joinButton}>
                    <Text style={styles.joinText}>
                      {isJoined ? "Leave" : "Join"}
                    </Text>
                  </Pressable>
                )}
              </View>

              {!!description && (
                <Text className="text-[15px] mt-[12px]">{description}</Text>
              )}

              <Text style={styles.stats}>
                {membersCount} members | {postsCount} posts
              </Text>
            </View>

            <View className="px-3 py-2 flex-row justify-between items-center gap-2 mt-5 mb-2">
              <View className="flex-1">
                <InputBox
                  value={searchText}
                  onChangeText={(text) => setFieldState("searchText", text)}
                  placeholder="Search..."
                  icon="magnifyingglass"
                  containerStyle={searchStyles.searchBar}
                  clearColor={Colors.brand.primary}
                  onSubmitEditing={() => handleCommunitySearch(searchText)}
                />
              </View>
              <Pressable onPress={() => resetCommunitySearch()}>
                <IconSymbol
                  name={"arrow.clockwise.circle"}
                  color={Colors.brand.primary}
                />
              </Pressable>
            </View>

            <View style={profileStyles.tabHeader}>
              {subTabs.map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() =>
                    setFieldState(
                      "activeTab",
                      tab as CommunityState["activeTab"]
                    )
                  }
                >
                  <Text
                    style={{
                      fontSize: 17,
                      color:
                        activeTab === tab
                          ? Colors.brand.primary
                          : Colors.text.disabled,
                      fontFamily:
                        activeTab === tab ? "RobotoBold" : "RobotoRegular",
                    }}
                  >
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View
              className="pt-2"
              style={{ backgroundColor: Colors.surface.background }}
            >
              <MasonryList
                posts={postsToDisplay}
                interactionVersion={interactionVersion}
              />
            </View>
          </View>
        </ScrollView>

        <Pressable
          style={styles.generateButton}
          onPress={() =>
            checkLogin(() => setFieldState("showAddOptionModal", true))
          }
        >
          <IconSymbol name="plus" color={Colors.brand.onPrimary} size={22} />
        </Pressable>
      </ScreenWrapper>
    </>
  );
}
