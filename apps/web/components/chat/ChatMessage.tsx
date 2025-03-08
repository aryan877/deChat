import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "@/app/types";
import { nanoid } from "nanoid";
import { User, XCircle, Copy, Check, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ToolInvocation } from "ai";
import {
  getToolComponent,
  preprocessToolResult,
  ValidToolName,
} from "../tools/registery";
import { isToolResult } from "@/app/types/tools";
import {
  SuccessResults,
  hasSuccessComponent,
  SuccessResultsMap,
} from "../tools/success/SuccessResults";

import { useState } from "react";
import { ToolNames } from "../ToolNames";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  addToolResult: (result: { toolCallId: string; result: unknown }) => void;
}

const isMessageReadyToRender = (message: Message): boolean => {
  const hasContent = Boolean(message.content?.trim());
  const toolInvocations = message.toolInvocations ?? [];

  if (!hasContent && !toolInvocations.length) {
    return false;
  }

  const hasValidTools = toolInvocations.some((tool) => {
    // Check for pending tool calls
    if (tool.state === "call") {
      return Boolean(getToolComponent(tool));
    }

    // Check for completed tool results
    if (tool.state === "result") {
      const toolResult = (tool as { result?: unknown }).result;
      if (!isToolResult(toolResult)) return false;

      const { status } = toolResult;
      return (
        status === "error" ||
        status === "cancelled" ||
        (status === "success" && hasSuccessComponent(tool.toolName))
      );
    }

    return false;
  });

  return hasContent || hasValidTools;
};

