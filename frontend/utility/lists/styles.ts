import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.border,
  },
  border: {
    marginTop: 5,
    height: 2,
    width: 55,
    backgroundColor: Colors.brand.primary,
    borderRadius: 1,
  },
  lightLabel: {
    color: Colors.text.disabled,
    fontSize: 13,
  },
  label: {
    fontSize: 16,
    fontFamily: "RobotoMedium",
  },
  description: {
    fontSize: 12,
    color: Colors.text.disabled,
    marginVertical: 4,
  },
  errorText: {
    color: Colors.brand.primary,
    fontSize: 13,
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
    height: 40,
    borderColor: Colors.text.placeholder,
    marginVertical: 4,
  },
  adddText: {
    color: Colors.brand.primary,
    marginBottom: 10,
    fontFamily: "RobotoMedium",
  },
  expiryContainer: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateInputContainer: {
    borderWidth: 1,
    borderColor: Colors.text.placeholder,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
  },
  navigateText: {
    color: Colors.text.link,
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.overlay.base,
  },
  amountContainer: {
    backgroundColor: Colors.brand.onPrimary,
    padding: 16,
    borderRadius: 16,
    width: "80%",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    width: "30%",
    alignSelf: "flex-end",
    backgroundColor: Colors.surface.buttonPrimary,
  },
  addItemButton: {
    borderRadius: 9999,
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    backgroundColor: Colors.brand.onPrimary,
  },
  addItemText: {
    color: Colors.brand.primary,
    fontFamily: "RobotoMedium",
    fontSize: 16,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text.disabled,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    backgroundColor: Colors.brand.onPrimary,
    elevation: 1,
  },
  expiryLabel: {
    fontSize: 12,
    color: Colors.text.disabled,
  },
  expiryIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listContainer: {
    width: "100%",
    backgroundColor: Colors.brand.onPrimary,
    padding: 20,
    borderRadius: 30,
    marginTop: 20,
  },
  containerLabel: {
    fontFamily: "RobotoMedium",
    fontSize: 17,
    color: Colors.text.primary,
  },
  disabledItem: {
    fontSize: 16,
    color: Colors.text.disabled,
  },
  addInventoryButton: {
    borderColor: Colors.brand.onBackground,
    borderWidth: 1,
  },
  addInventoryText: {
    color: Colors.text.primary,
    fontFamily: "RobotoMedium",
    fontSize: 16,
  },
});
