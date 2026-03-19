import pytest
from pages.login_page import LoginPage
from config.base import Config

@pytest.mark.smoke
@pytest.mark.ui
@pytest.mark.parametrize('browser', ['chrome'], indirect=True)
class TestAuthFlow:
    def test_guest_access_cricket(self, driver, base_page):
        """Guest can access /cricket without login"""
        base_page.navigate(base_page.config.CRICKET_URL)
        assert "Matches" in base_page.get_title()
    
    @pytest.mark.flaky
    def test_login_flow(self, driver, base_page):
        """Basic login flow"""
        login_page = LoginPage(driver)
        login_page.navigate_to_login()
        
        # Mock Auth0 - test redirect/visible elements
        login_page.click_auth0_login()
        
        # Assert redirect to cricket after login
        base_page.wait.url_contains('/cricket')
        assert 'Aiko Cricket' in base_page.get_title()

