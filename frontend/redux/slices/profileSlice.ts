import { getImageUrl } from "@/utility/imageUtils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Gender = "Male" | "Female" | "Prefer not to say" | "Other";

export interface ProfileData {
  username: string;
  avatarUrl: string;
  bio?: string;
  gender?: Gender;
  birthday?: string;
  phone?: string;
  email?: string;
  followersCount: number;
  followingCount: number;
  profileBg?: string;
  id?: string;
  metadata?: string;
  mealRegion?: string[];
  avoidIngredients?: string[];
  diet?: string[];
  isOnboarded?: boolean;
}

export const guestPicture: string = "687991440001bb3db31b"; // rmb update

export const guestProfile: ProfileData = {
  username: "Guest",
  avatarUrl: getImageUrl(guestPicture),
  followersCount: 0,
  followingCount: 0,
};

interface ProfileState {
  userData: ProfileData;
  refreshProfile: boolean;
}

const initialState: ProfileState = {
  userData: guestProfile,
  refreshProfile: false,
};

export const userSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileData: (state, action: PayloadAction<ProfileData>) => {
      state.userData = action.payload;
    },
    resetProfileData: (state) => {
      state.userData = guestProfile;
    },
    setRefreshProfile: (state, action: PayloadAction<boolean>) => {
      state.refreshProfile = action.payload;
    },
    updateProfileField: (
      state,
      action: PayloadAction<{ key: keyof ProfileData; value: any }>
    ) => {
      if (state.userData && action.payload.key in state.userData) {
        (state.userData as any)[action.payload.key] = action.payload.value;
      }
    },
  },
});

export const {
  setProfileData,
  resetProfileData,
  setRefreshProfile,
  updateProfileField,
} = userSlice.actions;
export default userSlice.reducer;
