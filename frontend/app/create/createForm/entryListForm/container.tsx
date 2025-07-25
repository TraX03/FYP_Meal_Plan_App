import { useFieldState } from "@/hooks/useFieldState";
import { useSuggestionList } from "@/hooks/useSuggestionList";
import { EntryController } from "../component";
import { CreateFormState } from "../controller";
import EntryListFormComponent from "./component";
import useEntryListFormController, { EntryType } from "./controller";

export type ContainerProps = {
  type: EntryType;
  create: ReturnType<typeof useFieldState<CreateFormState>>;
  controller: EntryController;
  placeholder: string;
  label?: string;
};

export default function EntryListFormContainer({
  type,
  create,
  controller,
  placeholder,
  label,
}: ContainerProps) {
  const { getSuggestions } = useSuggestionList(type);
  const { handleFocus, handleChange } = useEntryListFormController({
    create,
    type,
    controller,
  });

  return (
    <EntryListFormComponent
      type={type}
      create={create}
      controller={controller}
      placeholder={placeholder}
      label={label}
      getSuggestions={getSuggestions}
      handleFocus={handleFocus}
      handleChange={handleChange}
    />
  );
}
