import redis.asyncio as redis
import json
from typing import Any, Optional
from ..config import settings

class CacheService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.from_url(settings.redis_url)
            await self.redis_client.ping()
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis_client:
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """Set value in cache with expiration"""
        if not self.redis_client:
            return False
        
        try:
            await self.redis_client.setex(
                key, 
                expire, 
                json.dumps(value)
            )
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        if not self.redis_client:
            return False
        
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.redis_client:
            return False
        
        try:
            return await self.redis_client.exists(key) > 0
        except Exception as e:
            print(f"Cache exists error: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        if not self.redis_client:
            return 0
        
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                return await self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            print(f"Cache clear pattern error: {e}")
            return 0
