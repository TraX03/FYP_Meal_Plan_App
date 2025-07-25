import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedContainer: {
    borderColor: Colors.text.placeholder,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldTab: {
    paddingVertical: 3,
    backgroundColor: Colors.brand.onPrimary,
    borderColor: Colors.text.placeholder,
  },
  tabTitleText: {
    color: Colors.text.primary,
    fontFamily: "RobotoMedium",
  },
  settingsTab: {
    borderColor: Colors.surface.border,
    borderTopWidth: 1.2,
    borderBottomWidth: 1.2,
    padding: 25,
    alignItems: "center",
    flexDirection: "row",
  },
  genderOptionText: {
    fontSize: 14,
    fontFamily: "RobotoRegular",
    color: Colors.text.primary,
  },
  radioButton: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: Colors.brand.primary,
  },
  inputBox: {
    marginTop: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.surface.border,
  },
  inputPlaceholder: {
    fontFamily: "RobotoRegular",
    color: Colors.text.primary,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 45,
    fontSize: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surface.border,
  },
  saveButton: {
    marginTop: 25,
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: 12,
    width: 100,
    alignSelf: "flex-end",
    backgroundColor: Colors.surface.buttonPrimary,
  },
  saveButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "RobotoMedium",
    color: Colors.brand.onPrimary,
  },
  changeBgButton: {
    position: "absolute",
    top: 15,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  changeBgText: {
    fontSize: 13,
    fontFamily: "RobotoRegular",
  },
  tabText: {
    marginRight: 10,
    fontFamily: "RobotoRegular",
  },
});
