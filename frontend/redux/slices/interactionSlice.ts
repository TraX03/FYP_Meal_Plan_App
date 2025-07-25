import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InteractionState = {
  interactions: Record<string, any>;
  version: number;
};

const initialState: InteractionState = {
  interactions: {},
  version: 0,
};

const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    setInteractionRecords(state, action: PayloadAction<Record<string, any>>) {
      state.interactions = action.payload;
      state.version += 1;
    },
  },
});

export const { setInteractionRecords } = interactionSlice.actions;

export default interactionSlice.reducer;
