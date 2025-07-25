import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";
import React from "react";
import CreateFormComponent from "./component";
import { useCreateFormController } from "./controller";

export default function CreateFormContainer() {
  const { create, controller } = useCreateFormController();

  useKeyboardVisibility((visible) =>
    create.setFieldState("keyboardVisible", visible)
  );

  return <CreateFormComponent create={create} controller={controller} />;
}
