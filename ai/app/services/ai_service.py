import os
import json
import asyncio
from typing import Dict, Any, List, Optional
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI, ChatAnthropic
from langchain.schema import HumanMessage, SystemMessage
import openai
import google.generativeai as genai
from anthropic import Anthropic
from ..config import settings

class AIService:
    def __init__(self):
        self.last_token_count = 0
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize AI client connections"""
        # OpenAI
        if settings.openai_api_key:
            openai.api_key = settings.openai_api_key
            self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)
        
        # Google Generative AI
        if settings.google_api_key:
            genai.configure(api_key=settings.google_api_key)
            self.google_client = genai.GenerativeModel('gemini-pro')
        
        # Anthropic
        if settings.anthropic_api_key:
            self.anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
    
    def _get_client_for_model(self, model: str):
        """Get the appropriate client for the specified model"""
        if model.startswith('gpt-'):
            if not hasattr(self, 'openai_client'):
                raise ValueError("OpenAI API key not configured")
            return 'openai'
        elif model.startswith('gemini-'):
            if not hasattr(self, 'google_client'):
                raise ValueError("Google API key not configured")
            return 'google'
        elif model.startswith('claude-'):
            if not hasattr(self, 'anthropic_client'):
                raise ValueError("Anthropic API key not configured")
            return 'anthropic'
        else:
            raise ValueError(f"Unsupported model: {model}")
    
    async def summarize_text(self, text: str, model: str = "gpt-3.5-turbo") -> str:
        """Summarize text using AI"""
        prompt = f"Please provide a concise summary of the following text:\n\n{text}"
        
        if model.startswith('gpt-'):
            response = await self._openai_completion(prompt, model)
        elif model.startswith('gemini-'):
            response = await self._google_completion(prompt, model)
        elif model.startswith('claude-'):
            response = await self._anthropic_completion(prompt, model)
        else:
            raise ValueError(f"Unsupported model: {model}")
        
        return response
    
    async def extract_data(self, text: str, schema: Dict[str, Any], model: str = "gpt-3.5-turbo") -> Dict[str, Any]:
        """Extract structured data from text"""
        schema_str = json.dumps(schema, indent=2)
        prompt = f"""
        Extract the following data from the text below and return it as JSON:
        
        Schema: {schema_str}
        
        Text: {text}
        
        Return only the JSON object, no additional text.
        """
        
        if model.startswith('gpt-'):
            response = await self._openai_completion(prompt, model)
        elif model.startswith('gemini-'):
            response = await self._google_completion(prompt, model)
        elif model.startswith('claude-'):
            response = await self._anthropic_completion(prompt, model)
        else:
            raise ValueError(f"Unsupported model: {model}")
        
        try:
            # Try to parse JSON from response
            return json.loads(response)
        except json.JSONDecodeError:
            # If JSON parsing fails, return raw response
            return {"raw_response": response}
    
    async def classify_text(self, text: str, categories: List[str], model: str = "gpt-3.5-turbo") -> str:
        """Classify text into categories"""
        categories_str = ", ".join(categories)
        prompt = f"""
        Classify the following text into one of these categories: {categories_str}
        
        Text: {text}
        
        Return only the category name, no additional text.
        """
        
        if model.startswith('gpt-'):
            response = await self._openai_completion(prompt, model)
        elif model.startswith('gemini-'):
            response = await self._google_completion(prompt, model)
        elif model.startswith('claude-'):
            response = await self._anthropic_completion(prompt, model)
        else:
            raise ValueError(f"Unsupported model: {model}")
        
        return response.strip()
    
    async def generate_content(self, prompt: str, max_tokens: int = 1000, model: str = "gpt-3.5-turbo") -> str:
        """Generate content based on prompt"""
        if model.startswith('gpt-'):
            response = await self._openai_completion(prompt, model, max_tokens)
        elif model.startswith('gemini-'):
            response = await self._google_completion(prompt, model)
        elif model.startswith('claude-'):
            response = await self._anthropic_completion(prompt, model)
        else:
            raise ValueError(f"Unsupported model: {model}")
        
        return response
    
    async def chat_completion(self, messages: List[Dict[str, str]], model: str = "gpt-3.5-turbo", temperature: float = 0.7) -> str:
        """Chat completion with conversation history"""
        if model.startswith('gpt-'):
            response = await self._openai_chat(messages, model, temperature)
        elif model.startswith('gemini-'):
            response = await self._google_chat(messages, model, temperature)
        elif model.startswith('claude-'):
            response = await self._anthropic_chat(messages, model, temperature)
        else:
            raise ValueError(f"Unsupported model: {model}")
        
        return response
    
    async def _openai_completion(self, prompt: str, model: str, max_tokens: int = 1000) -> str:
        """OpenAI completion"""
        try:
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.7
            )
            self.last_token_count = response.usage.total_tokens
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def _openai_chat(self, messages: List[Dict[str, str]], model: str, temperature: float) -> str:
        """OpenAI chat completion"""
        try:
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature
            )
            self.last_token_count = response.usage.total_tokens
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def _google_completion(self, prompt: str, model: str) -> str:
        """Google Generative AI completion"""
        try:
            response = self.google_client.generate_content(prompt)
            self.last_token_count = 0  # Google doesn't provide token count in the same way
            return response.text
        except Exception as e:
            raise Exception(f"Google API error: {str(e)}")
    
    async def _google_chat(self, messages: List[Dict[str, str]], model: str, temperature: float) -> str:
        """Google Generative AI chat"""
        try:
            # Convert messages to Google format
            google_messages = []
            for msg in messages:
                if msg['role'] == 'user':
                    google_messages.append({"role": "user", "parts": [msg['content']]})
                elif msg['role'] == 'assistant':
                    google_messages.append({"role": "model", "parts": [msg['content']]})
            
            response = self.google_client.generate_content(google_messages)
            self.last_token_count = 0
            return response.text
        except Exception as e:
            raise Exception(f"Google API error: {str(e)}")
    
    async def _anthropic_completion(self, prompt: str, model: str) -> str:
        """Anthropic completion"""
        try:
            response = self.anthropic_client.messages.create(
                model=model,
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            self.last_token_count = response.usage.input_tokens + response.usage.output_tokens
            return response.content[0].text
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")
    
    async def _anthropic_chat(self, messages: List[Dict[str, str]], model: str, temperature: float) -> str:
        """Anthropic chat completion"""
        try:
            response = self.anthropic_client.messages.create(
                model=model,
                max_tokens=1000,
                messages=messages
            )
            self.last_token_count = response.usage.input_tokens + response.usage.output_tokens
            return response.content[0].text
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")
    
    def get_last_token_count(self) -> int:
        """Get the token count from the last request"""
        return self.last_token_count
