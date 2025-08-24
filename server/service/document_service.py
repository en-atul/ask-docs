import os
from typing import List, Dict, Any, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain_openai import ChatOpenAI
from config.chroma import get_vectorstore
import uuid


class DocumentService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.vectorstore = get_vectorstore("documents")

        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.1
        )

        # Initialize contextual compression retriever (for handling duplicate results)
        self.compressor = LLMChainExtractor.from_llm(self.llm)
        self.compression_retriever = ContextualCompressionRetriever(
            base_retriever=self.vectorstore.as_retriever(),
            base_compressor=self.compressor
        )

    async def process_and_store_document(self, file_content: str, filename: str, metadata: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Process document content, split into chunks, and store in vector database
        """
        try:
            # Create document object
            doc = Document(
                page_content=file_content,
                metadata={
                    "filename": filename,
                    "source": filename,
                    "document_id": str(uuid.uuid4()),
                    **(metadata or {})
                }
            )

            # Split document into chunks
            chunks = self.text_splitter.split_documents([doc])

            texts = [chunk.page_content for chunk in chunks]
            metadatas = [chunk.metadata for chunk in chunks]

            ids = self.vectorstore.add_texts(
                texts=texts,
                metadatas=metadatas
            )

            return {
                "success": True,
                "document_id": doc.metadata["document_id"],
                "filename": filename,
                "chunks_created": len(chunks),
                "message": f"Document '{filename}' processed and stored successfully"
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to process document '{filename}'"
            }

    def search_specific_document(self, query: str, document_id: str, k: int = 5) -> List[Document]:
        """
        Search within a specific document using document_id
        """
        try:
            # Create a filter for the specific document
            filter_dict = {"document_id": document_id}

            # Search with filter
            results = self.vectorstore.similarity_search(
                query,
                k=k,
                filter=filter_dict
            )

            return results
        except Exception as e:
            print(f"Error searching specific document: {e}")
            return []

    def search_all_documents(self, query: str, k: int = 5) -> List[Document]:
        """
        Search across all documents
        """
        try:
            results = self.vectorstore.similarity_search(query, k=k)
            return results
        except Exception as e:
            print(f"Error searching all documents: {e}")
            return []

    def sanitize_results(self, documents: List[Document], query: str) -> List[Document]:
        """
        Use contextual compression to remove duplicates and compress results
        """
        try:
            # Use contextual compression retriever
            compressed_docs = self.compression_retriever.get_relevant_documents(
                query)
            return compressed_docs
        except Exception as e:
            print(f"Error in contextual compression: {e}")
            # Fallback to original documents
            return documents

    async def format_with_openai(self, query: str, documents: List[Document]) -> str:
        """
        Use OpenAI to format the answer in a human-readable way
        """
        try:
            # Prepare context from documents
            context = "\n\n".join([doc.page_content for doc in documents])

            # Create prompt for OpenAI
            prompt = f"""
            Based on the following context, provide a clear and comprehensive answer to the question.
            
            Question: {query}
            
            Context:
            {context}
            
            Please provide a well-structured answer that directly addresses the question using the information from the context.
            """

            # Get response from OpenAI
            response = await self.llm.ainvoke(prompt)

            # Handle different response content types
            if isinstance(response.content, str):
                return response.content
            elif isinstance(response.content, list):
                # If it's a list, join the content
                return " ".join([str(item) for item in response.content])
            else:
                # Fallback: convert to string
                return str(response.content)

        except Exception as e:
            print(f"Error formatting with OpenAI: {e}")
            # Fallback to simple concatenation
            return "\n\n".join([doc.page_content for doc in documents])

    async def search_documents(self, query: str, k: int = 5, document_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Smart search: document-specific first, then global fallback with sanitization and formatting
        """
        try:
            results = []
            search_type = "global"

            # 1. Search specific document first (if document_id provided)
            if document_id:
                doc_results = self.search_specific_document(
                    query, document_id, k)
                if doc_results:
                    results = doc_results
                    search_type = "document_specific"

            # 2. If no results from specific document, search globally
            if not results:
                global_results = self.search_all_documents(query, k)
                results = global_results
                search_type = "global"

            if not results:
                return {
                    "success": True,
                    "query": query,
                    "answer": "No relevant information found in the documents.",
                    "search_type": search_type,
                    "total_results": 0
                }

            # 3. Sanitize results using contextual compression
            sanitized_results = self.sanitize_results(results, query)

            # 4. Format answer using OpenAI
            formatted_answer = await self.format_with_openai(query, sanitized_results)

            return {
                "success": True,
                "query": query,
                "answer": formatted_answer,
                "search_type": search_type,
                "total_results": len(sanitized_results),
                "sources": list(set([doc.metadata.get("filename", "Unknown") for doc in sanitized_results]))
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to search documents"
            }

    async def get_document_stats(self) -> Dict[str, Any]:
        """
        Get statistics about stored documents
        """
        try:
            # Get document count using the underlying ChromaDB client
            from config.chroma import get_client

            client = get_client()
            collection = client.get_collection(name="documents")
            count = collection.count()

            return {
                "success": True,
                "total_documents": count,
                "collection_name": "documents"
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to get document statistics"
            }
