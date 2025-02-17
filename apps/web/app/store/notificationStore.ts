import { create } from "zustand";
import { NotificationType } from "@/components/notifications/Notification";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  details?: unknown;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    message: string,
    details?: unknown
  ) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (type, message, details) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Math.random().toString(36).substring(7),
          type,
          message,
          details,
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
