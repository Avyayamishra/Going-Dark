/**
 * Case #002 — THE BLACK ORBIT
 * Investigation database seed.
 *
 * Solution: Anya Petrova (FSB Intelligence Analyst, AGT-003) is the culprit.
 *   - Motive: Financial — she received 5 payments tagged TR-914 (totalling
 *     ~$26.5k USD + €7.2k EUR + ₽890k RUB) in the 36 hours before the incident.
 *   - Means: She used Colonel Sokolov's credential RUS-77A while Sokolov was
 *     confirmed to be at the Moscow Secure Facility (LOC-02), hundreds of
 *     kilometers from the Plesetsk Uplink Facility (LOC-01).
 *   - Co-conspirator: Maj. Dmitri Volkov (AGT-004) communicated with Anya 8
 *     times before the incident (the most frequent pair), and received 2
 *     smaller TR-914 payments. He was also at the uplink facility during the
 *     incident window.
 *   - Identity spoofing: RUS-77A was used to claim 4 distinct identities
 *     (Sokolov, Dmitri, Anya, Anonymous Operator) in identity_events.
 *   - 7-minute data gap: KOSMOS-9147 telemetry was lost from 02:13:18 to
 *     02:21:00 UTC (7 min 42 sec).
 *   - Red herring: Ethan Hunt (AGT-002) was deliberately inserted into the
 *     trail — his movements place him at the uplink facility during the
 *     incident despite his mission assignment (OPERATION NIGHTWATCH) being
 *     elsewhere. He has no financial or communication ties to TR-914 / RUS-77A.
 *
 * Timestamps: All incident events on 2025-03-15 between 01:50-02:30 UTC.
 * Financial records and pre-incident comms are dated 2+ days before.
 */
import type { InvestigationDatabaseSeed } from "@/stories/types";
import { CASE_002_SCHEMA } from "./schema";

/** Build a 2025-03-15 (incident day) UTC timestamp: "YYYY-MM-DD HH:MM:SS". */
const T = (h: number, m: number, s = 0) =>
  `2025-03-15 ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

/** Build a UTC timestamp on an arbitrary date: "YYYY-MM-DD HH:MM:SS". */
const D = (date: string, h: number, m: number, s = 0) =>
  `${date} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

