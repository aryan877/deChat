import { Message as AIMessage } from "ai";

export type Message = AIMessage;

export interface ChatThread {
  userId: string;
  threadId: string;
  title?: string;
  messages: Message[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ThreadPreview = Pick<
  ChatThread,
  "threadId" | "title" | "createdAt" | "updatedAt"
>;
