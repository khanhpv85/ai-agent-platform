from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, Union

class AIRequest(BaseModel):
    """Base request model for AI operations"""
    model: str = Field(
        default="gpt-3.5-turbo", 
        description="AI model to use for the operation",
        example="gpt-3.5-turbo"
    )

class AIResponse(BaseModel):
    """Base response model for AI operations"""
    success: bool = Field(description="Whether the operation was successful")
    data: Dict[str, Any] = Field(description="Response data from the AI operation")
    model_used: str = Field(description="The AI model that was used")
    tokens_used: int = Field(description="Number of tokens consumed")
    execution_time_ms: int = Field(description="Execution time in milliseconds")
    error_message: Optional[str] = Field(default=None, description="Error message if operation failed")

class SummarizeRequest(AIRequest):
    """Request model for text summarization"""
    text: str = Field(
        ..., 
        description="Text to summarize",
        example="Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of 'intelligent agents': any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals."
    )
    max_length: Optional[int] = Field(
        default=150, 
        description="Maximum length of summary in characters",
        example=150
    )

class ExtractRequest(AIRequest):
    """Request model for data extraction"""
    text: str = Field(..., description="Text to extract data from")
    schema: Dict[str, Any] = Field(..., description="Schema defining what to extract")

class ClassifyRequest(AIRequest):
    """Request model for text classification"""
    text: str = Field(..., description="Text to classify")
    categories: List[str] = Field(..., description="Categories to classify into")

class GenerateRequest(AIRequest):
    """Request model for content generation"""
    prompt: str = Field(..., description="Prompt for content generation")
    max_tokens: int = Field(default=1000, description="Maximum tokens to generate")

class ChatMessage(BaseModel):
    """Model for chat messages"""
    role: str = Field(..., description="Role of the message sender (user/assistant/system)")
    content: str = Field(..., description="Content of the message")

class ChatRequest(AIRequest):
    """Request model for chat completion"""
    messages: List[ChatMessage] = Field(..., description="Conversation history")
    temperature: float = Field(default=0.7, description="Temperature for response generation")

class ChatResponse(BaseModel):
    """Response model for chat completion"""
    success: bool
    message: str
    model_used: str
    tokens_used: int
    execution_time_ms: int
    error_message: Optional[str] = None
