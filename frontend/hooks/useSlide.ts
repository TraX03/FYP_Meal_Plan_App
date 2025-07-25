import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions } from "react-native";

export function useSlide(isVisible: boolean, onAnimateOutDone?: () => void) {
  const translateY = useRef(new Animated.Value(300)).current;
  const [shouldRender, setShouldRender] = useState(isVisible);
  const cancelUnmount = useRef(false);

  useEffect(() => {
    const offscreenY = Dimensions.get("window").height;

    if (isVisible) {
      cancelUnmount.current = true;
      setShouldRender(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      cancelUnmount.current = false;
      Animated.spring(translateY, {
        toValue: offscreenY,
        useNativeDriver: true,
      }).start(() => {
        if (!cancelUnmount.current) {
          setShouldRender(false);
          onAnimateOutDone?.();
        }
      });
    }
  }, [isVisible]);

  return { translateY, shouldRender };
}
