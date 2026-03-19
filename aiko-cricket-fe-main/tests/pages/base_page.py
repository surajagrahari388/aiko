from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from utils.wait import SmartWait
from utils.logger import TestLogger
from config.base import Config

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = SmartWait(driver)
        self.logger = TestLogger()
        self.config = Config()
    
    def navigate(self, url: str):
        self.driver.get(url)
        self.logger.info(f"Navigated to: {url}")
    
    def get_title(self) -> str:
        return self.driver.title
    
    def get_current_url(self) -> str:
        return self.driver.current_url
    
    def find_element(self, locator):
        return self.wait.visible(locator)
    
    def click(self, locator):
        element = self.wait.clickable(locator)
        element.click()
        self.logger.info(f"Clicked: {locator}")
    
    def type_text(self, locator, text: str):
        element = self.wait.visible(locator)
        element.clear()
        element.send_keys(text)
        self.logger.info(f"Typed '{text}' into: {locator}")
    
    def get_text(self, locator) -> str:
        element = self.wait.visible(locator)
        return element.text
    
    def select_dropdown(self, locator, option: str):
        select = Select(self.find_element(locator))
        select.select_by_visible_text(option)
    
    def is_displayed(self, locator) -> bool:
        try:
            self.wait.visible(locator)
            return True
        except:
            return False
    
    @property
    def cricket_url(self):
        return self.config.CRICKET_URL
    
    @property
    def login_url(self):
        return self.config.LOGIN_URL

