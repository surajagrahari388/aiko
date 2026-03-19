from pages.base_page import BasePage
from selenium.webdriver.common.by import By
from utils.logger import TestLogger
from config.base import Config

class MatchDetailsPage(BasePage):
    # From match-details/ components
    TABS_CONTAINER = (By.CLASS_NAME, "match-details-tabs")
    INSIGHTS_TAB = (By.XPATH, "//button[contains(text(), 'Insights')] | //tab[contains(text(), 'Insights')]")
    QNA_TAB = (By.XPATH, "//button[contains(text(), 'QnA')]")
    TIPS_TAB = (By.XPATH, "//button[contains(text(), 'Tips')]")
    PLAYERS_TAB = (By.XPATH, "//button[contains(text(), 'Players')]")
    TIP_CARD = (By.CSS_SELECTOR, ".tip-card, [data-testid='tip']")
    STAR_BUTTON = (By.CSS_SELECTOR, "[data-testid='star'], button[aria-label*='star']")
    AUDIO_PLAYER = (By.CLASS_NAME, "audio-player")
    LOADING_SKELETON = (By.CLASS_NAME, "match-details-skeleton")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.logger = TestLogger()
    
    def wait_for_details_load(self):
        self.wait.invisibility_of_element_located(self.LOADING_SKELETON)
        self.wait.presence(self.TABS_CONTAINER)
    
    def click_tab(self, tab_name: str):
        tab_locator = (By.XPATH, f"//button[contains(text(), '{tab_name}')]")
        self.click(tab_locator)
        self.logger.info(f"Clicked {tab_name} tab")
    
    def star_first_tip(self):
        self.click(self.STAR_BUTTON)
        self.logger.info("Starred first tip")
    
    def play_audio(self):
        self.click((By.CSS_SELECTOR, f"{self.AUDIO_PLAYER} button[aria-label='play']"))
    
    def get_tip_count(self) -> int:
        tips = self.driver.find_elements(*self.TIP_CARD)
        return len(tips)

