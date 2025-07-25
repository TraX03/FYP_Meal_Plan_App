import { availableMealtimes } from "@/app/planner/controller";
import CustomPicker from "@/components/CustomPicker";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { styles } from "@/utility/create/styles";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { ContainerProps } from "./container";
import { EntryItem } from "./controller";

type Props = ContainerProps & {
  getSuggestions: (query: string) => string[];
  handleFocus: (index: number | null) => void;
  handleChange: (index: number, field: keyof EntryItem, value: string) => void;
};

export default function EntryListFormComponent({
  type,
  create,
  controller,
  placeholder,
  label,
  getSuggestions,
  handleFocus,
  handleChange,
}: Props) {
  const { focusedIndex, setFieldState, area } = create;
  const isSingleEntry = type === "area";
  const entries: EntryItem[] = isSingleEntry
    ? [{ name: area || "" }]
    : (create[type] as EntryItem[]);
  const hasItems = isSingleEntry ? !!area : entries.length > 0;

  const showSuggestions = (index: number, value: string) => {
    const suggestions = getSuggestions(value);
    const isFocused = focusedIndex?.[type] === index;
    if (!isFocused || suggestions.length === 0) return null;

    const width =
      type === "category" ? "93%" : isSingleEntry ? "100%" : "68.5%";

    return (
      <View style={[styles.suggestionBox, { width }]}>
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            onPress={() => controller.selectSuggestion(type, index, suggestion)}
            className="px-3 py-2"
          >
            <Text>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEntryRow = (item: EntryItem, index: number) => (
    <View key={index} className="relative mb-3">
      <View className="flex-row items-center gap-2">
        {type === "mealtime" ? (
          <CustomPicker
            selectedValue={item.name}
            onValueChange={(value) => {
              const id =
                availableMealtimes.find((mt) => mt.label === value)?.id ??
                value;
              handleChange(index, "name", id);
            }}
            options={availableMealtimes.map((mt) => mt.label)}
            placeholder={placeholder}
            style={{ flex: 1, height: 40 }}
          />
        ) : (
          <TextInput
            testID={`name-input-${index}`}
            value={item.name}
            placeholder={placeholder}
            onFocus={() => handleFocus(index)}
            onBlur={() => handleFocus(null)}
            onChangeText={(text) => handleChange(index, "name", text)}
            style={styles.inputValue}
            placeholderTextColor={Colors.text.disabled}
          />
        )}

        {type === "ingredient" && (
          <TextInput
            testID={`ingredient-quantity-input-${index}`}
            value={item.quantity}
            placeholder="Qty"
            onChangeText={(text) => handleChange(index, "quantity", text)}
            style={styles.inputQuantity}
            placeholderTextColor={Colors.text.disabled}
          />
        )}

        {!isSingleEntry && (
          <TouchableOpacity
            testID={`remove-button-${index}`}
            onPress={() => controller.modifyEntry(type, "remove", index)}
          >
            <IconSymbol
              name="multiply.circle.fill"
              size={20}
              color={Colors.brand.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {type === "ingredient" && (
        <View className="mt-2">
          <TextInput
            testID={`ingredient-note-input-${index}`}
            value={item.note}
            placeholder="Note"
            onFocus={() => handleFocus(index)}
            onBlur={() => handleFocus(null)}
            onChangeText={(text) => handleChange(index, "note", text)}
            style={styles.inputValue}
            placeholderTextColor={Colors.text.disabled}
          />
        </View>
      )}

      {type !== "mealtime" && showSuggestions(index, item.name)}
    </View>
  );

  return (
    <>
      <View className="flex-row justify-between items-center">
        <Text style={styles.inputTitle}>
          {label ?? type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
        {hasItems && (
          <TouchableOpacity
            onPress={() => setFieldState(type, isSingleEntry ? "" : [])}
          >
            <Text style={styles.linkText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {entries.map(renderEntryRow)}

      {!isSingleEntry && (
        <TouchableOpacity
          onPress={() => controller.modifyEntry(type, "add")}
          className="mb-6 mt-2"
        >
          <Text style={{ color: Colors.brand.primary }}>+ Add {type}</Text>
        </TouchableOpacity>
      )}
    </>
  );
}
