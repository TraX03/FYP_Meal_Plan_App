import InputBox from "@/components/InputBox";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { SuggestionType, useSuggestionList } from "@/hooks/useSuggestionList";
import { fetchSuggestions } from "@/services/DatamuseApi";
import { styles as searchStyles } from "@/utility/search/styles";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "./styles";

export type Mode = "datamuse-only" | "suggestion-then-custom";

type SearchSuggestionProps = {
  onSelectItem: (item: string) => void;
  mode?: Mode;
  placeholder?: string;
  suggestionType?: SuggestionType;
};

const SearchWithSuggestion = ({
  onSelectItem,
  mode = "suggestion-then-custom",
  placeholder = "Item",
  suggestionType,
}: SearchSuggestionProps) => {
  const [searchText, setSearchText] = useState("");
  const [datamuseSuggestions, setDatamuseSuggestions] = useState<string[]>([]);
  const [isUsingDatamuse, setIsUsingDatamuse] = useState(
    mode === "datamuse-only"
  );

  const trimmedText = searchText.trim();
  const shouldShowAddButton = isUsingDatamuse && trimmedText !== "";

  const getSuggestions = suggestionType
    ? useSuggestionList(suggestionType).getSuggestions
    : () => [];

  const displayedSuggestions = isUsingDatamuse
    ? datamuseSuggestions
    : getSuggestions(trimmedText);

  useEffect(() => {
    if (!isUsingDatamuse || !trimmedText) {
      setDatamuseSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const results = await fetchSuggestions(trimmedText);
      const capitalized = results.map(
        (item) => item.charAt(0).toUpperCase() + item.slice(1)
      );
      setDatamuseSuggestions(capitalized);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [trimmedText, isUsingDatamuse]);

  const handleSelect = (item: string) => {
    onSelectItem(item);
    setSearchText(item);
    setDatamuseSuggestions([]);
  };

  const toggleSuggestionMode = () => {
    setIsUsingDatamuse((prev) => !prev);
    setSearchText("");
    setDatamuseSuggestions([]);
  };

  return (
    <>
      <View className="flex-row items-center px-2.5">
        <View className="flex-1 min-w-[70%]">
          <InputBox
            value={searchText}
            onChangeText={setSearchText}
            placeholder={`${
              isUsingDatamuse ? "Enter" : "Search"
            } ${placeholder.toLowerCase()}...`}
            icon="magnifyingglass"
            containerStyle={searchStyles.searchBar}
            clearColor={Colors.brand.primary}
          />
        </View>

        {shouldShowAddButton && (
          <Pressable
            testID="add-button"
            onPress={() => handleSelect(trimmedText)}
            style={styles.modalAddButton}
          >
            <IconSymbol name="plus" size={16} color={Colors.brand.onPrimary} />
          </Pressable>
        )}
      </View>

      <ScrollView className="mt-3 mx-3" showsVerticalScrollIndicator={false}>
        <View style={styles.indicatorContainer}>
          <Text style={styles.modeIndicator}>
            Showing{" "}
            {isUsingDatamuse ? "dictionary" : suggestionType ?? "custom"}{" "}
            suggestions.
          </Text>
          {mode === "suggestion-then-custom" && (
            <Pressable onPress={toggleSuggestionMode}>
              <Text style={styles.modeChange}>Change</Text>
            </Pressable>
          )}
        </View>

        {displayedSuggestions.map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() => handleSelect(item)}
            className="my-1"
          >
            <Text style={styles.resultText}>{item}</Text>
          </Pressable>
        ))}

        {mode === "suggestion-then-custom" &&
          !isUsingDatamuse &&
          trimmedText !== "" && (
            <View className="py-5 self-end px-2.5">
              <Text style={styles.endText}>
                Didn't find what you're looking for?
              </Text>
              <Pressable onPress={toggleSuggestionMode}>
                <Text style={styles.addText}>Add it yourself!</Text>
              </Pressable>
            </View>
          )}
      </ScrollView>
    </>
  );
};

export default SearchWithSuggestion;
