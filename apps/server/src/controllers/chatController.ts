import { Response } from "express";
import { ChatThread } from "../models/ChatThread.js";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import {
  NotFoundError,
  APIError,
  ErrorCode,
} from "../middleware/errors/types.js";
import { getUserCluster, getUserId } from "../utils/userIdentification.js";
import { createSonicTools } from "@repo/de-agent/server";
import { streamText, smoothStream } from "ai";
import { generateDeChatAgent } from "../utils/generateDeChatAgent.js";
import { assistantPrompt } from "../const/prompt.js";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { nanoid } from "nanoid";

export const getThreads = async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const limit = parseInt(req.query.limit as string) || 10;
  const cursor = req.query.cursor as string | undefined;

  const query: any = { userId, isActive: true };
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const threads = await ChatThread.find(query, {
    threadId: 1,
    createdAt: 1,
    updatedAt: 1,
    title: 1,
  })
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = threads.length > limit;
  const items = hasMore ? threads.slice(0, -1) : threads;
  const nextCursor =
    hasMore && threads[limit]
      ? threads[limit].createdAt.toISOString()
      : undefined;

  return {
    threads: items,
    nextCursor,
    hasMore,
  };
};

export const createNewThread = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = getUserId(req);
  const threadId = `thread_${nanoid()}`;

  const chatThread = await ChatThread.create({
    userId,
    threadId,
    messages: [],
  });

  return {
    threadId: chatThread.threadId,
    createdAt: chatThread.createdAt,
    updatedAt: chatThread.updatedAt,
    title: chatThread.title || undefined,
    messages: [],
  };
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  const controller = new AbortController();
  const { signal } = controller;

  req.on("close", () => {
    controller.abort();
  });

  const userId = getUserId(req);
  const cluster = getUserCluster(req);
  const { messages, threadId, model = "openai" } = req.body;

  try {
    const chatThread = await ChatThread.findOne({
      threadId,
      userId,
      isActive: true,
    });

    if (!chatThread) {
      throw new NotFoundError("Thread not found");
    }

    if (!chatThread.title && messages.length > 0) {
      const firstUserMessage = messages.find(
        (msg: { role: string; content: string }) => msg.role === "user"
      );
      if (firstUserMessage) {
        chatThread.title = firstUserMessage.content.slice(0, 100);
        await chatThread.save();
      }
    }

    const agent = generateDeChatAgent({
      address: req.user?.walletAddress || "",
      cluster: cluster,
    });

    const tools = createSonicTools(agent);

    // Use type assertion to bypass type checking
    const modelToUse =
      model === "anthropic"
        ? anthropic("claude-3-5-sonnet-latest")
        : openai("gpt-4o");

    // Use the any type to bypass type checking
    const result = streamText({
      // @ts-ignore - Bypass type checking for model
      model: modelToUse,
      messages,
      experimental_toolCallStreaming: true,
      maxSteps: 5,
      system: assistantPrompt,
      tools,
      experimental_transform: smoothStream({
        chunking: "word",
        delayInMs: 15,
      }),
      abortSignal: signal,
    });

    const streamResponse = result.toDataStreamResponse();
    const stream = streamResponse.body;

    if (!stream) {
      throw new APIError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "No stream available"
      );
    }

    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        if (signal.aborted) {
          reader.releaseLock();
          res.end();
          return;
        }
        res.write(value);
      }
    } catch (error) {
      reader.releaseLock();
      console.error("Stream error:", error);
      if (!res.headersSent) {
        throw new APIError(
          500,
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Stream processing failed",
          error instanceof Error ? error.message : undefined
        );
      }
      res.end();
    }
  } catch (error) {
    if (!res.headersSent) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "An unexpected error occurred",
        error instanceof Error ? error.stack : undefined
      );
    }
  } finally {
    controller.abort();
  }
};

export const getThreadHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = getUserId(req);
  const threadId = req.params.threadId;

  const chatThread = await ChatThread.findOne({
    threadId,
    userId,
    isActive: true,
  });

  if (!chatThread) {
    throw new NotFoundError("Thread not found");
  }

  return {
    threadId: chatThread.threadId,
    messages: chatThread.messages,
    createdAt: chatThread.createdAt,
    updatedAt: chatThread.updatedAt,
  };
};

export const deleteThread = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = getUserId(req);
  const threadId = req.params.threadId;

  const result = await ChatThread.findOneAndDelete({ threadId, userId });

  if (!result) {
    throw new NotFoundError("Thread not found");
  }

  return { message: "Thread deleted successfully" };
};

export const saveAllMessages = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = getUserId(req);
  const { messages, threadId } = req.body;

  // First try to find existing thread
  let chatThread = await ChatThread.findOne({
    threadId,
    userId,
    isActive: true,
  });

  // If thread doesn't exist, create a new one
  if (!chatThread) {
    chatThread = new ChatThread({
      threadId,
      userId,
      isActive: true,
      messages: [],
    });
  }

  // Replace all messages in the thread
  chatThread.messages = messages;
  await chatThread.save();

  return {
    success: true,
    threadId,
    messageCount: messages.length,
  };
};
