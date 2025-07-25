import { useEffect } from "react";
import EditPreferencesComponent from "./component";
import { useEditPreferencesController } from "./controller";

type Props = {
  keyName: string;
};

export default function EditPreferencesContainer({ keyName }: Props) {
  const {
    editPref,
    fetchPreferences,
    handleSave,
    addItemToList,
    removeItemFromList,
  } = useEditPreferencesController();

  useEffect(() => {
    fetchPreferences(keyName);
  }, []);

  return (
    <EditPreferencesComponent
      keyName={keyName}
      editPref={editPref}
      handleSave={handleSave}
      addItemToList={addItemToList}
      removeItemFromList={removeItemFromList}
    />
  );
}
