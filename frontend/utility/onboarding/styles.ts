import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    backgroundColor: Colors.brand.onPrimary,
    paddingTop: 65,
  },
  title: {
    marginBottom: 20,
    marginTop: 32,
    width: "80%",
    fontFamily: "RobotoSemiBold",
    fontSize: 28,
    lineHeight: 32,
  },
  description: {
    width: "80%",
    fontSize: 15,
    marginBottom: 18,
    color: Colors.text.secondary,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  numText: {
    fontSize: 13,
    fontFamily: "RobotoRegular",
  },
  skipText: {
    fontSize: 18,
    color: Colors.text.link,
    fontFamily: "RobotoSemiBold",
  },
  button: {
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 32,
    width: "30%",
    marginBottom: 48,
    alignSelf: "flex-end",
    backgroundColor: Colors.surface.buttonPrimary,
  },
  buttonText: {
    fontFamily: "RobotoMedium",
    textAlign: "center",
    color: Colors.brand.onPrimary,
  },
  optionModal: {
    height: "60%",
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 90,
    marginBottom: -25,
  },
  nameOverlay: {
    backgroundColor: Colors.overlay.dark,
    padding: 12,
  },
  name: {
    color: Colors.brand.onPrimary,
    fontSize: 16,
  },
  loadingContainer: {
    width: 80,
    height: 25,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
