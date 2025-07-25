import MasonryList from "@/components/MasonryList";
import UserCard from "@/components/UserCard";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { User } from "@/utility/fetchUtils";
import { styles } from "@/utility/search/styles";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SearchResultState, Tab, tabs } from "./controller";

export type Props = {
  searchResult: ReturnType<typeof useFieldState<SearchResultState>>;
  filteredUsers: User[];
  interactionVersion: number;
  postLoading: boolean;
  isFromMealPlan: boolean;
  context?: string;
};

export default function SearchResultComponent({
  searchResult,
  filteredUsers,
  interactionVersion,
  postLoading,
  isFromMealPlan,
  context,
}: Props) {
  const { activeTab, filteredPosts, setFieldState } = searchResult;

  const filteredTabs: Tab[] = isFromMealPlan ? ["Recipes"] : tabs.slice();

  return (
    <>
      <View testID="search-result-container" style={styles.tabContainer}>
        <View style={styles.tabsWrapper}>
          {filteredTabs.map((tab, index) => (
            <View key={tab} style={styles.tabTextContainer}>
              <Pressable onPress={() => setFieldState("activeTab", tab)}>
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === tab
                          ? Colors.brand.primaryDark
                          : Colors.text.disabled,
                    },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
              {index < filteredTabs.length - 1 && !isFromMealPlan && (
                <Text style={styles.divider}>|</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === "Users" ? (
          filteredUsers.length === 0 ? (
            <View className="items-center justify-center mt-10">
              <Text style={styles.noUserText}>No users found</Text>
            </View>
          ) : (
            <View className="mt-1">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </View>
          )
        ) : postLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brand.primary} />
          </View>
        ) : filteredPosts.length === 0 ? (
          <View className="items-center justify-center mt-10">
            <Text style={styles.noFoundText}>
              No results found for "{activeTab}"
            </Text>
          </View>
        ) : (
          <MasonryList
            posts={filteredPosts}
            interactionVersion={interactionVersion}
            source={"searchResults"}
            isFromMealPlan={isFromMealPlan}
            context={context}
          />
        )}
      </ScrollView>
    </>
  );
}
