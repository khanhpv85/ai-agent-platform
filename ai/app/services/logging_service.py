import json
import time
from typing import Dict, Any, Optional
from ..config import settings

class LoggingService:
    def __init__(self):
        self.redis_client = None
    
    async def connect(self):
        """Connect to Redis for logging"""
        try:
            import redis.asyncio as redis
            self.redis_client = redis.from_url(settings.redis_url)
            await self.redis_client.ping()
        except Exception as e:
            print(f"Failed to connect to Redis for logging: {e}")
            self.redis_client = None
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
    
    async def log_request(
        self,
        service_name: str,
        request_type: str,
        request_data: Dict[str, Any],
        response_data: Optional[Dict[str, Any]] = None,
        model_used: Optional[str] = None,
        tokens_used: int = 0,
        cost: float = 0.0,
        execution_time_ms: int = 0,
        status: str = "success",
        error_message: Optional[str] = None
    ):
        """Log AI service request"""
        log_entry = {
            "id": f"log_{int(time.time() * 1000)}",
            "service_name": service_name,
            "request_type": request_type,
            "request_data": request_data,
            "response_data": response_data,
            "model_used": model_used,
            "tokens_used": tokens_used,
            "cost": cost,
            "execution_time_ms": execution_time_ms,
            "status": status,
            "error_message": error_message,
            "created_at": time.time()
        }
        
        # Log to console
        print(f"AI Service Log: {json.dumps(log_entry, indent=2)}")
        
        # Store in Redis if available
        if self.redis_client:
            try:
                log_key = f"ai_logs:{log_entry['id']}"
                await self.redis_client.setex(
                    log_key,
                    86400,  # 24 hours
                    json.dumps(log_entry)
                )
                
                # Add to recent logs list
                await self.redis_client.lpush("ai_logs:recent", log_key)
                await self.redis_client.ltrim("ai_logs:recent", 0, 999)  # Keep last 1000 logs
            except Exception as e:
                print(f"Failed to store log in Redis: {e}")
    
    async def get_recent_logs(self, limit: int = 100) -> list:
        """Get recent logs from Redis"""
        if not self.redis_client:
            return []
        
        try:
            log_keys = await self.redis_client.lrange("ai_logs:recent", 0, limit - 1)
            logs = []
            
            for key in log_keys:
                log_data = await self.redis_client.get(key)
                if log_data:
                    logs.append(json.loads(log_data))
            
            return logs
        except Exception as e:
            print(f"Failed to get recent logs: {e}")
            return []
    
    async def get_logs_by_service(self, service_name: str, limit: int = 100) -> list:
        """Get logs for a specific service"""
        if not self.redis_client:
            return []
        
        try:
            pattern = f"ai_logs:*"
            keys = await self.redis_client.keys(pattern)
            logs = []
            
            for key in keys[:limit]:
                log_data = await self.redis_client.get(key)
                if log_data:
                    log_entry = json.loads(log_data)
                    if log_entry.get("service_name") == service_name:
                        logs.append(log_entry)
            
            return sorted(logs, key=lambda x: x["created_at"], reverse=True)
        except Exception as e:
            print(f"Failed to get logs by service: {e}")
            return []
