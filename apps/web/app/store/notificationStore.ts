import { NotificationType } from "@/components/notifications/Notification";
import { create } from "zustand";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  details?: unknown;
  txHash?: string;
  txExplorerUrl?: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    message: string,
    details?: unknown,
    txHash?: string,
    txExplorerUrl?: string
  ) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (type, message, details, txHash, txExplorerUrl) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Math.random().toString(36).substring(7),
          type,
          message,
          details,
          txHash,
          txExplorerUrl,
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
