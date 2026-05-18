// @ts-expect-error -- event-source-polyfill has no published types
import { EventSourcePolyfill } from "event-source-polyfill";
import { useLocalNotification } from "~/composables/useLocalNotification";

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useNotificationStream = () => {
  const { token, authFetch } = useAuth();
  const apiUrl = useApiUrl();
  const { notify } = useLocalNotification();

  const notifications = useState<NotificationItem[]>("notifications", () => []);
  const source = useState<EventSource | null>("notifications-source", () => null);

  const markAsRead = (id: number) =>
    authFetch(`/api/notifications/${id}/read`, { method: "PATCH" }).catch((e) =>
      console.error("markAsRead failed", e),
    );

  const start = () => {
    if (!import.meta.client) return;
    if (!token.value || source.value) return;

    const es: EventSource = new EventSourcePolyfill(`${apiUrl}/api/notifications/stream`, {
      headers: { Authorization: `Bearer ${token.value}` },
      heartbeatTimeout: 90_000,
    });

    es.addEventListener("notification", (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as NotificationItem;
        if (notifications.value.some((n) => n.id === payload.id)) return;

        notifications.value = [payload, ...notifications.value];
        notify(payload.title, payload.body);
        markAsRead(payload.id);
      } catch (e) {
        console.error("Failed to parse notification payload", e);
      }
    });

    es.onerror = (e) => {
      console.warn("Notification stream error (polyfill will reconnect)", e);
    };

    source.value = es;
  };

  const stop = () => {
    source.value?.close();
    source.value = null;
    notifications.value = [];
  };

  return { notifications, start, stop };
};
