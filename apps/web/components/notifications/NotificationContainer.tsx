"use client";

import { Notification } from "./Notification";
import { useNotificationStore } from "@/app/store/notificationStore";
import { cn } from "@/lib/utils";

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50",
        "flex flex-col items-end gap-2",
        "w-[380px] max-w-[calc(100vw-2rem)]",
        "pointer-events-none"
      )}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "pointer-events-auto w-full",
            "transform transition-all duration-300 ease-out"
          )}
        >
          <Notification
            type={notification.type}
            message={notification.message}
            details={notification.details}
            isVisible={true}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};
