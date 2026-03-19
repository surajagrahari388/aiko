from pages.base_page import BasePage
from selenium.webdriver.common.by import By
from utils.logger import TestLogger
from config.base import Config

class MatchesPage(BasePage):
    # From /cricket/page.tsx analysis
    MATCHES_CONTAINER = (By.CLASS_NAME, "matches-container")  # matches-container.tsx
    MATCH_CARD = (By.CSS_SELECTOR, "[data-testid='match-card'], .match-card")
    FIRST_MATCH_CARD = (By.CSS_SELECTOR, "[data-testid='match-card']:first-child, .match-card:first-child")
    MATCH_FILTER = (By.CLASS_NAME, "match-status-filter")  # match-filters/
    LOADING_SKELETON = (By.CLASS_NAME, "matches-container-skeleton")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.logger = TestLogger()
    
    def navigate_to_matches(self):
        self.navigate(self.config.CRICKET_URL)
    
    def wait_for_matches_load(self):
        self.wait.invisibility_of_element_located(self.LOADING_SKELETON)
        self.wait.presence(self.MATCHES_CONTAINER)
    
    def get_match_count(self) -> int:
        cards = self.driver.find_elements(*self.MATCH_CARD)
        return len(cards)
    
    def click_first_match(self, match_id: str = None):
        if match_id:
            locator = (By.XPATH, f"//div[contains(@href, '{match_id}')] | //a[contains(@href, '/cricket/{match_id}')]")
        else:
            locator = self.FIRST_MATCH_CARD
        self.click(locator)
        self.logger.info("Clicked first match card")
    
    def apply_status_filter(self, status: str):
        filter_locator = (By.XPATH, f"//button[contains(text(), '{status}')]")
        self.click(filter_locator)

