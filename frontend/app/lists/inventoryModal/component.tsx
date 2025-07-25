import CustomPicker from "@/components/CustomPicker";
import InputBox from "@/components/InputBox";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { capitalize } from "@/utility/capitalize";
import { styles as createStyles } from "@/utility/create/styles";
import { styles } from "@/utility/lists/styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UNIT_CONVERSIONS } from "../controller";
import { ContainerProps } from "./container";
import { BatchUpdate, ModalState, SingleUpdate } from "./controller";

type Props = ContainerProps & {
  hasMismatch: {
    hasExpiryMismatch: (expiries: string[], quantityCount: number) => boolean;
    hasQuantityMismatch: (
      quantityText: string[],
      units: string[],
      checkedCount: number
    ) => boolean;
  };
  modifyDraftFieldAtIndex: (update: SingleUpdate | BatchUpdate) => void;
  modifyNewItemDraftField: (update: SingleUpdate | BatchUpdate) => void;
  isFromInventory?: boolean | undefined;
  modal: ReturnType<typeof useFieldState<ModalState>>;
  getSuggestions: (query: string) => string[];
  selectSuggestion: (suggestion: string) => void;
};

export default function InventoryModalComponent({
  lists,
  checkedItems,
  handleMoveToInventory,
  hasMismatch,
  modifyDraftFieldAtIndex,
  modifyNewItemDraftField,
  isFromInventory,
  modal,
  getSuggestions,
  selectSuggestion,
}: Props) {
  const {
    setFieldState,
    currentStepIndex,
    showDatePicker,
    datePickerIndex,
    formDrafts,
    showLoading,
  } = lists;

  const { newItemDraft, isFocus, searchText } = modal;
  const selectedItem = !isFromInventory
    ? checkedItems?.[currentStepIndex]
    : undefined;

  const checkedCount = selectedItem?.checkedCount ?? 1;
  const itemCount = parseInt(newItemDraft.itemCount ?? "1", 10) || 1;

  const safeCheckedItems = checkedItems ?? [];
  const isLastStep = currentStepIndex < safeCheckedItems.length - 1;

  const currentDraft = formDrafts?.[currentStepIndex] ?? {
    quantity: undefined,
    unit: [""],
    expiries: [""],
  };

  const draft = isFromInventory ? newItemDraft : currentDraft;
  const countToCheck = isFromInventory ? itemCount : checkedCount;

  const hasExpiryMismatch = hasMismatch.hasExpiryMismatch(
    draft.expiries ?? [],
    countToCheck
  );

  const hasQuantityMismatch = hasMismatch.hasQuantityMismatch(
    draft.quantityText ?? [],
    draft.unit ?? [],
    countToCheck
  );

  const isDisabled = hasExpiryMismatch || hasQuantityMismatch;

  return showLoading ? (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator
        testID="activity-indicator"
        size="large"
        color={Colors.brand.primary}
        style={{ marginVertical: 20 }}
      />
    </View>
  ) : (
    <ScrollView showsVerticalScrollIndicator={false}>
      {!isFromInventory && selectedItem && (
        <View className="flex-row items-center">
          <Text className="text-[16px]">
            <Text style={{ fontFamily: "RobotoMedium" }}>Item: </Text>
            {capitalize(selectedItem.name)}{" "}
          </Text>
          <Text style={styles.lightLabel}>(x{selectedItem.checkedCount})</Text>
        </View>
      )}

      {isFromInventory && (
        <>
          <Text style={styles.label}>Item</Text>
          <View>
            <InputBox
              placeholder="Ingredient"
              value={newItemDraft.itemName}
              onFocus={() => modal.setFieldState("isFocus", true)}
              onChangeText={(text) => {
                modal.setFieldState("searchText", text);
                modal.setFieldState("newItemDraft", {
                  ...modal.newItemDraft,
                  itemName: text,
                });
              }}
              containerStyle={styles.inputContainer}
            />

            {isFocus && getSuggestions(searchText).length > 0 && (
              <View style={[createStyles.suggestionBox, { width: "100%" }]}>
                {getSuggestions(searchText).map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    onPress={() => selectSuggestion(suggestion)}
                    className="px-3 py-2"
                  >
                    <Text>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <Text style={[styles.label, { marginTop: 8 }]}>Item Count</Text>
          <InputBox
            keyboardType="number-pad"
            value={newItemDraft.itemCount}
            onChangeText={(text) => {
              if (/^\d*$/.test(text)) {
                modal.setFieldState("newItemDraft", {
                  ...modal.newItemDraft,
                  itemCount: text,
                });
              }
            }}
            onBlur={() => {
              const count = parseInt(newItemDraft.itemCount ?? "", 10);
              if (!count || count <= 0) {
                modal.setFieldState("newItemDraft", {
                  ...modal.newItemDraft,
                  itemCount: "1",
                });
              }
            }}
            containerStyle={styles.inputContainer}
            showClearButton={false}
          />
        </>
      )}

      <View className="flex-row items-baseline mt-3">
        <Text style={styles.label}>Quantity </Text>
        <Text style={styles.lightLabel}>(optional)</Text>
      </View>
      <Text style={styles.description}>
        Only for measurable items (e.g. 1L milk).
      </Text>

      {hasQuantityMismatch && (
        <Text style={styles.errorText}>
          *Quantity entries must match item quantity (
          {isFromInventory
            ? parseInt(newItemDraft.itemCount ?? "1", 10)
            : selectedItem?.checkedCount ?? 1}
          ) and unit cannot be empty
        </Text>
      )}

      {(draft.quantityText ?? [""]).map((qt, index) => (
        <View key={index} className="flex-row items-center gap-2 mb-2">
          <InputBox
            placeholder="Quantity"
            keyboardType="decimal-pad"
            value={qt}
            onChangeText={(text) => {
              if (isFromInventory) {
                modifyNewItemDraftField({
                  updates: [
                    {
                      field: "quantityText",
                      index,
                      value: text,
                    },
                    {
                      field: "quantity",
                      index,
                      value: parseFloat(text.replace(",", ".")),
                    },
                  ],
                });
              } else {
                modifyDraftFieldAtIndex({
                  updates: [
                    { field: "quantityText", index, value: text },
                    {
                      field: "quantity",
                      index,
                      value: parseFloat(text.replace(",", ".")),
                    },
                  ],
                });
              }
            }}
            containerStyle={styles.inputContainer}
          />

          <CustomPicker
            selectedValue={draft.unit?.[index] ?? ""}
            onValueChange={(value) =>
              isFromInventory
                ? modifyNewItemDraftField({ field: "unit", index, value })
                : modifyDraftFieldAtIndex({ field: "unit", index, value })
            }
            options={Object.keys(UNIT_CONVERSIONS)}
            style={{ flex: 1, height: 40, maxWidth: "25%" }}
          />

          {(draft.quantityText ?? []).length > 1 && (
            <>
              <Pressable
                onPress={() => {
                  if (isFromInventory) {
                    modifyNewItemDraftField({
                      updates: [
                        { field: "quantityText", index, value: undefined },
                        { field: "quantity", index, value: undefined },
                        { field: "unit", index, value: undefined },
                      ],
                    });
                  } else {
                    modifyDraftFieldAtIndex({
                      updates: [
                        { field: "quantityText", index },
                        { field: "quantity", index },
                        { field: "unit", index },
                      ],
                    });
                  }
                }}
              >
                <IconSymbol
                  name="multiply.circle.fill"
                  size={20}
                  color={Colors.brand.primary}
                />
              </Pressable>

              <Pressable
                onPress={() => {
                  if (isFromInventory) {
                    modifyNewItemDraftField({
                      updates: [
                        {
                          field: "quantityText",
                          index,
                          insertAfter: true,
                          value: modal.newItemDraft.quantityText[index],
                        },
                        {
                          field: "quantity",
                          index,
                          insertAfter: true,
                          value: modal.newItemDraft.quantity[index] ?? 0,
                        },
                        {
                          field: "unit",
                          index,
                          insertAfter: true,
                          value: modal.newItemDraft.unit[index] ?? "",
                        },
                      ],
                    });
                  } else {
                    modifyDraftFieldAtIndex({
                      updates: [
                        {
                          field: "quantityText",
                          index,
                          value: qt,
                          insertAfter: true,
                        },
                        {
                          field: "quantity",
                          index,
                          value: currentDraft.quantity?.[index] ?? 0,
                          insertAfter: true,
                        },
                        {
                          field: "unit",
                          index,
                          value: currentDraft.unit?.[index] ?? "",
                          insertAfter: true,
                        },
                      ],
                    });
                  }
                }}
              >
                <IconSymbol
                  name="plus.rectangle.on.rectangle"
                  size={20}
                  color={Colors.brand.primary}
                />
              </Pressable>
            </>
          )}
        </View>
      ))}

      {(isFromInventory || checkedCount > 1) && (
        <Pressable
          onPress={() => {
            if (isFromInventory) {
              modal.setFieldState("newItemDraft", {
                ...modal.newItemDraft,
                quantityText: [...modal.newItemDraft.quantityText, ""],
                quantity: [...modal.newItemDraft.quantity, 0],
                unit: [...modal.newItemDraft.unit, ""],
              });
            } else {
              modifyDraftFieldAtIndex({
                updates: [
                  {
                    field: "quantityText",
                    index: (currentDraft.quantityText?.length ?? 0) - 1,
                    value: "",
                    insertAfter: true,
                  },
                  {
                    field: "quantity",
                    index: (currentDraft.quantity?.length ?? 0) - 1,
                    value: 0,
                    insertAfter: true,
                  },
                ],
              });
            }
          }}
        >
          <Text style={styles.adddText}>+ Add Quantity</Text>
        </Pressable>
      )}

      <View className="flex-row items-baseline mb-1">
        <Text style={styles.label}>Expiry Date </Text>
        <Text style={styles.lightLabel}>(optional)</Text>
      </View>

      {hasExpiryMismatch && (
        <Text style={styles.errorText}>
          *Expiry entries must match item quantity (
          {isFromInventory
            ? parseInt(newItemDraft.itemCount ?? "1", 10)
            : selectedItem?.checkedCount ?? 1}
          )
        </Text>
      )}

      {(draft.expiries ?? [""]).map((date, index) => (
        <View key={index} style={styles.expiryContainer}>
          <TouchableOpacity
            onPress={() => {
              setFieldState("datePickerIndex", index);
              setFieldState("showDatePicker", true);
            }}
            style={styles.dateInputContainer}
          >
            <Text
              style={{
                color: date ? Colors.text.primary : Colors.text.disabled,
              }}
            >
              {date
                ? new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Select expiry date"}
            </Text>
          </TouchableOpacity>

          {(draft.expiries?.length ?? 0) > 1 && (
            <>
              <Pressable
                onPress={() => {
                  if (isFromInventory) {
                    modifyNewItemDraftField({ field: "expiries", index });
                  } else {
                    modifyDraftFieldAtIndex({ field: "expiries", index });
                  }
                }}
              >
                <IconSymbol
                  name="multiply.circle.fill"
                  size={20}
                  color={Colors.brand.primary}
                />
              </Pressable>

              <Pressable
                onPress={() => {
                  if (isFromInventory) {
                    modifyNewItemDraftField({
                      field: "expiries",
                      index,
                      value: "",
                      insertAfter: true,
                    });
                  } else {
                    modifyDraftFieldAtIndex({
                      field: "expiries",
                      index,
                      value: currentDraft.expiries?.[index] ?? "",
                      insertAfter: true,
                    });
                  }
                }}
              >
                <IconSymbol
                  name="plus.rectangle.on.rectangle"
                  size={20}
                  color={Colors.brand.primary}
                />
              </Pressable>
            </>
          )}
        </View>
      ))}

      {showDatePicker && (
        <DateTimePicker
          value={
            currentDraft.expiries?.[datePickerIndex]
              ? new Date(currentDraft.expiries[datePickerIndex])
              : new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setFieldState("showDatePicker", false);

            if (event.type === "set" && selectedDate) {
              if (isFromInventory) {
                modifyNewItemDraftField({
                  field: "expiries",
                  index: datePickerIndex,
                  value: selectedDate.toISOString(),
                });
              } else {
                modifyDraftFieldAtIndex({
                  field: "expiries",
                  index: datePickerIndex,
                  value: selectedDate.toISOString(),
                });
              }
            }
          }}
        />
      )}

      {(isFromInventory || checkedCount > 1) && (
        <Pressable
          onPress={() => {
            if (isFromInventory) {
              modifyNewItemDraftField({
                field: "expiries",
                index: modal.newItemDraft.expiries.length - 1,
                value: "",
                insertAfter: true,
              });
            } else {
              modifyDraftFieldAtIndex({
                field: "expiries",
                index: (currentDraft.expiries?.length ?? 0) - 1,
                value: "",
                insertAfter: true,
              });
            }
          }}
        >
          <Text style={styles.adddText}>+ Add Expiry Date</Text>
        </Pressable>
      )}

      {!isFromInventory && (
        <View className="flex-row justify-between mt-4">
          {currentStepIndex > 0 ? (
            <Pressable
              onPress={() =>
                setFieldState("currentStepIndex", currentStepIndex - 1)
              }
            >
              <Text style={styles.navigateText}>Previous</Text>
            </Pressable>
          ) : (
            <View className="w-[70px]" />
          )}

          <Pressable
            disabled={isDisabled}
            onPress={
              isLastStep
                ? () => setFieldState("currentStepIndex", currentStepIndex + 1)
                : () => handleMoveToInventory()
            }
          >
            <Text
              style={{
                color: isDisabled ? Colors.text.disabled : Colors.text.link,
                fontSize: 15,
              }}
            >
              {isLastStep ? "Next" : "Submit"}
            </Text>
          </Pressable>
        </View>
      )}

      {isFromInventory && (
        <View className="flex-row justify-end mt-4">
          <Pressable
            disabled={isDisabled}
            onPress={() => {
              handleMoveToInventory(newItemDraft);
              modal.setFieldState("newItemDraft", {
                itemName: "",
                itemCount: "1",
                quantity: [0],
                quantityText: [""],
                unit: [""],
                expiries: [""],
              });
            }}
          >
            <Text
              style={{
                color: isDisabled ? Colors.text.disabled : Colors.text.link,
                fontSize: 15,
              }}
            >
              Add to Inventory
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
