from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
import socket
import ipaddress
from urllib.parse import urlparse

app = FastAPI(title="JobTracker Scraper Service")

class CrawlRequest(BaseModel):
    url: str

    @field_validator('url')
    @classmethod
    def validate_url(cls, v: str) -> str:
        parsed = urlparse(v)
        if parsed.scheme not in ('http', 'https'):
            raise ValueError('Scheme must be http or https')
        if not parsed.hostname:
            raise ValueError('Hostname is required')
            
        try:
            # Resolve to all IPs and check for private/local addresses to prevent SSRF
            addr_info = socket.getaddrinfo(parsed.hostname, None)
            for res in addr_info:
                ip_str = res[4][0]
                ip = ipaddress.ip_address(ip_str)
                if ip.is_loopback or ip.is_private or ip.is_link_local:
                    raise ValueError(f"Access to private or local network address {ip_str} is forbidden")
        except socket.gaierror:
            raise ValueError(f"DNS resolution failed for hostname: {parsed.hostname}")
        
        return v

class CrawlResponse(BaseModel):
    success: bool
    markdown: str = ""
    error: str = ""

@app.post("/crawl", response_model=CrawlResponse)
async def crawl_url(request: CrawlRequest):
    try:
        browser_config = BrowserConfig(
            headless=True,
            # Magic mode on
            text_mode=False
        )
        
        run_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            # Wait for JS, dynamic content loading
            # magic=True,
            # More granular control for cleaning
            word_count_threshold=10,
            remove_overlay_elements=True,
            process_iframes=True
        )

        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(
                url=request.url,
                config=run_config,
                # Simple way to use magic mode features if version supports it directly in arun
                # Otherwise configured via configs above
                magic=True 
            )

            if result.success:
                # result.markdown is now often a MarkdownGenerationResult object in modern crawl4ai
                # so we access the raw_markdown property to ensure we get a string.
                markdown_content = result.markdown.raw_markdown if hasattr(result.markdown, 'raw_markdown') else result.markdown
                return CrawlResponse(
                    success=True,
                    markdown=markdown_content
                )
            else:
                return CrawlResponse(
                    success=False,
                    error=result.error_message or "Unknown crawling error"
                )

    except Exception as e:
        return CrawlResponse(
            success=False,
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