export const CASE_002_DATABASE: InvestigationDatabaseSeed = {
  schema: CASE_002_SCHEMA,
  tables: [
    // ---------- AGENTS (9 rows) ----------
    // Persons of interest. Anya is the culprit. Ethan is the planted red herring.
    {
      name: "agents",
      rows: [
        { agent_id: "AGT-001", name: "Col. Viktor Sokolov", codename: "VIKTOR", role: "Russian Space Forces Commander", clearance_level: "TOP_SECRET", status: "ACTIVE" },
        { agent_id: "AGT-002", name: "Ethan Hunt", codename: "FALCON", role: "IMF Field Operative", clearance_level: "TOP_SECRET", status: "ACTIVE" },
        { agent_id: "AGT-003", name: "Anya Petrova", codename: "NIGHTINGALE", role: "FSB Intelligence Analyst", clearance_level: "SECRET", status: "ACTIVE" },
        { agent_id: "AGT-004", name: "Maj. Dmitri Volkov", codename: "WOLF", role: "GRU Cyber Operations Specialist", clearance_level: "SECRET", status: "ACTIVE" },
        { agent_id: "AGT-005", name: "Lena Kovač", codename: "SWIFT", role: "IMF Intelligence Liaison", clearance_level: "SECRET", status: "ACTIVE" },
        // Noise / red-herring agents
        { agent_id: "AGT-006", name: "Boris Morozov", codename: "BEAR", role: "Russian Space Forces Engineer", clearance_level: "CONFIDENTIAL", status: "ACTIVE" },
        { agent_id: "AGT-007", name: "Carter Vance", codename: "EAGLE", role: "IMF Deputy Director", clearance_level: "TOP_SECRET", status: "ACTIVE" },
        { agent_id: "AGT-008", name: "Pavel Orlov", codename: "STORM", role: "FSB Field Officer", clearance_level: "CONFIDENTIAL", status: "SUSPENDED" },
        { agent_id: "AGT-009", name: "Yuki Tanaka", codename: "CIPHER", role: "IMF Cyber Analyst", clearance_level: "SECRET", status: "ACTIVE" },
      ],
    },

    // ---------- SATELLITES (4 rows) ----------
    // KOSMOS-9147 is the target. Other satellites are noise / context.
    {
      name: "satellites",
      rows: [
        { satellite_id: "SAT-K9147", name: "KOSMOS-9147", operator: "Russian MoD", orbit_class: "GEO", status: "COMPROMISED" },
        { satellite_id: "SAT-K2231", name: "KOSMOS-2231", operator: "Russian MoD", orbit_class: "LEO", status: "ACTIVE" },
        { satellite_id: "SAT-IMF01", name: "IMF-SIGMA-1", operator: "IMF", orbit_class: "GEO", status: "ACTIVE" },
        { satellite_id: "SAT-K5512", name: "KOSMOS-5512", operator: "Roscosmos", orbit_class: "MEO", status: "ACTIVE" },
      ],
    },

    // ---------- ACCESS_LOGS (18 rows) ----------
    // KOSMOS-9147 was accessed with RUS-77A 14 times between 01:50-02:30.
    // 7-min gap (02:13:18 -> 02:21:12) — no access_logs during that window.
    {
      name: "access_logs",
      rows: [
        // KOSMOS-9147 + RUS-77A access chain (key evidence)
        { log_id: "AL-0001", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "AUTH_REQUEST", timestamp: T(1, 50, 12), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0002", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "AUTH_SUCCESS", timestamp: T(1, 51, 34), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0003", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "CHANNEL_CHANGE", timestamp: T(1, 53, 18), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0004", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "TELEMETRY_ACCESS", timestamp: T(1, 58, 22), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0005", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "AUTH_REQUEST", timestamp: T(2, 5, 11), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0006", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "AUTH_SUCCESS", timestamp: T(2, 6, 44), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0007", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "CHANNEL_CHANGE", timestamp: T(2, 8, 30), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0008", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "SIGNAL_OVERRIDE", timestamp: T(2, 13, 5), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0009", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "TELEMETRY_LOSS", timestamp: T(2, 13, 18), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        // -- 7-min gap: 02:13:18 -> 02:21:12 (no access logs during this window) --
        { log_id: "AL-0010", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "TELEMETRY_RESTORE", timestamp: T(2, 21, 12), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0011", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "CHANNEL_CHANGE", timestamp: T(2, 22, 8), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0012", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "AUTH_REQUEST", timestamp: T(2, 25, 33), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0013", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "AUTH_SUCCESS", timestamp: T(2, 26, 14), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0014", satellite_id: "SAT-K9147", access_id: "RUS-77A", event_type: "DEAUTH", timestamp: T(2, 28, 45), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        // Noise: other satellites and denied access attempts
        { log_id: "AL-0015", satellite_id: "SAT-K2231", access_id: "RUS-44B", event_type: "AUTH_REQUEST", timestamp: T(1, 45, 0), result: "SUCCESS", source_region: "EASTERN_EUROPE" },
        { log_id: "AL-0016", satellite_id: "SAT-K9147", access_id: "IMF-E1", event_type: "AUTH_REQUEST", timestamp: T(1, 48, 22), result: "DENIED", source_region: "WESTERN_EUROPE" },
        { log_id: "AL-0017", satellite_id: "SAT-K9147", access_id: "FSB-A1", event_type: "AUTH_REQUEST", timestamp: T(1, 49, 5), result: "DENIED", source_region: "CENTRAL_EUROPE" },
        { log_id: "AL-0018", satellite_id: "SAT-IMF01", access_id: "IMF-E1", event_type: "AUTH_REQUEST", timestamp: T(2, 12, 0), result: "SUCCESS", source_region: "WESTERN_EUROPE" },
      ],
    },

    // ---------- CREDENTIALS (6 rows) ----------
    // RUS-77A is officially owned by Sokolov (AGT-001). Other creds are noise.
    {
      name: "credentials",
      rows: [
        { credential_id: "CRED-001", access_id: "RUS-77A", owner_id: "AGT-001", issued_at: "2024-08-15 00:00:00", expires_at: "2027-08-15 00:00:00", status: "ACTIVE" },
        { credential_id: "CRED-002", access_id: "RUS-44B", owner_id: "AGT-004", issued_at: "2024-11-01 00:00:00", expires_at: "2026-11-01 00:00:00", status: "ACTIVE" },
        { credential_id: "CRED-003", access_id: "IMF-E1", owner_id: "AGT-002", issued_at: "2025-01-10 00:00:00", expires_at: "2027-01-10 00:00:00", status: "ACTIVE" },
        { credential_id: "CRED-004", access_id: "IMF-L1", owner_id: "AGT-005", issued_at: "2024-06-20 00:00:00", expires_at: "2026-06-20 00:00:00", status: "ACTIVE" },
        { credential_id: "CRED-005", access_id: "FSB-A1", owner_id: "AGT-003", issued_at: "2024-09-05 00:00:00", expires_at: "2027-09-05 00:00:00", status: "ACTIVE" },
        { credential_id: "CRED-006", access_id: "RUS-19C", owner_id: "AGT-006", issued_at: "2022-03-01 00:00:00", expires_at: "2024-03-01 00:00:00", status: "EXPIRED" },
      ],
    },

    // ---------- COMMUNICATIONS (22 rows) ----------
    // Anya <-> Dmitri is the most frequent pair (8 messages).
    // Several message_hashes contain "TR-914" or "RUS-77A" — discoverable via
    // SELECT * FROM communications WHERE message_hash LIKE '%TR-914%'.
    {
      name: "communications",
      rows: [
        // Anya <-> Dmitri (8 messages — most frequent pair, key evidence)
        { message_id: "MSG-0001", sender_id: "AGT-003", receiver_id: "AGT-004", timestamp: D("2025-03-13", 18, 22, 0), channel: "ENCRYPTED_VOICE", classification: "SECRET", message_hash: "TR-914_init_phase_pmt" },
        { message_id: "MSG-0002", sender_id: "AGT-004", receiver_id: "AGT-003", timestamp: D("2025-03-13", 22, 45, 11), channel: "ENCRYPTED_VOICE", classification: "SECRET", message_hash: "RUS-77A_acquired_ready" },
        { message_id: "MSG-0003", sender_id: "AGT-003", receiver_id: "AGT-004", timestamp: D("2025-03-14", 9, 14, 33), channel: "SECURE_TEXT", classification: "CONFIDENTIAL", message_hash: "TR-914_phase2_prep" },
        { message_id: "MSG-0004", sender_id: "AGT-004", receiver_id: "AGT-003", timestamp: D("2025-03-14", 14, 30, 0), channel: "ENCRYPTED_VOICE", classification: "SECRET", message_hash: "uplink_coords_verified" },
        { message_id: "MSG-0005", sender_id: "AGT-003", receiver_id: "AGT-004", timestamp: D("2025-03-14", 19, 55, 47), channel: "SECURE_TEXT", classification: "SECRET", message_hash: "TR-914_final_pmt_due" },
        { message_id: "MSG-0006", sender_id: "AGT-004", receiver_id: "AGT-003", timestamp: D("2025-03-14", 23, 12, 18), channel: "ENCRYPTED_VOICE", classification: "SECRET", message_hash: "RUS-77A_op_window_0150_0230" },
        { message_id: "MSG-0007", sender_id: "AGT-003", receiver_id: "AGT-004", timestamp: T(1, 32, 0), channel: "SECURE_TEXT", classification: "TOP_SECRET", message_hash: "TR-914_go_signal" },
        { message_id: "MSG-0008", sender_id: "AGT-004", receiver_id: "AGT-003", timestamp: T(1, 38, 9), channel: "SECURE_TEXT", classification: "TOP_SECRET", message_hash: "ack_RUS-77A_ready" },
        // Ethan <-> Lena (4 messages — IMF coordination, red herring)
        { message_id: "MSG-0009", sender_id: "AGT-002", receiver_id: "AGT-005", timestamp: D("2025-03-14", 20, 10, 0), channel: "SECURE_TEXT", classification: "CONFIDENTIAL", message_hash: "mission_briefing_updated" },
        { message_id: "MSG-0010", sender_id: "AGT-005", receiver_id: "AGT-002", timestamp: D("2025-03-14", 20, 35, 22), channel: "SECURE_TEXT", classification: "CONFIDENTIAL", message_hash: "intel_package_v3" },
        { message_id: "MSG-0011", sender_id: "AGT-002", receiver_id: "AGT-005", timestamp: T(0, 15, 0), channel: "SECURE_TEXT", classification: "CONFIDENTIAL", message_hash: "moving_to_position" },
        { message_id: "MSG-0012", sender_id: "AGT-005", receiver_id: "AGT-002", timestamp: T(0, 22, 41), channel: "SECURE_TEXT", classification: "CONFIDENTIAL", message_hash: "acknowledged_keep_secure" },
        // Sokolov <-> Anya (2 messages — red herring: contact with credential owner)
        { message_id: "MSG-0013", sender_id: "AGT-001", receiver_id: "AGT-003", timestamp: D("2025-03-13", 11, 0, 0), channel: "OFFICIAL_EMAIL", classification: "CONFIDENTIAL", message_hash: "weekly_briefing_schedule" },
        { message_id: "MSG-0014", sender_id: "AGT-003", receiver_id: "AGT-001", timestamp: D("2025-03-13", 13, 18, 5), channel: "OFFICIAL_EMAIL", classification: "CONFIDENTIAL", message_hash: "confirmed_attendance" },
        // Sokolov <-> Boris (2 messages — noise)
        { message_id: "MSG-0015", sender_id: "AGT-001", receiver_id: "AGT-006", timestamp: D("2025-03-14", 10, 5, 0), channel: "OFFICIAL_EMAIL", classification: "CONFIDENTIAL", message_hash: "uplink_maintenance_review" },
        { message_id: "MSG-0016", sender_id: "AGT-006", receiver_id: "AGT-001", timestamp: D("2025-03-14", 11, 30, 18), channel: "OFFICIAL_EMAIL", classification: "CONFIDENTIAL", message_hash: "maintenance_completed" },
        // Lena <-> Carter (2 messages — noise)
        { message_id: "MSG-0017", sender_id: "AGT-005", receiver_id: "AGT-007", timestamp: D("2025-03-14", 16, 0, 0), channel: "SECURE_TEXT", classification: "SECRET", message_hash: "ops_status_update" },
        { message_id: "MSG-0018", sender_id: "AGT-007", receiver_id: "AGT-005", timestamp: D("2025-03-14", 16, 22, 4), channel: "SECURE_TEXT", classification: "SECRET", message_hash: "approved_proceed" },
        // Yuki <-> Carter (1 message — noise)
        { message_id: "MSG-0019", sender_id: "AGT-009", receiver_id: "AGT-007", timestamp: T(0, 30, 0), channel: "SECURE_TEXT", classification: "SECRET", message_hash: "anomaly_detected_k9147" },
        // Anya <-> Lena (1 message — red herring: Anya also talked to IMF people)
        { message_id: "MSG-0020", sender_id: "AGT-003", receiver_id: "AGT-005", timestamp: D("2025-03-14", 17, 0, 0), channel: "OFFICIAL_EMAIL", classification: "CONFIDENTIAL", message_hash: "interagency_liaison_request" },
        // Dmitri <-> Boris (1 message — noise)
        { message_id: "MSG-0021", sender_id: "AGT-004", receiver_id: "AGT-006", timestamp: D("2025-03-13", 15, 0, 0), channel: "OFFICIAL_EMAIL", classification: "CONFIDENTIAL", message_hash: "engineering_specs_request" },
        // Carter -> Ethan (1 message — noise)
        { message_id: "MSG-0022", sender_id: "AGT-007", receiver_id: "AGT-002", timestamp: D("2025-03-14", 18, 45, 0), channel: "SECURE_TEXT", classification: "SECRET", message_hash: "field_op_clearance_granted" },
      ],
    },

    // ---------- LOCATIONS (6 rows) ----------
    // LOC-01 = uplink facility (where Anya was during the incident).
    // LOC-02 = Moscow Secure Facility (where Sokolov really was).
    {
      name: "locations",
      rows: [
        { location_id: "LOC-01", name: "Plesetsk Uplink Facility", country: "Russia", latitude: 62.928, longitude: 41.601 },
        { location_id: "LOC-02", name: "Moscow Secure Facility (FSB HQ)", country: "Russia", latitude: 55.755, longitude: 37.617 },
        { location_id: "LOC-03", name: "IMF European HQ", country: "Hungary", latitude: 47.497, longitude: 19.04 },
        { location_id: "LOC-04", name: "GRU Cyber Operations Center", country: "Russia", latitude: 55.755, longitude: 37.62 },
        { location_id: "LOC-05", name: "Arkhangelsk Relay Station", country: "Russia", latitude: 64.54, longitude: 40.518 },
        { location_id: "LOC-06", name: "Vienna IMF Liaison Office", country: "Austria", latitude: 48.208, longitude: 16.373 },
      ],
    },

    // ---------- AGENT_MOVEMENTS (17 rows) ----------
    // Sokolov was at LOC-02 (Moscow Secure Facility) covering the entire
    //   incident window — alibi confirmed.
    // Anya was at LOC-01 (Plesetsk Uplink Facility) from 01:30-02:50 — KEY.
    // Dmitri also at LOC-01 from 01:15-03:00 — co-conspirator.
    // Ethan at LOC-01 from 01:45-02:35 — RED HERRING (mission was elsewhere).
    {
      name: "agent_movements",
      rows: [
        // Sokolov — alibi confirmed at Moscow Secure Facility (LOC-02)
        { movement_id: "MV-0001", agent_id: "AGT-001", location_id: "LOC-05", arrived_at: D("2025-03-14", 18, 0, 0), departed_at: D("2025-03-14", 21, 0, 0), method: "GROUND" },
        { movement_id: "MV-0002", agent_id: "AGT-001", location_id: "LOC-02", arrived_at: D("2025-03-14", 22, 0, 0), departed_at: T(4, 0, 0), method: "AIR" },
        { movement_id: "MV-0003", agent_id: "AGT-001", location_id: "LOC-05", arrived_at: D("2025-03-13", 9, 0, 0), departed_at: D("2025-03-13", 17, 0, 0), method: "GROUND" },
        // Anya — KEY: arrived at uplink facility (LOC-01) at 01:30 and stayed until 02:50
        { movement_id: "MV-0004", agent_id: "AGT-003", location_id: "LOC-04", arrived_at: D("2025-03-14", 9, 0, 0), departed_at: D("2025-03-14", 12, 0, 0), method: "GROUND" },
        { movement_id: "MV-0005", agent_id: "AGT-003", location_id: "LOC-02", arrived_at: D("2025-03-14", 13, 30, 0), departed_at: D("2025-03-14", 17, 0, 0), method: "GROUND" },
        { movement_id: "MV-0006", agent_id: "AGT-003", location_id: "LOC-01", arrived_at: T(1, 30, 0), departed_at: T(2, 50, 0), method: "AIR" },
        // Dmitri — co-conspirator: also at LOC-01 during incident
        { movement_id: "MV-0007", agent_id: "AGT-004", location_id: "LOC-04", arrived_at: D("2025-03-14", 20, 0, 0), departed_at: D("2025-03-14", 23, 30, 0), method: "GROUND" },
        { movement_id: "MV-0008", agent_id: "AGT-004", location_id: "LOC-01", arrived_at: T(1, 15, 0), departed_at: T(3, 0, 0), method: "GROUND" },
        // Ethan — RED HERRING: at LOC-01 during incident despite mission elsewhere
        { movement_id: "MV-0009", agent_id: "AGT-002", location_id: "LOC-03", arrived_at: D("2025-03-14", 16, 0, 0), departed_at: T(0, 0, 0), method: "GROUND" },
        { movement_id: "MV-0010", agent_id: "AGT-002", location_id: "LOC-01", arrived_at: T(1, 45, 0), departed_at: T(2, 35, 0), method: "AIR" },
        // Lena — IMF liaison, IMF European HQ then Vienna office
        { movement_id: "MV-0011", agent_id: "AGT-005", location_id: "LOC-03", arrived_at: D("2025-03-14", 12, 0, 0), departed_at: T(2, 0, 0), method: "GROUND" },
        { movement_id: "MV-0012", agent_id: "AGT-005", location_id: "LOC-06", arrived_at: T(2, 15, 0), departed_at: null, method: "AIR" },
        // Boris — noise: was at Arkhangelsk Relay Station
        { movement_id: "MV-0013", agent_id: "AGT-006", location_id: "LOC-05", arrived_at: D("2025-03-14", 14, 0, 0), departed_at: D("2025-03-14", 20, 0, 0), method: "GROUND" },
        { movement_id: "MV-0014", agent_id: "AGT-006", location_id: "LOC-02", arrived_at: D("2025-03-13", 10, 0, 0), departed_at: D("2025-03-13", 18, 0, 0), method: "GROUND" },
        // Carter — noise: was at IMF European HQ
        { movement_id: "MV-0015", agent_id: "AGT-007", location_id: "LOC-03", arrived_at: D("2025-03-14", 9, 0, 0), departed_at: D("2025-03-14", 17, 0, 0), method: "GROUND" },
        // Pavel — noise: was at Moscow Secure Facility, later suspended
        { movement_id: "MV-0016", agent_id: "AGT-008", location_id: "LOC-02", arrived_at: D("2025-03-14", 8, 0, 0), departed_at: D("2025-03-14", 16, 0, 0), method: "GROUND" },
        // Yuki — noise: arrived at Vienna IMF Office (post-incident analysis)
        { movement_id: "MV-0017", agent_id: "AGT-009", location_id: "LOC-06", arrived_at: T(0, 30, 0), departed_at: null, method: "AIR" },
      ],
    },

    // ---------- FINANCIAL_RECORDS (17 rows) ----------
    // Anya received 5 payments tagged TR-914. Dmitri received 2.
    // Noise rows have NULL reference_code (monthly salaries, etc.).
    {
      name: "financial_records",
      rows: [
        // TR-914 tagged payments to Anya (5 — the key financial trail)
        { transaction_id: "TXN-0001", agent_id: "AGT-003", amount: 9500.0, currency: "USD", timestamp: D("2025-03-13", 14, 22, 0), description: "consulting services retainer", reference_code: "TR-914" },
        { transaction_id: "TXN-0002", agent_id: "AGT-003", amount: 7200.0, currency: "EUR", timestamp: D("2025-03-13", 19, 45, 11), description: "intel acquisition fee", reference_code: "TR-914" },
        { transaction_id: "TXN-0003", agent_id: "AGT-003", amount: 12000.0, currency: "USD", timestamp: D("2025-03-14", 10, 15, 0), description: "phase 1 retainer", reference_code: "TR-914" },
        { transaction_id: "TXN-0004", agent_id: "AGT-003", amount: 890000.0, currency: "RUB", timestamp: D("2025-03-14", 16, 30, 0), description: "operational expenses", reference_code: "TR-914" },
        { transaction_id: "TXN-0005", agent_id: "AGT-003", amount: 5000.0, currency: "USD", timestamp: D("2025-03-14", 22, 10, 0), description: "final delivery payment", reference_code: "TR-914" },
        // TR-914 tagged payments to Dmitri (2 — smaller, secondary)
        { transaction_id: "TXN-0006", agent_id: "AGT-004", amount: 450000.0, currency: "RUB", timestamp: D("2025-03-14", 11, 20, 0), description: "infrastructure services", reference_code: "TR-914" },
        { transaction_id: "TXN-0007", agent_id: "AGT-004", amount: 3200.0, currency: "USD", timestamp: D("2025-03-14", 18, 55, 0), description: "consulting fee", reference_code: "TR-914" },
        // Anya's normal monthly salary (no TR-914 — separates from the trail)
        { transaction_id: "TXN-0008", agent_id: "AGT-003", amount: 410000.0, currency: "RUB", timestamp: D("2025-03-13", 0, 25, 0), description: "monthly salary", reference_code: null },
        // Dmitri's normal salary
        { transaction_id: "TXN-0009", agent_id: "AGT-004", amount: 520000.0, currency: "RUB", timestamp: D("2025-03-13", 0, 30, 0), description: "monthly salary", reference_code: null },
        // Noise salary payments for other agents
        { transaction_id: "TXN-0010", agent_id: "AGT-001", amount: 650000.0, currency: "RUB", timestamp: D("2025-03-13", 0, 1, 0), description: "monthly salary", reference_code: null },
        { transaction_id: "TXN-0011", agent_id: "AGT-002", amount: 15000.0, currency: "USD", timestamp: D("2025-03-13", 0, 5, 0), description: "monthly operational stipend", reference_code: null },
        { transaction_id: "TXN-0012", agent_id: "AGT-005", amount: 9500.0, currency: "USD", timestamp: D("2025-03-13", 0, 8, 0), description: "monthly salary", reference_code: null },
        { transaction_id: "TXN-0013", agent_id: "AGT-006", amount: 220000.0, currency: "RUB", timestamp: D("2025-03-13", 0, 12, 0), description: "monthly salary", reference_code: null },
        { transaction_id: "TXN-0014", agent_id: "AGT-007", amount: 18000.0, currency: "USD", timestamp: D("2025-03-13", 0, 15, 0), description: "monthly salary", reference_code: null },
        { transaction_id: "TXN-0015", agent_id: "AGT-008", amount: 180000.0, currency: "RUB", timestamp: D("2025-03-13", 0, 22, 0), description: "monthly salary", reference_code: null },
        { transaction_id: "TXN-0016", agent_id: "AGT-009", amount: 8500.0, currency: "USD", timestamp: D("2025-03-13", 0, 18, 0), description: "monthly salary", reference_code: null },
        // Boris noise personal transaction
        { transaction_id: "TXN-0017", agent_id: "AGT-006", amount: 35000.0, currency: "RUB", timestamp: D("2025-03-14", 15, 0, 0), description: "personal purchase", reference_code: null },
      ],
    },

    // ---------- MISSION_RECORDS (6 rows) ----------
    // MSN-001 Ethan's mission was OPERATION NIGHTWATCH (00:00-04:00).
    // His movements show him at LOC-01 (Russian uplink facility) at 01:45-02:35
    // — inconsistent with his IMF mission assignment.
    {
      name: "mission_records",
      rows: [
        { mission_id: "MSN-001", agent_id: "AGT-002", mission_name: "OPERATION NIGHTWATCH", start_time: T(0, 0, 0), end_time: T(4, 0, 0), status: "COMPLETED" },
        { mission_id: "MSN-002", agent_id: "AGT-005", mission_name: "OPERATION BRIEFING DELTA", start_time: D("2025-03-14", 12, 0, 0), end_time: T(2, 0, 0), status: "COMPLETED" },
        { mission_id: "MSN-003", agent_id: "AGT-007", mission_name: "ROUTINE OVERSIGHT", start_time: D("2025-03-14", 9, 0, 0), end_time: D("2025-03-14", 17, 0, 0), status: "COMPLETED" },
        { mission_id: "MSN-004", agent_id: "AGT-009", mission_name: "SIGNAL ANALYSIS 9147", start_time: T(0, 30, 0), end_time: null, status: "ACTIVE" },
        { mission_id: "MSN-005", agent_id: "AGT-006", mission_name: "ROUTINE UPLINK MAINTENANCE", start_time: D("2025-03-14", 14, 0, 0), end_time: D("2025-03-14", 20, 0, 0), status: "COMPLETED" },
        { mission_id: "MSN-006", agent_id: "AGT-004", mission_name: "CYBER OPS READINESS DRILL", start_time: D("2025-03-13", 8, 0, 0), end_time: D("2025-03-13", 18, 0, 0), status: "COMPLETED" },
      ],
    },

    // ---------- SATELLITE_EVENTS (15 rows) ----------
    // KOSMOS-9147 telemetry with the 7-min gap (02:13:18 -> 02:21:00).
    {
      name: "satellite_events",
      rows: [
        // KOSMOS-9147 events during incident window
        { event_id: "SE-0001", satellite_id: "SAT-K9147", event_type: "TELEMETRY_HEARTBEAT", timestamp: T(0, 30, 0), severity: "INFO", event_code: "EVT-4470" },
        { event_id: "SE-0002", satellite_id: "SAT-K9147", event_type: "SIGNAL_ANOMALY", timestamp: T(1, 50, 12), severity: "WARNING", event_code: "EVT-4471" },
        { event_id: "SE-0003", satellite_id: "SAT-K9147", event_type: "CHANNEL_CHANGE", timestamp: T(1, 53, 18), severity: "INFO", event_code: "EVT-4472" },
        { event_id: "SE-0004", satellite_id: "SAT-K9147", event_type: "TELEMETRY_ACCESS", timestamp: T(1, 58, 22), severity: "INFO", event_code: "EVT-4473" },
        { event_id: "SE-0005", satellite_id: "SAT-K9147", event_type: "AUTH_HANDSHAKE", timestamp: T(2, 5, 11), severity: "INFO", event_code: "EVT-4474" },
        { event_id: "SE-0006", satellite_id: "SAT-K9147", event_type: "CHANNEL_CHANGE", timestamp: T(2, 8, 30), severity: "INFO", event_code: "EVT-4475" },
        { event_id: "SE-0007", satellite_id: "SAT-K9147", event_type: "SIGNAL_OVERRIDE", timestamp: T(2, 13, 5), severity: "CRITICAL", event_code: "EVT-4476" },
        { event_id: "SE-0008", satellite_id: "SAT-K9147", event_type: "TELEMETRY_LOSS", timestamp: T(2, 13, 18), severity: "CRITICAL", event_code: "EVT-4477" },
        // -- 7-MIN GAP: 02:13:18 -> 02:21:00 (no events for SAT-K9147 during this window) --
        { event_id: "SE-0009", satellite_id: "SAT-K9147", event_type: "TELEMETRY_RESTORE", timestamp: T(2, 21, 0), severity: "CRITICAL", event_code: "EVT-4478" },
        { event_id: "SE-0010", satellite_id: "SAT-K9147", event_type: "CHANNEL_CHANGE", timestamp: T(2, 22, 8), severity: "WARNING", event_code: "EVT-4479" },
        { event_id: "SE-0011", satellite_id: "SAT-K9147", event_type: "AUTH_HANDSHAKE", timestamp: T(2, 25, 33), severity: "INFO", event_code: "EVT-4480" },
        { event_id: "SE-0012", satellite_id: "SAT-K9147", event_type: "SIGNAL_ANOMALY", timestamp: T(2, 28, 45), severity: "WARNING", event_code: "EVT-4481" },
        // Noise: other satellite events during the same window
        { event_id: "SE-0013", satellite_id: "SAT-K2231", event_type: "TELEMETRY_HEARTBEAT", timestamp: T(2, 0, 0), severity: "INFO", event_code: "EVT-3301" },
        { event_id: "SE-0014", satellite_id: "SAT-IMF01", event_type: "TELEMETRY_HEARTBEAT", timestamp: T(2, 0, 0), severity: "INFO", event_code: "EVT-5501" },
        { event_id: "SE-0015", satellite_id: "SAT-K5512", event_type: "TELEMETRY_HEARTBEAT", timestamp: T(2, 0, 0), severity: "INFO", event_code: "EVT-6612" },
      ],
    },

    // ---------- IDENTITY_EVENTS (7 rows) ----------
    // RUS-77A was used to claim 4 distinct identities across 5 events — proof
    // the credential was hijacked. All were VERIFIED (system was tricked).
    {
      name: "identity_events",
      rows: [
        { event_id: "IE-0001", access_id: "RUS-77A", claimed_identity: "Col. Viktor Sokolov", verification_method: "CERTIFICATE", timestamp: T(1, 51, 34), result: "VERIFIED" },
        { event_id: "IE-0002", access_id: "RUS-77A", claimed_identity: "Maj. Dmitri Volkov", verification_method: "TOKEN", timestamp: T(2, 5, 11), result: "VERIFIED" },
        { event_id: "IE-0003", access_id: "RUS-77A", claimed_identity: "Anya Petrova", verification_method: "BIOMETRIC", timestamp: T(2, 13, 5), result: "VERIFIED" },
        { event_id: "IE-0004", access_id: "RUS-77A", claimed_identity: "Anonymous Operator", verification_method: "CERTIFICATE", timestamp: T(2, 21, 12), result: "VERIFIED" },
        { event_id: "IE-0005", access_id: "RUS-77A", claimed_identity: "Col. Viktor Sokolov", verification_method: "CERTIFICATE", timestamp: T(2, 25, 33), result: "VERIFIED" },
        // Noise identity events (other credentials, normal usage)
        { event_id: "IE-0006", access_id: "RUS-44B", claimed_identity: "Maj. Dmitri Volkov", verification_method: "CERTIFICATE", timestamp: T(1, 30, 0), result: "VERIFIED" },
        { event_id: "IE-0007", access_id: "IMF-E1", claimed_identity: "Ethan Hunt", verification_method: "BIOMETRIC", timestamp: D("2025-03-14", 18, 0, 0), result: "VERIFIED" },
      ],
    },
  ],
};
