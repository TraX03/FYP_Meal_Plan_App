import { ContainerProps } from "./container";

export type EntryType = "ingredient" | "category" | "area" | "mealtime";
export type EntryItem = { name: string; quantity?: string; note?: string };

type Props = Pick<ContainerProps, "type" | "create" | "controller">;

export const useEntryListFormController = ({
  create,
  type,
  controller,
}: Props) => {
  const { setFieldState } = create;

  const handleFocus = (index: number | null) =>
    setFieldState("focusedIndex", { [type]: index });

  const handleChange = (index: number, field: keyof EntryItem, value: string) =>
    controller.updateEntry(type, index, field, value);

  return { handleFocus, handleChange };
};

export default useEntryListFormController;
