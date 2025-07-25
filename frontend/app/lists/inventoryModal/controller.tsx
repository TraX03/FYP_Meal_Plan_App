import { useFieldState } from "@/hooks/useFieldState";
import { Keyboard } from "react-native";
import { ListsState } from "../controller";

type DraftField = "quantityText" | "quantity" | "unit" | "expiries";

export type NewItemDraft = {
  itemName: string;
  itemCount: string;
  quantity: number[];
  quantityText: string[];
  unit: string[];
  expiries: string[];
};

export interface SingleUpdate {
  field: DraftField;
  index: number;
  value?: any;
  insertAfter?: boolean;
}

export interface BatchUpdate {
  updates: SingleUpdate[];
}

export interface ModalState {
  newItemDraft: NewItemDraft;
  isFocus: boolean;
  searchText: string;
}

export const useInventoryModalController = (
  lists: ReturnType<typeof useFieldState<ListsState>>
) => {
  const modal = useFieldState<ModalState>({
    newItemDraft: {
      itemName: "",
      itemCount: "1",
      quantity: [],
      quantityText: [""],
      unit: [""],
      expiries: [""],
    },
    isFocus: false,
    searchText: "",
  });

  const { setFieldState } = lists;

  const hasExpiryMismatch = (expiries: string[], quantityCount: number) => {
    const filled = expiries.filter(Boolean);
    return (
      filled.length > 1 &&
      (filled.length !== quantityCount || filled.length !== expiries.length)
    );
  };

  const hasQuantityMismatch = (
    quantityText: string[],
    units: string[],
    checkedCount: number
  ) => {
    const cleanedQuantities = quantityText.filter((q) => q.trim() !== "");
    const cleanedUnits = units.filter((u) => u.trim() !== "");

    const allEmpty =
      cleanedQuantities.length === 0 && cleanedUnits.length === 0;
    const allFilled =
      cleanedQuantities.length === checkedCount &&
      cleanedUnits.length === checkedCount &&
      !units.some((u) => !u || u.trim() === "");

    return !(allEmpty || allFilled);
  };

  const modifyDraftFieldAtIndex = (update: SingleUpdate | BatchUpdate) => {
    const draft = lists.formDrafts?.[lists.currentStepIndex] ?? {};
    const result: Partial<typeof draft> = { ...draft };

    const updates = "updates" in update ? update.updates : [update];

    updates.forEach(({ field, index, value, insertAfter }) => {
      const existingArray = Array.isArray(draft[field])
        ? [...(draft[field] as any[])]
        : [];

      if (value === undefined) {
        existingArray.splice(index, 1);
      } else if (insertAfter) {
        existingArray.splice(index + 1, 0, value);
      } else {
        existingArray[index] = value;
      }

      (result as any)[field] = existingArray;
    });

    setFieldState("formDrafts", {
      ...lists.formDrafts,
      [lists.currentStepIndex]: result,
    });
  };

  const modifyNewItemDraftField = (update: SingleUpdate | BatchUpdate) => {
    const updates = "updates" in update ? update.updates : [update];

    const newDraft: NewItemDraft = { ...modal.newItemDraft };

    updates.forEach(({ field, index, value, insertAfter }) => {
      const current = [...(newDraft[field] as any[])];

      if (insertAfter) {
        current.splice(index + 1, 0, value ?? current[index]);
      } else if (value === undefined) {
        current.splice(index, 1);
      } else {
        current[index] = value;
      }

      (newDraft as any)[field] = current;
    });

    modal.setFieldState("newItemDraft", newDraft);
  };

  const selectSuggestion = (suggestion: string) => {
    modal.setFields({
      newItemDraft: {
        ...modal.newItemDraft,
        itemName: suggestion,
      },
      searchText: suggestion,
      isFocus: false,
    });
    Keyboard.dismiss;
  };

  return {
    hasMismatch: { hasExpiryMismatch, hasQuantityMismatch },
    modifyDraftFieldAtIndex,
    modifyNewItemDraftField,
    modal,
    selectSuggestion,
  };
};

export default useInventoryModalController;
