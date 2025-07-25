import { useFieldState } from "@/hooks/useFieldState";
import { useSuggestionList } from "@/hooks/useSuggestionList";
import { ListItem, ListsState } from "../controller";
import InventoryModalComponent from "./component";
import useInventoryModalController, { NewItemDraft } from "./controller";

export type ContainerProps = {
  lists: ReturnType<typeof useFieldState<ListsState>>;
  checkedItems?: ListItem[];
  handleMoveToInventory: (newItemDraft?: NewItemDraft) => Promise<void>;
  isFromInventory?: boolean;
};

export default function InventoryModalContainer({
  lists,
  checkedItems,
  handleMoveToInventory,
  isFromInventory,
}: ContainerProps) {
  const { getSuggestions } = useSuggestionList("ingredient");
  const {
    hasMismatch,
    modifyDraftFieldAtIndex,
    modifyNewItemDraftField,
    modal,
    selectSuggestion,
  } = useInventoryModalController(lists);

  return (
    <InventoryModalComponent
      lists={lists}
      checkedItems={checkedItems}
      hasMismatch={hasMismatch}
      handleMoveToInventory={handleMoveToInventory}
      modifyDraftFieldAtIndex={modifyDraftFieldAtIndex}
      modifyNewItemDraftField={modifyNewItemDraftField}
      isFromInventory={isFromInventory}
      modal={modal}
      getSuggestions={getSuggestions}
      selectSuggestion={selectSuggestion}
    />
  );
}
