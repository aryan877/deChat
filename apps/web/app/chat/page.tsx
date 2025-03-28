"use client";

import { chatClient } from "@/app/clients/chat";
import { useClusterStore } from "@/app/store/clusterStore";
import { ThreadPreview } from "@/app/types";
import { GetThreadsResponse } from "@/app/types/api/chat";
import ChatMessage from "@/components/chat/ChatMessage";
import Sidebar from "@/components/chat/Sidebar";
import { ScrollDownIcon } from "@/components/ScrollDownIcon";
import { SendIcon } from "@/components/SendIcon";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  chatKeys,
  useCreateThread,
  useDeleteThread,
  useSaveAllMessages,
  useThreadMessages,
} from "@/hooks/chat";
import { localStorageUtils } from "@/utils/localStorage";
import { useChat } from "@ai-sdk/react";
import { usePrivy } from "@privy-io/react-auth";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { nanoid } from "nanoid";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// Action Guide component to display available actions
const ActionGuide = () => {
  return (
    <div className="text-center py-4">
      <h1 className="text-xl md:text-2xl font-bold text-primary mb-3">
        Welcome to DeChat
      </h1>
      <p className="text-xs text-white/80 mb-4">
        Your personal AI assistant for navigating DeFi on Sonic - get quotes,
        execute trades, check balances, and explore the Sonic ecosystem
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-5xl mx-auto">
        {/* Account & Balance Section */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border">
          <h2 className="text-base font-semibold text-primary mb-2">
            📊 Account & Balance
          </h2>
          <ul className="space-y-2">
            <li>
              <p className="text-sm font-medium">Check Account Info</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Show me my account balance&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">View Token Balance</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;What&apos;s my USDC balance?&quot;
                </span>
              </p>
            </li>
          </ul>
        </div>

        {/* Trading & Swapping Section */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border">
          <h2 className="text-base font-semibold text-primary mb-2">
            💱 Trading & Swapping
          </h2>
          <ul className="space-y-2">
            <li>
              <p className="text-sm font-medium">Get Best Trade Quote</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Get a quote to swap 1.5 SONIC for USDC&quot;
                </span>
              </p>
              <div className="mt-1 text-xs bg-primary/10 text-primary p-1.5 rounded">
                <span className="font-semibold">New!</span> Powered by ODOS and
                Magpie aggregators for the best rates
              </div>
            </li>
            <li>
              <p className="text-sm font-medium">Execute Swap</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">&quot;Execute the swap&quot;</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Automatically routes through the best liquidity provider
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Specify Aggregator</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Use Magpie to swap 1 SONIC to USDC&quot;
                </span>
                {" or "}
                <span className="italic">
                  &quot;Get ODOS quote for 10 USDC to SONIC&quot;
                </span>
              </p>
            </li>
          </ul>
        </div>

        {/* Staking Section */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border">
          <h2 className="text-base font-semibold text-primary mb-2">
            ⚡ Staking & Delegation
          </h2>
          <ul className="space-y-2">
            <li>
              <p className="text-sm font-medium">View My Stakes</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Show my staked SONIC tokens&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">View Validators</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Show me all Sonic validators&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Stake Tokens</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Stake 10 SONIC with validator 18&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Unstake Tokens</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Unstake 5 SONIC from validator 18&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Withdraw Tokens</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Withdraw my unlocked tokens from validator 18&quot;
                </span>
              </p>
            </li>
          </ul>
        </div>

        {/* AAVE Protocol Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-3 pt-7 rounded-lg border border-primary/20 relative">
          <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-bl-md">
            Powered by AAVE
          </div>
          <h2 className="text-base font-semibold text-primary mb-2">
            💰 AAVE v3 on Sonic
          </h2>
          <ul className="space-y-2">
            <li>
              <p className="text-sm font-medium">Check AAVE Positions</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Show my AAVE positions&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">
                Get Lending & Borrowing Rates
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;What are my current AAVE rates?&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Check Health Factor</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;What is my AAVE health factor?&quot;
                </span>
              </p>
            </li>
          </ul>
        </div>

        {/* Silo Finance Section */}
        <div className="bg-gradient-to-r from-rose-500/10 to-rose-600/10 p-3 pt-7 rounded-lg border border-rose-500/20 relative">
          <div className="absolute top-0 right-0 bg-rose-500/20 text-rose-600/90 text-[10px] px-2 py-0.5 rounded-bl-md">
            NEW
          </div>
          <h2 className="text-base font-semibold text-rose-600/90 mb-2">
            🏦 Silo Finance on Sonic
          </h2>
          <ul className="space-y-2">
            <li>
              <p className="text-sm font-medium">View Silo Markets</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Show me Silo Finance markets&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Get Silo Stats</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;What's the TVL in Silo Finance?&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Search Specific Tokens</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Find SONIC markets in Silo Finance&quot;
                </span>
                <span className="ml-1.5 text-rose-600/80 text-[10px]">
                  Deposit & Withdraw Available Now! Borrow & Repay Coming Soon
                </span>
              </p>
            </li>
          </ul>
        </div>

        {/* Allora Oracle Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-3 pt-7 rounded-lg border border-primary/20 relative">
          <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-bl-md">
            Powered by Allora
          </div>
          <h2 className="text-base font-semibold text-primary mb-2">
            🔮 Price Predictions
          </h2>
          <ul className="space-y-2">
            <li>
              <p className="text-sm font-medium">View Topics</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Show me available Allora topics&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Get Price Inference</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Get price prediction for BTC&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Topic Inference</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Get inference for topic 18&quot;
                </span>
              </p>
            </li>
          </ul>
        </div>

        {/* Cross-Chain Bridge Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-3 pt-7 rounded-lg border border-primary/20 relative col-span-1 md:col-span-2">
          <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-bl-md">
            Powered by deBridge
          </div>
          <h2 className="text-base font-semibold text-primary mb-2">
            🌉 Cross-Chain Bridge
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            DeChat integrates with deBridge protocol to enable seamless
            cross-chain transfers between Sonic and other major blockchains.
          </p>
          <ul className="space-y-2">
            <li>
              <p className="text-sm font-medium">View Supported Chains</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;What chains can I bridge to?&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Get Bridge Quote</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Get a quote to bridge 10 USDC from Sonic to
                  Ethereum&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Execute Bridge Transfer</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Bridge 5 USDC from Sonic to Ethereum&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Verify Transaction Status</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Check the status of my bridge transaction
                  0xae10b8...&quot;
                </span>
              </p>
            </li>
          </ul>
        </div>

        {/* Transfers Section */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border">
          <h2 className="text-base font-semibold text-primary mb-2">
            💸 Transfers & Transactions
          </h2>
          <ul className="space-y-2">
            <li>
              <p className="text-sm font-medium">Transfer Tokens</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Send 1 SONIC to 0x742d35...&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Check Transaction Status</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Check status of transaction 0xae10b8...&quot;
                </span>
              </p>
            </li>
          </ul>
        </div>

        {/* Price Data Section */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border">
          <h2 className="text-base font-semibold text-primary mb-2">
            📈 Market & Price Data
          </h2>
          <ul className="space-y-2">
            <li>
              <p className="text-sm font-medium">Get Price Feeds</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Show available Chainlink price feeds&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Get Current Prices</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;What&apos;s the current BTC/USD price?&quot;
                </span>
              </p>
            </li>
          </ul>
        </div>

        {/* Sonic Docs */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border">
          <h2 className="text-base font-semibold text-primary mb-2">
            📚 Ask About Sonic
          </h2>
          <p className="text-xs text-muted-foreground">
            <span className="italic">
              &quot;What is Sonic blockchain?&quot;
            </span>
            {" or "}
            <span className="italic">&quot;How does staking work?&quot;</span>
          </p>
        </div>

        {/* Search & Information Section */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border col-span-1 md:col-span-2">
          <h2 className="text-base font-semibold text-primary mb-2">
            🔍 Search & Information
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li>
              <p className="text-sm font-medium">Search Tokens</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;Search for ETH tokens&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Check Sonic Points</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">&quot;Show my Sonic Points&quot;</span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Get Token Supply</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;What&apos;s the total supply of USDC?&quot;
                </span>
              </p>
            </li>
            <li>
              <p className="text-sm font-medium">Get Block Reward</p>
              <p className="text-xs text-muted-foreground">
                <span className="italic">
                  &quot;What was the reward for block 12345?&quot;
                </span>
              </p>
            </li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Type your question or command in the input box below to get started
      </p>
    </div>
  );
};

// Custom hook to warn user when leaving page during active operations
const usePageLeaveWarning = (shouldWarn: boolean) => {
  // Handle browser's native beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldWarn) {
        // Standard way to show a confirmation dialog before leaving
        const message =
          "You have an ongoing operation. Are you sure you want to leave?";
        e.preventDefault();
        e.returnValue = message; // Required for Chrome
        return message; // For older browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldWarn]);
};

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
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [hasActiveToolCall, setHasActiveToolCall] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Add a ref to track previous messages to avoid unnecessary saves
  const prevMessagesRef = useRef<string>("");
  // Add a ref to track if we've already handled the pending message
  const pendingMessageHandledRef = useRef(false);
  const [selectedModel, setSelectedModel] = useState<"openai" | "anthropic">(
    () => {
      // Initialize from localStorage if available, otherwise default to "openai"
      if (typeof window !== "undefined") {
        const savedModel = localStorageUtils.getSelectedModel();
        return (savedModel as "openai" | "anthropic") || "openai";
      }
      return "openai";
    }
  );

  usePageLeaveWarning(isWaitingForResponse || hasActiveToolCall);

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
    error,
  } = useChat({
    api: "/api/chat/message",
    id: chatId || undefined,
    credentials: "include",
    generateId: () => `msg_${nanoid()}`,
    sendExtraMessageFields: true,
    body: {
      threadId: chatId,
      model: selectedModel,
    },
    headers: {
      "Content-Type": "application/json",
      "x-cluster": useClusterStore.getState().selectedCluster,
    },
    initialMessages,
    onResponse: () => {
      setIsWaitingForResponse(false);
    },
    onError: () => {
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

  // Add an effect to save the selected model to localStorage when it changes
  useEffect(() => {
    localStorageUtils.saveSelectedModel(selectedModel);
  }, [selectedModel]);

  // Improved message saving logic - save messages when they change and not loading
  useEffect(() => {
    if (!isChatLoading && chatId && messages.length > 0) {
      const currentMessagesJson = JSON.stringify(messages);

      // Only save if messages have actually changed
      if (prevMessagesRef.current !== currentMessagesJson) {
        prevMessagesRef.current = currentMessagesJson;
        saveAllMessagesMutation({
          messages,
          threadId: chatId,
        }).catch(console.error);
      }
    }
  }, [chatId, isChatLoading, saveAllMessagesMutation, messages]);

  // Modify the effect to handle pending messages
  useEffect(() => {
    const handlePendingMessage = async () => {
      // Skip if we've already handled the pending message for this chatId
      if (pendingMessageHandledRef.current) return;

      const pendingMessage = localStorageUtils.getPendingMessage();
      if (pendingMessage && chatId) {
        try {
          // Mark as handled immediately to prevent duplicate handling
          pendingMessageHandledRef.current = true;

          // Clear the pending message first
          localStorageUtils.clearPendingMessage();
          // Set the input value
          handleInputChange({
            target: { value: pendingMessage },
          } as React.ChangeEvent<HTMLTextAreaElement>);
          // Submit the message
          setIsWaitingForResponse(true);
          const fakeEvent = {
            preventDefault: () => {},
          } as FormEvent<HTMLFormElement>;
          await handleSubmit(fakeEvent);
        } catch (error) {
          console.error("Error handling pending message:", error);
          setIsWaitingForResponse(false);
        }
      }
    };

    handlePendingMessage();
  }, [chatId, handleInputChange, handleSubmit]);

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
        setIsWaitingForResponse(true);
        const response = await createThreadMutation();
        router.push(`/chat?chatId=${response.threadId}`);
      } catch (error) {
        console.error("Error creating thread:", error);
        localStorageUtils.clearPendingMessage();
        setIsWaitingForResponse(false);
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

  // Add a helper function to handle stopping and cancelling tool calls
  const handleStop = () => {
    // Stop the chat generation first to ensure streaming stops immediately
    stop();
    setIsWaitingForResponse(false);

    // After stopping, mark any pending tools as cancelled
    messages.forEach((message) => {
      if (message.toolInvocations) {
        message.toolInvocations.forEach((tool) => {
          if (tool.state === "call" || tool.state === "partial-call") {
            addToolResult({
              toolCallId: tool.toolCallId,
              result: {
                status: "cancelled",
                message: "Operation cancelled by user",
              },
            });
          }
        });
      }
    });
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const fakeEvent = {
        preventDefault: () => {},
      } as FormEvent<HTMLFormElement>;
      handleFormSubmit(fakeEvent);
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
          className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 pt-12 sm:pt-8 md:pt-6"
        >
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <ActionGuide />
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLoading={
                    (isChatLoading || isWaitingForResponse) &&
                    messages.length > 0 &&
                    message.id === messages[messages.length - 1]?.id &&
                    message.role === "assistant"
                  }
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
            {error && (
              <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Error occurred</span>
                </div>
                <p className="text-sm text-destructive/90 mb-3">
                  {error.message}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReload}
                  disabled={isWaitingForResponse}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${isWaitingForResponse ? "animate-spin" : ""}`}
                  />
                  Retry
                </Button>
              </div>
            )}
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
                  overflow: "hidden",
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 items-center">
                <div className="mr-2">
                  <Select
                    value={selectedModel}
                    onValueChange={(value: "openai" | "anthropic") =>
                      setSelectedModel(value)
                    }
                  >
                    <SelectTrigger className="h-6 text-[10px] w-[80px] px-2">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">GPT-4o</SelectItem>
                      <SelectItem value="anthropic">
                        Claude 3.5 Sonnet
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isChatLoading && (
                  <Button
                    type="button"
                    onClick={handleStop}
                    className="p-1.5 h-8 w-8 bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
                    title="Stop generating"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <rect
                        x="6"
                        y="6"
                        width="12"
                        height="12"
                        rx="2"
                        fill="currentColor"
                      />
                    </svg>
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
                  {isWaitingForResponse || isChatLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendIcon />
                  )}
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
