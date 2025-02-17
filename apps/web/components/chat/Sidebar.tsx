import {
  MessageSquarePlus,
  MessageSquare,
  Settings,
  Trash2,
} from "lucide-react";

interface SidebarProps {
  onNewChat: () => void;
  onChatSelect: (chatId: number) => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  onNewChat,
  onChatSelect,
  onOpenSettings,
}: SidebarProps) {
  return (
    <div className="w-80 bg-muted border-r border-border flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquarePlus className="h-5 w-5" />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          <h2 className="px-2 text-sm font-semibold text-muted-foreground mb-2">
            Recent Chats
          </h2>
          {/* Chat History Items */}
          {[1, 2, 3].map((chatId) => (
            <div key={chatId} className="group relative">
              <button
                onClick={() => onChatSelect(chatId)}
                className="w-full px-3 py-3 rounded-lg text-left hover:bg-secondary transition-colors flex items-center gap-3 text-foreground group-hover:pr-12"
              >
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                Chat Session {chatId}
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement delete functionality
                  console.log("Delete chat:", chatId);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              US
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">User Settings</p>
          </div>
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
