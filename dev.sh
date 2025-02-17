#!/bin/bash

# Exit on error
set -e

# Check if .env file exists
if [ ! -f "apps/server/.env" ]; then
    echo "❌ Missing apps/server/.env file"
    exit 1
fi

# Install dependencies and start dev server
echo "🏗️  Installing dependencies..."
pnpm install

echo "🚀 Starting server in dev mode..."
pnpm run dev
echo "✅ Backend running at http://localhost:5000"
echo "✅ Frontend running at http://localhost:3000"
