import {
  Loader2,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThreadPreview } from "@/app/types";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WalletSetupButton } from "./WalletSetupButton";
import { WalletInfo } from "./WalletInfo";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  threads: ThreadPreview[];
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  isLoading: boolean;
  onDeleteClick: (thread: ThreadPreview) => void;
  onLogoutClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export default function Sidebar({
  threads,
  selectedThread,
  onSelectThread,
  onCreateThread,
  isLoading,
  onDeleteClick,
  onLogoutClick,
  isCollapsed = false,
  onToggleCollapse,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: SidebarProps) {
  const { user } = usePrivy();
  const [threadToDelete, setThreadToDelete] = useState<ThreadPreview | null>(
    null
  );
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const handleNewChatClick = () => {
    if (user?.wallet?.delegated) {
      onCreateThread();
    }
  };

  const handleDeleteClick = async (
    thread: ThreadPreview,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setThreadToDelete(thread);
  };

  const confirmDelete = async () => {
    if (!threadToDelete) return;

    setDeletingThreadId(threadToDelete.threadId);
    try {
      await onDeleteClick(threadToDelete);
    } finally {
      setDeletingThreadId(null);
      setThreadToDelete(null);
    }
  };

  const formatThreadName = (thread: ThreadPreview) => {
    if (thread.title) {
      return thread.title;
    }
    return "New Chat";
  };

  const canCreateNewChat = user?.wallet?.delegated;
  const needsWalletSetup = !user?.wallet || !user.wallet.delegated;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background">
      <div className={`p-3 ${isCollapsed ? "px-2" : ""}`}>
        <div
          className={`flex items-center gap-2 mb-3 ${isCollapsed ? "flex-col" : ""}`}
        >
          {onToggleCollapse && isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 hidden md:flex"
              onClick={onToggleCollapse}
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}
          {canCreateNewChat ? (
            <Button
              onClick={handleNewChatClick}
              disabled={isLoading}
              className={cn(
                "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-9",
                isCollapsed ? "w-8 md:w-full p-0" : "flex-1"
              )}
              variant="default"
              size={isCollapsed ? "icon" : "default"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquarePlus
                  className={cn("h-4 w-4", !isCollapsed && "mr-2")}
                />
              )}
              {(!isCollapsed || isMobileOpen) && (
                <span>{isLoading ? "Creating..." : "New Chat"}</span>
              )}
            </Button>
          ) : (
            <WalletSetupButton
              className={cn(
                "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-9",
                isCollapsed ? "w-8 md:w-full p-0" : "flex-1"
              )}
              variant="default"
              showIconOnly={isCollapsed && !isMobileOpen}
            />
          )}
          {onToggleCollapse && !isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat threads list */}
      {(!isCollapsed || isMobileOpen) && (
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {threads.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground">
              <p className="text-sm">No chats yet</p>
              <p className="text-xs mt-2">
                {canCreateNewChat
                  ? "Click 'New Chat' to start a conversation"
                  : needsWalletSetup && user?.wallet
                    ? "Activate your wallet to start chatting"
                    : "Create a EVM wallet to start chatting"}
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-1 px-3 pb-4">
                {threads.map((thread) => (
                  <li
                    key={thread.threadId}
                    onClick={() => {
                      onSelectThread(thread.threadId);
                      setIsMobileOpen(false);
                    }}
                    className={cn(
                      "flex items-center p-2 cursor-pointer rounded-md hover:bg-muted transition-all duration-200",
                      selectedThread === thread.threadId &&
                        "bg-muted border-border"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MessageSquarePlus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate text-foreground font-medium text-sm">
                        {formatThreadName(thread)}
                      </span>
                    </div>
                    <Button
                      onClick={(e) => handleDeleteClick(thread, e)}
                      variant="ghost"
                      size="icon"
                      disabled={deletingThreadId === thread.threadId}
                      className="text-destructive hover:text-destructive/90 hover:bg-muted flex-shrink-0 h-8 w-8"
                    >
                      {deletingThreadId === thread.threadId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <div className="px-3 pb-4">
                  <Button
                    variant="outline"
                    className="w-full h-9 text-sm"
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Wallet info at the bottom */}
      <div className="mt-auto border-t flex-shrink-0">
        <WalletInfo
          onLogoutClick={onLogoutClick}
          isCollapsed={isCollapsed && !isMobileOpen}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Delete confirmation dialog */}
      <Dialog
        open={threadToDelete !== null}
        onOpenChange={(open) => !open && setThreadToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setThreadToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingThreadId !== null}
            >
              {deletingThreadId ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-3 left-3 z-40 p-2 rounded-md bg-background border border-border"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-full bg-background border-r border-border flex-shrink-0 transition-all duration-200",
          isCollapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar - Overlay approach */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-30 transition-all duration-200",
          isMobileOpen
            ? "bg-background/80 backdrop-blur-sm"
            : "bg-transparent pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[280px] bg-background border-r border-border transition-transform duration-200 flex flex-col",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-14 flex-1 flex flex-col h-full">
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
}
