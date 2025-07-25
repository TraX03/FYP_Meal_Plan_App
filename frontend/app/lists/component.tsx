import BottomSheetModal from "@/components/BottomSheetModal";
import CounterInput from "@/components/CounterInput";
import SearchWithSuggestion from "@/components/SearchWithSuggestions";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { capitalize, titleCase } from "@/utility/capitalize";
import { styles as homeStyles } from "@/utility/home/styles";
import { styles } from "@/utility/lists/styles";
import { styles as onboardingStyles } from "@/utility/onboarding/styles";
import { styles as plannerStyles } from "@/utility/planner/styles";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import AmountModalContainer from "./amountModal/container";
import { ListItem, ListsState } from "./controller";
import InventoryModalContainer from "./inventoryModal/container";

type Props = {
  lists: ReturnType<typeof useFieldState<ListsState>>;
  actions: {
    addItemToList: (name: string, quantity?: number[]) => Promise<void>;
    handleShoppingCheck: (itemId: string, checked: boolean) => Promise<void>;
    handleMoveToInventory: () => Promise<void>;
    handleClearItems: (
      itemsToClear: ListItem[],
      removeIfExpired: boolean
    ) => Promise<void>;
    handleInventoryCheck: (itemId: string, usedAmount: number) => Promise<void>;
    getExpiryStatus: (expiries?: string[]) => {
      label: string;
      color: string;
    } | null;
    handleQuantityChange: (itemId: string, delta: number) => void;
    saveQuantityChange: (item: ListItem) => Promise<void>;
    handleRemoveItem: (itemId: string) => Promise<void>;
    loadItems: () => Promise<void>;
  };
  listData: {
    checkedItems: ListItem[];
    uncheckedItems: ListItem[];
    expiredItems: ListItem[];
  };
  checkLogin: (next: string | (() => void)) => void;
};

export const LIST_TABS = ["shopping", "inventory"] as const;

