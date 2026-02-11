from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

app = FastAPI(title="JobTracker Scraper Service")

class CrawlRequest(BaseModel):
    url: str

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
                return CrawlResponse(
                    success=True,
                    markdown=result.markdown_v2.raw_markdown if hasattr(result, 'markdown_v2') else result.markdown
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
