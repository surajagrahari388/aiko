# Aiko Cricket Test Automation Framework

Enterprise-grade Python/Selenium E2E + API automation for Aiko Cricket FE.

## Quick Start (Local)

1. **Setup**
```bash
cd tests
pip install -r requirements.txt
cp .env.example .env  # Update BASE_URL if needed
```

2. **Run Tests**
```bash
# All tests
pytest

# UI smoke tests (Chrome)
pytest tests/ -m smoke -n 2

# API only
pytest tests/api/ -m api

# Headless
pytest --headless

# Allure reports
pytest --alluredir=reports/allure-results
allure serve reports/allure-results
```

3. **Docker (Full Grid)**
```bash
docker-compose up -d
pytest --driver Remote --command-executor http://localhost:4444/wd/hub
```

## CI/CD (Azure DevOps)
See `ci/azure-pipelines.yml`

## Structure
- `pages/` Screenplay POM
- `tests/` E2E suites
- `api/` API tests
- `utils/` Smart waits, logging

## Add New Test
1. Extend `pages/YourPage.py`
2. Add `tests/test_your_flow.py`
3. Mark `@pytest.mark.smoke` for critical paths

## Best Practices
- No hardcoded sleeps → use SmartWait
- Data-driven with fixtures
- Screenshots auto-captured on failure
- Parallel safe (xdist)

Framework covers 80% critical journeys out-of-box.

