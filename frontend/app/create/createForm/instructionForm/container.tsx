import { useState } from "react";
import InstructionsFormComponent from "./component";

export type ContainerProps = {
  instructions: { image?: string; text: string }[];
  modifyInstruction: (action: "add" | "remove", index?: number) => void;
  updateInstruction: (index: number, text: string) => void;
  updateInstructionImage: (index: number, shouldRemove?: boolean) => void;
};

export default function InstructionsFormContainer({
  instructions,
  modifyInstruction,
  updateInstruction,
  updateInstructionImage,
}: ContainerProps) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <InstructionsFormComponent
      instructions={instructions}
      modifyInstruction={modifyInstruction}
      updateInstruction={updateInstruction}
      updateInstructionImage={updateInstructionImage}
      fullscreenImage={fullscreenImage}
      setFullscreenImage={setFullscreenImage}
    />
  );
}
