from pages.base_page import BasePage
from selenium.webdriver.common.by import By
from utils.logger import TestLogger
from config.base import Config

class LoginPage(BasePage):
    # Auth0 selectors (common patterns from typical implementations)
    AUTH0_BUTTON = (By.XPATH, "//button[contains(text(), 'Continue with Auth0')] | //a[contains(@href, 'auth0')]")
    EMAIL_INPUT = (By.ID, "email")  # or name="email"
    PASSWORD_INPUT = (By.ID, "password")
    SUBMIT_BUTTON = (By.XPATH, "//button[@type='submit'] | //input[@type='submit']")
    SUCCESS_MESSAGE = (By.XPATH, "//div[contains(text(), 'success') or contains(text(), 'dashboard')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.logger = TestLogger()
        self.config = Config()
    
    def navigate_to_login(self):
        self.navigate(self.config.LOGIN_URL)
        self.logger.info("Navigated to login page")
    
    def click_auth0_login(self):
        self.click(self.AUTH0_BUTTON)
        self.logger.info("Clicked Auth0 login")
    
    def login_with_credentials(self, email: str, password: str):
        self.click_auth0_login()
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.PASSWORD_INPUT, password)
        self.click(self.SUBMIT_BUTTON)
        self.logger.info(f"Attempted login with {email}")
    
    def is_login_successful(self) -> bool:
        return self.is_displayed(self.SUCCESS_MESSAGE)
    
    def get_error_message(self) -> str:
        try:
            return self.get_text((By.XPATH, "//div[contains(@class, 'error')] | //p[contains(text(), 'error')]"))
        except:
            return ""

