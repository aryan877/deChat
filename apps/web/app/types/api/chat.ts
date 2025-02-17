import { Message, ThreadPreview } from "../models/chat";

export interface CreateThreadResponse {
  threadId: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
  messages: Message[];
}

export interface GetThreadHistoryResponse {
  threadId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface GetThreadsResponse {
  threads: ThreadPreview[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface DeleteThreadResponse {
  message: string;
}

export interface SaveAllMessagesResponse {
  success: boolean;
  threadId: string;
  messageCount: number;
}
