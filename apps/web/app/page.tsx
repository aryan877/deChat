export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            DeChat
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl">
            Building the future of DeFAI on Sonic&apos;s high-performance
            blockchain. An autonomous decentralized chat agent that
            revolutionizes Web3 interactions through AI.
          </p>

          <div className="flex gap-4 mt-8">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Start Chatting
            </button>
            <button className="px-8 py-3 border border-gray-700 rounded-lg font-medium hover:border-purple-500 transition-colors">
              Learn More
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl">
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">Decentralized Chat</h3>
              <p className="text-gray-400">
                Fully decentralized messaging powered by Sonic&apos;s blockchain
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">AI-Enhanced</h3>
              <p className="text-gray-400">
                Advanced AI capabilities for smarter conversations and
                automation
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">Cross-Chain Ready</h3>
              <p className="text-gray-400">
                Seamless integration with Ethereum and other blockchains via
                Sonic Gateway
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">
              © 2024 DeChat. Built for Sonic DeFAI Hackathon
            </p>
            <div className="flex gap-6">
              <a
                href="https://docs.soniclabs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                Docs
              </a>
              <a
                href="https://github.com/blorm-network/ZerePy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://discord.gg/sonic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
