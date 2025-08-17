from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import os
import time
import uuid
from typing import Dict, Any, List, Optional

from .models import (
    AIRequest, 
    AIResponse, 
    SummarizeRequest, 
    ExtractRequest, 
    ClassifyRequest,
    GenerateRequest,
    ChatRequest,
    ChatResponse
)
from .services.ai_service import AIService
from .services.cache_service import CacheService
from .services.logging_service import LoggingService
from .config import settings

app = FastAPI(
    title="AI Agent Platform - AI Service",
    description="""
    # AI Agent Platform - AI Service
    
    Centralized AI reasoning engine for the AI Agent Platform. This service provides a unified interface for AI operations including text summarization, data extraction, classification, content generation, and chat completion.
    
    ## Features
    
    - **Multi-Provider Support**: Works with OpenAI, Google Gemini, and Anthropic Claude
    - **Caching**: Intelligent caching to reduce API costs and improve response times
    - **Logging**: Comprehensive request logging and monitoring
    - **Error Handling**: Robust error handling with detailed error messages
    
    ## Authentication
    
    This service is designed for internal use by other platform services. Authentication is handled at the API gateway level.
    
    ## Rate Limiting
    
    Requests are automatically rate-limited to prevent abuse and manage costs.
    
    ## Models Supported
    
    - **OpenAI**: GPT-4, GPT-3.5 Turbo
    - **Google**: Gemini Pro
    - **Anthropic**: Claude 3
    
    ## Usage Examples
    
    ### Text Summarization
    ```bash
    curl -X POST "http://localhost/api/ai/summarize" \\
         -H "Content-Type: application/json" \\
         -d '{"text": "Your text here", "model": "gpt-3.5-turbo"}'
    ```
    
    ### Data Extraction
    ```bash
    curl -X POST "http://localhost/api/ai/extract" \\
         -H "Content-Type: application/json" \\
         -d '{"text": "Your text", "schema": {"name": "string"}, "model": "gpt-3.5-turbo"}'
    ```
    """,
    version="1.0.0",
    contact={
        "name": "AI Agent Platform Team",
        "email": "support@aiagentplatform.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    servers=[
        {"url": "/api/ai", "description": "API Gateway Route"},
        {"url": "http://localhost:8000", "description": "Direct Service Access"}
    ]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Services
ai_service = AIService()
cache_service = CacheService()
logging_service = LoggingService()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await cache_service.connect()
    await logging_service.connect()

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await cache_service.disconnect()
    await logging_service.disconnect()

@app.get("/health", 
    summary="Health Check",
    description="Check the health status of the AI service",
    response_description="Service health status",
    tags=["Health"]
)
async def health_check():
    """
    Health check endpoint for the AI service.
    
    Returns:
        dict: Service health status including service name and status
    """
    return {
        "status": "healthy", 
        "service": "ai-service",
        "timestamp": time.time(),
        "version": "1.0.0"
    }

@app.post("/summarize", 
    response_model=AIResponse,
    summary="Summarize Text",
    description="Summarize text using AI models. Supports multiple AI providers and includes intelligent caching.",
    response_description="AI-generated text summary",
    tags=["AI Operations"]
)
async def summarize_text(request: SummarizeRequest):
    """
    Summarize text using AI models.
    
    This endpoint uses AI to create concise summaries of provided text. The service supports
    multiple AI providers and includes intelligent caching to reduce costs and improve performance.
    
    Args:
        request (SummarizeRequest): The text to summarize and model configuration
        
    Returns:
        AIResponse: Summary with metadata including tokens used and execution time
        
    Raises:
        HTTPException: If the AI service encounters an error
    """
    start_time = time.time()
    
    try:
        # Check cache first
        cache_key = f"summarize:{hash(request.text)}"
        cached_result = await cache_service.get(cache_key)
        if cached_result:
            return AIResponse(
                success=True,
                data={"summary": cached_result},
                model_used="cached",
                tokens_used=0,
                execution_time_ms=int((time.time() - start_time) * 1000)
            )
        
        # Process with AI
        summary = await ai_service.summarize_text(request.text, request.model)
        
        # Cache result
        await cache_service.set(cache_key, summary, expire=3600)
        
        # Log request
        await logging_service.log_request(
            service_name="ai",
            request_type="summarize",
            request_data={"text_length": len(request.text)},
            response_data={"summary_length": len(summary)},
            model_used=request.model,
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="success"
        )
        
        return AIResponse(
            success=True,
            data={"summary": summary},
            model_used=request.model,
            tokens_used=ai_service.get_last_token_count(),
            execution_time_ms=int((time.time() - start_time) * 1000)
        )
        
    except Exception as e:
        await logging_service.log_request(
            service_name="ai",
            request_type="summarize",
            request_data={"text_length": len(request.text)},
            error_message=str(e),
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="error"
        )
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract", response_model=AIResponse)
async def extract_data(request: ExtractRequest):
    """Extract structured data from text"""
    start_time = time.time()
    
    try:
        extracted_data = await ai_service.extract_data(
            request.text, 
            request.schema, 
            request.model
        )
        
        await logging_service.log_request(
            service_name="ai",
            request_type="extract",
            request_data={"text_length": len(request.text)},
            response_data={"extracted_fields": len(extracted_data)},
            model_used=request.model,
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="success"
        )
        
        return AIResponse(
            success=True,
            data={"extracted_data": extracted_data},
            model_used=request.model,
            tokens_used=ai_service.get_last_token_count(),
            execution_time_ms=int((time.time() - start_time) * 1000)
        )
        
    except Exception as e:
        await logging_service.log_request(
            service_name="ai",
            request_type="extract",
            request_data={"text_length": len(request.text)},
            error_message=str(e),
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="error"
        )
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify", response_model=AIResponse)
async def classify_text(request: ClassifyRequest):
    """Classify text into categories"""
    start_time = time.time()
    
    try:
        classification = await ai_service.classify_text(
            request.text,
            request.categories,
            request.model
        )
        
        await logging_service.log_request(
            service_name="ai",
            request_type="classify",
            request_data={"text_length": len(request.text)},
            response_data={"classification": classification},
            model_used=request.model,
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="success"
        )
        
        return AIResponse(
            success=True,
            data={"classification": classification},
            model_used=request.model,
            tokens_used=ai_service.get_last_token_count(),
            execution_time_ms=int((time.time() - start_time) * 1000)
        )
        
    except Exception as e:
        await logging_service.log_request(
            service_name="ai",
            request_type="classify",
            request_data={"text_length": len(request.text)},
            error_message=str(e),
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="error"
        )
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate", response_model=AIResponse)
async def generate_content(request: GenerateRequest):
    """Generate content based on prompt"""
    start_time = time.time()
    
    try:
        generated_content = await ai_service.generate_content(
            request.prompt,
            request.max_tokens,
            request.model
        )
        
        await logging_service.log_request(
            service_name="ai",
            request_type="generate",
            request_data={"prompt_length": len(request.prompt)},
            response_data={"content_length": len(generated_content)},
            model_used=request.model,
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="success"
        )
        
        return AIResponse(
            success=True,
            data={"generated_content": generated_content},
            model_used=request.model,
            tokens_used=ai_service.get_last_token_count(),
            execution_time_ms=int((time.time() - start_time) * 1000)
        )
        
    except Exception as e:
        await logging_service.log_request(
            service_name="ai",
            request_type="generate",
            request_data={"prompt_length": len(request.prompt)},
            error_message=str(e),
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="error"
        )
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    """Chat completion with conversation history"""
    start_time = time.time()
    
    try:
        response = await ai_service.chat_completion(
            request.messages,
            request.model,
            request.temperature
        )
        
        await logging_service.log_request(
            service_name="ai",
            request_type="chat",
            request_data={"messages_count": len(request.messages)},
            response_data={"response_length": len(response)},
            model_used=request.model,
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="success"
        )
        
        return ChatResponse(
            success=True,
            message=response,
            model_used=request.model,
            tokens_used=ai_service.get_last_token_count(),
            execution_time_ms=int((time.time() - start_time) * 1000)
        )
        
    except Exception as e:
        await logging_service.log_request(
            service_name="ai",
            request_type="chat",
            request_data={"messages_count": len(request.messages)},
            error_message=str(e),
            execution_time_ms=int((time.time() - start_time) * 1000),
            status="error"
        )
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def list_available_models():
    """List available AI models"""
    return {
        "models": [
            {"id": "gpt-4", "name": "GPT-4", "provider": "openai"},
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "openai"},
            {"id": "gemini-pro", "name": "Gemini Pro", "provider": "google"},
            {"id": "claude-3", "name": "Claude 3", "provider": "anthropic"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
