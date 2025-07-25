import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { Provider as ReduxProvider } from "react-redux";

import authReducer from "@/redux/slices/authSlice";
import interactionReducer from "@/redux/slices/interactionSlice";
import loadingReducer from "@/redux/slices/loadingSlice";
import mealplanReducer from "@/redux/slices/mealplanSlice";
import profileReducer from "@/redux/slices/profileSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  interaction: interactionReducer,
  loading: loadingReducer,
  profile: profileReducer,
  mealplan: mealplanReducer,
});

export function renderWithRedux(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({ reducer: rootReducer, preloadedState }),
    ...renderOptions
  }: any = {}
) {
  return {
    ...render(<ReduxProvider store={store}>{ui}</ReduxProvider>, renderOptions),
    store,
  };
}
