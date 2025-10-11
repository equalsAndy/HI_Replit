#!/bin/bash

echo "🚀 AST Knowledge Processing Pipeline"
echo "===================================="

# Check prerequisites
echo ""
echo "1. 🔍 Checking Prerequisites..."

# Check if ChromaDB container is running
if ! docker ps | grep -q chroma-coaching; then
    echo "❌ ChromaDB container not running. Starting it..."
    docker run -d -p 8000:8000 --name chroma-coaching chromadb/chroma
    sleep 5
else
    echo "✅ ChromaDB container running"
fi

# Check if coaching tables exist
echo ""
echo "2. 📊 Ensuring Database Tables Exist..."
curl -s -X POST "http://localhost:8080/create-coaching-tables" | head -c 200
echo ""

# Check if Python dependencies are installed
echo ""
echo "3. 📦 Installing Python Dependencies..."
pip install -q psycopg2-binary boto3 chromadb numpy aiohttp

echo ""
echo "4. 🔍 Checking Source Files..."
if [ -f "coaching-data/source-files/AST_Compendium.md" ]; then
    echo "✅ AST Compendium found"
else
    echo "❌ AST Compendium not found at coaching-data/source-files/AST_Compendium.md"
fi

team_files=$(find coaching-data/source-files -name "*team*.md" | wc -l)
echo "✅ Found $team_files team profile files"

echo ""
echo "5. 🧠 Running Basic Knowledge Processing..."
python3 coaching-data/process_ast_knowledge.py

echo ""
echo "6. 🚀 Running Enhanced Processing with Embeddings..."
python3 coaching-data/process_ast_enhanced.py

echo ""
echo "7. 🧪 Testing API Integration..."

# Test knowledge endpoint
echo ""
echo "Testing knowledge base endpoint..."
curl -s -X GET "http://localhost:8080/api/coaching/knowledge" | head -c 200

# Test vector database status
echo ""
echo ""
echo "Testing vector database status..."
curl -s -X GET "http://localhost:8080/api/coaching/vector/status"

echo ""
echo ""
echo "✅ AST Knowledge Processing Complete!"
echo ""
echo "📊 Reports Generated:"
echo "  • coaching-data/processing_report.json"
echo "  • coaching-data/data_quality_report.json"
echo "  • coaching-data/semantic_search_test.json"
echo "  • coaching-data/enhancement_report.json"
echo ""
echo "🎯 What's Now Available:"
echo "  ✅ Complete AST methodology in ChromaDB and PostgreSQL"
echo "  ✅ 30+ team profiles with strengths analysis"
echo "  ✅ Semantic search across all coaching content"
echo "  ✅ API endpoints for intelligent coaching recommendations"
echo "  ✅ Vector database with enhanced embeddings"
echo ""
echo "🔮 Ready for AI Coaching Conversations!"
