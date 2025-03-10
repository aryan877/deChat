"use client";

import {
  MessageSquarePlus,
  Bot,
  Blocks,
  ExternalLink,
  Github,
  MessageCircle,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const { authenticated, login } = usePrivy();
  const router = useRouter();

  const handleStartChatting = () => {
    if (!authenticated) {
      login();
    } else {
      router.push("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex items-center gap-2">
            <Image
              src="/sonic-logo.png"
              alt="Sonic Logo"
              width={60}
              height={60}
              className="object-contain"
            />
            <span className="text-primary font-bold text-4xl">×</span>
            <h1 className="text-7xl font-bold gradient-text">DeChat</h1>
          </div>
          <div className="flex items-center justify-center">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Powered by Sonic Blockchain
            </span>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl">
            The native AI assistant for Sonic blockchain. Interact with DeFi
            protocols, manage assets, and bridge tokens across chains with
            simple conversational commands.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleStartChatting}
              className="px-8 py-3 gradient-bg rounded-md font-medium hover:opacity-90 transition-opacity text-primary-foreground flex items-center gap-2"
            >
              <MessageSquarePlus className="h-5 w-5" />
              {authenticated ? "Start Chatting" : "Login to Chat"}
            </button>
            <button className="px-8 py-3 border border-muted hover:border-primary/50 rounded-lg font-medium transition-colors flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Learn More
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl">
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group">
              <div className="flex justify-center">
                <div className="mb-4 p-2.5 rounded-lg bg-primary/10 text-primary w-fit group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                Sonic Native Assistant
              </h3>
              <p className="text-muted-foreground">
                Purpose-built AI assistant for Sonic blockchain with deep
                protocol integration
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group">
              <div className="flex justify-center">
                <div className="mb-4 p-2.5 rounded-lg bg-primary/10 text-primary w-fit group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                DeFi Automation
              </h3>
              <p className="text-muted-foreground">
                Stake, swap, transfer, and manage assets with simple
                conversational commands
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group">
              <div className="flex justify-center">
                <div className="mb-4 p-2.5 rounded-lg bg-primary/10 text-primary w-fit group-hover:bg-primary/20 transition-colors">
                  <Blocks className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                Cross-Chain with deBridge
              </h3>
              <p className="text-muted-foreground">
                Seamlessly bridge assets between Sonic and other blockchains
                using deBridge protocol
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/sonic-logo.png"
                alt="Sonic Logo"
                width={24}
                height={24}
                className="object-contain"
              />
              <span className="text-primary font-medium">×</span>
              <span className="text-primary font-medium">DeChat</span>
              <p className="text-muted-foreground text-sm ml-1">
                © 2024 | Built on Sonic Blockchain
              </p>
            </div>
            <div className="flex gap-6 justify-center">
              <a
                href="https://github.com/blorm-network/ZerePy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a
                href="https://github.com/aryan877/deChat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Github className="h-4 w-4" />
                DeChat Repo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
