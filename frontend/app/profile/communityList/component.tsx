import HeaderBar from "@/components/HeaderBar";
import InputBox from "@/components/InputBox";
import PostCard from "@/components/PostCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { styles as homeStyles } from "@/utility/home/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import { styles as searchStyles } from "@/utility/search/styles";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { ListingState, mainTabs } from "./controller";

type Props = {
  comList: ReturnType<typeof useFieldState<ListingState>>;
  handleCommunitySearch: (query: string) => void;
  resetCommunitySearch: () => void;
};

export default function CommunityListComponent({
  comList,
  handleCommunitySearch,
  resetCommunitySearch,
}: Props) {
  const { created, joined, activeTab, setFieldState, searchText, showLoading } =
    comList;

  const communityToDisplay =
    activeTab === "Joined" ? joined : activeTab === "Created" ? created : [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenWrapper>
        <FlatList
          style={profileStyles.headerContainer}
          contentContainerStyle={{
            paddingBottom: 30,
            backgroundColor: Colors.surface.background,
            flex: 1,
          }}
          data={communityToDisplay}
          keyExtractor={(item) => `${item.id}`}
          renderItem={({ item }) => (
            <View className="px-3">
              {showLoading ? (
                <ActivityIndicator size="large" color={Colors.brand.primary} />
              ) : (
                <PostCard post={item} />
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-row items-center justify-center mb-6 mt-6">
              <View style={homeStyles.divider} />
              <Text style={homeStyles.endText}>Nothing to show here</Text>
              <View style={homeStyles.divider} />
            </View>
          }
          ListHeaderComponent={
            <>
              <View style={{ backgroundColor: Colors.brand.onPrimary }}>
                <HeaderBar title="Your Communities" />
                <View className="px-3 py-2 flex-row justify-between items-center gap-2">
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
              </View>

              <View style={profileStyles.tabHeader} className="mb-4">
                {mainTabs.map((tab) => (
                  <Pressable
                    key={tab}
                    onPress={() =>
                      setFieldState(
                        "activeTab",
                        tab as ListingState["activeTab"]
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
            </>
          }
        />
      </ScreenWrapper>
    </>
  );
}
