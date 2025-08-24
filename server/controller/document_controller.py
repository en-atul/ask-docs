from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional
from service.document_service import DocumentService

router = APIRouter(prefix="/api/documents", tags=["documents"])


def get_document_service() -> DocumentService:
    return DocumentService()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    document_service: DocumentService = Depends(get_document_service)
):
    """
    Upload and process a document

    - **file**: The document file to upload
    - **description**: Optional description of the document
    - **tags**: Optional comma-separated tags
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        # Read file content
        content = await file.read()

        # Try to decode as text (for text files)
        try:
            file_content = content.decode('utf-8')
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="File must be a text file (PDF, DOCX, etc. not supported yet)"
            )

        # Prepare metadata
        metadata = {
            "description": description,
            "file_size": len(content),
            "content_type": file.content_type
        }

        if tags:
            metadata["tags"] = [tag.strip() for tag in tags.split(",")]

        # Process and store document
        result = await document_service.process_and_store_document(
            file_content=file_content,
            filename=file.filename,
            metadata=metadata
        )

        if result["success"]:
            return JSONResponse(
                status_code=201,
                content={
                    "message": "Document uploaded and processed successfully",
                    "data": result
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result["message"])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/query")
async def query_documents(
    query: str = Form(...),
    k: Optional[int] = Form(5),
    document_id: Optional[str] = Form(None),
    document_service: DocumentService = Depends(get_document_service)
):
    """
    Query documents using natural language with smart search

    - **query**: The question or query to search for
    - **k**: Number of results to return (default: 5)
    - **document_id**: Optional document ID to search within specific document first
    """
    try:
        if not query.strip():
            raise HTTPException(
                status_code=400, detail="Query cannot be empty")

        # Ensure k has a valid value
        k_value = k if k is not None else 5

        if k_value < 1 or k_value > 20:
            raise HTTPException(
                status_code=400, detail="k must be between 1 and 20")

        # Search documents with smart search (document-specific first, then global)
        result = await document_service.search_documents(
            query=query,
            k=k_value,
            document_id=document_id
        )

        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Query executed successfully",
                    "data": result
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result["message"])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/stats")
async def get_document_stats(
    document_service: DocumentService = Depends(get_document_service)
):
    """
    Get statistics about stored documents
    """
    try:
        result = await document_service.get_document_stats()

        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Statistics retrieved successfully",
                    "data": result
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result["message"])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "message": "Document API is running"
        }
    )
