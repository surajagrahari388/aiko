import pytest
import os
import sys
import allure
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.core.utils import ChromeType
from pages.base_page import BasePage
from utils.driver import DriverFactory
from utils.wait import SmartWait
from utils.logger import TestLogger
from config.base import Config
from faker import Faker

load_dotenv()

fake = Faker()

@pytest.fixture(scope="session")
def config():
    return Config()

@pytest.fixture(scope="session")
def logger():
    return TestLogger()

@pytest.fixture(scope="function")
def driver(request, config):
    browser = getattr(request, 'param', 'chrome').lower()
    headless = request.config.getoption('--headless') or config.HEADLESS
    
    factory = DriverFactory(browser, headless)
    driver_instance = factory.create()
    
    yield driver_instance
    
    if hasattr(driver_instance, 'quit'):
        driver_instance.quit()

@pytest.fixture(scope="function")
def base_page(driver):
    return BasePage(driver)

@pytest.fixture(scope="function")
def smart_wait(driver):
    return SmartWait(driver)

@pytest.fixture(scope="session")
def api_client(config):
    import requests
    return requests.Session()

@pytest.fixture(scope="function")
def test_data():
    return {
        'match_id': '83798',  # Normalized test match
        'invalid_match_id': '999999',
        'user_email': fake.email(),
        'user_id': fake.uuid4(),
    }

def pytest_configure(config):
    # Add markers
    config.addinivalue_line("markers", "smoke: critical path tests")
    config.addinivalue_line("markers", "regression: full coverage")
    # Custom hooks

@pytest.hookimpl(tryfirst=True)
def pytest_runtest_makereport(item, call):
    if "slow" in item.keywords:
        item._testcase = None

