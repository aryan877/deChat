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

const SendIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
  >
    <path
      d="M12 20V4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 11L12 4L19 11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ScrollDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  });

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

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // Modify the form submit handler
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!chatId && input.trim()) {
      try {
        // Save message to local storage
        localStorageUtils.savePendingMessage(input);
        // Create new thread and navigate
        const response = await createThreadMutation();
        router.push(`/chat?chatId=${response.threadId}`);
      } catch (error) {
        console.error("Error creating thread:", error);
        // Clear pending message if there was an error
        localStorageUtils.clearPendingMessage();
      }
      return;
    }

    handleSubmit(e);
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
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-sm break-words whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {showScrollDown && messages.length > 0 && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-10">
            <Button
              size="icon"
              variant="secondary"
              onClick={scrollToBottom}
              className="h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <ScrollDownIcon />
            </Button>
          </div>
        )}

        <div className="sticky bottom-0 bg-background px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleFormSubmit} className="relative py-3">
              <Textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-sm text-foreground placeholder-muted-foreground pr-12 py-2"
                placeholder="Type your message..."
                rows={1}
                disabled={isChatLoading}
                style={{
                  minHeight: "40px",
                  maxHeight: "160px",
                }}
              />
              <Button
                type="submit"
                disabled={isChatLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary hover:bg-primary/90 rounded-md transition-colors h-8 w-8"
              >
                <SendIcon />
              </Button>
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
