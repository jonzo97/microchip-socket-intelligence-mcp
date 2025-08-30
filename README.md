# Microchip Socket Intelligence MCP Server

> AI-powered competitive intelligence and block diagram generation for Microchip FAEs

## 🚀 Quick Start (5 minutes)

```bash
# Clone and setup
git clone git@github.com:jonzo97/microchip-socket-intelligence-mcp.git
cd microchip-socket-intelligence-mcp
./scripts/setup.sh

# That's it! The setup script handles everything
```

## 🎯 What This Does

This MCP (Model Context Protocol) server provides Microchip Field Application Engineers with:

- **Socket Intelligence Database**: Comprehensive competitive analysis across 40+ product categories
- **Block Diagram Generator**: Automatic draw.io XML generation from natural language
- **Business Intelligence**: Market analysis, competitive positioning, and opportunity discovery
- **Research Automation**: Generate new intelligence with customizable prompts

## 📋 Prerequisites

- Windows 11 with WSL2 Ubuntu
- Claude Desktop (with MCP support)
- Node.js 18+ (installer included in setup)
- 8GB RAM minimum
- 10GB free disk space

## 🛠️ Detailed Setup

### Step 1: WSL2 Configuration
```bash
# In Windows PowerShell (Admin)
wsl --install -d Ubuntu
wsl --set-default-version 2

# Configure WSL for optimal performance
```
[Full WSL Setup Guide →](docs/WSL-SETUP-GUIDE.md)

### Step 2: Clone Repository
```bash
# In WSL Ubuntu terminal
cd ~
git clone git@github.com:jonzo97/microchip-socket-intelligence-mcp.git
cd microchip-socket-intelligence-mcp
```

### Step 3: Run Automated Setup
```bash
# This script installs everything needed
./scripts/setup.sh
```

### Step 4: Configure Claude Desktop
The setup script automatically configures Claude Desktop. For manual configuration:
[Claude Desktop Setup Guide →](docs/CLAUDE-DESKTOP-SETUP.md)

## 💡 Using the Intelligence System

### Generate New Intelligence
```bash
# Run a specific research prompt
node scripts/generate-intelligence.js --category "automotive"

# Update the entire database
node scripts/update-database.js --full
```

### Available Commands in Claude Desktop

Once configured, you can use these commands in Claude:

- `@socket-research [category]` - Research competitive landscape
- `@block-diagram [description]` - Generate draw.io diagrams
- `@market-analysis [segment]` - Analyze market opportunities
- `@competitive-intel [competitor]` - Deep competitive analysis

[Complete Usage Guide →](docs/INTELLIGENCE-GENERATION-GUIDE.md)

## 📁 Project Structure

```
microchip-socket-intelligence-mcp/
├── mcp-server/              # MCP server implementation
│   ├── src/                 # TypeScript source files
│   ├── dist/                # Compiled JavaScript
│   └── package.json         # Dependencies
├── intelligence-database/   # Socket intelligence data
│   └── enhanced-context/    # Research outputs
├── prompts/                 # Research prompt templates
├── scripts/                 # Automation scripts
└── docs/                    # Documentation
```

## 🔧 Features

### Socket Intelligence
- 40+ product categories analyzed
- Competitive landscape mapping
- Win probability calculations
- Market share analysis
- Key competitor identification

### Block Diagram Generation
- Natural language to draw.io XML
- Microchip component integration
- System architecture visualization
- Automatic part number matching

### Business Intelligence
- TAM/SAM analysis
- Design win tracking
- Opportunity discovery
- Executive reporting

## 📚 Documentation

- [WSL Setup Guide](docs/WSL-SETUP-GUIDE.md)
- [Claude Desktop Configuration](docs/CLAUDE-DESKTOP-SETUP.md)
- [MCP Server Architecture](docs/MCP-SERVER-GUIDE.md)
- [Intelligence Generation](docs/INTELLIGENCE-GENERATION-GUIDE.md)
- [Database Updates](docs/DATABASE-UPDATE-GUIDE.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

## 🤝 Contributing

To add new intelligence categories or improve existing ones:

1. Create new prompt in `prompts/` directory
2. Run intelligence generation script
3. Review and enhance output
4. Update database
5. Submit pull request

See [Contributing Guide](docs/CONTRIBUTING.md) for details.

## 🐛 Troubleshooting

### Common Issues

**WSL2 not starting**: Ensure virtualization is enabled in BIOS

**Node.js version error**: Run `nvm use 18` in WSL

**Claude Desktop not connecting**: Check `~/.claude/config.json`

**Permission denied**: Run `chmod +x scripts/*.sh`

[Full Troubleshooting Guide →](docs/TROUBLESHOOTING.md)

## 📈 Performance Tips

- Allocate at least 4GB RAM to WSL2
- Use SSD for database storage
- Enable WSL2 systemd for better performance
- Keep database under 100MB for optimal speed

## 🔒 Security Notes

- All data is stored locally
- No external API calls for intelligence
- Credentials stay in WSL environment
- Database is read-only by default

## 📝 License

Proprietary - Microchip Technology Inc. Internal Use Only

## 💬 Support

For issues or questions:
- Check [Documentation](docs/)
- Review [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- Contact: FAE Support Team

---

**Built for Microchip FAEs** | **Powered by Claude MCP** | **Version 1.0.0**