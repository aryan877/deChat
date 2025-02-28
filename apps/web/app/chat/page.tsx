"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState, FormEvent, useCallback } from "react";
import React, { Suspense } from "react";
import Sidebar from "@/components/chat/Sidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { nanoid } from "nanoid";
import { ThreadPreview } from "@/app/types";
import { usePrivy } from "@privy-io/react-auth";
import { useClusterStore } from "@/app/store/clusterStore";
import {
  useCreateThread,
  useDeleteThread,
  useSaveAllMessages,
  chatKeys,
  useThreadMessages,
} from "@/hooks/chat";
import { useInfiniteQuery } from "@tanstack/react-query";
import { chatClient } from "@/app/clients/chat";
import { GetThreadsResponse } from "@/app/types/api/chat";
import { localStorageUtils } from "@/utils/localStorage";
import { SendIcon } from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import { ScrollDownIcon } from "@/components/ScrollDownIcon";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StopIcon } from "@/components/StopIcon";

const ChatContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logout } = usePrivy();
  const { data: initialMessages = [] } = useThreadMessages(chatId);
  const [hasInitialMessagesSaved, setHasInitialMessagesSaved] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [hasActiveToolCall, setHasActiveToolCall] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    data,
    isLoading: isThreadsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: chatKeys.threads(),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return chatClient.getThreads({
        limit: 10,
        cursor: pageParam,
      });
    },
    getNextPageParam: (lastPage: GetThreadsResponse) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { mutateAsync: createThreadMutation } = useCreateThread();
  const { mutateAsync: deleteThreadMutation } = useDeleteThread();
  const { mutateAsync: saveAllMessagesMutation } = useSaveAllMessages();

  // Flatten all threads from all pages
  const threads =
    data?.pages.flatMap((page: GetThreadsResponse) => page.threads) || [];

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
    reload,
    addToolResult,
    stop,
  } = useChat({
    api: "/api/chat/message",
    id: chatId || undefined,
    credentials: "include",
    generateId: () => `msg_${nanoid()}`,
    sendExtraMessageFields: true,
    body: {
      threadId: chatId,
    },
    headers: {
      "Content-Type": "application/json",
      "x-cluster": useClusterStore.getState().selectedCluster,
    },
    initialMessages,
    onResponse: () => {
      setIsWaitingForResponse(false);
    },
  });

  // Check for active tool calls
  useEffect(() => {
    const hasActiveTool = messages.some((message) =>
      message?.toolInvocations?.some((t) => t.state === "call")
    );
    setHasActiveToolCall(hasActiveTool);
  }, [messages]);

  useEffect(() => {
    if (!isChatLoading && messages.length > 0) {
      if (chatId) {
        // Only save if these aren't the initial messages or if we have new messages
        if (
          !hasInitialMessagesSaved &&
          messages.length !== initialMessages.length &&
          messages.length > 0
        ) {
          saveAllMessagesMutation({
            messages,
            threadId: chatId,
          }).catch(console.error);
          setHasInitialMessagesSaved(true);
        }
      }
    }
  }, [
    chatId,
    isChatLoading,
    saveAllMessagesMutation,
    messages,
    initialMessages.length,
    hasInitialMessagesSaved,
  ]);

  // Add scroll handler to check if we're at bottom
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const hasScrollableContent = scrollHeight > clientHeight;
      const isAtBottom =
        Math.abs(scrollHeight - clientHeight - scrollTop) < 100;
      setShowScrollDown(!isAtBottom && hasScrollableContent);
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener("scroll", handleScroll);
      return () =>
        messagesContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Modify the effect to handle pending messages
  useEffect(() => {
    const handlePendingMessage = async () => {
      const pendingMessage = localStorageUtils.getPendingMessage();
      if (pendingMessage && chatId) {
        try {
          // Clear the pending message first
          localStorageUtils.clearPendingMessage();
          // Set the input value
          handleInputChange({
            target: { value: pendingMessage },
          } as React.ChangeEvent<HTMLTextAreaElement>);
          // Submit the message
          const fakeEvent = {
            preventDefault: () => {},
          } as FormEvent<HTMLFormElement>;
          await handleSubmit(fakeEvent);
        } catch (error) {
          console.error("Error handling pending message:", error);
        }
      }
    };

    handlePendingMessage();
  }, [chatId, handleInputChange, handleSubmit]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 160); // Max height: 160px
      textarea.style.height = `${Math.max(40, newHeight)}px`; // Min height: 40px
    };

    adjustHeight();

    // Add event listener for input changes
    textarea.addEventListener("input", adjustHeight);

    return () => {
      textarea.removeEventListener("input", adjustHeight);
    };
  }, [input]);

  // Modified form submit handler
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!chatId && input.trim()) {
      try {
        localStorageUtils.savePendingMessage(input);
        const response = await createThreadMutation();
        router.push(`/chat?chatId=${response.threadId}`);
      } catch (error) {
        console.error("Error creating thread:", error);
        localStorageUtils.clearPendingMessage();
      }
      return;
    }

    setIsWaitingForResponse(true);
    handleSubmit(e);
  };

  // Handle reload with error handling
  const handleReload = async () => {
    try {
      setIsWaitingForResponse(true);
      await reload();
    } catch (error) {
      console.error("Error reloading chat:", error);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  }

  const handleCreateThread = async () => {
    try {
      const response = await createThreadMutation();
      router.push(`/chat?chatId=${response.threadId}`);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const handleSelectThread = (threadId: string) => {
    router.push(`/chat?chatId=${threadId}`);
  };

  const handleDeleteThread = async (thread: ThreadPreview) => {
    try {
      await deleteThreadMutation(thread.threadId);
      if (chatId === thread.threadId) {
        router.push("/chat");
      }
      // Refresh the threads list after deletion
      refetch();
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const handleLoadMore = () => {
    fetchNextPage();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-background">
      <Sidebar
        threads={threads}
        selectedThread={chatId}
        onSelectThread={handleSelectThread}
        onCreateThread={handleCreateThread}
        isLoading={isThreadsLoading}
        onDeleteClick={handleDeleteThread}
        onLogoutClick={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        hasMore={!!hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={handleLoadMore}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 pt-16 md:pt-6 pb-6"
        >
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2 md:mb-3">
                  Welcome to DeChat
                </h1>
                <p className="text-sm text-muted-foreground">
                  Start a conversation with our decentralized AI assistant
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLoading={isChatLoading || isWaitingForResponse}
                  addToolResult={addToolResult}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {showScrollDown && messages.length > 0 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 max-w-3xl mx-auto w-full flex justify-center">
            <Button
              size="icon"
              variant="secondary"
              onClick={scrollToBottom}
              className="h-8 w-8 rounded-md shadow-md hover:shadow-lg transition-all"
            >
              <ScrollDownIcon />
            </Button>
          </div>
        )}

        <div className="sticky bottom-0 bg-background px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleFormSubmit} className="relative py-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-sm text-foreground placeholder-muted-foreground pr-24 py-2"
                placeholder={
                  hasActiveToolCall
                    ? "Please complete/cancel action or wait for response..."
                    : isWaitingForResponse
                      ? "Waiting for response..."
                      : "Type your message..."
                }
                rows={1}
                disabled={
                  isChatLoading || hasActiveToolCall || isWaitingForResponse
                }
                style={{
                  minHeight: "40px",
                  maxHeight: "160px",
                  overflow: "hidden", // Hide scrollbar during auto-resize
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {isChatLoading && (
                  <Button
                    type="button"
                    onClick={stop}
                    className="p-1.5 h-8 w-8 bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
                    title="Stop generating"
                  >
                    <StopIcon />
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={
                    isChatLoading ||
                    hasActiveToolCall ||
                    !input.trim() ||
                    isWaitingForResponse
                  }
                  className="p-1.5 h-8 w-8 bg-primary hover:bg-primary/90 rounded-md transition-colors"
                >
                  {isWaitingForResponse ? <LoadingSpinner /> : <SendIcon />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
