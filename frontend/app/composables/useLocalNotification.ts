import { LocalNotifications } from "@capacitor/local-notifications";

export const useLocalNotification = () => {
  const ensurePermission = async (): Promise<boolean> => {
    let { display } = await LocalNotifications.checkPermissions();
    if (display !== "granted") {
      ({ display } = await LocalNotifications.requestPermissions());
    }
    return display === "granted";
  };

  const notify = async (title: string, body: string) => {
    if (!(await ensurePermission())) {
      console.warn("Notifications refusées par l’utilisateur");
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now() % 2147483647,
          schedule: { at: new Date(Date.now() + 100) },
        },
      ],
    });
  };

  return { ensurePermission, notify };
};
