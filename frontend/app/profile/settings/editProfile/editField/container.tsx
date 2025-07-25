import React from "react";
import EditFieldComponent from "./component";
import { useEditFieldController } from "./controller";

type Props = {
  keyName: string;
  size?: string;
  data?: string;
};

export default function EditFieldContainer({ keyName, size, data }: Props) {
  const maxLength = size ? parseInt(size, 10) : undefined;
  const controller = useEditFieldController(keyName, data ?? "", maxLength);

  return <EditFieldComponent {...controller} />;
}
