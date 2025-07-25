import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Models } from "react-native-appwrite";

interface AuthState {
  user: Models.User<{}> | null;
  onboarded: boolean;
}

const initialState: AuthState = {
  user: null,
  onboarded: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Models.User<{}> | null>) {
      state.user = action.payload;
    },
    setOnboarded(state, action: PayloadAction<boolean>) {
      state.onboarded = action.payload;
    },
  },
});

export const { setUser, setOnboarded } = authSlice.actions;
export default authSlice.reducer;
