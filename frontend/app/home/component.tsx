import MasonryList from "@/components/MasonryList";
import PostCard, { Post } from "@/components/PostCard";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Routes } from "@/constants/Routes";
import { useFieldState } from "@/hooks/useFieldState";
import { usePreventDoubleTap } from "@/hooks/usePreventDoubleTap";
import { styles } from "@/utility/home/styles";
import { router } from "expo-router";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { HomeState } from "./controller";

export type Props = {
  suggestions: string[];
  filteredPosts: Post[];
  home: ReturnType<typeof useFieldState<HomeState>>;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  interactionVersion: number;
};

export default function HomeComponent({
  suggestions,
  filteredPosts,
  home,
  onRefresh,
  refreshing,
  interactionVersion,
}: Props) {
  const { activeTab, activeSuggestion, setFieldState } = home;
  const onPress = usePreventDoubleTap(() => router.push(Routes.Search));

  const renderSuggestionBar = () => {
    const filteredSuggestions =
      activeTab === "Follow"
        ? suggestions.filter((s) => s !== "Communities")
        : suggestions;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.suggestContainer}
      >
        {filteredSuggestions.map((item) => {
          const isActive = activeSuggestion === item;
          return (
            <Pressable
              key={item}
              onPress={() => setFieldState("activeSuggestion", item)}
              className="px-5 py-1.5 mr-2.5 rounded-full"
              style={{
                backgroundColor: isActive
                  ? Colors.brand.primary
                  : Colors.surface.backgroundSoft,
              }}
            >
              <Text
                style={[
                  styles.suggestText,
                  {
                    color: isActive
                      ? Colors.brand.onPrimary
                      : Colors.text.primary,
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View className="flex-row">
          {["Follow", "Explore"].map((tab) => (
            <Pressable
              key={tab}
              onPress={() =>
                setFieldState("activeTab", tab as HomeState["activeTab"])
              }
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === tab
                        ? Colors.brand.primary
                        : Colors.text.disabled,
                  },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable testID="search-icon" onPress={onPress}>
            <IconSymbol name="magnifyingglass" color={Colors.brand.primary} />
          </Pressable>
        </View>
      </View>

      {activeSuggestion === "Communities" ? (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => `${item.id}-${interactionVersion}`}
          renderItem={({ item }) => (
            <View className="px-2">
              <PostCard post={item} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              colors={[Colors.brand.primary]}
              progressViewOffset={90}
            />
          }
          ListHeaderComponent={renderSuggestionBar()}
          ListEmptyComponent={
            <View className="flex-row items-center justify-center mb-6 mt-6">
              <View style={styles.divider} />
              <Text style={styles.endText}>Nothing to show here</Text>
              <View style={styles.divider} />
            </View>
          }
        />
      ) : (
        <MasonryList
          posts={filteredPosts}
          interactionVersion={interactionVersion}
          refreshing={refreshing}
          onRefresh={onRefresh}
          header={renderSuggestionBar()}
        />
      )}
    </View>
  );
}
