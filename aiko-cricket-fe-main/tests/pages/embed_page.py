from pages.base_page import BasePage
from selenium.webdriver.common.by import By
from utils.logger import TestLogger
from config.base import Config

class EmbedPage(BasePage):
    # Embed widgets
    TIPS_CAROUSEL = (By.CLASS_NAME, "bet-type-carousel")  # tips-section/
    MATCH_CENTER_CONTENT = (By.CLASS_NAME, "match-center")
    LOADING_STATE = (By.CLASS_NAME, "tips-generating-state")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.logger = TestLogger()
        self.config = Config()
    
    def navigate_to_match_center(self, match_id: str):
        url = f"{self.config.EMBED_BASE}/match-center/{match_id}"
        self.navigate(url)
    
    def navigate_to_match_tips(self, match_id: str):
        url = f"{self.config.EMBED_BASE}/match-tips/{match_id}"
        self.navigate(url)
    
    def verify_embed_loaded(self):
        self.wait.presence(self.MATCH_CENTER_CONTENT)
        self.logger.info("Embed widget loaded successfully")
    
    def count_carousel_items(self) -> int:
        items = self.driver.find_elements(*self.TIPS_CAROUSEL)
        return len(items)

