export const PENDING_MESSAGE_KEY = "pending_chat_message";

export const localStorageUtils = {
  savePendingMessage: (message: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PENDING_MESSAGE_KEY, message);
    }
  },

  getPendingMessage: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(PENDING_MESSAGE_KEY);
    }
    return null;
  },

  clearPendingMessage: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(PENDING_MESSAGE_KEY);
    }
  },
};
