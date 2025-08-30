# Claude Desktop MCP Configuration Guide

## Prerequisites

- Claude Desktop installed (with MCP support)
- WSL2 with Ubuntu configured
- MCP server installed (via setup script)

## Step 1: Locate Claude Configuration

Claude Desktop stores its configuration in:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Alternate**: `~/.claude/claude_desktop_config.json` (in WSL)

## Step 2: MCP Server Configuration

### Automatic Configuration (Recommended)
```bash
# Run from the project directory
cd ~/projects/microchip-socket-intelligence-mcp
./scripts/configure-claude.sh
```

### Manual Configuration

1. Open Claude Desktop configuration:
```powershell
# In Windows PowerShell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

2. Add the MCP server configuration:
```json
{
  "mcpServers": {
    "microchip-socket-intelligence": {
      "command": "wsl",
      "args": [
        "-e",
        "bash",
        "-lc",
        "cd /home/YOUR_USERNAME/projects/microchip-socket-intelligence-mcp/mcp-server && node dist/server.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "DATABASE_PATH": "/home/YOUR_USERNAME/projects/microchip-socket-intelligence-mcp/intelligence-database"
      }
    }
  }
}
```

**Important**: Replace `YOUR_USERNAME` with your actual WSL username.

## Step 3: Verify WSL Path

```bash
# In WSL, get your username
echo $USER

# Get full path to project
cd ~/projects/microchip-socket-intelligence-mcp
pwd
# Should output: /home/YOUR_USERNAME/projects/microchip-socket-intelligence-mcp
```

## Step 4: Build MCP Server

```bash
# In WSL, navigate to project
cd ~/projects/microchip-socket-intelligence-mcp/mcp-server

# Install dependencies
npm install

# Build the server
npm run build

# Test the server
npm test
```

## Step 5: Restart Claude Desktop

1. Close Claude Desktop completely
2. Check Task Manager to ensure no Claude processes running
3. Restart Claude Desktop
4. Check for MCP indicator in the interface

## Step 6: Verify MCP Connection

In Claude Desktop, you should see:
- MCP server icon in the interface
- "microchip-socket-intelligence" in available tools

Test with:
```
Can you check if the MCP server is connected?
```

## Configuration Options

### Advanced Server Configuration
```json
{
  "mcpServers": {
    "microchip-socket-intelligence": {
      "command": "wsl",
      "args": [
        "-e",
        "bash",
        "-lc",
        "cd /home/YOUR_USERNAME/projects/microchip-socket-intelligence-mcp/mcp-server && node dist/server.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "DATABASE_PATH": "/home/YOUR_USERNAME/projects/microchip-socket-intelligence-mcp/intelligence-database",
        "LOG_LEVEL": "info",
        "MAX_CONCURRENT_REQUESTS": "5",
        "CACHE_ENABLED": "true",
        "CACHE_TTL": "3600"
      },
      "capabilities": {
        "tools": true,
        "resources": true,
        "prompts": true
      }
    }
  }
}
```

### Multiple MCP Servers
```json
{
  "mcpServers": {
    "microchip-socket-intelligence": {
      "command": "wsl",
      "args": ["..."]
    },
    "another-mcp-server": {
      "command": "node",
      "args": ["path/to/another/server.js"]
    }
  }
}
```

## Available MCP Commands

Once configured, these commands become available in Claude:

### Socket Research
```
@socket-research automotive
@socket-research "power management"
@socket-research --competitive "STM32"
```

### Block Diagram Generation
```
@block-diagram "automotive gateway with CAN and Ethernet"
@block-diagram --format drawio "industrial PLC system"
```

### Market Intelligence
```
@market-analysis "EV charging infrastructure"
@competitive-intel "Texas Instruments power management"
```

### Database Operations
```
@update-database --category automotive
@search-database "USB Type-C controllers"
@export-intelligence --format json
```

## Troubleshooting

### MCP Server Not Appearing

1. **Check Configuration Path**
```powershell
# Verify config file exists
dir "$env:APPDATA\Claude\claude_desktop_config.json"
```

2. **Validate JSON Syntax**
```bash
# In WSL
python3 -m json.tool < ~/.claude/claude_desktop_config.json
```

3. **Check Server Build**
```bash
# Verify server is built
ls -la ~/projects/microchip-socket-intelligence-mcp/mcp-server/dist/server.js
```

### Connection Errors

1. **WSL Not Running**
```powershell
# Start WSL
wsl --status
wsl
```

2. **Path Issues**
```bash
# Test the full command
wsl -e bash -lc "cd /home/YOUR_USERNAME/projects/microchip-socket-intelligence-mcp/mcp-server && node dist/server.js"
```

3. **Permission Issues**
```bash
# Fix permissions
chmod +x ~/projects/microchip-socket-intelligence-mcp/scripts/*.sh
chmod 755 ~/projects/microchip-socket-intelligence-mcp/mcp-server/dist/server.js
```

### Server Crashes

1. **Check Logs**
```bash
# View server logs
tail -f ~/projects/microchip-socket-intelligence-mcp/mcp-server/logs/server.log
```

2. **Memory Issues**
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
```

3. **Rebuild Server**
```bash
cd ~/projects/microchip-socket-intelligence-mcp/mcp-server
npm run clean
npm run build
```

## Performance Optimization

### Enable Caching
```json
{
  "env": {
    "CACHE_ENABLED": "true",
    "CACHE_TTL": "7200",
    "CACHE_MAX_SIZE": "100MB"
  }
}
```

### Adjust Concurrency
```json
{
  "env": {
    "MAX_CONCURRENT_REQUESTS": "10",
    "REQUEST_TIMEOUT": "30000"
  }
}
```

### Database Optimization
```bash
# Optimize database
cd ~/projects/microchip-socket-intelligence-mcp
node scripts/optimize-database.js
```

## Security Considerations

1. **Local Only**: MCP server runs locally, no external connections
2. **Read-Only**: Database operations are read-only by default
3. **Sandboxed**: Runs in WSL2 VM isolation
4. **No Credentials**: No API keys or credentials needed

## Updating the MCP Server

```bash
# Pull latest changes
cd ~/projects/microchip-socket-intelligence-mcp
git pull

# Rebuild server
cd mcp-server
npm install
npm run build

# Restart Claude Desktop
```

## Best Practices

1. **Regular Updates**: Pull repository updates weekly
2. **Database Maintenance**: Run optimization monthly
3. **Log Rotation**: Clear old logs periodically
4. **Backup Configuration**: Keep a backup of your config file

## Getting Help

### Diagnostic Commands
```bash
# Check server version
node ~/projects/microchip-socket-intelligence-mcp/mcp-server/dist/server.js --version

# Test database connection
node ~/projects/microchip-socket-intelligence-mcp/scripts/test-database.js

# Validate configuration
node ~/projects/microchip-socket-intelligence-mcp/scripts/validate-config.js
```

### Support Resources
- Check server logs in `mcp-server/logs/`
- Review [Troubleshooting Guide](TROUBLESHOOTING.md)
- Contact FAE Support Team

---

**Next Steps**: [Generate Intelligence Guide](INTELLIGENCE-GENERATION-GUIDE.md)