import { Colors } from "@/constants/Colors";
import { styles as searchStyles } from "@/utility/search/styles";
import { Pressable, Text } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";

type SelectionListProps = {
  getPageSuggestions: () => string[];
  toggleItemSelection: (item: string) => void;
  selectedItems: string[];
  onOpenModal: () => void;
};

const SelectionList = ({
  getPageSuggestions,
  toggleItemSelection,
  selectedItems,
  onOpenModal,
}: SelectionListProps) => (
  <>
    {getPageSuggestions().map((item) => {
      const isSelected = selectedItems.includes(item);

      return (
        <Pressable
          key={item}
          onPress={() => toggleItemSelection(item)}
          style={[
            searchStyles.itemContainer,
            {
              backgroundColor: isSelected
                ? Colors.brand.primaryDark
                : "transparent",
              borderColor: isSelected ? "transparent" : Colors.text.primary,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 13,
              color: isSelected
                ? Colors.brand.onPrimary
                : Colors.brand.onBackground,
            }}
          >
            {item}
          </Text>
        </Pressable>
      );
    })}

    <Pressable
      onPress={onOpenModal}
      style={[searchStyles.itemContainer, { paddingHorizontal: 20 }]}
    >
      <IconSymbol name="plus" size={16} color={Colors.text.primary} />
    </Pressable>
  </>
);

export default SelectionList;
