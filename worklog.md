# SQL Murder Mystery — Worklog

Project: Case #001 — THE MIDNIGHT ARCHIVE
Stack: Next.js 16, TypeScript, Tailwind, better-sqlite3, Monaco Editor, Zustand

---
Task ID: 0
Agent: main
Task: Project setup and planning

Work Log:
- Explored existing Next.js scaffold (shadcn/ui, Prisma, Zustand available)
- Installed @monaco-editor/react and better-sqlite3
- Verified better-sqlite3 native bindings work
- Designed murder mystery plot (victim Elias Voss, killer Daniel Brooks, motive: embezzlement/tech sale to Helix Dynamics, TR-4817 transaction)
- Designed 8-table SQLite schema: suspects, employees, locations, visits, calls, transactions, messages, security_logs, evidence

Stage Summary:
- Murderer: Daniel Brooks (Head of Security)
- Motive: Elias discovered Daniel selling Nexora secrets to Helix Dynamics + embezzling (TR-4817 $480k payment)
- Method: Disabled archive camera (22:30), lured Elias to archive (22:05 call), killed him ~22:48, wiped computer, took phone
- Red herrings: Maya Chen (CFO, left 21:00), Sofia Martinez (engineer, floor 3), Ryan Cole (ops, discovered body)

---
Task ID: 14
Agent: main
Task: End-to-end verification and bug fixing

Work Log:
- Switched SQL engine from better-sqlite3 (native, crashed under Turbopack) to sql.js (pure WASM) — stable
- Fixed Zustand persist hydration mismatch (skipHydration + _hasHydrated guard + manual rehydrate)
- Fixed LandingPage boot-lines render crash (Cannot read 'startsWith' of undefined) with type guard filter
- Added ErrorBoundary for graceful error capture
- Fixed SQLEditor: runInternal ordering (ref-based), running state, lint (refs-during-render, hooks rules)
- Fixed HintPanel: renamed useHint->revealHint (hooks rule)
- Verified full golden path with Agent Browser:
  * Landing renders (dark forensic theme, boot log, CTA)
  * Case Introduction (cinematic beats, persons of interest, objective)
  * Investigation Dashboard (3-column layout, TopBar, sidebars)
  * SQL Editor (Monaco) + Run Query (Ctrl+Enter) executes against real SQLite
  * Query Results table (headers, row numbers, copy, count, exec time)
  * Empty result ("0 RECORDS FOUND"), error handling ("QUERY ERROR / Column does not exist"), unsafe blocking ("UNSAFE QUERY")
  * Evidence auto-discovery (TR-4817 query -> EVD-004 discovered in EvidencePanel)
  * Database Explorer (9 tables, expandable columns, filter, quick-query)
  * Query History (timing, row count, restore)
  * Notes panel (add/remove)
  * Final Accusation (WHO/HOW/WHY radio groups) -> Case Complete ("THE ARCHIVE SPEAKS")
- Verified responsive: tablet (1024) and mobile (414) reorganize with CASE/EVIDENCE drawers
- Lint clean (0 errors)

Stage Summary:
- Full game loop verified working end-to-end via Agent Browser
- sql.js WASM engine stable for realistic single-user pacing
- All required features implemented and tested

---
Task ID: 15
Agent: main
Task: Transform mystery — Maya Chen as killer, story emerges from database relationships

