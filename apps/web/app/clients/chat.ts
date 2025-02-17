import api from "@/lib/axios";
import {
  GetThreadsResponse,
  GetThreadHistoryResponse,
  CreateThreadResponse,
  DeleteThreadResponse,
  SaveAllMessagesResponse,
} from "../types/api/chat";
import { Message } from "../types/models/chat";

export const chatClient = {
  saveAllMessages: async (
    messages: Message[],
    threadId: string
  ): Promise<SaveAllMessagesResponse> => {
    const { data } = await api.post<SaveAllMessagesResponse>(
      "/api/chat/save-all-messages",
      {
        messages,
        threadId,
      }
    );
    return data;
  },

  getThreads: async (params?: {
    limit?: number;
    cursor?: string;
  }): Promise<GetThreadsResponse> => {
    const { data } = await api.get<GetThreadsResponse>("/api/chat/threads", {
      params: {
        limit: params?.limit || 20,
        cursor: params?.cursor,
      },
    });
    return data;
  },

  getHistory: async (threadId: string): Promise<Message[]> => {
    const { data } = await api.get<GetThreadHistoryResponse>(
      `/api/chat/history/${threadId}`
    );
    return data.messages;
  },

  createThread: async (): Promise<CreateThreadResponse> => {
    const { data } = await api.post<CreateThreadResponse>("/api/chat/thread");
    return data;
  },

  deleteThread: async (threadId: string): Promise<DeleteThreadResponse> => {
    const { data } = await api.delete<DeleteThreadResponse>(
      `/api/chat/thread/${threadId}`
    );
    return data;
  },
};
