import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatClient } from "@/app/clients/chat";
import { CreateThreadResponse, Message } from "@/app/types";
import { GetThreadsResponse } from "@/app/types";
import { ThreadPreview } from "@/app/types";

export const chatKeys = {
  all: ["chats"] as const,
  threads: () => [...chatKeys.all, "threads"] as const,
  thread: (threadId: string) => [...chatKeys.all, "thread", threadId] as const,
  messages: (threadId: string) =>
    [...chatKeys.thread(threadId), "messages"] as const,
};

export function useThreads() {
  return useQuery({
    queryKey: chatKeys.threads(),
    queryFn: () => chatClient.getThreads(),
  });
}

export function useThreadMessages(threadId: string | null) {
  return useQuery({
    queryKey: chatKeys.messages(threadId || ""),
    queryFn: () => chatClient.getHistory(threadId || ""),
    enabled: !!threadId,
  });
}

export function useSaveAllMessages() {
  return useMutation({
    mutationFn: ({
      messages,
      threadId,
    }: {
      messages: Message[];
      threadId: string;
    }) => chatClient.saveAllMessages(messages, threadId),
    onSuccess: () => {
      // // Invalidate messages for this thread to trigger refetch
      // queryClient.invalidateQueries({ queryKey: chatKeys.messages(threadId) });
      // // Also invalidate threads list as the last message might have changed
      // queryClient.invalidateQueries({ queryKey: chatKeys.threads() });
    },
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatClient.createThread,
    onSuccess: (newThread: CreateThreadResponse) => {
      // Immediately update the threads list in the cache
      queryClient.setQueryData<
        { pages: GetThreadsResponse[]; pageParams: unknown[] } | undefined
      >(chatKeys.threads(), (oldData) => {
        const threadPreview: ThreadPreview = {
          threadId: newThread.threadId,
          createdAt: newThread.createdAt,
          updatedAt: newThread.updatedAt,
          title: newThread.title,
        };

        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                threads: [threadPreview],
                hasMore: false,
                nextCursor: undefined,
              },
            ],
            pageParams: [undefined],
          };
        }
        // Add the new thread to the first page
        const updatedPages = [...oldData.pages];
        const firstPage = updatedPages[0];
        if (!firstPage) return oldData;

        updatedPages[0] = {
          ...firstPage,
          threads: [threadPreview, ...firstPage.threads],
          hasMore: firstPage.hasMore ?? false,
        };

        return {
          ...oldData,
          pages: updatedPages,
        };
      });
      // Also invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: chatKeys.threads() });
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) => chatClient.deleteThread(threadId),
    onSuccess: (_, threadId) => {
      // Remove the thread from cache with exact: true to prevent refetch
      queryClient.removeQueries({
        queryKey: chatKeys.thread(threadId),
        exact: true,
      });
      // Invalidate threads list to trigger refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.threads() });
    },
  });
}
