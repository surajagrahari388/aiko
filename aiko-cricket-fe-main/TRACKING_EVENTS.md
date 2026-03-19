# Analytics Tracking Events

## match_click

**Trigger:** User clicks on a match card to view match details.

**When it fires:** 
- Immediately when user clicks the match card in the match list
- Fires once per click action

**Fields:**
- `match_id` - Unique identifier for the match
- `competition` - Tournament or league name
- `status` - Current match status (Live, Demo, Upcoming)
- `date_start_ist` - Match start time in IST
- `team_1` - First team name
- `team_2` - Second team name
- `tenant_id` - User's tenant identifier
- `language` - Language opted by the user

---

## tip_impression

**Trigger:** A betting tip becomes visible/impressionable to the user in the match details page.

**When it fires:**
- When a tip card scrolls into viewport or becomes visible on the Tips carousel
- Uses Intersection Observer to detect visibility (tip must be at least partially visible)
- Fires every time the tip enters the viewport (fires multiple times if user scrolls away and back)

**Fields:**
- `tip_id` - Unique identifier for the tip
- `match_id` - Unique identifier for the match
- `language` - Language opted by the user
- `market_category` - Category of the betting market (e.g., "Match Winner", "Highest Scorer", "match_insights")
- `scenario` - Specific scenario or type of the tip
- `tenant_id` - User's tenant identifier

**Testing verification:**
1. Navigate to a match with tips
2. Scroll to view a tip card
3. Verify console log shows `tip_impression` event with matching `tip_id`
4. Scroll away from the tip and scroll back - event SHOULD fire again
5. Load a new match - the same tip (if present) should fire again as a new impression

---

## tip_audio_played

**Trigger:** User clicks the initial audio/speaker button on a betting tip to listen to the tip narration.

**When it fires:**
- When user clicks the audio playback button on a tip card for the first time
- Fires before audio playback starts
- Fires each time user clicks the initial play button (can fire multiple times for same tip)
- Does NOT fire on pause/resume/play controls within the audio player

**Fields:**
- `tip_id` - Unique identifier for the tip
- `match_id` - Unique identifier for the match
- `language` - Language opted by the user
- `market_category` - Category of the betting market (e.g., "Match Winner", "Highest Scorer", "match_insights")
- `scenario` - Specific scenario or type of the tip
- `tenant_id` - User's tenant identifier

**Testing verification:**
1. Navigate to a match with tips
2. Locate a tip card with an audio icon/button
3. Click the audio/speaker icon
4. Verify console log shows `tip_audio_played` event with matching `tip_id`
5. Click the same button again on same or different tip
6. Event should fire again (multiple events allowed for same tip)

---

## match_pulse_impression

**Trigger:** A Match Pulse card becomes visible to the user in the match details page.

**When it fires:**
- When a Match Pulse card is at least 70% visible in the viewport for 3 continuous seconds
- Uses Intersection Observer with visibility duration tracking
- Fires once per sustained visibility period

**Fields:**
- `tip_id` - Unique identifier for the current card
- `match_id` - Unique identifier for the match
- `language` - Language opted by the user
- `market_category` - Always "Match_Pulse"
- `scenario` - Specific scenario or type of the insight
- `tenant_id` - User's tenant identifier (when ENABLE_TENANT is active)

**Testing verification:**
1. Navigate to a match with Match Pulse content
2. Scroll so the Match Pulse card is visible for at least 3 seconds
3. Verify console log shows `match_pulse_impression` event with matching `tip_id`
4. Swipe to a different card and wait 3 seconds — a new impression should fire

---

## match_pulse_audio_played

**Trigger:** User clicks the speaker button on a Match Pulse card to listen to the audio narration.

**When it fires:**
- When user clicks the audio playback button on a Match Pulse card
- Fires before the TTS API call is made
- Fires each time user clicks the initial play button (can fire multiple times for same card)
- Does NOT fire on pause/resume/play controls within the audio player

**Fields:**
- `tip_id` - Unique identifier for the current card
- `match_id` - Unique identifier for the match
- `language` - Language opted by the user
- `market_category` - Always "Match_Pulse"
- `scenario` - Specific scenario or type of the insight
- `tenant_id` - User's tenant identifier (when ENABLE_TENANT is active)

**Testing verification:**
1. Navigate to a match with Match Pulse content
2. Click the speaker/audio icon on a Match Pulse card
3. Verify console log shows `match_pulse_audio_played` event with matching `tip_id`
4. Navigate to a different card and click the speaker icon again
5. Event should fire again with the new card's `tip_id`

---

## qna_asked

**Trigger:** User submits a question through the Q&A interface (either by typing or voice input).

**When it fires:**
- When user submits a new question via the Q&A input field or voice recognition
- Fires immediately when the question is added to the processing queue
- Each question submission generates a unique `question_id`
- Fires for both typed questions and voice-to-text converted questions

