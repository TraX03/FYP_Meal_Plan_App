import { Colors } from "@/constants/Colors";
import { styles } from "@/utility/profile/styles";
import { router, Stack } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";

type ErrorScreenProps = {
  message: string;
};

const ErrorScreen = ({ message }: ErrorScreenProps) => (
  <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.centeredContainer}>
      <View className="absolute top-20 left-3 self-start">
        <Pressable onPress={() => router.back()}>
          <IconSymbol
            name="chevron.left"
            color={Colors.brand.primary}
            size={30}
          />
        </Pressable>
      </View>
      <LottieView
        source={require("@/assets/animations/404-error.json")}
        autoPlay
        loop={true}
        style={{ width: 200, height: 200 }}
      />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  </>
);

export default ErrorScreen;
