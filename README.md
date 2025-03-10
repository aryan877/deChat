# DeChat - AI Assistant for Sonic Blockchain

DeChat is a native AI assistant for the Sonic blockchain that allows users to interact with DeFi protocols, manage assets, and bridge tokens across chains using simple conversational commands.

**Live Site**: [dechat.cc](https://dechat.cc)

## Features

- **Sonic Native Assistant**: Purpose-built AI assistant for Sonic blockchain
- **DeFi Automation**: Stake, swap, transfer, and manage assets with simple commands
- **Wallet Integration**: Secure wallet connection via Privy
- **AI-Powered Chat**: Natural language interface for blockchain interactions

## Architecture

DeChat is built as a full-stack application with separate frontend and backend components:

### Frontend (`apps/web`)

- Next.js application with React for the user interface
- Privy integration for wallet connection and authentication

### Backend (`apps/server`)

- Node.js/Express server handling API requests
- MongoDB database for storing user data and chat threads
- Integration with OpenAI for natural language processing

## DeAgent Package

The core of DeChat's blockchain interaction is powered by the custom `de-agent` package:

### Structure

- **Agent**: Core DeAgent class that handles blockchain interactions and transaction signing
- **Actions**: Predefined blockchain operations (40+ actions) including:
  - Sonic token transfers and balance checks
  - Staking and unstaking operations
  - Cross-chain bridging via deBridge
  - Price data via Chainlink integration
  - Token swaps and trading
- **Tools**: AI-compatible tools that wrap actions for natural language processing
- **Constants**: Token definitions and configuration defaults

The DeAgent connects to the Sonic blockchain via RPC and uses Privy for secure transaction signing, enabling the AI assistant to perform blockchain operations on behalf of users through conversational commands.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm
- MongoDB instance
- OpenAI API key
- Privy account and credentials

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/aryan877/deChat.git
   cd deChat
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env` in both `apps/web` and `apps/server` directories
   - Fill in the required values (API keys, database URIs, etc.)

4. Run the development server:
   ```
   pnpm dev
   ```
