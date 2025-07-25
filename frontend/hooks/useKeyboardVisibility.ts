import { useEffect } from "react";
import { Keyboard } from "react-native";

export function useKeyboardVisibility(setVisible: (visible: boolean) => void) {
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setVisible(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setVisible(false)
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, [setVisible]);
}
