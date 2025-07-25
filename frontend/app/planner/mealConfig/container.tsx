import { useEffect } from "react";
import MealConfigComponent from "./component";
import useMealConfigController from "./controller";

export default function MealConfigContainer() {
  const {
    config,
    updateMealCount,
    toggleMealOption,
    toggleSection,
    handleSave,
    loadInitialConfig,
  } = useMealConfigController();

  useEffect(() => {
    loadInitialConfig();
  }, []);

  return (
    <MealConfigComponent
      config={config}
      updateMealCount={updateMealCount}
      toggleMealOption={toggleMealOption}
      toggleSection={toggleSection}
      handleSave={handleSave}
    />
  );
}