**Fields:**
- `question_id` - Unique identifier for the question (changes with each submission)
- `question_text` - The actual question text submitted by the user
- `conversation_id` - Identifier for the conversation thread
- `tenant_id` - User's tenant identifier
- `language` - Language opted by the user
- `text_source` - Source of the question text ("typed" or "voice")
- `is_faq` - Whether this is a frequently asked question
- `faq_category` - Category of the FAQ if applicable
- `match_id` - Unique identifier for the match
- `match_title` - Title of the match
- `tournament_title` - Name of the tournament/competition
- `tournament_season` - Season of the tournament
- `tournament_type` - Type/format of the tournament (e.g., "T20", "ODI")
- `team1_name` - Name of the first team
- `team2_name` - Name of the second team
- `venue_name` - Name of the venue/stadium
- `venue_country` - Country where the venue is located
- `venue_location` - City/location of the venue
- `date_start_ist` - Match start time in IST
- `pitch_condition` - Type of pitch condition
- `weather` - Weather conditions for the match
- `match_status` - Current status of the match

**Testing verification:**
1. Navigate to a match with Q&A functionality enabled
2. Type a question in the Q&A input field and press enter/submit
3. Verify console log shows `qna_asked` event with a unique `question_id`
4. Submit the same question again
5. Event should fire again with a different `question_id`
6. Use voice input to ask a question
7. Event should fire with `text_source: "voice"`

---

## qna_feedback

**Trigger:** User provides feedback on Q&A responses by clicking upvote/downvote buttons or submitting custom email feedback.

**When it fires:**
- When user clicks the thumbs up (upvote) or thumbs down (downvote) button on an assistant response
- When user submits custom feedback via the email feedback form (mail icon)
- Fires immediately when the feedback button is clicked or form is submitted
- Each feedback action generates a separate event (can vote multiple times if vote is changed)

**Fields:**
- `conversation_id` - Identifier for the conversation thread
- `feedback_type` - Type of feedback ("upvote", "downvote", or "custom")
- `match_id` - Unique identifier for the match
- `match_title` - Title of the match
- `tournament_title` - Name of the tournament/competition
- `language` - Language opted by the user
- `tenant_id` - User's tenant identifier
- `timestamp` - Unix timestamp when feedback was given
- `feedback_title` - Title of custom feedback (only present when feedback_type is "custom", e.g., "Accuracy" or "Quality")
- `feedback_description` - Detailed description of custom feedback (only present when feedback_type is "custom")

**Testing verification:**
1. Navigate to a match with Q&A functionality and submit a question
2. Wait for an AI response to appear
3. Click the thumbs up or thumbs down button on the response
4. Verify console log shows `qna_feedback` event with correct `feedback_type` ("upvote" or "downvote")
5. Change vote by clicking the other button
6. Event should fire again with updated `feedback_type`
7. Click the mail icon to open custom feedback form
8. Fill out and submit the form
9. Verify console log shows `qna_feedback` event with `feedback_type: "custom"`, `feedback_title`, and `feedback_description`

---

## qna_unstar

**Trigger:** User removes a question from their favorites by clicking the star button on a favorited question.

**When it fires:**
- When user clicks the star button on a question that is currently favorited
- Fires immediately when the unstar action is initiated
- Only fires when removing from favorites (not when adding)

**Fields:**
- `conversation_id` - Identifier for the conversation thread
- `question_text` - The actual question text that was unstarred
- `question_id` - Unique identifier for the question
- `match_id` - Unique identifier for the match
- `match_title` - Title of the match
- `tournament_title` - Name of the tournament/competition
- `language` - Language opted by the user
- `tenant_id` - User's tenant identifier
- `timestamp` - Unix timestamp when question was unstarred

**Testing verification:**
1. Navigate to a match and submit a question
2. Click the star button to favorite the question (should see `qna_favorite` event)
3. Click the star button again to unstar the question
4. Verify console log shows `qna_unstar` event with matching `question_id`

---

## qna_favorite

**Trigger:** User adds a question to their favorites by clicking the star button on a question.

**When it fires:**
- When user clicks the star button on a question that is not currently favorited
- Fires immediately when the favorite action is initiated
- Only fires when adding to favorites (not when removing)

**Fields:**
- `conversation_id` - Identifier for the conversation thread
- `question_text` - The actual question text that was favorited
- `question_id` - Unique identifier for the question
- `match_id` - Unique identifier for the match
- `match_title` - Title of the match
- `tournament_title` - Name of the tournament/competition
- `language` - Language opted by the user
- `tenant_id` - User's tenant identifier
- `timestamp` - Unix timestamp when question was favorited

**Testing verification:**
1. Navigate to a match and submit a question
2. Click the star button to favorite the question
3. Verify console log shows `qna_favorite` event with matching `question_id`
4. Try clicking star again (should see `qna_unstar` event instead)

---

## favourite_tip_qna_asked

