from dataclasses import dataclass
from typing import List, Dict

@dataclass
class BrowserConfig:
    name: str
    headless: bool
    capabilities: Dict[str, str]
    
CHROME = BrowserConfig(
    name='chrome',
    headless=True,
    capabilities={'browserName': 'chrome', 'version': 'latest'}
)

FIREFOX = BrowserConfig(
    name='firefox',
    headless=True,
    capabilities={'browserName': 'firefox', 'version': 'latest'}
)

BROWSERS: List[BrowserConfig] = [CHROME, FIREFOX]

def get_browser_config(browser_name: str) -> BrowserConfig:
    for config in BROWSERS:
        if config.name == browser_name.lower():
            return config
    raise ValueError(f"Unknown browser: {browser_name}")

