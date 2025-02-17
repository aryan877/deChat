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
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={cn(
            "pointer-events-auto w-full",
            "transform transition-all duration-300 ease-out",
            "hover:translate-x-0 hover:scale-[1.02]",
            index === 0 ? "translate-x-0" : "translate-x-2"
          )}
          style={{
            // Add slight rotation for a more dynamic look
            transform: `rotate(${Math.min(index * 0.5, 1)}deg)`,
          }}
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
