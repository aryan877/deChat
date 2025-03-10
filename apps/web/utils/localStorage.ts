export const PENDING_MESSAGE_KEY = "pending_chat_message";
export const SELECTED_MODEL_KEY = "selected_chat_model";

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

  saveSelectedModel: (model: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_MODEL_KEY, model);
    }
  },

  getSelectedModel: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SELECTED_MODEL_KEY);
    }
    return null;
  },

  clearSelectedModel: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SELECTED_MODEL_KEY);
    }
  },
};
