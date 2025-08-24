from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from controller.document_controller import router as document_router

app = FastAPI(
    title="Ask Docs API",
    version="1.0.0",
    description="A document Q&A system with vector search capabilities"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(document_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Ask Docs API",
        "version": "1.0.0",
        "endpoints": {
            "upload_document": "/api/documents/upload",
            "query_documents": "/api/documents/query",
            "query_documents_stream": "/api/documents/query/stream",
            "document_stats": "/api/documents/stats",
            "health_check": "/api/documents/health",
            "api_docs": "/docs"
        },
        "features": {
            "file_support": ["PDF", "TXT"],
            "smart_search": "Document-specific search with global fallback",
            # TODO: It requires enhancement
            "streaming": "Real-time query responses with Server-Sent Events",
            "contextual_compression": "Automatic result sanitization and deduplication",
            "openai_formatting": "Human-readable answer formatting"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Ask Docs API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