export default function ChatMessage({
  message,
  isLoading,
  addToolResult,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (message.content) {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const toolNames =
    message.toolInvocations?.map((tool) => tool.toolName).filter(Boolean) || [];

  if (!isMessageReadyToRender(message)) {
    return (
      <div className="w-full">
        {toolNames.length > 0 && (
          <div className="max-w-3xl mx-auto px-4">
            <ToolNames toolNames={toolNames} className="py-2" />
          </div>
        )}
      </div>
    );
  }

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    if (!toolInvocation) return null;

    const { state, toolCallId, toolName } = toolInvocation;
    const toolResult = (toolInvocation as { result?: unknown }).result;

    // Handle successful tool execution
    if (
      state === "result" &&
      isToolResult(toolResult) &&
      toolResult.status === "success"
    ) {
      if (hasSuccessComponent(toolName)) {
        return (
          <div key={toolCallId} className="mt-4">
            <SuccessResults
              toolName={toolName as keyof SuccessResultsMap}
              data={
                toolResult.data as SuccessResultsMap[keyof SuccessResultsMap]
              }
            />
          </div>
        );
      }
      return null;
    }

    // Handle error or cancelled states
    if (
      state === "result" &&
      isToolResult(toolResult) &&
      (toolResult.status === "error" || toolResult.status === "cancelled")
    ) {
      const isError = toolResult.status === "error";
      const errorMessage = toolResult.error?.message;

      return (
        <div key={toolCallId} className="flex items-start gap-3 py-0.5">
          <XCircle
            className={cn(
              "w-4 h-4 flex-shrink-0 mt-[2px]",
              isError ? "text-destructive" : "text-destructive/90"
            )}
          />
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-[0.9375rem] leading-normal m-0 break-words",
                isError ? "text-destructive" : "text-destructive/90"
              )}
            >
              {toolResult.message ||
                (isError ? "Operation failed" : "Operation cancelled")}
            </p>
            {isError && errorMessage && (
              <p className="text-[0.875rem] mt-1 text-destructive/80 leading-normal m-0 break-words">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Handle pending tool calls
    if (state === "call") {
      const ToolComponent = getToolComponent(toolInvocation);
      if (!ToolComponent) return null;

      try {
        return (
          <ToolComponent
            key={toolCallId}
            args={toolInvocation.args}
            onSubmit={(toolResult) => {
              const processedResult = preprocessToolResult(
                toolName as ValidToolName,
                toolResult
              );
              addToolResult({
                toolCallId,
                result: processedResult,
              });
            }}
          />
        );
      } catch (error) {
        console.error("Error rendering tool invocation:", error);
        return (
          <div
            key={toolCallId}
            className="text-destructive text-sm p-2 bg-destructive/10 rounded break-words"
          >
            Failed to render tool invocation:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="w-full">
      {toolNames.length > 0 && (
        <div className="max-w-3xl mx-auto px-4">
          <ToolNames toolNames={toolNames} className="py-2" />
        </div>
      )}
      <div className="max-w-3xl mx-auto py-3">
        <div
          className={cn(
            "flex w-full items-start p-4",
            message.role === "user" && "bg-muted dark:bg-muted rounded-md"
          )}
        >
          {/* Avatar */}
          <div className="flex-none mr-4 sticky top-0">
            {message.role === "assistant" ? (
              <Avatar className="w-8 h-8 ring-1 ring-primary/30 bg-primary/20 flex items-center justify-center transition-all duration-200 hover:ring-primary/40 hover:bg-primary/30">
                <span className="text-sm font-medium text-primary">De</span>
              </Avatar>
            ) : (
              <Avatar className="w-8 h-8 ring-1 ring-border bg-background flex items-center justify-center transition-all duration-200 hover:ring-border/80 hover:bg-muted/50">
                <User className="w-5 h-5 text-foreground/80" />
              </Avatar>
            )}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0 pt-[1px] overflow-hidden">
            {/* Show tool results first */}
            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="max-w-3xl mx-auto">
                {message.toolInvocations.map((toolInvocation) => {
                  const result = renderToolInvocation(toolInvocation);
                  // Only render the div with margin if there's actual content
                  return result ? (
                    <div key={toolInvocation.toolCallId} className="mb-6">
                      {result}
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {/* Message content */}
            {message.content?.trim() && (
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "flex-1 min-w-0 overflow-hidden",
                    isLoading && "opacity-60"
                  )}
                >
                  <div className="prose prose-sm max-w-none break-words text-foreground/90">
                    <ReactMarkdown
                      components={{
                        code({
                          className,
                          children,
                          inline,
                          ...props
                        }: React.ComponentPropsWithoutRef<"code"> & {
                          inline?: boolean;
                        }) {
                          const isInline = inline;
                          const match = /language-(\w+)/.exec(className || "");
                          return !isInline && match ? (
                            <div
                              key={nanoid()}
                              className="relative group/code mt-3 mb-3 first:mt-0 overflow-hidden"
                            >
                              <div className="absolute -top-4 left-0 right-0 h-6 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/30 rounded-t-lg flex items-center px-4">
                                <span className="text-xs font-medium text-foreground/70">
                                  {match?.[1]?.toUpperCase() || "CODE"}
                                </span>
                              </div>
                              <div className="!bg-muted/30 dark:!bg-muted/20 !rounded-lg !rounded-tl-none !pt-4 text-[14px]">
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  customStyle={{
                                    background: "transparent",
                                    padding: "1rem",
                                    margin: 0,
                                    fontSize: "14px",
                                    overflowX: "auto",
                                    wordBreak: "break-word",
                                    whiteSpace: "pre-wrap",
                                  }}
                                  wrapLines={true}
                                  wrapLongLines={true}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              </div>
                            </div>
                          ) : (
                            <code
                              {...props}
                              className={cn(
                                "px-1.5 py-0.5 rounded-md text-[14px] font-normal break-all align-middle",
                                message.role === "assistant"
                                  ? "bg-muted/40 dark:bg-muted/30"
                                  : "bg-primary/10"
                              )}
                            >
                              {children}
                            </code>
                          );
                        },
                        p({ children }) {
                          return (
                            <p
                              key={nanoid()}
                              className="text-[15px] leading-normal m-0 break-words"
                            >
                              {children}
                            </p>
                          );
                        },
                        h1({ children }) {
                          return (
                            <h1 className="text-2xl font-semibold mt-4 mb-2 first:mt-0 break-words">
                              {children}
                            </h1>
                          );
                        },
                        h2({ children }) {
                          return (
                            <h2 className="text-xl font-semibold mt-4 mb-2 first:mt-0 break-words">
                              {children}
                            </h2>
                          );
                        },
                        h3({ children }) {
                          return (
                            <h3 className="text-lg font-semibold mt-3 mb-2 first:mt-0 break-words">
                              {children}
                            </h3>
                          );
                        },
                        ul({ children }) {
                          return (
                            <ul
                              key={nanoid()}
                              className="mt-2 mb-2 space-y-1 text-[15px] list-disc pl-6 marker:text-muted-foreground break-words"
                            >
                              {children}
                            </ul>
                          );
                        },
                        ol({ children }) {
                          return (
                            <ol
                              key={nanoid()}
                              className="mt-2 mb-2 space-y-1 text-[15px] list-decimal pl-6 marker:text-muted-foreground break-words"
                            >
                              {children}
                            </ol>
                          );
                        },
                        li({ children }) {
                          return (
                            <li
                              key={nanoid()}
                              className="leading-normal break-words"
                            >
                              {children}
                            </li>
                          );
                        },
                        blockquote({ children }) {
                          return (
                            <blockquote
                              key={nanoid()}
                              className="mt-2 mb-2 pl-4 border-l-2 border-muted-foreground/30 text-muted-foreground break-words"
                            >
                              {children}
                            </blockquote>
                          );
                        },
                        hr() {
                          return (
                            <hr
                              key={nanoid()}
                              className="my-3 border-muted-foreground/20"
                            />
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <div className="flex-none">
                  <button
                    onClick={handleCopy}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && message.role === "assistant" && (
              <div className="flex items-center mt-2">
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  {message.role === "assistant"
                    ? "Processing..."
                    : "Thinking..."}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
