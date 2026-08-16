# PRD: Boggle and AI Stories Competitive Upgrade

## Problem Statement

Recent webmaster data shows RuleWord is beginning to earn meaningful search exposure, but the product experience is not yet strong enough to convert that exposure into durable organic traffic.

Boggle is the clearest opportunity. The Boggle page receives the majority of impressions, especially for "boggle online", "boggle online free", and related terms, but click-through is weak. The page already ranks in the lower half of page one for several queries, which means improved game quality, richer search snippets, and stronger retention loops can produce near-term growth.

AI Stories is the second opportunity. The stories index has much lower impression volume but substantially better click-through. That suggests the concept is compelling, but the experience needs stronger discovery, replayability, and shareable outcomes before RuleWord can own this category.

Competitor research indicates that successful online Boggle-style games commonly provide configurable board sizes, timed and relaxed modes, drag/touch word entry, visible word lists, post-game missed words, scoring breakdowns, daily challenges, streaks, leaderboards, and shareable boards. Strong interactive story products emphasize persistent memory, visible progress, meaningful stats, branching endings, replay history, genre hubs, save/resume, and shareable result cards.

## Solution

Upgrade Boggle from a basic playable word grid into a complete, replayable word game destination. The first release should preserve instant browser play while adding the features players expect from competitive online Boggle pages: better board interaction, game modes, post-round review, hints, stats, daily challenge, and SEO-relevant explanatory surfaces.

Upgrade AI Stories from a collection of story templates into a stronger interactive fiction product: easier genre discovery, richer story cards, persistent progress, ending collection, clearer choice impact, replay incentives, and shareable story outcomes.

Both upgrades should support SEO goals without burying the playable experience. The game or story should remain the first useful screen on the page, with supporting content, internal links, schema, and FAQs below or adjacent to the experience.

## User Stories

1. As a search visitor, I want to start playing Boggle immediately, so that I do not bounce after landing from Google.
2. As a Boggle player, I want to choose 4x4 or 5x5 boards, so that I can play either classic or larger-grid Boggle.
3. As a Boggle player, I want timed, relaxed, and practice modes, so that I can match the session to my mood.
4. As a mobile player, I want to drag across adjacent letters smoothly, so that Boggle feels natural on a touchscreen.
5. As a desktop player, I want click and keyboard-friendly controls, so that I can play quickly without fighting the UI.
6. As a Boggle player, I want invalid paths to be rejected clearly, so that I understand why a word did not count.
7. As a Boggle player, I want the game to recognize standard words reliably, so that valid words are not frustratingly rejected.
8. As a Boggle player, I want "Qu" tile handling to feel correct, so that classic Boggle rules are respected.
9. As a Boggle player, I want a live score and word count, so that I can track progress during the round.
10. As a Boggle player, I want scoring by word length, so that longer words feel properly rewarded.
11. As a Boggle player, I want to see found words grouped by length, so that I can understand my scoring pattern.
12. As a Boggle player, I want a post-game list of missed words, so that each round teaches me something.
13. As a Boggle learner, I want hints that reveal prefixes, first letters, or word lengths, so that I can improve without seeing every answer.
14. As a returning Boggle player, I want local high scores and streaks, so that I have a reason to come back.
15. As a daily puzzle player, I want one shared daily Boggle board, so that I can compare results with others.
16. As a social player, I want to share my Boggle score without spoiling the board, so that I can invite friends to beat it.
17. As an SEO visitor, I want concise rules, scoring, and strategy near the game, so that the page answers my query.
18. As a site owner, I want Boggle engagement events tracked, so that I can learn whether gameplay upgrades improve retention and clicks.
19. As an AI Stories visitor, I want to see genres and story types clearly, so that I can pick a story quickly.
20. As an AI Stories player, I want each story card to show length, genre, endings, and core stats, so that I understand the commitment before playing.
21. As an AI Stories player, I want auto-save and visible resume controls, so that I can continue a story later.
22. As an AI Stories player, I want my choices to visibly affect stats and relationships, so that decisions feel meaningful.
23. As an AI Stories player, I want a progress indicator by chapter, so that I know where I am in the arc.
24. As an AI Stories player, I want ending collection, so that replaying has a clear goal.
25. As an AI Stories player, I want replay from a finished story without losing the ending I unlocked, so that I can explore alternate paths.
26. As an AI Stories player, I want shareable ending cards, so that my result becomes a social hook.
27. As an AI Stories player, I want fallback content when AI generation fails, so that the experience never dead-ends.
28. As a mobile Stories player, I want choices, stats, and narration to fit comfortably on small screens, so that reading does not feel cramped.
29. As an SEO visitor, I want story pages to answer "what is this game", "how long is it", and "how many endings", so that I can decide to play.
30. As a site owner, I want Stories engagement events tracked, so that I can identify which templates deserve expansion.

## Implementation Decisions

