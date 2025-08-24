# Ask Docs API

A FastAPI-based document Q&A system with vector search capabilities using ChromaDB and LangChain.

## Features

- 📤 **Document Upload**: Upload and process documents with automatic text splitting
- 🔍 **Vector Search**: Query documents using natural language with semantic search
- 📊 **Document Statistics**: Get information about stored documents
- 🏗️ **Clean Architecture**: Controller-Service pattern for maintainable code

## Project Structure

```
server/
├── config/
│   └── chroma.py          # ChromaDB configuration
├── controller/
│   └── document_controller.py  # API endpoints
├── service/
│   └── document_service.py     # Business logic
├── main.py                # FastAPI application
├── requirements.txt       # Python dependencies
├── test_apis.py          # API testing script
└── README.md             # This file
```

## Setup

### 1. Install Dependencies

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the server directory:

```env
# ChromaDB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8000

# OpenAI Configuration (required for embeddings)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start ChromaDB

#### Option A: Using Docker (Recommended)
```bash
docker run -p 8000:8000 chromadb/chroma:latest
```

#### Option B: Using Docker Compose
```bash
docker-compose up -d
```

### 4. Start the API Server

```bash
cd server
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

## API Endpoints

### 1. Upload Document
**POST** `/api/documents/upload`

Upload and process a document for vector search.

**Form Data:**
- `file` (required): The document file (text files only)
- `description` (optional): Description of the document
- `tags` (optional): Comma-separated tags

**Example:**
```bash
curl -X POST "http://localhost:8000/api/documents/upload" \
  -F "file=@document.txt" \
  -F "description=Sample document" \
  -F "tags=example,documentation"
```

**Response:**
```json
{
  "message": "Document uploaded and processed successfully",
  "data": {
    "success": true,
    "document_id": "uuid-here",
    "filename": "document.txt",
    "chunks_created": 5,
    "message": "Document 'document.txt' processed and stored successfully"
  }
}
```

### 2. Query Documents
**POST** `/api/documents/query`

Search documents using natural language queries.

**Form Data:**
- `query` (required): The search query
- `k` (optional): Number of results to return (default: 5, max: 20)

**Example:**
```bash
curl -X POST "http://localhost:8000/api/documents/query" \
  -F "query=What is machine learning?" \
  -F "k=3"
```

**Response:**
```json
{
  "message": "Query executed successfully",
  "data": {
    "success": true,
    "query": "What is machine learning?",
    "results": [
      {
        "rank": 1,
        "content": "Machine learning is a subset of artificial intelligence...",
        "metadata": {
          "filename": "document.txt",
          "source": "document.txt"
        },
        "score": 0.95
      }
    ],
    "total_results": 1
  }
}
```

### 3. Document Statistics
**GET** `/api/documents/stats`

Get statistics about stored documents.

**Example:**
```bash
curl "http://localhost:8000/api/documents/stats"
```

**Response:**
```json
{
  "message": "Statistics retrieved successfully",
  "data": {
    "success": true,
    "total_documents": 25,
    "collection_name": "documents"
  }
}
```

### 4. Health Check
**GET** `/api/documents/health`

Check if the document API is running.

**Example:**
```bash
curl "http://localhost:8000/api/documents/health"
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Document API is running"
}
```

## Testing

Run the test script to verify all endpoints:

```bash
cd server
source venv/bin/activate
python test_apis.py
```

## API Documentation

Once the server is running, you can access:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

## Configuration

### ChromaDB Settings

- **Local Development**: `CHROMA_HOST=localhost`
- **Docker**: `CHROMA_HOST=chroma` (when using docker-compose)

### Text Splitting

Documents are automatically split into chunks with:
- **Chunk Size**: 1000 characters
- **Chunk Overlap**: 200 characters

### Embeddings

The system uses OpenAI embeddings for vector search. Make sure to:
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Set it in your `.env` file as `OPENAI_API_KEY`

## Troubleshooting

### Common Issues

1. **ChromaDB Connection Error**
   - Make sure ChromaDB is running
   - Check the host and port configuration
   - For Docker, ensure the container is running

2. **OpenAI API Key Error**
   - Set the `OPENAI_API_KEY` environment variable
   - Make sure the API key is valid and has credits

3. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check that you're in the correct virtual environment

### Logs

Check the server logs for detailed error messages when issues occur.

## Development

### Adding New Features

1. **New Service**: Add business logic in `service/`
2. **New Controller**: Add API endpoints in `controller/`
3. **New Configuration**: Add settings in `config/`

### Code Structure

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data processing
- **Config**: Manage application configuration and external services

## License

This project is for educational purposes.
