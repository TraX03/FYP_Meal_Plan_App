import * as Notifications from "expo-notifications";
import { capitalize } from "./capitalize";

export async function scheduleExpiryNotification(
  itemName: string,
  expiryDate: string,
  userId: string
) {
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) {
    console.warn("Invalid expiry date:", expiryDate);
    return;
  }

  async function scheduleNotification(daysBefore: number) {
    const targetDate = new Date(expiry);
    targetDate.setDate(targetDate.getDate() - daysBefore);
    targetDate.setHours(9, 0, 0, 0);

    const now = new Date();
    let triggerDate = targetDate;

    if (triggerDate <= now) {
      if (daysBefore === 1) {
        triggerDate = new Date(now.getTime() + 10 * 1000);
      } else {
        console.log(`Skipped ${daysBefore}d notification: already past`);
        return;
      }
    }

    const isoTrigger = triggerDate.toISOString();
    const description = `${capitalize(
      itemName
    )} will expire in ${daysBefore} day${daysBefore > 1 ? "s" : ""}.`;

    try {
      let alreadyScheduled = false;
      if (!alreadyScheduled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "📦 Expiry Notification",
            body: description,
            sound: true,
            data: {
              itemName,
              expiryDate,
              triggerDate: isoTrigger,
              userId,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
      }
    } catch (err) {
      console.warn(`Failed to schedule notification:`, err);
    }
  }

  const threeDayBefore = new Date(expiry);
  threeDayBefore.setDate(threeDayBefore.getDate() - 3);
  threeDayBefore.setHours(9, 0, 0, 0);

  if (threeDayBefore > new Date()) {
    await scheduleNotification(3);
  } else {
    console.log("Skipping 3-day notification: too late");
  }

  await scheduleNotification(1);
}
