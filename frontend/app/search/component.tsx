import HeaderBar from "@/components/HeaderBar";
import InputBox from "@/components/InputBox";
import ScreenWrapper from "@/components/ScreenWrapper";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { styles as profileStyles } from "@/utility/profile/styles";
import { styles } from "@/utility/search/styles";
import { router, Stack } from "expo-router";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { pages } from "../onboarding/component";
import { availableMealtimes } from "../planner/controller";
import { SearchContext, searchModeOptions, SearchState } from "./controller";
import SearchResultContainer from "./searchResult/container";

type Props = {
  search: ReturnType<typeof useFieldState<SearchState>>;
  handleSearch: (term?: string, context?: SearchContext) => Promise<void>;
  handleClear: () => void;
  isFromMealPlan: boolean;
  context?: string;
};

export default function SearchComponent({
  search,
  handleSearch,
  handleClear,
  isFromMealPlan,
  context,
}: Props) {
  const {
    allFilteredPosts,
    filteredUsers,
    recentSearches,
    searchText,
    hasSearched,
    expanded,
    postLoading,
    setFieldState,
    searchMode,
  } = search;

  const displayedSearches = expanded
    ? recentSearches
    : recentSearches.slice(0, 7);

  const cuisinePage = pages.find((p) => p.keyName === "cuisine");

  const searchTag = (
    label: string,
    onPress: () => void,
    isSelected = false
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[
        styles.itemContainer,
        {
          borderColor: isSelected ? "transparent" : Colors.text.primary,
          backgroundColor: isSelected ? Colors.brand.primary : "transparent",
        },
      ]}
    >
      <Text
        style={{
          fontSize: 13,
          color: isSelected ? Colors.brand.onPrimary : Colors.text.primary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenWrapper>
        <View style={profileStyles.headerContainer}>
          <HeaderBar
            titleComponent={
              <InputBox
                value={searchText}
                onChangeText={(text) => setFieldState("searchText", text)}
                placeholder="Search..."
                icon="magnifyingglass"
                containerStyle={styles.searchBar}
                clearColor={Colors.brand.primary}
                onSubmitEditing={() => handleSearch()}
              />
            }
            onBackPress={() => {
              if (hasSearched) {
                setFieldState("hasSearched", false);
              } else {
                router.back();
              }
            }}
          />
          {hasSearched ? (
            <SearchResultContainer
              allFilteredPosts={allFilteredPosts}
              filteredUsers={filteredUsers}
              postLoading={postLoading}
              isFromMealPlan={isFromMealPlan}
              context={context}
            />
          ) : (
            <View className="px-4 py-3">
              <View className="flex-row items-center justify-between mb-4 mt-3">
                <Text style={styles.titleText}>Recent Searches</Text>
                <TouchableOpacity testID="clear-button" onPress={handleClear}>
                  <IconSymbol
                    name="trash"
                    color={Colors.brand.primary}
                    size={22}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-3">
                {displayedSearches.length === 0 ? (
                  <Text style={{ color: Colors.feedback.unknown }}>
                    No recent searches
                  </Text>
                ) : (
                  displayedSearches.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSearch(item)}
                    >
                      <View style={styles.itemContainer}>
                        <Text style={styles.itemText}>{item}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {recentSearches.length > 7 && (
                <TouchableOpacity
                  onPress={() => {
                    setFieldState("expanded", !expanded);
                  }}
                  className="mt-2 mb-2"
                >
                  <Text style={styles.expandText}>
                    {expanded ? "Show Less" : "Show More"}
                  </Text>
                </TouchableOpacity>
              )}

              <View className="mt-6">
                <Text style={styles.titleText}>Search Mode</Text>
              </View>

              <View className="flex-row flex-wrap gap-3 mt-3">
                {searchModeOptions.map((mode) =>
                  searchTag(
                    mode.label,
                    () => setFieldState("searchMode", mode.id),
                    searchMode === mode.id
                  )
                )}
              </View>

              <View className="mt-6">
                <Text style={styles.titleText}>Search By Mealtime</Text>
              </View>

              <View className="flex-row flex-wrap gap-3 mt-3">
                {availableMealtimes
                  .filter((mt) => mt.id !== "all")
                  .map((mt) =>
                    searchTag(mt.label, () =>
                      handleSearch(mt.label, "mealtime")
                    )
                  )}
              </View>

              <View className="mt-6">
                <Text style={styles.titleText}>Search By Cuisine</Text>
              </View>

              <View className="flex-row flex-wrap gap-3 mt-3">
                {cuisinePage?.suggestions?.map((label) =>
                  searchTag(label, () => handleSearch(label, "area"))
                )}
              </View>
            </View>
          )}
        </View>
      </ScreenWrapper>
    </>
  );
}
