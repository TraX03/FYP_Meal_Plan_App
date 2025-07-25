import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useIsFocused } from "@react-navigation/native";
import { addDays, format, startOfDay } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import PlannerComponent from "./component";
import usePlannerController from "./controller";

export default function PlannerContainer() {
  const isFocused = useIsFocused();
  const { isLoggedIn } = useReduxSelectors();
  const { checkLogin } = useRequireLogin();
  const { targetDate } = useLocalSearchParams();

  const {
    date: { weekStart, minDate },
    planner: { selectedDate, setFieldState },
    planner,
    fetchMealsForDate,
    actions,
  } = usePlannerController();

  useEffect(() => {
    if (targetDate) {
      const parsedDate = new Date(targetDate as string);
      if (!isNaN(parsedDate.getTime())) {
        setFieldState("selectedDate", parsedDate);
      }
    }
  }, [targetDate]);

  useEffect(() => {
    const formatDate = (d: Date) => format(d, "yyyy-MM-dd");
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      startOfDay(addDays(weekStart, i))
    );
    const validDates = weekDates.filter((d) => d >= minDate);
    const isDateInRange = validDates.some(
      (d) => formatDate(d) === formatDate(selectedDate)
    );

    if (!isDateInRange && validDates.length > 0) {
      const fallbackDate =
        validDates.findLast((d) => d <= selectedDate) ?? validDates[0];

      if (formatDate(fallbackDate) !== formatDate(selectedDate)) {
        setFieldState("selectedDate", fallbackDate);
      }
    }
  }, [weekStart, selectedDate, minDate, setFieldState]);

  useEffect(() => {
    if (isFocused && isLoggedIn) {
      setFieldState("planLoading", true);
      fetchMealsForDate(selectedDate);
    }
  }, [isFocused, selectedDate, isLoggedIn]);

  return (
    <PlannerComponent
      planner={planner}
      checkLogin={checkLogin}
      fetchMealsForDate={fetchMealsForDate}
      date={{ weekStart, minDate }}
      actions={actions}
    />
  );
}
