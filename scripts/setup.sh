#!/bin/bash

# Microchip Socket Intelligence MCP Server - Complete Setup Script
# This script sets up everything needed to run the Socket Intelligence system

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REQUIRED_NODE_VERSION="18"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MCP_SERVER_DIR="$PROJECT_DIR/mcp-server"
CLAUDE_CONFIG_DIR="$HOME/.claude"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Header
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Microchip Socket Intelligence MCP Server Setup          ║"
echo "║                    Version 1.0.0                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if running in WSL
print_status "Checking environment..."
if grep -q Microsoft /proc/version; then
    print_success "WSL environment detected"
else
    print_warning "Not running in WSL - some features may not work correctly"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check and install Node.js
print_status "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge "$REQUIRED_NODE_VERSION" ]; then
        print_success "Node.js v$(node -v) is installed"
    else
        print_warning "Node.js version is too old. Installing Node.js v${REQUIRED_NODE_VERSION}..."
        curl -fsSL https://deb.nodesource.com/setup_${REQUIRED_NODE_VERSION}.x | sudo -E bash -
        sudo apt-get install -y nodejs
        print_success "Node.js v${REQUIRED_NODE_VERSION} installed"
    fi
else
    print_warning "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_${REQUIRED_NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed"
fi

# Check npm
print_status "Checking npm..."
if command -v npm &> /dev/null; then
    print_success "npm $(npm -v) is installed"
else
    print_error "npm not found. Please install npm manually."
    exit 1
fi

# Install system dependencies
print_status "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y git build-essential python3 python3-pip curl wget

# Navigate to MCP server directory
cd "$MCP_SERVER_DIR"

# Install Node dependencies
print_status "Installing MCP server dependencies..."
npm install
print_success "Dependencies installed"

# Build the MCP server
print_status "Building MCP server..."
npm run build
if [ $? -eq 0 ]; then
    print_success "MCP server built successfully"
else
    print_error "Failed to build MCP server"
    exit 1
fi

# Test the server build
print_status "Testing server build..."
if [ -f "dist/server.js" ]; then
    print_success "Server build verified"
else
    print_error "Server build not found at dist/server.js"
    exit 1
fi

# Setup database
print_status "Setting up intelligence database..."
if [ -f "../intelligence-database/socket-intelligence-database.json" ]; then
    print_success "Intelligence database found"
else
    print_warning "Intelligence database not found, creating template..."
    mkdir -p ../intelligence-database
    echo '{"version":"1.0.0","categories":[],"updated":"'$(date -Iseconds)'"}' > ../intelligence-database/socket-intelligence-database.json
    print_success "Template database created"
fi

# Configure Claude Desktop
print_status "Configuring Claude Desktop..."
mkdir -p "$CLAUDE_CONFIG_DIR"

# Get WSL username for config
WSL_USERNAME=$(whoami)
WSL_PROJECT_PATH="/home/$WSL_USERNAME/projects/microchip-socket-intelligence-mcp"

# Create Claude config
cat > "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" << EOF
{
  "mcpServers": {
    "microchip-socket-intelligence": {
      "command": "wsl",
      "args": [
        "-e",
        "bash",
        "-lc",
        "cd $WSL_PROJECT_PATH/mcp-server && node dist/server.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "DATABASE_PATH": "$WSL_PROJECT_PATH/intelligence-database"
      }
    }
  }
}
EOF

print_success "Claude Desktop configuration created"

# Create Windows config location notice
if [ -d "/mnt/c/Users" ]; then
    WINDOWS_USER=$(ls /mnt/c/Users | grep -v -E "Public|Default|All Users|desktop.ini" | head -1)
    if [ ! -z "$WINDOWS_USER" ]; then
        print_status "Creating Windows configuration..."
        WINDOWS_CONFIG_PATH="/mnt/c/Users/$WINDOWS_USER/AppData/Roaming/Claude"
        
        if [ ! -d "$WINDOWS_CONFIG_PATH" ]; then
            print_warning "Claude Desktop config directory not found at $WINDOWS_CONFIG_PATH"
            print_warning "Please ensure Claude Desktop is installed"
        else
            cp "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" "$WINDOWS_CONFIG_PATH/"
            print_success "Windows Claude configuration updated"
        fi
    fi
fi

# Make scripts executable
print_status "Setting script permissions..."
chmod +x "$PROJECT_DIR"/scripts/*.sh
chmod +x "$PROJECT_DIR"/scripts/*.js 2>/dev/null || true
print_success "Script permissions set"

# Create quick access commands
print_status "Creating quick access commands..."
cat > "$HOME/.mchp_socket_intel" << 'EOF'
# Microchip Socket Intelligence shortcuts
alias mcp-intel='cd ~/projects/microchip-socket-intelligence-mcp'
alias mcp-generate='node ~/projects/microchip-socket-intelligence-mcp/scripts/generate-intelligence.js'
alias mcp-update='node ~/projects/microchip-socket-intelligence-mcp/scripts/update-database.js'
alias mcp-server='cd ~/projects/microchip-socket-intelligence-mcp/mcp-server && npm run dev'

# Function to test MCP server
test-mcp() {
    cd ~/projects/microchip-socket-intelligence-mcp/mcp-server
    node dist/server.js --test
}
EOF

# Add to bashrc if not already there
if ! grep -q "mchp_socket_intel" "$HOME/.bashrc"; then
    echo "source $HOME/.mchp_socket_intel" >> "$HOME/.bashrc"
    print_success "Quick access commands added to .bashrc"
fi

# Test database access
print_status "Testing database access..."
cd "$PROJECT_DIR"
node -e "
const fs = require('fs');
const dbPath = './intelligence-database/socket-intelligence-database.json';
try {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log('Database test: OK - Version:', data.version || '1.0.0');
    process.exit(0);
} catch(e) {
    console.error('Database test failed:', e.message);
    process.exit(1);
}
" && print_success "Database access verified" || print_warning "Database access test failed"

# Final summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
print_success "MCP Server is ready to use!"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop"
echo "2. Look for 'microchip-socket-intelligence' in MCP tools"
echo "3. Test with: @socket-research automotive"
echo ""
echo "Quick commands (after reloading shell):"
echo "  mcp-intel     - Go to project directory"
echo "  mcp-generate  - Generate new intelligence"
echo "  mcp-update    - Update database"
echo "  test-mcp      - Test MCP server"
echo ""
echo "For more information, see docs/CLAUDE-DESKTOP-SETUP.md"
echo ""

# Reload shell notice
print_warning "Run 'source ~/.bashrc' to enable shortcuts in current session"

exit 0