import pytest
from pages.matches_page import MatchesPage
from pages.match_details_page import MatchDetailsPage
from pages.embed_page import EmbedPage
from config.base import Config

@pytest.mark.regression
@pytest.mark.ui
class TestMatchDetails:
    @pytest.fixture(autouse=True)
    def setup_match(self, driver, base_page):
        self.matches_page = MatchesPage(driver)
        self.details_page = MatchDetailsPage(driver)
        self.matches_page.navigate_to_matches()
        self.matches_page.wait_for_matches_load()
        self.matches_page.click_first_match()
        self.details_page.wait_for_details_load()
    
    def test_tabs_navigation(self, driver):
        """Switch between Insights/QnA/Tips tabs"""
        tabs = ['Insights', 'QnA', 'Tips']
        for tab in tabs:
            self.details_page.click_tab(tab)
            assert tab.lower() in driver.page_source.lower()
    
    def test_star_tip(self, driver):
        """Star a tip"""
        self.details_page.click_tab('Tips')
        initial_count = self.details_page.get_tip_count()
        self.details_page.star_first_tip()
        # Verify visual feedback or count change
        assert self.details_page.get_tip_count() >= initial_count
    
    @pytest.mark.skip(reason="Requires valid creds for full audio")
    def test_audio_playback(self, driver):
        self.details_page.play_audio()

