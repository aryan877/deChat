import { z } from "zod";
import { validateRequest } from "./validateRequest.js";

const toolInvocationSchema = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.record(z.unknown()).optional().default({}), // Made args optional with empty object default
  result: z.unknown().optional(),
  state: z.enum(["partial-call", "call", "result"]),
});

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.string().optional(),
  annotations: z.array(z.unknown()).optional().default([]),
  isLoading: z.boolean().optional().default(false),
  toolInvocations: z.array(toolInvocationSchema).optional().default([]),
});

// Schema for sending a message
export const validateSendMessage = validateRequest({
  body: z.object({
    messages: z.array(messageSchema),
    threadId: z.string(),
  }),
});

// Schema for saving all messages in a thread
export const validateSaveAllMessages = validateRequest({
  body: z.object({
    messages: z.array(messageSchema),
    threadId: z.string(),
  }),
});

// Schema for getting thread history
export const validateThreadHistory = validateRequest({
  params: z.object({
    threadId: z.string(),
  }),
});

// Schema for deleting a thread
export const validateDeleteThread = validateRequest({
  params: z.object({
    threadId: z.string(),
  }),
});

// Schema for getting threads with pagination
export const validateGetThreads = validateRequest({
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
  }),
});

export type Message = z.infer<typeof messageSchema>;
export type ToolInvocation = z.infer<typeof toolInvocationSchema>;
