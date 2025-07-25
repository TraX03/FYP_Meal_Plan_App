import { useRef } from "react";

export function usePreventDoubleTap(callback: () => void, delay = 1000) {
  const lastTapRef = useRef(0);

  return () => {
    const now = Date.now();
    if (now - lastTapRef.current < delay) {
      const timeLeft = delay - (now - lastTapRef.current);
      console.log(`Blocked: wait ${timeLeft}ms more`);
      return;
    }

    lastTapRef.current = now;
    callback();
  };
}