- Boggle will remain a client-side React game, but core rules should be extracted into a testable game engine that owns board generation, adjacency validation, word validation, scoring, hint derivation, and answer discovery.
- Boggle should support at least two board sizes: classic 4x4 for launch and 5x5 as a competitive upgrade. The 5x5 dice distribution can use a documented local configuration.
- Boggle modes should include timed classic, relaxed untimed, and daily challenge. Daily boards must be deterministic from date plus mode so all users receive the same puzzle.
- Boggle should load the full dictionary once and cache it in memory. Prefix lookup should be supported to make answer discovery and hint generation fast.
- Boggle post-game review should show found words, missed high-value words, score breakdown, best possible score, and replay/new-board controls.
- Boggle share text should include score, word count, board size, date for daily mode, and a non-spoiling result grid or summary.
- Boggle local persistence should store best scores, recent rounds, daily streak, and settings without requiring login.
- Stories should keep the existing content-template model, but add a player progress layer for continue/replay/ending collection across story templates.
- Stories should add a richer discovery model: genre grouping, recommended story, continue-playing row, new/popular badges, and story metadata.
- Stories should make choice impact more legible through stat deltas, relationship changes, chapter transitions, and end-screen recap.
- Stories should preserve AI generation but treat deterministic fallback content as a first-class path, not an error-only afterthought.
- Both experiences should emit analytics-friendly browser events for start, completion, share, mode selection, hint use, and resume.
- SEO copy should support the gameplay rather than replace it: Boggle content should emphasize "Boggle online free", "4x4 Boggle", "5x5 Boggle", "Boggle rules", and "Boggle scoring"; Stories content should emphasize "AI story games", "interactive fiction", "multiple endings", and specific genre keywords.

## Testing Decisions

- Boggle engine tests should cover board generation, deterministic daily seeds, adjacency validation, duplicate word prevention, minimum word length, Qu tile behavior, scoring, dictionary matching, prefix lookup, answer discovery, and hint generation.
- Boggle component tests should focus on externally visible behavior: starting a round, submitting words, ending a round, switching modes, showing post-game review, and persisting high scores.
- Boggle mobile E2E should verify the game is playable at common mobile widths and that the board, timer, score, and word list do not overlap.
- Stories state tests should cover save/resume, replay, ending collection, stat updates, fallback node behavior, and share payload creation.
- Stories E2E should verify that a visitor can start a story, make choices, resume after reload, finish via fallback or mocked AI, and see an ending screen.
- SEO tests should verify canonical URLs, structured data, FAQ content, internal links, and indexable static copy remain present for Boggle and Stories pages.
- Tests should assert user-visible outcomes, not internal React state shape.

## Out of Scope

- Real-time multiplayer Boggle is out of scope for the first implementation.
- Server-backed global leaderboards are out of scope unless an existing storage/auth layer is introduced separately.
- User accounts, cross-device sync, and paid premium story features are out of scope.
- User-generated story publishing is out of scope.
- Full AI image generation for story scenes is out of scope for this PRD, though static thumbnails can be improved separately.
- Non-English Boggle dictionaries are out of scope for the first release.

## Release Plan

### Phase 1: Boggle Gameplay Foundation

- Extract and test a Boggle engine.
- Improve word entry for mouse and touch.
- Add mode selector for classic timed and relaxed play.
- Add post-round review with found words, missed words, and scoring breakdown.
- Add local high scores and recent rounds.

### Phase 2: Boggle Growth Features

- Add deterministic daily challenge.
- Add 5x5 mode.
- Add hints and shareable score summaries.
- Add engagement events.
- Update Boggle SEO sections to reflect the upgraded feature set.

### Phase 3: Stories Retention Foundation

- Add continue-playing and story progress surfaces.
- Add ending collection per story.
- Improve story cards with length, endings, genre, and stats.
- Add stat delta feedback after choices.
- Improve fallback flow so AI failures continue gracefully.

### Phase 4: Stories Growth Features

- Add recommended/trending story rows.
- Add shareable ending cards.
- Add genre landing improvements and stronger internal links.
- Add engagement events.
- Update story page SEO and FAQ sections around the upgraded experience.

## Success Metrics

- Boggle organic CTR improves from the current low baseline toward 1.5-3% on major impressions queries.
- Boggle average engagement increases: more rounds started, more rounds completed, and more returning daily challenge sessions.
- Stories index CTR remains strong while impressions grow through richer internal linking and genre coverage.
- Stories completion and replay rates increase after ending collection and continue-playing surfaces launch.
- Mobile Boggle CTR and engagement improve, reducing the desktop/mobile gap visible in webmaster data.

## Further Notes

This PRD intentionally prioritizes product quality as an SEO lever. The webmaster data suggests Google is already testing RuleWord for these topics; the highest-leverage next move is to make the landing experience feel like a destination worth ranking, revisiting, and sharing.