Work Log:
- Redesigned seed DB (scripts/seed-investigation.ts) with Maya=killer, Daniel=accomplice:
  * TR-4817 as a recurring reference across 14 small transactions (9 outgoing vendor payments + 5 incoming kickbacks to Maya's personal account), totalling ~$60k. Pattern only visible via aggregation (GROUP BY, COUNT, SUM).
  * Maya's movement contradiction: exits Parking Garage 21:05, re-enters via Side Entrance 22:18, enters Archive 22:41 (during TOD), exits 22:54.
  * Maya-Daniel coordination: 3 calls + 5 SMS chain ("He knows. He pulled the TR-4817 file... I need the room dark." / "CAM-04." / "Coming back in. East side." / "Done. Drive safe.")
  * Camera disabled by Daniel at 22:30 (accomplice); terminal wiped by Maya at 22:50 (principal).
  * Red herrings: Sofia (remote admin, promotion denied), Ryan (found body, staffing complaint), Tomas/Victor/Nadia (suspicious-flagged personal transactions).
  * Converted seed to use sql.js (positional ? params) since better-sqlite3 was removed.
- Updated engine schema metadata: transactions.reference column description.
- Updated caseData.ts:
  * New suspects bios (Maya=killer, Daniel=accomplice with undisclosed relationship)
  * 10 knowledge-based objectives grouped by thread (MOVEMENT, COMMUNICATION, FINANCIAL, SECURITY, MESSAGES, ACCUSATION) — parallel, non-linear
  * 10 investigation leads with starter queries (non-linear suggested questions)
  * 8 hints with thread tags, unlocked by evidence discovery
  * New accusation options: HOW=M_RETURN_ARCHIVE, WHY=M_EMBEZZLEMENT
  * Rewrote EVIDENCE_TRIGGERS to be content-based (not exact-string): detect person/time/location in result rows, semantic SQL patterns, aggregation results. Different valid queries uncover same evidence.
- Updated evidence catalog (12 items) reflecting Maya as killer.
- Updated accusation API: CORRECT = {who:S001, how:M_RETURN_ARCHIVE, why:M_EMBEZZLEMENT}
- Updated CaseComplete narrative (Maya embezzlement, Daniel accomplice, full reconstruction)
- Added InvestigationLeads panel (suggested questions with starter queries, thread tags)
- Enhanced InvestigationNotes: edit notes + suspect tagging (MAYA/DANIEL/SOFIA/RYAN with color-coded tags)
- Updated InvestigationProgress: objectives grouped by investigation thread with color-coded tags
- Updated HintPanel: thread tags on each hint
- Updated InvestigationDashboard: 4 right-sidebar tabs (Evidence/Leads/Progress/Hints)
- Added updateNote to game store

Verification (direct engine test — bypasses unstable dev server):
- Path A (Movements→Maya→transactions→security): all queries return correct data, evidence triggers fire (EVD-003, EVD-004, EVD-001, EVD-006, EVD-002, EVD-005)
- Path B (Messages→TR-4817→transactions): EVD-007, EVD-001, EVD-008 fire
- Path C (Calls→Daniel→security→Maya): EVD-008 fires on both SMS and calls
- Accusation API: Maya/Return/Embezzlement = correct (3/3); wrong answers = 0/3
- Error handling: bad column, unsafe query, empty result all work
- Lint clean (0 errors)

Stage Summary:
- Mystery now emerges from database relationships, not a single query
- TR-4817 is a multi-record financial pattern requiring aggregation to uncover
- Parallel investigation threads (Movements/Communications/Financial/Security/Messages) all converge on Maya
- Daniel is accomplice (camera), Maya is principal (archive entry, terminal wipe, financial motive)
- Evidence engine is content-based — different valid SQL queries can uncover the same evidence
- No single query exposes the murderer; player must connect multiple independent pieces

---
Task ID: 16
Agent: main
Task: Final verification of transformed mystery

Work Log:
- Ran direct engine test (scripts/test-engine.ts): all 3 investigation paths return correct data
- Ran evidence trigger test (scripts/test-evidence-triggers.ts): all triggers fire correctly
  * Path A: Maya movements → EVD-003, EVD-004; TR-4817 → EVD-001, EVD-006; camera → EVD-002; wipe → EVD-005
  * Path B: Elias messages → EVD-007; TR-4817 messages → EVD-001, EVD-008
  * Path C: Maya-Daniel SMS → EVD-008; Maya-Daniel calls → EVD-008
  * Fixed EVD-003 (semantic SQL detection for Maya+Archive queries without location_name in SELECT)
  * Fixed EVD-008 (extended to also fire on Maya-Daniel calls, not just SMS)
- Tested accusation API: Maya/Return/Embezzlement = correct (3/3); wrong = 0/3
- Verified UI via Agent Browser:
  * Landing → Briefing → Dashboard flow works
  * Default query (SELECT * FROM suspects) executes and shows 4 suspects including Maya Chen
  * Right sidebar shows 4 tabs: EVIDENCE, LEADS, PROGRESS, HINTS
  * Leads panel shows 10 suggested questions with color-coded thread tags and starter queries
  * Dark forensic theme renders well (VLM confirmed: "clean and logical... polished and fully functional")
- Lint clean (0 errors)

Stage Summary:
- Mystery fully transformed: Maya Chen is the killer, Daniel Brooks is the accomplice
- Story emerges from database relationships across 6 parallel investigation threads
- TR-4817 is a multi-record financial pattern requiring aggregation to uncover
- Evidence engine is content-based — different valid SQL queries uncover the same evidence
- All 3 test paths (A/B/C) verified working end-to-end through the database
- No single query exposes the murderer; player must connect multiple independent pieces

---
Task ID: 17
Agent: main
Task: SQL learning experience — contextual feedback, 3-level hints, evidence board, timeline, profiles, accusation gate

Work Log:
- Built SQL concept analyzer (src/lib/sql/analyzer.ts): deterministic tokenizer detecting 26 SQL concepts (SELECT, WHERE, BETWEEN, GROUP BY, JOIN, etc.), classifies into BEGINNER/INTERMEDIATE/AGGREGATION/ADVANCED levels, picks most educational insight. Fixed ALIAS false-positive (now only matches table aliases on FROM/JOIN with AS or short 1-2 letter alias).
- Updated types: QueryHistoryItem gains concepts+level fields; GameState gains learnedConcepts, shownInsights, timeline; HintItem gains level; AccusationRecord gains evidence+evidenceCoverage.
- Updated store: recordConcepts (+5/concept bonus), markInsightShown, addTimelineEvent, useHint(objectiveId, level) for 3-level progressive hints, store version bumped to 2.
- Rewrote caseData OBJECTIVES with 3-level hints each: L1=investigative direction, L2=database direction, L3=SQL concept direction. Never reveals the complete query.
- Built contextual SQL insight (SqlInsight.tsx): subtle footer below results showing "YOU USED: {concept}" + 1-line explanation. Auto-dismisses after 7s. Only shows for new concepts (tracked in shownInsights).
- Enhanced error experience (QueryResults.tsx): added SQL Tip section per error kind (column/table/syntax/unsafe). Empty results now show "NO RECORDS FOUND" + investigative note ("An empty result can be evidence too").
- Built evidence discovery cinematic notification (EvidenceToast.tsx): fixed top-center toast with "NEW EVIDENCE DISCOVERED" + name + category + +100, auto-dismisses after 5.5s.
- Enhanced evidence catalog with source, foundTime, relatedSuspect, relatedEvidence, accusationDimension (identity/opportunity/motive/supporting). 6 categories with color-coded metadata.
- Built Evidence Board (EvidenceBoard.tsx): evidence grouped by 6 categories, click discovered evidence to open inspector modal showing description/significance/source/found-time/related-suspect/related-evidence links.
- Built Investigation Timeline (InvestigationTimeline.tsx): chronological vertical timeline, only shows discovered events (auto-added when evidence is discovered via getTimelineEventForEvidence mapping).
- Built Suspect Profiles (SuspectProfiles.tsx): per-suspect cards showing known info + discovered evidence count + player notes count. Click to open detail modal. No suspicion percentage.
- Rewrote HintPanel for 3-level progressive hints: expandable per-objective, L2 requires L1, L3 requires L2, each -25 pts.
- Updated TopBar accusation dialog: evidence-coverage gate (identity+opportunity+motive+supporting all required), multi-evidence selection (checkboxes for all discovered evidence), "CASE THEORY INCOMPLETE" feedback on wrong answer.
- Updated CaseComplete: added "What You Learned" educational summary showing each SQL concept used with its hint, plus the closing line "You didn't learn SQL so you could play the game. You learned SQL because you needed it to solve the murder."
- Updated QueryHistory: shows concept tags per query + level badge.
- Updated InvestigationProgress: added SQL Concepts Used section showing all 21 trackable concepts with used/unused styling.
- Dashboard now has 6 left tabs (Brief/Suspects/Profiles/Database/Notes/History) and 6 right tabs (Evidence/Board/Timeline/Leads/Progress/Hints).
- Fixed all lint errors (setState-in-effect rule resolved via rAF + early-return pattern).
- Re-seeded DB with new schema (transactions.reference column).

Verification:
- SQL analyzer tested directly: correctly identifies concepts and levels for 6 test queries (BEGINNER→ADVANCED), picks appropriate insights (BETWEEN, GROUP BY, INNER JOIN, LIMIT, DISTINCT).
- Evidence triggers tested directly: all paths fire correctly (Path A/B/C).
- Agent Browser verified: Landing→Briefing→Dashboard flow works; default query executes; Evidence Board renders with 6 categories + locked undiscovered cards; Timeline shows empty state; Suspect Profiles shows all 4 suspects with evidence/notes counts; Accusation dialog shows coverage gate (Identity/Opportunity/Motive/Supporting) + WHO/HOW/WHY + multi-evidence selector.
- Lint clean (0 errors).

Stage Summary:
- Player learns SQL because they need it to solve the murder (not a tutorial)
- Contextual insights appear subtly after successful queries using new concepts
- 3-level progressive hints per objective (investigative→database→SQL)
- Evidence board, timeline, and suspect profiles let the player build their own mental model
- Accusation requires evidence coverage across 4 dimensions + multi-evidence selection
- Final educational summary shows concepts used in investigation context
- Detective experience is primary; SQL learning is secondary and emergent

---
Task ID: SEED-001
Agent: general-purpose
Task: Create Case #001 database seed module

Work Log:
- Read prior worklog and existing case-001 story structure (metadata, suspects, objectives, leads, evidence, timeline, accusation, solution, triggers modules already present).
- Created /home/z/my-project/src/stories/case-001/database.ts exporting `CASE_001_DATABASE: InvestigationDatabaseSeed`.
- Ported ALL investigation data verbatim from scripts/seed-investigation.ts (lines 165–456) into the new typed module, organized as 9 SeedTable entries matching the shared schema:
  * suspects (4 rows) — Maya/Daniel/Sofia/Ryan
  * employees (13 rows) — victim + non-suspects
  * locations (11 rows) — Lobby → Side Entrance
  * visits (27 rows) — movement thread; Maya's secret return at 22:18 + Archive entry at 22:41
  * calls (15 rows) — communication thread; Maya↔Daniel coordination calls
  * transactions (31 rows) — financial thread; TR-4817 across 14 small payments + 17 noise rows
  * messages (19 rows) — message thread; Elias→Priya audit, Elias→Maya confrontation setup, Maya↔Daniel SMS chain
  * security_logs (22 rows) — security thread; CAM-04 disabled by Daniel at 22:30:12, terminal wipe by Maya at 22:50:41
  * evidence (12 rows) — physical/digital/forensic/financial catalog
- Preserved the `T(h, m, s=0)` timestamp helper at the top of the file and used it for all visit/call/message/log timestamps exactly as in the seed script. Added TypeScript types to the helper params: `(h: number, m: number, s = 0)`.
- File imports `InvestigationDatabaseSeed` from `@/stories/types` (type-only import).
- Verified by loading the module directly with node --experimental-strip-types:
  * Row counts match exactly: 4/13/11/27/15/31/19/22/12 (suspects/employees/locations/visits/calls/transactions/messages/security_logs/evidence)
  * TR-4817 transaction count = 14 (matches original sanity check)
  * T(22, 41) => "2025-03-14 22:41:00" ✓
  * T(22, 30, 12) => "2025-03-14 22:30:12" ✓
- No other files modified; no scripts executed that mutate state.

Stage Summary:
- Case #001's investigation database is now available as a typed TypeScript module (`CASE_001_DATABASE`) ready for the engine's `Story.database` field, decoupling story data from the legacy sql.js seed script.
- All row data, comments, and the T() timestamp helper are byte-for-byte equivalent to the seed script, so engine behavior will match the previously-verified golden paths (A/B/C).
- Next step: a separate task can wire `CASE_001_DATABASE` into a case-001 `index.ts` that assembles the full `Story` object, and the engine can consume it to build an isolated in-memory SQLite database.

---
Task ID: MULTI-001
Agent: main
Task: Transform single-story game into scalable multi-story platform with DLC support

Work Log:
- Created Story type system (src/stories/types.ts): StoryMetadata, SuspectInfo, ObjectiveDefinition, LeadDefinition, EvidenceCatalogItem, EvidenceTrigger, TimelineEventDef, AccusationDefinition, StorySolution, InvestigationDatabaseSeed, Story
- Created story registry (src/stories/registry.ts): STORY_REGISTRY with listAll/listPlayable/getStory/getByStoryId
- Created story access abstraction (src/stories/access.ts): StoryAccessProvider interface + LocalStoryAccessProvider (FREE stories unlocked, PAID/COMING_SOON locked, DEV_UNLOCK_ALL flag for development)
- Created shared evidence metadata (src/stories/evidenceMeta.ts): EVIDENCE_CATEGORY_META + ACCUSATION_DIMENSIONS (reusable across stories)
- Migrated Case #001 into src/stories/case-001/:
  * metadata.ts, suspects.ts, objectives.ts (with 3-level hints), leads.ts, evidence.ts (catalog), triggers.ts (evidence triggers + discoverEvidenceFromResult helper), timeline.ts, accusation.ts, solution.ts (who/how/why + evidenceObjectiveMap + reconstruction), database.ts (all 154 seed rows)
  * index.ts assembles the full Story object
- Created Case #002 (The Glasshouse Protocol) — COMING_SOON placeholder metadata
- Created Case #003 (Dead Frequency) — COMING_SOON placeholder metadata
- Refactored SQL engine (src/lib/sql/engine.ts):
  * Removed fixed DB_PATH loading
  * Added getStoryDatabase(storyId) — creates an isolated in-memory SQLite DB from the story's seed data (shared schema + story-specific rows)
  * DB cache per storyId (only active story initialized)
  * executeQuery(storyId, sql) and getSchema(storyId) now require a storyId
  * releaseStoryDatabase(storyId) for cleanup
- Updated API routes:
  * /api/query POST accepts {sql, storyId}; GET accepts ?storyId=
  * /api/accuse POST accepts {storyId, who, how, why} — looks up solution from STORY_REGISTRY
- Refactored game store (src/lib/game/store.ts):
  * Story-scoped progress: progress[storyId] = {discoveredEvidence, queryHistory, notes, hints, completedObjectives, accusation, score, timeline, learnedConcepts, shownInsights, started, completed}
  * activeStoryId tracks the current story
  * selectStory(storyId) / exitToArchive() / resetActiveStory()
  * All per-story actions (addQuery, discoverEvidence, addNote, useHint, etc.) operate on the active story's progress
  * Selector hooks: useActiveStory, useDiscoveredEvidence, useQueryHistory, useNotes, useHints, useCompletedObjectives, useScore, useTimeline, useLearnedConcepts, useShownInsights, useAccusation
  * Store version bumped to 3
- Updated use-sql-query hook: passes storyId to API, uses story.evidenceTriggers + story.timeline + story.solution.evidenceObjectiveMap (no hardcoded Case #001 logic)
- Created CaseArchive component: case selection screen with cards showing case number, title, tagline, description, difficulty, estimated time, access status (FREE/COMING SOON), progress (COMPLETED/IN PROGRESS), score
- Updated page.tsx: stage flow is now landing → archive → briefing → investigation → complete
- Updated LandingPage: CTA goes to "archive" stage, shows archive stats instead of Case #001 facts
- Updated ALL game components to use the active story from the store instead of importing from @/data/caseData or @/data/evidenceCatalog:
  * CaseBrief, SuspectList, CaseIntroduction, CaseComplete, TopBar (accusation dialog), EvidencePanel, EvidenceBoard, InvestigationTimeline, SuspectProfiles, InvestigationProgress, InvestigationLeads, HintPanel, InvestigationDashboard, InvestigationNotes, QueryHistory, DatabaseExplorer
- Removed old files: src/data/caseData.ts, src/data/evidenceCatalog.ts, src/lib/game/evidenceEngine.ts, src/lib/game/timeline.ts
- Added "Archive" button to TopBar for returning to the case archive

Verification:
- Lint clean (0 errors)
- Query API with storyId=case-001 returns correct suspect data (Maya Chen, Daniel Brooks, etc.)
- Accusation API with storyId=case-001 + correct answers returns correct:true, correctCount:3
- Accusation API with wrong answers returns correct:false
- Agent Browser: Landing → Case Archive shows 3 cases (#001 FREE, #002 COMING SOON, #003 COMING SOON)
- Case #001 starts correctly: briefing → dashboard with SQL editor
- Default query (SELECT * FROM suspects) executes against Case #001's database

Stage Summary:
- ONE GAME ENGINE + MANY STORY PACKS + ONE ISOLATED DATABASE PER STORY + STORY-SPECIFIC LOCAL PROGRESS
- Case #001 fully migrated, completely playable
- Case #002 and #003 are placeholder DLC (COMING SOON)
- No Supabase, no backend, no payment integration
- Story access abstraction ready for future BackendStoryAccessProvider
- Adding a new story = create src/stories/case-NNN/ folder + register in registry.ts

---
Task ID: GOING-DARK
Agent: main
Task: Fix preview, eliminate backend, rename to GOING DARK

Work Log:
- Fixed preview: updated allowedDevOrigins in next.config.ts with explicit preview domain patterns
- Eliminated backend dependency entirely:
  * Created src/lib/sql/client-engine.ts — client-side SQL execution using sql.js WASM
  * The database runs entirely in the browser (in-memory SQLite from story seed data)
  * Copied sql-wasm.wasm to public/ for client-side loading
  * Updated use-sql-query hook to call executeQuery() directly (no fetch to /api/query)
  * Updated DatabaseExplorer to call getSchema() directly (no fetch to /api/query)
  * Updated TopBar accusation to call evaluateAccusation() directly (no fetch to /api/accuse)
  * Removed src/app/api/query/ and src/app/api/accuse/ API routes entirely
  * The game now runs 100% client-side — no backend, no API calls, database is local
- Renamed game from "SQL Murder Mystery" to "GOING DARK":
  * Updated layout.tsx title metadata
  * Updated LandingPage hero title to "GOING DARK"
  * Updated TopBar header text
  * Updated CaseArchive header text
  * Updated type comments

Verification:
- Lint clean (0 errors)
- Home page returns 200 with "GOING DARK" content
- WASM file accessible at /sql-wasm.wasm (200)
- No blocked origin errors
- Query execution works client-side (verified "Maya Chen" and "Daniel Brooks" in results)
- The game is now fully self-contained: no backend, no external database, no API calls

Stage Summary:
- Game renamed to "GOING DARK"
- Database is locally stored in the game (client-side sql.js WASM, in-memory)
- No backend dependency — the game runs entirely in the browser
- Preview should be visible (allowedDevOrigins fixed, server running)

---
Task ID: UX-FIXES
Agent: main
Task: Fix objective updates, add starter queries, manual evidence discovery, remove favicon, cursor:pointer

Work Log:
1. Fixed objective completion: objectives now complete based on query-pattern triggers (objectiveTriggers in story solution), NOT on evidence discovery. Added ObjectiveTrigger type with test functions that fire when the player runs relevant queries. This means OBJ-1 completes when querying visits during TOD, OBJ-4 completes when finding CAMERA_DISABLED, etc.

2. Added "Load starter query" to Progress panel: each objective now has a starterQuery field. The InvestigationProgress component shows a "LOAD STARTER QUERY" button for each objective that loads the SQL into the editor.

3. Removed automatic evidence discovery: evidence is NO LONGER auto-discovered when a query runs. Instead, the user must manually click on specific rows in the results table to inspect them for evidence. The QueryResults component now has handleRowClick which tests each clicked row against all evidence triggers. Discovered rows show a fingerprint icon. A hint "Click a row to inspect for evidence" is shown in the results meta bar.

4. Removed favicon: removed `icons` from layout.tsx metadata, deleted public/logo.svg and public/favicon.ico.

5. Added cursor:pointer globally: added CSS rule in globals.css targeting button, [role="button"], a, [onclick], [data-clickable], .cursor-pointer.

6. Updated solution.ts: replaced evidenceObjectiveMap with objectiveTriggers (query-pattern-based). Each objective has a trigger test that fires based on query content + result patterns.

7. Updated use-sql-query hook: removed automatic evidence discovery + evidenceObjectiveMap logic. Now only completes objectives via objectiveTriggers. Evidence discovery is handled by QueryResults row click.

8. Updated QueryResults: rows are now clickable (cursor:pointer, hover highlight). Clicking a row checks all evidence triggers against that single row. If evidence is found, it's discovered + timeline event added + fingerprint icon shown on the row.

Verification:
- Lint clean (0 errors)
- Progress tab shows OBJ-1, OBJ-2, etc. with "LOAD STARTER QUERY" buttons (VLM confirmed)
- Query execution works (returned "Maya Chen" in results)
- Favicon removed (no icons in layout, files deleted)
- Server running, home: 200

---
Task ID: CASE2-DB
Agent: general-purpose
Task: Create Case #002 (THE BLACK ORBIT) database seed module

Work Log:
- Read prior worklog, types.ts (InvestigationDatabaseSeed = {schema: TableSchemaDef[]; tables: SeedTable[]}), schema.ts (CASE_002_SCHEMA — 11 tables: agents, satellites, access_logs, credentials, communications, locations, agent_movements, financial_records, mission_records, satellite_events, identity_events), and suspects.ts (Anya=AGT-003 culprit, Sokolov=AGT-001, Ethan=AGT-002 red herring, Dmitri=AGT-004 co-conspirator, Lena=AGT-005).
- Created /home/z/my-project/src/stories/case-002/database.ts exporting `CASE_002_DATABASE: InvestigationDatabaseSeed`.
- Imports `CASE_002_SCHEMA` from `./schema` (per task spec) and assigns it to the `schema` field (engine's client-engine.ts uses story.database.schema to create tables in-memory — no longer falls back to Case-1 shared schema).
- Defined `T(h,m,s=0)` helper for 2025-03-15 UTC timestamps and `D(date,h,m,s=0)` helper for earlier-date timestamps (financial records + pre-incident comms).
- Seeded all 11 tables with rich intelligence-database data:
  * agents (9): 5 primary suspects + 4 noise (Boris, Carter, Pavel-suspended, Yuki)
  * satellites (4): KOSMOS-9147 (target/COMPROMISED) + 3 noise
  * access_logs (18): 14 SUCCESS events for RUS-77A on SAT-K9147 between 01:50:12-02:28:45, with the 02:13:18->02:21:12 gap preserved; 2 DENIED access attempts (IMF-E1, FSB-A1) and 2 noise rows on other satellites
  * credentials (6): RUS-77A owned by AGT-001 Sokolov (ACTIVE, expires 2027); RUS-44B/AGT-004, IMF-E1/AGT-002, IMF-L1/AGT-005, FSB-A1/AGT-003; 1 EXPIRED noise (RUS-19C / Boris)
  * communications (22): Anya↔Dmitri = 8 messages (most frequent pair); Ethan↔Lena = 4; Sokolov↔Anya = 2 (red herring); plus 8 noise across 5 other pairs. 4 message_hashes contain "TR-914" and 3 contain "RUS-77A" — discoverable via LIKE.
  * locations (6): LOC-01 Plesetsk Uplink Facility, LOC-02 Moscow Secure Facility (Sokolov's alibi), LOC-03 IMF European HQ, LOC-04 GRU Cyber Center, LOC-05 Arkhangelsk Relay Station, LOC-06 Vienna IMF Office
  * agent_movements (17): Sokolov at LOC-02 22:00→04:00 (alibi covers incident); Anya at LOC-01 01:30→02:50 (KEY); Dmitri at LOC-01 01:15→03:00 (co-conspirator); Ethan at LOC-01 01:45→02:35 (RED HERRING — inconsistent with IMF mission)
  * financial_records (17): 5 TR-914 payments to Anya ($9.5k USD, €7.2k EUR, $12k USD, ₽890k RUB, $5k USD) + 2 TR-914 to Dmitri (₽450k, $3.2k) + 10 NULL-reference noise salaries
  * mission_records (6): MSN-001 Ethan OPERATION NIGHTWATCH 00:00→04:00 COMPLETED (inconsistent with his LOC-01 movement); plus 5 noise missions
  * satellite_events (15): 12 KOSMOS-9147 events including the 7-min 42-sec gap (02:13:18 TELEMETRY_LOSS CRITICAL → 02:21:00 TELEMETRY_RESTORE CRITICAL); 3 CRITICAL events in window; 3 noise events on other satellites
  * identity_events (7): 5 events for RUS-77A claiming 4 distinct identities (Sokolov, Dmitri Volkov, Anya Petrova, Anonymous Operator) — all VERIFIED; 2 noise events for other credentials

Verification (node + TypeScript compiler API in-memory transpile):
- TypeScript type-check (tsc --noEmit --project tsconfig.json): NO errors in case-002 files
- ESLint (eslint src/stories/case-002/): exit 0, clean
- Runtime structural + clue-discoverability test (15 assertions) — ALL PASSED:
  * Row counts within spec ranges: agents 9/8-10, satellites 4/3-4, access_logs 18/15-20, credentials 6/5-6, communications 22/20-25, locations 6/5-6, agent_movements 17/15-20, financial_records 17/15-20, mission_records 6/5-6, satellite_events 15/12-15, identity_events 7/6-8
  * Clue 1: 3 CRITICAL K9147 events in 01:50-02:30 window ✓
  * Clue 3: 7.70-min gap 02:13:18→02:21:00 (within ~7-min target) ✓
  * Clue 4: 14 SUCCESS access_logs for RUS-77A on K9147 ✓
  * Clue 6: RUS-77A ACTIVE owner = AGT-001 (Sokolov) ✓
  * Clue 8: Sokolov at LOC-02 (Moscow Secure Facility) covering incident window ✓
  * Clue 12: 8 Anya-Dmitri comms before incident ✓
  * Clue 13: Anya↔Dmitri is the top pair (8 messages, next is Ethan↔Lena with 4) ✓
  * Clue 16-17: Anya has 5 TR-914 payments (>= 4 required) ✓
  * Clue 18: 4 communications contain "TR-914" in message_hash (MSG-0001/0003/0005/0007) ✓
  * Clue 20-21: RUS-77A used under 4 distinct claimed identities ✓
  * Clue 22: Anya at LOC-01 Plesetsk Uplink Facility 01:30→02:50 (covers entire incident window) ✓

Stage Summary:
- Case #002's investigation database is now available as a typed TypeScript module (`CASE_002_DATABASE`) ready for the engine's `Story.database` field.
- The story emerges from database relationships across 5 parallel investigation threads (SATELLITE/ACCESS, CREDENTIAL, COMMUNICATION, FINANCIAL, MOVEMENT) all converging on Anya Petrova (AGT-003).
- Key evidence is discoverable via standard SQL: JOINs (agents↔credentials↔access_logs), GROUP BY + ORDER BY COUNT DESC (top comm pair), LIKE '%TR-914%' (cross-table reference), timestamp BETWEEN (event window + gap detection).
- Red herrings: Ethan Hunt's movement at LOC-01 (inconsistent with IMF mission), Sokolov↔Anya comms (innocent briefings), Pavel's SUSPENDED status, Boris's expired credential.
- Next step: a separate task can wire `CASE_002_DATABASE` into a case-002 `index.ts` (alongside metadata/suspects/objectives/leads/evidence/triggers/timeline/accusation/solution modules) and register the case in STORY_REGISTRY so the engine picks it up.

---
Task ID: CASE2
Agent: main
Task: Implement Case #002 — THE BLACK ORBIT (complete playable story)

Work Log:
- Inspected existing architecture: story registry, types, client-engine, Case 1 structure
- Refactored SQL engine (client-engine.ts) to support per-story schemas:
  * Added TableSchemaDef type (schema definition per table)
  * Added schema field to InvestigationDatabaseSeed (optional for backward compat)
  * Engine now checks story.database.schema — if present, creates story-specific tables; if absent, uses default Case 1 schema
  * ALLOWED_TABLES is now dynamic per story (getAllowedTables function)
  * getSchema function reads table names and descriptions from the story's schema definition
  * validateQuery accepts optional allowedTables parameter
- Created Case 2 story content in src/stories/case-002/:
  * metadata.ts — spy satellite mystery, FREE access, difficulty INSPECTOR
  * suspects.ts — 5 suspects: Sokolov, Ethan Hunt, Anya Petrova, Dmitri Volkov, Lena Kovač
  * schema.ts — 11 tables: agents, satellites, access_logs, credentials, communications, locations, agent_movements, financial_records, mission_records, satellite_events, identity_events
  * database.ts — full seed data (created by subagent): 9 agents, 4 satellites, 18 access_logs, 6 credentials, 22 communications, 6 locations, 17 movements, 17 financial_records, 6 missions, 15 satellite_events, 7 identity_events
  * objectives.ts — 10 objectives with 3-level hints and starter queries
  * leads.ts — 10 investigative leads with starter queries
  * evidence.ts — 10 evidence catalog items with accusation dimensions
  * triggers.ts — 10 content-based evidence triggers
  * timeline.ts — 8 chronological timeline events
  * accusation.ts — WHO/HOW/WHY options with 4 choices each
  * solution.ts — Anya Petrova (AGT-003) is the culprit; credential theft + orbital key extraction
  * index.ts — assembles full Story object
- Registered Case 2 in registry.ts as playable (moved from COMING_SOON to PLAYABLE_STORIES)
- Made schema field optional in InvestigationDatabaseSeed type (backward compatibility with Case 1)
- Updated Case 3 (Glasshouse Protocol) — removed from COMING_SOON list (was replaced by Black Orbit)

Story Summary:
- Solution: Anya Petrova (FSB analyst) stole Sokolov's credential RUS-77A, was physically at the uplink facility, communicated with Dmitri Volkov, received TR-914 payments, manipulated identity records
- 7-minute telemetry gap on KOSMOS-9147 (02:13-02:21 UTC)
- Ethan Hunt deliberately inserted as false trail
- 5/5 difficulty with CTEs, window functions, multi-table JOINs

Verification:
- Lint: 0 errors
- Server: running, home: 200
- Case Archive: shows 3 cases (#001 FREE, #002 FREE, #003 COMING SOON)
- Case 2 selected from archive without errors
- Case 2 dashboard loads with SQL editor
- Query "SELECT * FROM agents;" executes against Case 2's database (client-side sql.js)
