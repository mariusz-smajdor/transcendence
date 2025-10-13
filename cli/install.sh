#!/bin/bash

# Tournament CLI Installation Script

echo "🏆 Installing Tournament CLI 🏆"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16.0.0 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 16.0.0 or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Make CLI executable
echo "🔧 Making CLI executable..."
chmod +x cli-tournament.js

if [ $? -eq 0 ]; then
    echo "✅ CLI script is now executable"
else
    echo "⚠️  Could not make script executable (this is OK on Windows)"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "To start the Tournament CLI:"
echo "  npm start"
echo ""
echo "Or:"
echo "  node cli-tournament.js"
echo ""
echo "Or:"
echo "  ./cli-tournament.js"
echo ""
echo "Make sure the Transcendence server is running on https://localhost:3000"
echo "Happy gaming! 🎮"

