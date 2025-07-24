#!/usr/bin/env python3

import uvicorn
import chromadb
import os

def start_chromadb_server():
    """Start ChromaDB server on localhost:8000"""
    print("🚀 Starting ChromaDB server on http://localhost:8000")
    
    try:
        # Import the ChromaDB server components
        import chromadb
        from chromadb.server.fastapi import FastAPI
        from chromadb.config import Settings
        
        # Create settings for persistent storage
        settings = Settings(
            is_persistent=True,
            persist_directory="./chromadb_data"
        )
        
        # Create the FastAPI app
        app = FastAPI(settings=settings)
        
        print("✅ ChromaDB server configured successfully")
        print("📊 Server will be available at: http://localhost:8000")
        print("💾 Data will be persisted to: ./chromadb_data")
        print("🔄 Starting server...")
        
        # Start the server
        uvicorn.run(
            app,
            host="localhost",
            port=8000,
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Failed to import ChromaDB server components: {e}")
        print("🔧 Trying basic ChromaDB setup...")
        
        # Try creating a simple client for testing
        try:
            client = chromadb.Client()
            print("✅ ChromaDB client created successfully")
            print("⚠️  Note: This is a memory-only client, not a server")
            print("📝 Please install a newer version of ChromaDB for server functionality")
        except Exception as e2:
            print(f"❌ Even basic ChromaDB setup failed: {e2}")
            
    except Exception as e:
        print(f"❌ Failed to start ChromaDB server: {e}")
        print("📝 Please check ChromaDB installation and version")

if __name__ == "__main__":
    start_chromadb_server()
