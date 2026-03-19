import pytest
import requests
import json
from config.base import Config

@pytest.mark.api
@pytest.mark.smoke
class TestCricketAPI:
    def test_get_players_valid_match(self, api_client, config):
        """Test /api/players?matchId=83798"""
        params = {'matchId': config.TEST_MATCH_ID}
        response = api_client.get(f"{config.PLAYERS_ENDPOINT}", params=params)
        
        assert response.status_code == 200
        data = response.json()
        assert 'teams' in data
        assert len(data['teams']) > 0
        pytest.mark.flaky
    
    @pytest.mark.parametrize("match_id", ['999999', 'abc'])
    def test_get_players_invalid_match(self, api_client, config, match_id):
        """Invalid matchId returns 400"""
        params = {'matchId': match_id}
        response = api_client.get(f"{config.PLAYERS_ENDPOINT}", params=params)
        assert response.status_code == 400
    
    def test_post_tips_generation(self, api_client, config, test_data):
        """Test /api/tips POST"""
        payload = {
            'match_id': int(config.TEST_MATCH_ID),
            'user_id': test_data['user_id'],
            'language': 'en'
        }
        response = api_client.post(f"{config.TIPS_ENDPOINT}", json=payload)
        
        assert response.status_code in [200, 202]  # 202 = generating
        data = response.json()
        assert 'tips' in data or 'status' in data

