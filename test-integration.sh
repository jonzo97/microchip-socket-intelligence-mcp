#!/bin/bash

echo "🧪 Testing Intelligent Chunking Integration"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found"
    exit 1
fi

echo "✅ Python3 found: $(python3 --version)"

# Check if sentence-transformers is installed (for local embeddings)
echo "🔍 Checking for sentence-transformers..."
if python3 -c "import sentence_transformers" 2>/dev/null; then
    echo "✅ sentence-transformers installed"
    LOCAL_EMBEDDINGS_AVAILABLE=true
else
    echo "⚠️  sentence-transformers not installed"
    echo "   Install with: pip install sentence-transformers"
    LOCAL_EMBEDDINGS_AVAILABLE=false
fi

# Check if Chroma server is running
echo "🔍 Checking for Chroma server..."
if curl -s http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
    echo "✅ Chroma server is running"
else
    echo "❌ Chroma server not running"
    echo "   Start with: docker run -p 8000:8000 chromadb/chroma"
    exit 1
fi

# Check if research files exist
echo "🔍 Checking for research files..."
FILES_COUNT=$(ls -1 intelligence-database/enhanced-context/*.md 2>/dev/null | wc -l)
if [ "$FILES_COUNT" -gt 0 ]; then
    echo "✅ Found $FILES_COUNT research files"
else
    echo "❌ No research files found"
    exit 1
fi

# Test embedding generation (if local embeddings available)
if [ "$LOCAL_EMBEDDINGS_AVAILABLE" = true ]; then
    echo ""
    echo "🧪 Testing local embedding generation..."
    TEST_RESULT=$(echo '["test sentence"]' | python3 mcp-server/src/embed.py --model all-mpnet-base-v2 2>&1)

    if echo "$TEST_RESULT" | grep -q "\["; then
        EMBEDDING_DIM=$(echo "$TEST_RESULT" | python3 -c "import sys, json; print(len(json.load(sys.stdin)[0]))")
        echo "✅ Embeddings working: $EMBEDDING_DIM dimensions"
    else
        echo "❌ Embedding test failed:"
        echo "$TEST_RESULT"
        exit 1
    fi
fi

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
cd mcp-server
if npm run build 2>&1 | grep -q "error"; then
    echo "❌ TypeScript build failed"
    exit 1
else
    echo "✅ TypeScript build successful"
fi
cd ..

# Test chunking
echo ""
echo "🧪 Testing intelligent chunker..."
if node test-chunking.js 2>&1 | grep -q "Created:"; then
    echo "✅ Chunking test passed"
else
    echo "❌ Chunking test failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ All integration tests passed!"
echo ""
echo "Next steps:"
echo "1. Update embedding-config.json with your preferences"
echo "2. Run: cd mcp-server && npm run setup-db-v2"
echo "3. Test search quality with real queries"
echo ""

if [ "$LOCAL_EMBEDDINGS_AVAILABLE" = false ]; then
    echo "💡 To use local embeddings (recommended):"
    echo "   pip install sentence-transformers"
    echo "   Then set 'useLocal: true' in embedding-config.json"
    echo ""
fi
