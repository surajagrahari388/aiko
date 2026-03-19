from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from config.base import Config
import time

class SmartWait:
    def __init__(self, driver):
        self.driver = driver
        self.config = Config()
        self.wait = WebDriverWait(self.driver, self.config.DEFAULT_TIMEOUT)
    
    def presence(self, locator, timeout=None):
        timeout = timeout or self.config.DEFAULT_TIMEOUT
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def visible(self, locator, timeout=None):
        timeout = timeout or self.config.DEFAULT_TIMEOUT
        return self.wait.until(EC.visibility_of_element_located(locator))
    
    def clickable(self, locator, timeout=None):
        timeout = timeout or self.config.DEFAULT_TIMEOUT
        return self.wait.until(EC.element_to_be_clickable(locator))
    
    def text_present(self, locator, text, timeout=None):
        timeout = timeout or self.config.DEFAULT_TIMEOUT
        return self.wait.until(EC.text_to_be_present_in_element((By.XPATH, locator), text))
    
    def url_contains(self, url_part, timeout=None):
        timeout = timeout or self.config.DEFAULT_TIMEOUT
        return self.wait.until(lambda d: url_part in d.current_url)
    
    def stale(self, element):
        return self.wait.until(EC.staleness_of(element))
    
    def sleep(self, seconds):
        """Emergency sleep - avoid in production"""
        time.sleep(seconds)

