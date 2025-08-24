import os
import chromadb
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Chroma configuration
# Use localhost for local development
# Default to "localhost" if not set
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = os.getenv("CHROMA_PORT", "8001")  # Default Chroma port is 8000

# Initialize embeddings with error handling


def get_embeddings():
    """Get OpenAI embeddings - automatically loads OPENAI_API_KEY from environment"""
    try:
        return OpenAIEmbeddings()
    except Exception as e:
        raise ValueError(
            "OPENAI_API_KEY not found. Please set it in your .env file or environment variables. "
            "You can get one from https://platform.openai.com/api-keys"
        )


# Initialize ChromaDB client lazily
_client = None


def get_client():
    """Get ChromaDB client with lazy initialization"""
    global _client
    if _client is None:
        try:
            _client = chromadb.HttpClient(
                host=CHROMA_HOST,
                port=CHROMA_PORT
            )
        except Exception as e:
            raise ConnectionError(
                f"Could not connect to ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}. "
                f"Make sure ChromaDB is running. Error: {str(e)}"
            )
    return _client

# Initialize LangChain Chroma vectorstore


def get_vectorstore(collection_name="documents"):
    """Get or create a Chroma vectorstore"""
    embeddings = get_embeddings()
    client = get_client()
    return Chroma(
        client=client,
        collection_name=collection_name,
        embedding_function=embeddings
    )
