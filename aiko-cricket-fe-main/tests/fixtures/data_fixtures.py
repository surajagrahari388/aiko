import json
from faker import Faker
from config.base import Config

fake = Faker()

def load_fixture(filename):
    with open(f"tests/fixtures/{filename}", 'r') as f:
        return json.load(f)

def create_match_payload(match_id=None):
    config = Config()
    return {
        "match_id": int(match_id or config.TEST_MATCH_ID),
        "user_id": fake.uuid4(),
        "language": "en"
    }

# Sample match data fixture
SAMPLE_MATCH = {
    "match": {
        "id": Config.TEST_MATCH_ID,
        "teams": [{"name": "Team A"}, {"name": "Team B"}]
    }
}

