import { AuthErrors, ValidationErrors } from "@/constants/Errors";
import { Routes } from "@/constants/Routes";
import { useAuthentication } from "@/hooks/useAuthentication";
import { useFieldState } from "@/hooks/useFieldState";
import { useProfileData } from "@/hooks/useProfileData";
import { useLocalSearchParams, useRouter } from "expo-router";

export interface AuthFormState {
  email: string;
  password: string;
  errorTitle: string;
  errorMessage: string;
  showErrorModal: boolean;
}

export type AuthMode = "signUp" | "signIn";

export const useAuthController = (mode: AuthMode) => {
  const { login, signUp } = useAuthentication();
  const { fetchProfile } = useProfileData();
  const router = useRouter();
  const { redirect } = useLocalSearchParams();

  const authForm = useFieldState<AuthFormState>({
    email: "",
    password: "",
    errorTitle: "",
    errorMessage: "",
    showErrorModal: false,
  });

  const { email, password, setFieldState, setFields } = authForm;

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const isValidPassword = (password: string) =>
    /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      password
    );

  const extractUsername = (email: string) => email.split("@")[0];

  const validateForm = () => {
    if (!isValidEmail(email)) {
      showError(ValidationErrors.email);
      return false;
    }

    if (!isValidPassword(password)) {
      showError(ValidationErrors.password);
      return false;
    }

    return true;
  };

  const handleAuthError = (error: any) => {
    const { type, response } = error ?? {};
    const parsedMessage = response ? JSON.parse(response).message : "";

    switch (type) {
      case "general_argument_invalid":
        showError(getErrorFromMessage(parsedMessage));
        break;
      case "user_invalid_credentials":
        showError(AuthErrors.invalidCredentials);
        break;
      case "user_already_exists":
        showError(AuthErrors.emailAlreadyExists);
        break;
      default:
        showError(AuthErrors.unknown);
    }
  };

  const getErrorFromMessage = (message: string) => {
    if (message.includes("email")) return AuthErrors.invalidEmail;
    if (message.includes("password")) return AuthErrors.invalidPassword;
    return AuthErrors.unknown;
  };

  const showError = (errorConfig: {
    title: string;
    defaultMessage: string;
  }) => {
    setFields({
      errorTitle: errorConfig.title,
      errorMessage: errorConfig.defaultMessage,
      showErrorModal: true,
    });
  };

  const closeErrorModal = () => {
    setFields({
      showErrorModal: false,
      errorMessage: "",
    });
  };

  const handleSubmit = async () => {
    if (mode === "signUp" && !validateForm()) return;

    try {
      if (mode === "signUp") {
        await signUp(email, password, extractUsername(email));
      } else {
        await login(email, password);
      }

      const profile = await fetchProfile();

      const destination =
        profile?.isOnboarded === false
          ? Routes.Onboarding
          : typeof redirect === "string"
          ? redirect
          : Routes.Home;

      router.replace(destination as never);
    } catch (error: any) {
      await handleAuthError(error);
    }
  };

  const updateField = (field: keyof AuthFormState, value: string) => {
    setFieldState(field, value);
  };

  return {
    authForm,
    handleSubmit,
    updateField,
    closeErrorModal,
  };
};

export default useAuthController;
