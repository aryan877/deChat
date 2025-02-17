"use client";
import Sidebar from "@/components/chat/Sidebar";

export default function ChatPage() {
  const handleNewChat = () => {
    // TODO: Implement new chat functionality
    console.log("New chat clicked");
  };

  const handleChatSelect = (chatId: number) => {
    // TODO: Implement chat selection
    console.log("Chat selected:", chatId);
  };

  const handleOpenSettings = () => {
    // TODO: Implement settings
    console.log("Settings clicked");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        onOpenSettings={handleOpenSettings}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Welcome Message */}
            <div className="text-center py-8">
              <h1 className="text-4xl font-bold gradient-text mb-4">
                Welcome to DeChat
              </h1>
              <p className="text-muted-foreground">
                Start a conversation with our decentralized AI assistant
              </p>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <textarea
                className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-foreground placeholder-muted-foreground"
                placeholder="Type your message..."
                rows={1}
              />
              <button className="absolute right-3 p-1.5 bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary-foreground"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M2.5 2.5l15 7.5-15 7.5M2.5 2.5l7.5 7.5M2.5 17.5l7.5-7.5"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