**Trigger:** User initiates Q&A processing for a favorited tip by clicking to expand or view the tip details.

**When it fires:**
- When a favorited tip is processed for Q&A (e.g., when user clicks to view the tip's Q&A response)
- Fires before sending the question to the AI service
- Each tip processing generates a unique `question_id`
- Only fires for favorited tips that have an `original_question`

**Fields:**
- `tip_id` - Unique identifier for the favorited tip
- `question_id` - Unique identifier for the question (changes with each processing)
- `question_text` - The original question text associated with the favorited tip
- `question_length` - Length of the question text in characters
- `conversation_id` - Identifier for the conversation thread
- `tenant_id` - User's tenant identifier
- `language` - Language opted by the user
- `match_id` - Unique identifier for the match
- `match_title` - Title of the match
- `tournament_title` - Name of the tournament/competition
- `tournament_season` - Season of the tournament
- `tournament_type` - Type/format of the tournament (e.g., "T20", "ODI")
- `team1_name` - Name of the first team
- `team2_name` - Name of the second team
- `venue_name` - Name of the venue/stadium
- `venue_country` - Country where the venue is located
- `venue_location` - City/location of the venue
- `date_start_ist` - Match start time in IST
- `pitch_condition` - Type of pitch condition
- `weather` - Weather conditions for the match
- `match_status` - Current status of the match

**Testing verification:**
1. Navigate to the favorites section and find a favorited tip with an original question
2. Click to expand or view the tip's Q&A response
3. Verify console log shows `favourite_tip_qna_asked` event with matching `tip_id` and `question_id`
4. Process the same tip again
5. Event should fire again with a different `question_id`

---

## favourite_tip_qna_success

**Trigger:** AI successfully processes and returns a response for a favorited tip's Q&A.

**When it fires:**
- When the AI service successfully returns a complete response for a favorited tip's question
- Fires after receiving the full streaming response from the AI service
- Only fires when the API call succeeds (status 200)

**Fields:**
- `tip_id` - Unique identifier for the favorited tip
- `question_id` - Unique identifier for the question
- `question_text` - The original question text associated with the favorited tip
- `question_length` - Length of the question text in characters
- `conversation_id` - Identifier for the conversation thread
- `tenant_id` - User's tenant identifier
- `language` - Language opted by the user
- `match_id` - Unique identifier for the match
- `match_title` - Title of the match
- `tournament_title` - Name of the tournament/competition
- `tournament_season` - Season of the tournament
- `tournament_type` - Type/format of the tournament (e.g., "T20", "ODI")
- `team1_name` - Name of the first team
- `team2_name` - Name of the second team
- `venue_name` - Name of the venue/stadium
- `venue_country` - Country where the venue is located
- `venue_location` - City/location of the venue
- `date_start_ist` - Match start time in IST
- `pitch_condition` - Type of pitch condition
- `weather` - Weather conditions for the match
- `match_status` - Current status of the match
- `response_length` - Length of the AI response in characters

**Testing verification:**
1. Navigate to the favorites section and find a favorited tip with an original question
2. Click to expand or view the tip's Q&A response
3. Wait for the AI response to complete successfully
4. Verify console log shows `favourite_tip_qna_success` event with matching `tip_id` and `response_length`

---

## favourite_tip_qna_error

**Trigger:** AI fails to process a favorited tip's Q&A request.

**When it fires:**
- When the AI service returns an error response (non-200 status) for a favorited tip's question
- When a network error or other exception occurs during processing
- Fires immediately when the error is detected

**Fields:**
- `tip_id` - Unique identifier for the favorited tip
- `question_id` - Unique identifier for the question
- `question_text` - The original question text associated with the favorited tip
- `question_length` - Length of the question text in characters
- `conversation_id` - Identifier for the conversation thread
- `tenant_id` - User's tenant identifier
- `language` - Language opted by the user
- `match_id` - Unique identifier for the match
- `match_title` - Title of the match
- `tournament_title` - Name of the tournament/competition
- `tournament_season` - Season of the tournament
- `tournament_type` - Type/format of the tournament (e.g., "T20", "ODI")
- `team1_name` - Name of the first team
- `team2_name` - Name of the second team
- `venue_name` - Name of the venue/stadium
- `venue_country` - Country where the venue is located
- `venue_location` - City/location of the venue
- `date_start_ist` - Match start time in IST
- `pitch_condition` - Type of pitch condition
- `weather` - Weather conditions for the match
- `match_status` - Current status of the match
- `error_status` - HTTP status code of the error response (only present for API errors)
- `error_message` - Error message describing what went wrong (only present for exceptions)

**Testing verification:**
1. Navigate to the favorites section and find a favorited tip with an original question
2. Simulate an error condition (e.g., network failure, invalid API key, or server error)
3. Click to expand or view the tip's Q&A response
4. Verify console log shows `favourite_tip_qna_error` event with matching `tip_id` and error details
