import pytest
from pages.matches_page import MatchesPage
from pages.match_details_page import MatchDetailsPage
from config.base import Config

@pytest.mark.regression
@pytest.mark.ui
@pytest.mark.parametrize('browser', ['chrome'], indirect=True)
class TestMatchesFlow:
    def test_matches_list_and_navigate(self, driver, base_page):
        """Load matches → click first → land on details"""
        matches_page = MatchesPage(driver)
        matches_page.navigate_to_matches()
        matches_page.wait_for_matches_load()
        
        assert matches_page.get_match_count() > 0
        
        # Click first match
        matches_page.click_first_match()
        
        # Verify match details loaded
        details_page = MatchDetailsPage(driver)
        details_page.wait_for_details_load()
        assert '/cricket/' in base_page.get_current_url()
    
    def test_match_filter_live(self, driver, base_page):
        """Apply live filter → verify results"""
        matches_page = MatchesPage(driver)
        matches_page.navigate_to_matches()
        matches_page.wait_for_matches_load()
        
        initial_count = matches_page.get_match_count()
        matches_page.apply_status_filter('Live')
        
        # Should have fewer or same matches
        final_count = matches_page.get_match_count()
        assert final_count <= initial_count

