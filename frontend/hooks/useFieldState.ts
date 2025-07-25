import { useRef, useState } from "react";

export function useFieldState<T extends object>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const stateRef = useRef(state);

  const setStateWithRef = (updater: (prev: T) => T) => {
    setState((prev) => {
      const next = updater(prev);
      stateRef.current = next;
      return next;
    });
  };

  const setFieldState = <K extends keyof T>(field: K, value: T[K]) => {
    setStateWithRef((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setFields = (fields: Partial<T>) => {
    setStateWithRef((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  const getFieldState = <K extends keyof T>(field: K): T[K] => {
    return stateRef.current[field];
  };

  return {
    ...state,
    setFieldState,
    setFields,
    getFieldState,
  };
}
