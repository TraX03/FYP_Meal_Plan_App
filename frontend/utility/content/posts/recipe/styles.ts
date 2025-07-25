import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  nutrientContainer: {
    width: "100%",
    marginTop: 28,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: Colors.overlay.ultraLightGray,
  },
  nutrientLabel: {
    fontSize: 18,
    fontFamily: "RobotoMedium",
    color: Colors.brand.primary,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 20,
    alignSelf: "center",
  },
  ingredientName: {
    color: Colors.text.primary,
    fontSize: 15,
    fontFamily: "RobotoRegular",
    flexShrink: 1,
  },
  quantityName: {
    color: Colors.text.disabled,
    fontSize: 14,
    fontFamily: "RobotoRegular",
    textAlign: "right",
  },
  noteText: {
    color: Colors.brand.primaryDark,
    fontSize: 14,
  },
  buttonText: {
    color: Colors.brand.primary,
    fontFamily: "RobotoMedium",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  ratingContainer: {
    paddingHorizontal: 12,
    borderRadius: 25,
    marginTop: 25,
  },
  rating: {
    fontFamily: "SignikaNegativeSCSemiBold",
    fontSize: 40,
  },
  ratingTitle: {
    fontFamily: "SignikaNegativeSC",
    fontSize: 18,
    marginLeft: 3,
  },
  noRating: {
    color: Colors.text.disabled,
    fontFamily: "RobotoRegular",
    fontSize: 14,
    marginVertical: 10,
  },
  ratingButton: {
    backgroundColor: Colors.brand.primary,
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 5,
    marginVertical: 20,
  },
  subHeader: {
    fontFamily: "RobotoSemiBold",
    fontSize: 16,
    marginBottom: 10,
    color: Colors.text.primary,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderColor: Colors.surface.buttonSecondary,
  },
  itemLabel: {
    fontSize: 14,
    color: Colors.text.light,
    fontFamily: "RobotoRegular",
  },
  amount: {
    fontSize: 14,
    color: Colors.brand.onBackground,
    fontFamily: "RobotoMedium",
  },
  header: {
    fontFamily: "RobotoSemiBold",
    fontSize: 20,
  },
  starLabel: {
    color: Colors.text.primary,
    fontSize: 15,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surface.backgroundMuted,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.brand.primary,
  },
  percentText: {
    fontFamily: "RobotoLight",
    fontSize: 12,
    width: 40,
    textAlign: "right",
  },
  scoreContainer: {
    flexDirection: "row",
    gap: 22,
    alignItems: "center",
    borderBottomWidth: 0.5,
    paddingBottom: 20,
    borderColor: Colors.feedback.unknown,
  },
  ratingScore: {
    fontFamily: "RobotoBold",
    fontSize: 45,
  },
  ratingCount: {
    color: Colors.text.disabled,
    marginTop: 5,
  },
  orderByContainer: {
    alignItems: "flex-end",
    marginTop: 15,
    borderBottomWidth: 0.5,
    paddingBottom: 5,
    borderColor: Colors.feedback.unknown,
  },
  pickerContainer: {
    borderWidth: 0,
    gap: 12,
    height: 20,
    alignItems: "center",
  },
  labelTitle: {
    fontFamily: "RobotoMedium",
    fontSize: 18,
  },
  ratingLabel: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
});
