import allure
import os
from selenium.webdriver.common.by import By
from datetime import datetime

def attach_screenshot(driver, name="screenshot"):
    allure.attach(
        driver.get_screenshot_as_png(),
        name=f"{name}_{datetime.now().strftime('%H%M%S')}",
        attachment_type=allure.attachment_type.PNG
    )

def attach_page_source(driver):
    allure.attach(
        driver.page_source,
        name="page_source",
        attachment_type=allure.attachment_type.HTML
    )

def attach_logs(logs):
    with open("test_logs.txt", "w") as f:
        f.write("\n".join(logs))
    allure.attach.file("test_logs.txt", name="test_logs", attachment_type=allure.attachment_type.TEXT)

