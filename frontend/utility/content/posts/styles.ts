import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.onPrimary,
  },
  contentContainer: {
    backgroundColor: Colors.brand.onPrimary,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  overlayContainer: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  commentBar: {
    flex: 1,
    marginRight: 10,
    backgroundColor: Colors.surface.backgroundSoft,
    borderRadius: 50,
  },
  timeAgoText: {
    fontSize: 10,
    color: Colors.text.disabled,
  },
  commentText: {
    marginTop: 5,
    fontSize: 13,
    color: Colors.text.primary,
  },
  divider: {
    width: 200,
    height: 0.5,
    backgroundColor: Colors.surface.border,
    alignSelf: "center",
    marginVertical: 25,
  },
  instructionModal: {
    height: "85%",
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 90,
    marginBottom: -25,
  },
  modalHeader: {
    fontSize: 20,
    fontFamily: "RobotoSemiBold",
    marginBottom: 12,
    textAlign: "center",
  },
  recipeTitle: {
    fontSize: 20,
    fontFamily: "RobotoBold",
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "RobotoMedium",
    marginBottom: 5,
  },
  authorText: {
    color: Colors.text.disabled,
    marginTop: 6,
    fontFamily: "RobotoMedium",
    fontSize: 14,
  },
  authorName: {
    color: Colors.brand.primary,
    textDecorationLine: "underline",
  },
  statsText: {
    color: Colors.text.disabled,
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    fontFamily: "RobotoRegular",
    fontSize: 14,
    lineHeight: 20,
  },
  dateText: {
    alignSelf: "flex-end",
    color: Colors.text.disabled,
    fontSize: 12,
    paddingTop: 10,
  },
  countLabel: {
    fontSize: 10,
    color: Colors.text.disabled,
  },
  mealPlanButton: {
    backgroundColor: Colors.brand.primary,
    height: "60%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 5,
    marginVertical: 20,
  },
  ratingButtonText: {
    color: Colors.brand.onPrimary,
    fontSize: 15,
    fontFamily: "RobotoMedium",
  },
  fixedContainer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
  },
  replyToText: {
    color: Colors.feedback.unknown,
    fontSize: 12,
    marginRight: 15,
  },
  replyButton: {
    color: Colors.brand.primary,
    fontFamily: "Afacad",
    textAlign: "right",
    fontSize: 15,
  },
});
