import React from "react";
import AuthFormComponent from "./component";
import { AuthMode, useAuthController } from "./controller";

type Props = {
  mode: AuthMode;
};

export default function AuthFormContainer({ mode }: Props) {
  const { authForm, handleSubmit, updateField, closeErrorModal } =
    useAuthController(mode);

  return (
    <AuthFormComponent
      mode={mode}
      auth={authForm}
      onSubmit={handleSubmit}
      updateField={updateField}
      closeErrorModal={closeErrorModal}
    />
  );
}
