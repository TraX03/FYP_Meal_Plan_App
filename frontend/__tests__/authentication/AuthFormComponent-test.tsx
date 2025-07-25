import AuthFormComponent from "@/app/authentication/authForm/component";
import { Routes } from "@/constants/Routes";
import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";

jest.mock("expo-router");

const mockUpdateField = jest.fn();
const mockOnSubmit = jest.fn();
const mockCloseErrorModal = jest.fn();

const mockAuth = {
  email: "test@example.com",
  password: "123456",
  showErrorModal: false,
  errorTitle: "",
  errorMessage: "",
  setFieldState: jest.fn(),
  setFields: jest.fn(),
  getFieldState: jest.fn(),
};

const baseProps = {
  mode: "signIn" as const,
  updateField: mockUpdateField,
  onSubmit: mockOnSubmit,
  closeErrorModal: mockCloseErrorModal,
  auth: mockAuth,
};

describe("AuthFormComponent", () => {
  it("renders Sign In form correctly", () => {
    const { getByPlaceholderText, getByTestId } = render(
      <AuthFormComponent {...baseProps} />
    );

    const button = getByTestId("auth-submit-button");
    const { getByText } = within(button);
    expect(getByText("Sign In")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(screen.queryByText(/forgot password\?/i)).not.toBeNull();
  });

  it("calls updateField on text input", () => {
    const { getByPlaceholderText } = render(
      <AuthFormComponent {...baseProps} />
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "new@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "newpassword");

    expect(mockUpdateField).toHaveBeenCalledWith("email", "new@example.com");
    expect(mockUpdateField).toHaveBeenCalledWith("password", "newpassword");
  });

  it("calls onSubmit when Sign In button is pressed", () => {
    const { getByTestId } = render(<AuthFormComponent {...baseProps} />);
    const submitButton = getByTestId("auth-submit-button");
    fireEvent.press(submitButton);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it("switches to Sign Up when text is pressed", () => {
    const { getByText } = render(<AuthFormComponent {...baseProps} />);
    fireEvent.press(getByText("Sign Up"));
    expect(router.replace).toHaveBeenCalledWith({
      pathname: Routes.AuthForm,
      params: { mode: "signUp" },
    });
  });

  it("calls router.back when back icon is pressed", () => {
    const { getByTestId } = render(<AuthFormComponent {...baseProps} />);
    fireEvent.press(getByTestId("back-button"));
    expect(router.back).toHaveBeenCalled();
  });

  it("renders NotificationModal if showErrorModal is true", () => {
    const propsWithError = {
      ...baseProps,
      auth: {
        ...baseProps.auth,
        showErrorModal: true,
        errorTitle: "Error",
        errorMessage: "Invalid credentials",
      },
    };

    const { getByText } = render(<AuthFormComponent {...propsWithError} />);
    expect(getByText("Error")).toBeTruthy();
    expect(getByText("Invalid credentials")).toBeTruthy();
  });
});