export default function ListsComponent({
  lists,
  actions,
  listData,
  checkLogin,
}: Props) {
  const {
    activeTab,
    showAddModal,
    showInventoryModal,
    setFieldState,
    setFields,
    showAmountModal,
    keyboardVisible,
    isEditing,
    showSyncLoading,
  } = lists;

  const {
    addItemToList,
    handleShoppingCheck,
    handleMoveToInventory,
    handleClearItems,
    handleInventoryCheck,
    getExpiryStatus,
    handleQuantityChange,
    saveQuantityChange,
    handleRemoveItem,
    loadItems,
  } = actions;

  const { checkedItems, uncheckedItems, expiredItems } = listData;

  const renderListItem = (
    item: ListItem,
    disabled: boolean,
    useContainer: boolean = true,
    showCheckbox: boolean = true
  ) => {
    const expiryInfo =
      item.checked && activeTab === "inventory"
        ? null
        : getExpiryStatus(item.expiries);
    const color = disabled ? Colors.brand.primaryLight : Colors.brand.primary;

    const content = (
      <>
        {showCheckbox && (
          <Pressable
            testID={`checkbox-${item.id}`}
            onPress={() => {
              if (item.type === "inventory") {
                setFields({ modalItem: item, showAmountModal: true });
              } else {
                handleShoppingCheck(item.id!, !item.checked);
              }
            }}
          >
            <IconSymbol
              name={item.checked ? "checkmark.square.fill" : "checkmark.square"}
              color={color}
            />
          </Pressable>
        )}

        <View className="flex-row items-center justify-between flex-1">
          <View style={{ flexShrink: 1, marginRight: 8 }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[{ fontSize: 16 }, disabled && styles.disabledItem]}
            >
              {titleCase(item.name)}
            </Text>
            {expiryInfo && (
              <View className="flex-row items-center mt-1 gap-1.5">
                <View
                  style={[
                    styles.expiryIndicator,
                    { backgroundColor: expiryInfo.color },
                  ]}
                />
                <Text style={styles.expiryLabel}>{expiryInfo.label}</Text>
              </View>
            )}
          </View>

          {isEditing && !item.checked && activeTab !== "inventory" ? (
            <View className="flex-row gap-2 items-center">
              <CounterInput
                value={item.quantityDisplay}
                onDecrement={() => handleQuantityChange(item.id!, -1)}
                onIncrement={() => handleQuantityChange(item.id!, 1)}
                noMarginTop={true}
              />
              <Pressable
                testID={`trash-${item.id}`}
                onPress={() => handleRemoveItem(item.id!)}
              >
                <IconSymbol
                  name="trash"
                  color={Colors.brand.primary}
                  size={22}
                />
              </Pressable>
            </View>
          ) : (
            <Text style={[{ fontSize: 16 }, disabled && styles.disabledItem]}>
              {"\u00D7"}{" "}
              {!showCheckbox
                ? item.expiredQuantity
                : item.checked
                ? item.checkedCount
                : item.quantityDisplay}
              {showCheckbox || !item.expiredUnit ? item.unit : item.expiredUnit}
            </Text>
          )}
        </View>
      </>
    );

    return useContainer ? (
      <View key={item.id} style={styles.itemContainer}>
        {content}
      </View>
    ) : (
      <View
        key={item.id}
        className="flex-row justify-between items-center mb-3 gap-3"
      >
        {content}
      </View>
    );
  };

  const ItemGroup = ({
    title,
    items,
    onClear,
    footer,
  }: {
    title: string;
    items: ListItem[];
    onClear?: () => void;
    footer?: React.ReactNode;
  }) => (
    <View style={styles.listContainer}>
      <View className="flex-row justify-between items-center mb-4">
        <Text style={styles.containerLabel}>{title}</Text>
        {onClear && (
          <Pressable onPress={onClear}>
            <Text style={{ color: Colors.text.light }}>Clear</Text>
          </Pressable>
        )}
      </View>

      {items.map((item) =>
        renderListItem(item, true, false, title !== "Expired Items")
      )}

      {footer}
    </View>
  );

  return (
    <>
      <BottomSheetModal
        isVisible={showAddModal}
        onClose={() => setFieldState("showAddModal", false)}
        modalStyle={onboardingStyles.optionModal}
        zIndex={12}
      >
        <SearchWithSuggestion
          onSelectItem={(itemName: string) => addItemToList(itemName)}
          mode={"suggestion-then-custom"}
          placeholder={"Ingredient"}
          suggestionType={"ingredient"}
        />
      </BottomSheetModal>

      <BottomSheetModal
        isVisible={showInventoryModal}
        onClose={() =>
          setFields({
            showInventoryModal: false,
            formDrafts: {},
          })
        }
        modalStyle={[
          onboardingStyles.optionModal,
          { paddingBottom: 60, ...(keyboardVisible && { flex: 1 }) },
        ]}
        zIndex={12}
      >
        <InventoryModalContainer
          lists={lists}
          isFromInventory={activeTab === "inventory"}
          checkedItems={checkedItems}
          handleMoveToInventory={handleMoveToInventory}
        />
      </BottomSheetModal>

      {showAmountModal && (
        <Modal transparent animationType="fade" statusBarTranslucent>
          <AmountModalContainer
            lists={lists}
            handleInventoryCheck={handleInventoryCheck}
          />
        </Modal>
      )}

      <View style={homeStyles.container}>
        <View style={[homeStyles.header, styles.header]}>
          <View className="flex-row justify-between items-center w-full">
            <Text style={plannerStyles.headerTitle}>Lists</Text>
            <View className="flex-row items-center gap-1">
              <Pressable onPress={() => loadItems()}>
                <IconSymbol
                  name="arrow.clockwise.circle"
                  color={Colors.brand.primary}
                />
              </Pressable>
              <Pressable>
                <IconSymbol name="ellipsis" color={Colors.brand.primary} />
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }}
        >
          <View className="px-4 pt-3">
            <View className="flex-row gap-5">
              {LIST_TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setFieldState("activeTab", tab)}
                  >
                    <View className="items-center">
                      <Text
                        style={{
                          fontFamily: isActive
                            ? "RobotoMedium"
                            : "RobotoRegular",
                          color: isActive
                            ? Colors.brand.primary
                            : Colors.text.disabled,
                          fontSize: 18,
                        }}
                      >
                        {capitalize(tab)}
                      </Text>
                      {isActive && <View style={styles.border} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row justify-between mt-6">
              <Text className="text-[14px]">{uncheckedItems.length} items</Text>
              <View className="flex-row gap-2 items-center">
                {activeTab !== "inventory" && (
                  <Pressable
                    testID={isEditing ? "edit-mode-done" : "edit-mode-toggle"}
                    onPress={() =>
                      checkLogin(async () => {
                        if (isEditing) {
                          setFieldState("isEditing", false);

                          for (const item of uncheckedItems) {
                            await saveQuantityChange(item);
                          }
                        } else {
                          setFieldState("isEditing", true);
                        }
                      })
                    }
                  >
                    <IconSymbol
                      name={isEditing ? "arrow.down.doc" : "pencil.circle"}
                      color={
                        isEditing ? Colors.brand.primary : Colors.text.disabled
                      }
                      size={20}
                    />
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {showSyncLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={Colors.brand.primary} />
            </View>
          ) : (
            <>
              <View className="px-4 mt-4">
                {uncheckedItems.length === 0 ? (
                  <Pressable
                    testID="add-items-button"
                    onPress={() =>
                      checkLogin(() => {
                        setFieldState(
                          activeTab === "inventory"
                            ? "showInventoryModal"
                            : "showAddModal",
                          true
                        );
                      })
                    }
                    style={styles.addItemButton}
                  >
                    <Text style={styles.addItemText}>+ Add Items</Text>
                  </Pressable>
                ) : (
                  uncheckedItems.map((item) => renderListItem(item, false))
                )}
              </View>

              {expiredItems.length > 0 && (
                <ItemGroup
                  title="Expired Items"
                  items={expiredItems}
                  onClear={() => handleClearItems(expiredItems, true)}
                />
              )}

              {checkedItems.length > 0 && (
                <ItemGroup
                  title={
                    activeTab === "shopping"
                      ? "Checked Items"
                      : "Finished Items"
                  }
                  items={checkedItems}
                  onClear={
                    activeTab === "inventory"
                      ? () => handleClearItems(checkedItems, false)
                      : undefined
                  }
                  footer={
                    activeTab === "shopping" && (
                      <Pressable
                        className="rounded-full w-full py-3 items-center justify-center mt-5"
                        style={styles.addInventoryButton}
                        onPress={() =>
                          setFieldState("showInventoryModal", true)
                        }
                      >
                        <Text style={styles.addInventoryText}>
                          Add to Inventory
                        </Text>
                      </Pressable>
                    )
                  }
                />
              )}
            </>
          )}
        </ScrollView>

        <Pressable
          onPress={() =>
            checkLogin(() =>
              setFieldState(
                activeTab === "inventory"
                  ? "showInventoryModal"
                  : "showAddModal",
                true
              )
            )
          }
          style={plannerStyles.generateButton}
        >
          <IconSymbol name="plus" color={Colors.brand.onPrimary} size={22} />
        </Pressable>
      </View>
    </>
  );
}
