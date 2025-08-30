# Chroma Vector Database Setup Guide

## 🎉 Migration Complete: Pinecone → Chroma DB

Your MCP server has been successfully migrated from Pinecone ($50+/month) to Chroma DB (FREE)!

## Setup Instructions

### 1. Start Chroma Server
Choose one of these options:

**Option A: Docker (Recommended)**
```bash
docker run -p 8000:8000 chromadb/chroma
```

**Option B: Python pip**
```bash
pip install chromadb
chroma run --host localhost --port 8000
```

### 2. Set Environment Variable
```bash
export OPENAI_API_KEY="your-openai-api-key"
# Note: PINECONE_API_KEY is no longer needed!
```

### 3. Populate Vector Database
```bash
cd /home/jorgill/prompt_dev/mcp-server
npm run setup-db
```

### 4. Start MCP Server
```bash
npm run start
# or for development:
npm run dev
```

## What Changed

### ✅ **Removed:**
- `@pinecone-database/pinecone` dependency
- `PINECONE_API_KEY` environment variable requirement
- Monthly $50+ costs

### ✅ **Added:**
- `chromadb` dependency (free)
- `ChromaResearchProcessor` class
- Local vector database (runs on your hardware)
- Automatic connection testing

### ✅ **Same Functionality:**
- Vector search across 87 socket intelligence research files
- Semantic similarity search
- Metadata filtering
- MCP server integration

## Benefits

- **$0/month cost** vs $50+/month for Pinecone
- **Faster local queries** (no network latency)
- **Complete data privacy** (everything stays local)
- **No rate limits** or quotas
- **Full control** over indexing and search

## Testing

The system will automatically test the Chroma connection and inform you if the server is not running:

```
✅ Chroma vector database initialized successfully
```

or

```
⚠️ Chroma server not available - vector search disabled
💡 Start Chroma server with: docker run -p 8000:8000 chromadb/chroma
```

## Next Steps

1. Start Chroma server: `docker run -p 8000:8000 chromadb/chroma`
2. Run database setup: `npm run setup-db`
3. Your socket intelligence system is ready!

The MCP server will now provide the same powerful vector search capabilities without any ongoing costs.