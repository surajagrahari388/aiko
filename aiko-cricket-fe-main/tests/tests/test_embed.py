import pytest
from pages.embed_page import EmbedPage
from config.base import Config

@pytest.mark.smoke
@pytest.mark.ui
class TestEmbedWidgets:
    def test_match_center_embed(self, driver, base_page):
        """Public embed loads without auth"""
        embed_page = EmbedPage(driver)
        embed_page.navigate_to_match_center(Config.TEST_MATCH_ID)
        embed_page.verify_embed_loaded()
    
    def test_match_tips_embed(self, driver, base_page):
        """Tips carousel in embed"""
        embed_page = EmbedPage(driver)
        embed_page.navigate_to_match_tips(Config.TEST_MATCH_ID)
        embed_page.verify_embed_loaded()
        assert embed_page.count_carousel_items() > 0

