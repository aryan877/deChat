import Link from "next/link";
import {
  MessageSquarePlus,
  Bot,
  Blocks,
  ExternalLink,
  Github,
  MessageCircle,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-7xl font-bold gradient-text">DeChat</h1>

          <p className="text-xl text-muted-foreground max-w-2xl">
            Building the future of DeFAI on Sonic&apos;s high-performance
            blockchain. An autonomous decentralized chat agent that
            revolutionizes Web3 interactions through AI.
          </p>

          <div className="flex gap-4 mt-8">
            <Link
              href="/chat"
              className="px-8 py-3 gradient-bg rounded-md font-medium hover:opacity-90 transition-opacity text-primary-foreground flex items-center gap-2"
            >
              <MessageSquarePlus className="h-5 w-5" />
              Start Chatting
            </Link>
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
                Decentralized Chat
              </h3>
              <p className="text-muted-foreground">
                Fully decentralized messaging powered by Sonic&apos;s blockchain
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group">
              <div className="flex justify-center">
                <div className="mb-4 p-2.5 rounded-lg bg-primary/10 text-primary w-fit group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                AI-Enhanced
              </h3>
              <p className="text-muted-foreground">
                Advanced AI capabilities for smarter conversations and
                automation
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group">
              <div className="flex justify-center">
                <div className="mb-4 p-2.5 rounded-lg bg-primary/10 text-primary w-fit group-hover:bg-primary/20 transition-colors">
                  <Blocks className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                Cross-Chain Ready
              </h3>
              <p className="text-muted-foreground">
                Seamless integration with Ethereum and other blockchains via
                Sonic Gateway
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 DeChat. Built for Sonic DeFAI Hackathon
            </p>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
