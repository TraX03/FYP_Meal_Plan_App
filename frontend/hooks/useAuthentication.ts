import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { Routes } from "@/constants/Routes";
import { setUser } from "@/redux/slices/authSlice";
import { setInteractionRecords } from "@/redux/slices/interactionSlice";
import { setLoading } from "@/redux/slices/loadingSlice";
import { AppDispatch } from "@/redux/store";
import { account, createDocument, getCurrentUser } from "@/services/Appwrite";
import { fetchInteractions } from "@/utility/interactionUtils";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useProfileData } from "./useProfileData";

export function useAuthentication() {
  const dispatch = useDispatch<AppDispatch>();
  const { fetchProfile } = useProfileData();

  const handleError = (action: string, error: any) => {
    console.error(`${action} failed:`, error);
    throw error;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        dispatch(setUser(currentUser));
      } catch (error) {
        dispatch(setUser(null));
      }
    };

    checkSession();
  }, [dispatch]);

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(setLoading(true));
      try {
        await account.createEmailPasswordSession(email, password);
        const currentUser = await getCurrentUser();
        dispatch(setUser(currentUser));

        const interactionRecords = await fetchInteractions();
        dispatch(setInteractionRecords(interactionRecords));
      } catch (error) {
        handleError("Login", error);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const signUp = useCallback(
    async (email: string, password: string, username: string) => {
      dispatch(setLoading(true));
      try {
        await account.create("unique()", email, password);
        await account.createEmailPasswordSession(email, password);

        const currentUser = await getCurrentUser();
        dispatch(setUser(currentUser));

        const userId = currentUser.$id;
        await createDocument(
          AppwriteConfig.USERS_COLLECTION_ID,
          {
            user_id: userId,
            username,
            joined_at: new Date().toISOString(),
          },
          userId
        );

        dispatch(setInteractionRecords({}));
      } catch (error) {
        handleError("SignUp", error);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await account.deleteSession("current");
      dispatch(setUser(null));
      dispatch(setInteractionRecords({}));
      router.replace(Routes.Home);
      fetchProfile();
    } catch (error) {
      handleError("Logout", error);
    }
  }, [dispatch]);

  return {
    login,
    signUp,
    logout,
  };
}
