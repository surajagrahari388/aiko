import os
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

class Config:
    # Timeouts
    DEFAULT_TIMEOUT = int(os.getenv('SELENIUM_TIMEOUT', '10'))
    SHORT_TIMEOUT = int(os.getenv('SHORT_TIMEOUT', '5'))
    LONG_TIMEOUT = int(os.getenv('LONG_TIMEOUT', '30'))
    
    # App URLs
    BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')
    LOGIN_URL = f"{BASE_URL}/login"
    CRICKET_URL = f"{BASE_URL}/cricket"
    EMBED_BASE = f"{BASE_URL}/embed"
    
    # Test match data (from analysis)
    TEST_MATCH_ID = '83798'  # Normalized from 837981
    INVALID_MATCH_ID = '999999'
    
    # Browsers
    HEADLESS = os.getenv('HEADLESS', 'false').lower() == 'true'
    
    # API
    API_BASE = f"{BASE_URL}/api"
    PLAYERS_ENDPOINT = f"{API_BASE}/players"
    TIPS_ENDPOINT = f"{API_BASE}/tips"
    
    # Allure
    ALLURE_RESULTS = "reports/allure-results"
    
    @classmethod
    def get_env(cls, key: str, default: str = '') -> str:
        return os.getenv(key, default)
    
    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

