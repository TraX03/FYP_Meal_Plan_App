/* Below are the error configurations used throughout the app. */

/* Common error messages */
const commonErrors = {
  invalidEmailFormat: "Please enter a valid email address.",
};

/* Field validation errors */
export const ValidationErrors = {
  email: {
    title: "Email Error",
    defaultMessage: commonErrors.invalidEmailFormat,
  },
  password: {
    title: "Password Error",
    defaultMessage:
      "Password must be at least 8 characters, with one uppercase and one special character.",
  },
} as const;

export type ValidationErrorType = keyof typeof ValidationErrors;

/* Server/API errors */
export const AuthErrors = {
  invalidPassword: {
    title: "Login Error",
    defaultMessage: "Your password does not meet the required format.",
  },
  invalidEmail: {
    title: "Login Error",
    defaultMessage: commonErrors.invalidEmailFormat,
  },
  invalidCredentials: {
    title: "Login Error",
    defaultMessage:
      "The email or password is incorrect. Please double-check your details.",
  },
  emailAlreadyExists: {
    title: "Signup Error",
    defaultMessage: "An account with this email already exists.",
  },
  unknown: {
    title: "Error",
    defaultMessage: "Something went wrong. Please try again.",
  },
} as const;

export type AuthErrorType = keyof typeof AuthErrors;
