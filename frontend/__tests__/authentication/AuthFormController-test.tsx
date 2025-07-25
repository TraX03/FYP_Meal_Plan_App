import useAuthController from "@/app/authentication/authForm/controller";
import { AuthErrors, ValidationErrors } from "@/constants/Errors";
import { Routes } from "@/constants/Routes";
import { useAuthentication } from "@/hooks/useAuthentication";
import { useProfileData } from "@/hooks/useProfileData";
import { act, renderHook } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

jest.mock("@/hooks/useAuthentication", () => ({
  useAuthentication: jest.fn(),
}));
jest.mock("@/hooks/useProfileData", () => ({
  useProfileData: jest.fn(),
}));
jest.mock("expo-router");

const mockLogin = jest.fn();
const mockSignUp = jest.fn();
const mockFetchProfile = jest.fn();
const mockReplace = jest.fn();

describe("useAuthController (signUp mode)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthentication as jest.Mock).mockReturnValue({
      login: mockLogin,
      signUp: mockSignUp,
    });

    (useProfileData as jest.Mock).mockReturnValue({
      fetchProfile: mockFetchProfile,
    });

    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  it("should update field correctly", () => {
    const { result } = renderHook(() => useAuthController("signUp"));

    act(() => {
      result.current.updateField("email", "test@example.com");
      result.current.updateField("password", "StrongP@ssword1");
    });

    expect(result.current.authForm.email).toBe("test@example.com");
    expect(result.current.authForm.password).toBe("StrongP@ssword1");
  });

  it("should show error for invalid email", async () => {
    const { result } = renderHook(() => useAuthController("signUp"));

    act(() => {
      result.current.updateField("email", "invalidemail");
      result.current.updateField("password", "StrongP@ss1");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.authForm.errorTitle).toBe(
      ValidationErrors.email.title
    );
  });

  it("should show error for weak password", async () => {
    const { result } = renderHook(() => useAuthController("signUp"));

    act(() => {
      result.current.updateField("email", "test@example.com");
      result.current.updateField("password", "weak");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.authForm.errorTitle).toBe(
      ValidationErrors.password.title
    );
  });

  it("should sign up successfully and redirect to onboarding", async () => {
    mockFetchProfile.mockResolvedValue({ isOnboarded: false });

    const { result } = renderHook(() => useAuthController("signUp"));

    act(() => {
      result.current.updateField("email", "test@example.com");
      result.current.updateField("password", "StrongP@ss1");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSignUp).toHaveBeenCalledWith(
      "test@example.com",
      "StrongP@ss1",
      "test"
    );
    expect(mockReplace).toHaveBeenCalledWith(Routes.Onboarding);
  });

  it("should show modal with error when signUp fails", async () => {
    mockSignUp.mockRejectedValue({
      type: "user_already_exists",
    });

    const { result } = renderHook(() => useAuthController("signUp"));

    act(() => {
      result.current.updateField("email", "test@example.com");
      result.current.updateField("password", "StrongP@ss1");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.authForm.errorTitle).toBe(
      AuthErrors.emailAlreadyExists.title
    );
    expect(result.current.authForm.showErrorModal).toBe(true);
  });
});

describe("useAuthController (signIn mode)", () => {
  it("should call login and redirect to Home", async () => {
    mockFetchProfile.mockResolvedValue(true);

    const { result } = renderHook(() => useAuthController("signIn"));

    act(() => {
      result.current.updateField("email", "test@example.com");
      result.current.updateField("password", "StrongP@ss1");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "StrongP@ss1");
    expect(mockReplace).toHaveBeenCalledWith(Routes.Home);
  });
});
