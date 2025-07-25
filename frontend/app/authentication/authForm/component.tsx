import InputBox from "@/components/InputBox";
import NotificationModal from "@/components/NotifcationModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Routes } from "@/constants/Routes";
import { useFieldState } from "@/hooks/useFieldState";
import { usePreventDoubleTap } from "@/hooks/usePreventDoubleTap";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../../utility/authentication/styles";
import { AuthFormState, AuthMode } from "./controller";

const SOCIAL_PROVIDERS = {
  google: require("@/assets/images/google.png"),
  facebook: require("@/assets/images/facebook.png"),
  apple: require("@/assets/images/apple.png"),
};

type Props = {
  mode: AuthMode;
  auth: ReturnType<typeof useFieldState<AuthFormState>>;
  onSubmit: () => void;
  updateField: (field: keyof AuthFormState, value: string) => void;
  closeErrorModal: () => void;
};

export default function AuthFormComponent({
  mode,
  auth,
  onSubmit,
  updateField,
  closeErrorModal,
}: Props) {
  const { email, password, showErrorModal, errorTitle, errorMessage } = auth;
  const { width, height } = Dimensions.get("window");
  const statusBarHeight = StatusBar.currentHeight || 0;
  const isSignIn = mode === "signIn";

  const onSwitchAuthMode = usePreventDoubleTap(() => {
    router.replace({
      pathname: Routes.AuthForm,
      params: { mode: isSignIn ? "signUp" : "signIn" },
    });
  });

  return (
    <>
      <NotificationModal
        visible={showErrorModal}
        errorTitle={errorTitle}
        errorMessage={errorMessage}
        onClose={closeErrorModal}
      />

      <ImageBackground
        source={require("@/assets/images/gradient.png")}
        style={[
          styles.background,
          {
            width: width,
            height: height + statusBarHeight,
          },
        ]}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-16">
          <Pressable testID="back-button" onPress={() => router.back()}>
            <IconSymbol
              name="chevron.left"
              color={Colors.brand.primaryDark}
              size={30}
            />
          </Pressable>

          <Image
            source={require("@/assets/images/pantriQ.png")}
            className="w-full h-[150px] self-center mt-2.5"
            resizeMode="contain"
          />

          <Text style={styles.titleText}>
            {isSignIn ? "Sign In" : "Sign Up"}
          </Text>

          <InputBox
            icon="person.fill"
            placeholder="Email"
            value={email}
            onChangeText={(text) => updateField("email", text.trim())}
            lines={1}
            containerStyle={styles.input}
          />

          <InputBox
            icon="lock.fill"
            placeholder="Password"
            value={password}
            onChangeText={(text) => updateField("password", text.trim())}
            isPassword
            lines={1}
            containerStyle={[
              styles.input,
              { marginBottom: isSignIn ? 14 : 56 },
            ]}
          />

          {isSignIn && (
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          )}

          <TouchableOpacity
            testID="auth-submit-button"
            style={styles.buttonStyle}
            onPress={onSubmit}
          >
            <Text style={styles.buttonText}>
              {isSignIn ? "Sign In" : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mb-6 mt-6">
            <View style={styles.dividerStyle} />
            <Text style={styles.dividerText}> or continue with</Text>
            <View style={styles.dividerStyle} />
          </View>

          <View className="flex-row justify-center gap-2 mb-6">
            {Object.keys(SOCIAL_PROVIDERS).map((provider) => (
              <TouchableOpacity key={provider} onPress={() => {}}>
                <Image
                  source={
                    SOCIAL_PROVIDERS[provider as keyof typeof SOCIAL_PROVIDERS]
                  }
                  className="w-[60px] h-[60px]"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>

          <View className="items-center mb-10">
            <TouchableOpacity onPress={onSwitchAuthMode}>
              <Text style={styles.dividerText}>
                {isSignIn ? (
                  <>
                    Don't have an account?{" "}
                    <Text style={styles.underlineText}>Sign Up</Text>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Text style={styles.underlineText}>Sign In</Text>
                  </>
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
