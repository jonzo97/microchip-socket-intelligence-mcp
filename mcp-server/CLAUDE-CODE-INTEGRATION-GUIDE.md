# 🚀 Socket Intelligence MCP Server - Claude Code Integration Guide

This comprehensive guide walks you through setting up and using the Socket Intelligence MCP Server with Claude Code for advanced socket qualification, competitive analysis, and block diagram generation.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [MCP Server Setup](#mcp-server-setup)  
3. [Claude Code Configuration](#claude-code-configuration)
4. [Testing the Integration](#testing-the-integration)
5. [Using the 5 Core Tools](#using-the-5-core-tools)
6. [Block Diagram Generation](#block-diagram-generation)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Features](#advanced-features)

## 📦 Prerequisites

**System Requirements:**
- Node.js 18+ installed
- Claude Code app (latest version)
- Operating system: macOS, Windows, or Linux

**Optional (for enhanced vector search):**
- Pinecone API key
- OpenAI API key

## 🛠 MCP Server Setup

### Step 1: Verify Installation

```bash
# Navigate to the MCP server directory
cd /home/jorgill/prompt_dev/mcp-server

# Verify the server builds and runs
npm run build
node dist/server.js
```

✅ **Expected Output:** `Socket Intelligence MCP Server running on stdio`

### Step 2: Test Server Functionality (Optional)

```bash
# Run the test suite to validate all components
node test-server.js
```

This validates:
- Research database processing (87 files)
- Socket qualification engine
- Competitive analysis engine  
- Vector search capabilities
- Block diagram generation

## ⚙️ Claude Code Configuration

### Step 1: Locate Claude Code Configuration

The MCP configuration file location varies by OS:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%/Claude/claude_desktop_config.json` 
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

### Step 2: Add Socket Intelligence MCP Server

Edit your `claude_desktop_config.json` file and add the Socket Intelligence server:

```json
{
  "mcpServers": {
    "socket-intelligence": {
      "command": "node",
      "args": ["/home/jorgill/prompt_dev/mcp-server/dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**🔧 Configuration Notes:**
- Replace the path with your actual MCP server location
- Ensure the path uses forward slashes even on Windows
- The server runs on stdio (no port needed)

### Step 3: Optional Environment Variables

For enhanced functionality, add API keys:

```json
{
  "mcpServers": {
    "socket-intelligence": {
      "command": "node", 
      "args": ["/home/jorgill/prompt_dev/mcp-server/dist/server.js"],
      "env": {
        "NODE_ENV": "production",
        "PINECONE_API_KEY": "your-pinecone-api-key",
        "OPENAI_API_KEY": "your-openai-api-key",
        "PINECONE_INDEX_NAME": "socket-intelligence"
      }
    }
  }
}
```

### Step 4: Restart Claude Code

1. **Completely quit** Claude Code application
2. **Wait 5 seconds** for full shutdown
3. **Restart** Claude Code
4. **Look for the 🔌 icon** in the interface indicating MCP connection

## 🧪 Testing the Integration

### Step 1: Verify MCP Server Connection

In Claude Code, start a new conversation and type:

```
Can you list the available MCP tools?
```

✅ **Expected Response:** You should see 5 tools listed:
- `qualify_socket`
- `search_intelligence` 
- `generate_block_diagram`
- `analyze_displacement`
- `find_similar_sockets`

### Step 2: Quick Functionality Test

Test each tool with simple queries:

```
Please qualify a socket for an automotive gateway application requiring CAN-FD and Ethernet connectivity.
```

✅ **Expected:** Detailed socket qualification with MCHP recommendations and win probability

## 🛠 Using the 5 Core Tools

### 1. 🎯 `qualify_socket` - Socket Requirements Matching

**Purpose:** Match customer requirements to optimal Microchip socket solutions with win probability scoring.

**Example Usage:**
```
Please qualify a socket with these requirements:
- Socket Type: MCU
- Application: Industrial automation controller
- Requirements: ARM Cortex-M7, 2MB Flash, CAN-FD, Ethernet, USB
- Volume: High volume production
- Competition: STM32H7 series
```

**Response Includes:**
- Qualification score (0-100%)
- Recommended MCHP part with specifications
- Competitive analysis and win probability
- Strategic recommendations
- Gap analysis

### 2. 🔍 `search_intelligence` - Research Archive Search

**Purpose:** Semantic search across 87 processed research files for competitive intelligence and market analysis.

**Example Usage:**
```
Search for intelligence on TSN networking opportunities and win probability against TI and Broadcom.
```

**Response Includes:**
- Relevant research excerpts
- Market data and analysis  
- Competitive positioning
- Win/loss factors
- Technical specifications

### 3. 📊 `generate_block_diagram` - Intelligent System Architecture

**Purpose:** Generate comprehensive block diagrams with intelligent layout and proper component sizing.

**Example Usage:**
```
Generate a block diagram for an automotive telematics gateway in draw.io format with high performance requirements.
```

**Output Formats:**
- **draw.io XML** (recommended) - Import directly into draw.io
- **SVG** - Vector graphics for presentations
- **Mermaid** - Text-based diagrams
- **JSON** - Structured data for custom processing

**Features:**
- Intelligent component placement (no overlapping)
- Hierarchical organization (system → primary → secondary → connectors)
- Proper connector routing with signal labeling
- MCHP-optimized component selection
- Application-specific system recommendations

### 4. 🏢 `analyze_displacement` - Competitive Displacement Strategy

**Purpose:** Analyze opportunities to displace competitor solutions with strategic recommendations.

**Example Usage:**
```
Analyze displacement opportunity for STM32F4 in a current customer design. Customer satisfaction is medium with pain points around development complexity and cost.
```

**Response Includes:**
- Displacement difficulty assessment
- Win probability calculation
- Key advantages to leverage
- Addressing customer pain points
- Strategic displacement approach
- Timeline considerations

### 5. 🔗 `find_similar_sockets` - Pattern Recognition

**Purpose:** Find similar socket requirements and solutions for pattern-based recommendations.

**Example Usage:**
```
Find sockets similar to automotive body control applications with CAN connectivity and find patterns in successful designs.
```

**Response Includes:**
- Similar socket applications
- Similarity scoring
- Pattern analysis
- Success factors
- Design recommendations

## 📈 Block Diagram Generation Deep Dive

The enhanced block diagram generator addresses common issues with overlapping components and poor layouts.

### Key Improvements:

**1. Intelligent Layout Engine**
- Hierarchical arrangement prevents overlapping
- Automatic spacing calculations based on component count
- Grid-based positioning with proper margins

**2. Component Intelligence**
- Application-specific component selection
- Market segment-aware power architecture
- Automatic peripheral inference from requirements

**3. Draw.io Optimization**
- Native XML format support
- Proper cell IDs and geometry
- Compatible styles and shapes
- Direct import capability

### Example Block Diagram Request:

```
Generate a comprehensive block diagram for:
- Application: "Automotive BMS Controller"
- Market Segment: "Automotive" 
- Requirements: High performance, medical-grade certifications
- Output Format: "drawio"
```

**Generated Diagram Includes:**
- Primary Microchip MCU (SAME70Q21B) 
- Power management subsystem
- CAN-FD transceiver (MCP2562FD)
- Crypto authentication (ATECC608B)
- External memory interfaces
- System-level network connections
- Proper signal routing and labeling

### Using Draw.io Output:

1. **Copy the XML response** from Claude Code
2. **Open draw.io** (app.diagrams.net)
3. **File → Import From → Text**
4. **Paste the XML** and click Import
5. **Your diagram loads** with proper layout and connections

## 🔧 Troubleshooting

### Common Issues:

**1. MCP Server Not Connecting**
```
Error: No MCP tools available
```
**Solutions:**
- Verify the server path in configuration is correct
- Check that the server builds successfully: `npm run build`
- Ensure Claude Code was fully restarted after config changes
- Check console logs: run `node dist/server.js` manually

**2. Server Crashes on Startup**
```
Error: Module not found
```
**Solutions:**
- Run `npm install` to install dependencies
- Verify Node.js version: `node --version` (should be 18+)
- Check file permissions on the server directory

**3. Draw.io XML Import Issues**
```
Error: Invalid XML format
```
**Solutions:**
- Ensure you copied the complete XML response
- Check for special characters that might be corrupted
- Try the JSON format as fallback: `"output_format": "json"`

**4. Empty or Incomplete Responses**
```
No socket recommendations returned
```
**Solutions:**
- Verify research database exists: check `intelligence-database/` folder
- Ensure server has read permissions on research files
- Try with simpler requirements first

### Getting Help:

**Check Server Status:**
```bash
node dist/server.js
# Should output: Socket Intelligence MCP Server running on stdio
```

**Validate Research Database:**
```bash
node analyze-and-tag.js
# Should show analysis of 87 research files
```

**Test Tools Individually:**
```bash
node test-server.js
# Comprehensive validation of all functionality
```

## 🚀 Advanced Features

### Vector Search Enhancement

When API keys are configured, the server provides:
- Semantic search across research archive
- Advanced similarity matching  
- Contextual result ranking
- Cross-document intelligence correlation

### Competitive Intelligence Database

The server processes:
- **87 research files** with metadata extraction
- **7 major competitors** (TI, STM, NXP, Infineon, ADI, Intel, Broadcom)
- **Market segments:** Automotive, Industrial, Medical, Consumer, Infrastructure
- **Socket categories:** MCU, Analog, Power, Interface, RF, Memory, Clock

### Research File Enhancement

Enhanced files include:
- **Structured metadata** with confidence scoring
- **Competitive intelligence** extraction
- **Technical tags** for semantic search
- **Key insights** identification
- **Win/loss factors** analysis

## 📝 Example Workflows

### Workflow 1: Complete Socket Qualification

```
1. "Qualify a socket for automotive ADAS sensor hub requiring ARM Cortex-M7, 2MB Flash, CAN-FD, and competing against NXP S32K3"

2. "Search for intelligence on ADAS applications and NXP competitive positioning"  

3. "Generate a block diagram for the ADAS sensor hub in draw.io format"

4. "Analyze displacement strategy for the NXP S32K3 with medium customer satisfaction"
```

### Workflow 2: Market Analysis

```
1. "Search for TSN networking market opportunities and growth projections"

2. "Find similar sockets to TSN automotive applications"

3. "Analyze competitive displacement opportunities in TSN market against Broadcom and Intel"
```

### Workflow 3: System Design

```
1. "Generate a comprehensive industrial PLC controller block diagram with EtherCAT connectivity"

2. "Qualify the recommended MCU against Siemens and Beckhoff solutions" 

3. "Search for industrial automation competitive intelligence and market positioning"
```

## 🎯 Best Practices

**1. Specific Requirements**
- Provide detailed application context
- Include competitive landscape information
- Specify market segment and volume requirements

**2. Iterative Refinement** 
- Start with broad socket qualification
- Refine with specific technical requirements
- Use intelligence search for deep market analysis

**3. Block Diagram Optimization**
- Use draw.io format for best layout results
- Specify performance tier and certifications
- Include special features in requirements

**4. Competitive Analysis**
- Research customer pain points first
- Identify switching barriers and advantages
- Use displacement analysis for strategic approach

---

## 🎉 Success Metrics

With proper integration, you should achieve:

✅ **87 research files** searchable and analyzed  
✅ **5 MCP tools** functioning in Claude Code  
✅ **Draw.io block diagrams** with proper layout  
✅ **Competitive intelligence** for 7 major vendors  
✅ **Socket qualification** with win probability scoring  
✅ **Zero overlapping components** in diagrams  
✅ **Hierarchical system organization** for readability  

**The Socket Intelligence MCP Server transforms Claude Code into a comprehensive semiconductor sales engineering platform!** 🚀

---

*For additional support or feature requests, refer to the codebase documentation or submit an issue.*