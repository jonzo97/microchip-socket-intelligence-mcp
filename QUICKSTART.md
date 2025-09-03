# 🚀 Quick Start Guide - Microchip FAE AI System

## Prerequisites
- Node.js 18+ installed
- Docker installed (optional, for ChromaDB)
- OpenAI API key

## Quick Launch (Background Mode)
See [LAUNCH-GUIDE.md](LAUNCH-GUIDE.md) for one-command background launch scripts.

```bash
# After initial setup, daily launch is just:
~/launch-socket-intel.sh
```

## 1. ChromaDB Vector Database

### Option A: Docker (Recommended - Fastest)
```bash
docker run -p 8000:8000 chromadb/chroma
# Or for background: docker run -d -p 8000:8000 chromadb/chroma
```

### Option B: Python (If Docker not available)
```bash
pip install chromadb
chroma run --host localhost --port 8000
```

## 2. MCP Server Setup

### First Time Setup
```bash
cd mcp-server
npm install
export OPENAI_API_KEY="your-key-here"
npm run setup-db  # Populates vector database
```

### Start Server
```bash
npm run dev  # Development mode with auto-reload
# OR
npm run start  # Production mode
```

## 3. Verify Everything is Running

You should see:
```
✅ Chroma vector database initialized successfully
🚀 MCP Server running on port 3000
```

## Common Issues

### Docker Error: "Unable to find image 'localhost:latest'"
- You're mixing Docker and Python syntax
- Use: `docker run -p 8000:8000 chromadb/chroma`
- NOT: `docker run -p 8000:8000 localhost --port 8000`

### ChromaDB Connection Failed
- Ensure ChromaDB is running on port 8000
- Check: `curl http://localhost:8000/api/v1/heartbeat`
- Should return: `{"nanosecond heartbeat":...}`

### Database Not Populated
- Run: `npm run setup-db` from mcp-server directory
- This loads all 87 socket intelligence files into vectors

## Key Commands Reference

| Task | Command |
|------|---------|
| Start ChromaDB (Docker) | `docker run -p 8000:8000 chromadb/chroma` |
| Start ChromaDB (Python) | `chroma run --host localhost --port 8000` |
| Setup Database | `npm run setup-db` |
| Start MCP Server | `npm run dev` |
| Build TypeScript | `npm run build` |
| Run Tests | `npm test` |

## Environment Variables

Create `.env` file in mcp-server:
```bash
OPENAI_API_KEY=your-openai-api-key
# No Pinecone key needed anymore! 🎉
```

## Quick Test

After starting both ChromaDB and MCP server:
```bash
curl http://localhost:3000/health
```

Should return server status with vector database info.