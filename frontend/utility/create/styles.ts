import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

const BaseInputBox = {
  borderWidth: 1,
  borderColor: Colors.surface.border,
  borderRadius: 6,
  paddingHorizontal: 8,
  paddingVertical: 4,
};

export const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    backgroundColor: Colors.brand.onPrimary,
    paddingTop: 65,
    paddingHorizontal: 16,
  },
  inputTitle: {
    fontFamily: "RobotoMedium",
    fontSize: 18,
    marginBottom: 8,
  },
  linkText: {
    color: Colors.text.link,
    fontFamily: "RobotoRegular",
    marginBottom: 8,
  },
  stepText: {
    fontFamily: "RobotoMedium",
    color: Colors.brand.primary,
    marginBottom: 8,
    marginTop: 4,
    fontSize: 16,
  },
  stepButtonText: {
    textAlign: "center",
    fontFamily: "RobotoRegular",
    color: Colors.brand.onPrimary,
  },
  addImageButton: {
    width: 112,
    height: 112,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface.buttonSecondary,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    borderRadius: 9999,
    backgroundColor: Colors.overlay.light,
  },
  addStepButton: {
    backgroundColor: Colors.brand.primary,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputValue: {
    ...BaseInputBox,
    flex: 1,
  },
  inputQuantity: {
    ...BaseInputBox,
    width: 80,
  },
  suggestionBox: {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: Colors.brand.onPrimary,
    borderWidth: 1,
    borderColor: Colors.surface.border,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
});
