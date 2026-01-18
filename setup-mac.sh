#!/bin/bash
set -e

echo "🚀 AffilAI Mac Setup"
echo "===================="

# Install Homebrew
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add to PATH
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo "✅ Homebrew already installed"
fi

# Install Rust
if ! command -v rustc &> /dev/null; then
    echo "🦀 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust already installed"
fi

# Install Node.js
if ! command -v node &> /dev/null; then
    echo "📗 Installing Node.js..."
    brew install node
else
    echo "✅ Node.js already installed"
fi

# Install project dependencies
echo "📥 Installing npm dependencies..."
cd /Users/ryan/affilai
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the app:"
echo "  cd /Users/ryan/affilai"
echo "  npm run tauri dev"
