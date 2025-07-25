import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MealplanState {
  hasAddedInventory: boolean;
}

const initialState: MealplanState = {
  hasAddedInventory: false,
};

const mealplanSlice = createSlice({
  name: "mealplan",
  initialState,
  reducers: {
    setHasAddedInventory(state, action: PayloadAction<boolean>) {
      state.hasAddedInventory = action.payload;
    },
  },
});

export const { setHasAddedInventory } = mealplanSlice.actions;
export default mealplanSlice.reducer;
