import AuthFormComponent from "@/app/authentication/authForm/component";
import OnboardingComponent from "@/app/onboarding/component";
import ProfileComponent from "@/app/profile/component";
import { Routes } from "@/constants/Routes";
import { renderWithRedux } from "@/utility/renderWithRedux";
import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

import useOnboardingController from "@/app/onboarding/controller";
import { router } from "expo-router";

jest.mock("@/hooks/useReduxSelectors", () => ({
  useReduxSelectors: () => ({ isLoggedIn: false }),
}));
jest.mock("@/services/GeminiApi", () => ({
  cleanPreferencesByType: jest.fn(async (items: string[], type: string) => {
    return items.map((item) => item.toLowerCase());
  }),
}));

jest.mock("@/services/FastApi", () => ({
  fetchColdstartRecommendations: jest.fn(() =>
    Promise.resolve({
      post_ids: ["1", "2", "3"],
      titles: ["Recipe 1", "Recipe 2", "Recipe 3"],
      images: ["url1", "url2", "url3"],
    })
  ),
}));
jest.mock("@/services/Appwrite", () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({ $id: "test-user-id" })),
  createDocument: jest.fn(),
  updateDocument: jest.fn(),
}));
jest.mock("expo-router", () => {
  const routerMock = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  };

  return {
    useRouter: () => routerMock,
    router: routerMock,
    Stack: {
      Screen: () => null,
    },
  };
});

const mockProfileState: any = {
  activeTab: "Posts",
  posts: [],
  likedPosts: [],
  bookmarkedPosts: [],
  subTab: "Recipe",
  postLoading: false,
  setFieldState: jest.fn(),
};

const mockAuthState = {
  email: "",
  password: "",
  showErrorModal: false,
  errorTitle: "",
  errorMessage: "",
};

describe("Registration Flow", () => {
  it("should navigate: edit → sign-in → sign-up → onboarding → home", async () => {
    const { getByTestId: getEditButton } = renderWithRedux(
      <ProfileComponent
        profileData={{
          id: "user123",
          username: "testuser",
          avatarUrl: "http://avatar.com",
          followersCount: 0,
          followingCount: 0,
          profileBg: "",
          bio: "",
        }}
        isLoading={false}
        isLoggedIn={false}
        checkLogin={() => {
          router.push(`${Routes.AuthForm}?mode=sign-in` as any);
        }}
        profile={mockProfileState}
        isOwnProfile={true}
        isBackgroundDark={false}
        interactionData={{ interactionRecords: {}, interactionVersion: 1 }}
        fetchPostsByUser={jest.fn()}
      />
    );

    fireEvent.press(getEditButton("edit-button"));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(
        "/authentication/[mode]?mode=sign-in"
      );
    });

    const updateField = jest.fn();
    const closeErrorModal = jest.fn();

    const { getByText: getSignUpText } = renderWithRedux(
      <AuthFormComponent
        mode="signIn"
        auth={mockAuthState as any}
        updateField={updateField}
        closeErrorModal={closeErrorModal}
        onSubmit={jest.fn()}
      />
    );

    fireEvent.press(getSignUpText("Sign Up"));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith({
        pathname: Routes.AuthForm,
        params: { mode: "signUp" },
      });
    });

    const signUp = jest.fn().mockResolvedValue(undefined);
    const fetchProfile = jest.fn().mockResolvedValue(false);
    const handleAuthError = jest.fn();

    const signUpAuthState = {
      email: "newuser@example.com",
      password: "password123",
      showErrorModal: false,
      errorTitle: "",
      errorMessage: "",
    };

    const { getByTestId: getSignUpTestId } = renderWithRedux(
      <AuthFormComponent
        mode="signUp"
        auth={signUpAuthState as any}
        updateField={updateField}
        closeErrorModal={closeErrorModal}
        onSubmit={async () => {
          try {
            await signUp(
              signUpAuthState.email,
              signUpAuthState.password,
              "newuser"
            );
            const isOnboarded = await fetchProfile();
            router.replace(isOnboarded ? Routes.Home : Routes.Onboarding);
          } catch (err) {
            await handleAuthError(err);
          }
        }}
      />
    );

    fireEvent.press(getSignUpTestId("auth-submit-button"));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        "newuser@example.com",
        "password123",
        "newuser"
      );
      expect(fetchProfile).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith(Routes.Onboarding);
    });
  });
});

describe("Onboarding Flow", () => {
  it("should fill preferences, rate recipes, and redirect to Home", async () => {
    let captured: any = null;

    const HookWrapper = () => {
      const onboardingController = useOnboardingController();
      captured = onboardingController;
      return (
        <OnboardingComponent
          onboarding={onboardingController.onboarding}
          isNextEnabled={true}
          actions={onboardingController.actions}
        />
      );
    };

    const { getByTestId, getByText } = renderWithRedux(<HookWrapper />);

    await waitFor(() => expect(captured).not.toBeNull());

    fireEvent.press(getByText("Fish"));
    fireEvent.press(getByTestId("next-button"));

    fireEvent.press(getByText("Keto"));
    fireEvent.press(getByTestId("next-button"));

    fireEvent.press(getByText("Japanese"));
    fireEvent.press(getByTestId("next-button"));

    await waitFor(() => expect(captured.onboarding.showLottie).toBe(false), {
      timeout: 3000,
    });

    fireEvent.press(getByText("Like"));
    await waitFor(() => expect(getByText("Recipe 2")).toBeTruthy());

    fireEvent.press(getByText("Neutral"));
    await waitFor(() => expect(getByText("Recipe 3")).toBeTruthy());

    fireEvent.press(getByText("Dislike"));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith(Routes.Home);
    });
  });
});
