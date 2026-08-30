import type { TableSchemaDef } from "@/stories/types";

// Case #002 uses a completely different schema from Case #001.
// The engine creates these tables in-memory from the story's seed data.
export const CASE_002_SCHEMA: TableSchemaDef[] = [
  {
    name: "agents",
    description: "IMF and allied personnel involved in the investigation.",
    createSql: `CREATE TABLE agents (
  agent_id        TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  codename        TEXT NOT NULL,
  role            TEXT NOT NULL,
  clearance_level TEXT NOT NULL,
  status          TEXT NOT NULL
)`,
    columns: [
      { name: "agent_id", type: "TEXT", description: "Primary key — unique agent identifier." },
      { name: "name", type: "TEXT", description: "Full name of the agent." },
      { name: "codename", type: "TEXT", description: "Operational codename." },
      { name: "role", type: "TEXT", description: "Job title / role." },
      { name: "clearance_level", type: "TEXT", description: "Security clearance (e.g. TOP_SECRET, SECRET, CONFIDENTIAL)." },
      { name: "status", type: "TEXT", description: "Current status (ACTIVE, SUSPENDED, etc.)." },
    ],
  },
  {
    name: "satellites",
    description: "Satellite registry including the target KOSMOS-9147.",
    createSql: `CREATE TABLE satellites (
  satellite_id TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  operator     TEXT NOT NULL,
  orbit_class  TEXT NOT NULL,
  status       TEXT NOT NULL
)`,
    columns: [
      { name: "satellite_id", type: "TEXT", description: "Primary key — unique satellite identifier." },
      { name: "name", type: "TEXT", description: "Satellite name (e.g. KOSMOS-9147)." },
      { name: "operator", type: "TEXT", description: "Operating organization/country." },
      { name: "orbit_class", type: "TEXT", description: "Orbit classification (GEO, LEO, MEO)." },
      { name: "status", type: "TEXT", description: "Current operational status." },
    ],
  },
  {
    name: "access_logs",
    description: "Authentication and access events for satellite systems.",
    createSql: `CREATE TABLE access_logs (
  log_id        TEXT PRIMARY KEY,
  satellite_id  TEXT NOT NULL,
  access_id     TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  timestamp     TEXT NOT NULL,
  result        TEXT NOT NULL,
  source_region TEXT NOT NULL
)`,
    columns: [
      { name: "log_id", type: "TEXT", description: "Primary key — unique log entry." },
      { name: "satellite_id", type: "TEXT", description: "Satellite accessed (maps to satellites.satellite_id)." },
      { name: "access_id", type: "TEXT", description: "Credential ID used (e.g. RUS-77A)." },
      { name: "event_type", type: "TEXT", description: "Type of access event (AUTH_REQUEST, AUTH_SUCCESS, CHANNEL_CHANGE, etc.)." },
      { name: "timestamp", type: "TEXT", description: "When the event occurred (UTC)." },
      { name: "result", type: "TEXT", description: "Outcome (SUCCESS, DENIED, etc.)." },
      { name: "source_region", type: "TEXT", description: "Geographic region of the access attempt." },
    ],
  },
  {
    name: "credentials",
    description: "Credential registry — who owns which access IDs.",
    createSql: `CREATE TABLE credentials (
  credential_id TEXT PRIMARY KEY,
  access_id     TEXT NOT NULL,
  owner_id      TEXT NOT NULL,
  issued_at     TEXT NOT NULL,
  expires_at    TEXT NOT NULL,
  status        TEXT NOT NULL
)`,
    columns: [
      { name: "credential_id", type: "TEXT", description: "Primary key — unique credential record." },
      { name: "access_id", type: "TEXT", description: "The access identifier (e.g. RUS-77A)." },
      { name: "owner_id", type: "TEXT", description: "Agent who owns this credential (maps to agents.agent_id)." },
      { name: "issued_at", type: "TEXT", description: "When the credential was issued." },
      { name: "expires_at", type: "TEXT", description: "When the credential expires." },
      { name: "status", type: "TEXT", description: "Credential status (ACTIVE, REVOKED, EXPIRED)." },
    ],
  },
  {
    name: "communications",
    description: "Intercepted communications between agents.",
    createSql: `CREATE TABLE communications (
  message_id    TEXT PRIMARY KEY,
  sender_id     TEXT NOT NULL,
  receiver_id   TEXT NOT NULL,
  timestamp     TEXT NOT NULL,
  channel       TEXT NOT NULL,
  classification TEXT NOT NULL,
  message_hash  TEXT NOT NULL
)`,
    columns: [
      { name: "message_id", type: "TEXT", description: "Primary key — unique message identifier." },
      { name: "sender_id", type: "TEXT", description: "Sender agent ID (maps to agents.agent_id)." },
      { name: "receiver_id", type: "TEXT", description: "Receiver agent ID." },
      { name: "timestamp", type: "TEXT", description: "When the message was sent (UTC)." },
      { name: "channel", type: "TEXT", description: "Communication channel used." },
      { name: "classification", type: "TEXT", description: "Message classification level." },
      { name: "message_hash", type: "TEXT", description: "Hash of message content (may contain references)." },
    ],
  },
  {
    name: "locations",
    description: "Known locations relevant to the investigation.",
    createSql: `CREATE TABLE locations (
  location_id TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  latitude    REAL NOT NULL,
  longitude   REAL NOT NULL
)`,
    columns: [
      { name: "location_id", type: "TEXT", description: "Primary key — unique location identifier." },
      { name: "name", type: "TEXT", description: "Location name." },
      { name: "country", type: "TEXT", description: "Country where the location is." },
      { name: "latitude", type: "REAL", description: "Latitude coordinate." },
      { name: "longitude", type: "REAL", description: "Longitude coordinate." },
    ],
  },
  {
    name: "agent_movements",
    description: "Movement records showing where agents were during the incident.",
    createSql: `CREATE TABLE agent_movements (
  movement_id  TEXT PRIMARY KEY,
  agent_id     TEXT NOT NULL,
  location_id  TEXT NOT NULL,
  arrived_at   TEXT NOT NULL,
  departed_at  TEXT,
  method       TEXT NOT NULL
)`,
    columns: [
      { name: "movement_id", type: "TEXT", description: "Primary key — unique movement record." },
      { name: "agent_id", type: "TEXT", description: "Agent who moved (maps to agents.agent_id)." },
      { name: "location_id", type: "TEXT", description: "Location visited (maps to locations.location_id)." },
      { name: "arrived_at", type: "TEXT", description: "Arrival timestamp (UTC)." },
      { name: "departed_at", type: "TEXT", description: "Departure timestamp (UTC). NULL if still present." },
      { name: "method", type: "TEXT", description: "Method of arrival (GROUND, AIR, RAIL, etc.)." },
    ],
  },
  {
    name: "financial_records",
    description: "Financial transactions involving agents. Contains reference TR-914.",
    createSql: `CREATE TABLE financial_records (
  transaction_id TEXT PRIMARY KEY,
  agent_id       TEXT NOT NULL,
  amount         REAL NOT NULL,
  currency       TEXT NOT NULL,
  timestamp      TEXT NOT NULL,
  description    TEXT NOT NULL,
  reference_code TEXT
)`,
    columns: [
      { name: "transaction_id", type: "TEXT", description: "Primary key — unique transaction." },
      { name: "agent_id", type: "TEXT", description: "Agent associated with the transaction." },
      { name: "amount", type: "REAL", description: "Transaction amount." },
      { name: "currency", type: "TEXT", description: "Currency code (USD, EUR, RUB, etc.)." },
      { name: "timestamp", type: "TEXT", description: "When the transaction occurred." },
      { name: "description", type: "TEXT", description: "Transaction description." },
      { name: "reference_code", type: "TEXT", description: "Optional reference code (e.g. TR-914). NULL when untagged." },
    ],
  },
  {
    name: "mission_records",
    description: "Mission assignments for agents.",
    createSql: `CREATE TABLE mission_records (
  mission_id   TEXT PRIMARY KEY,
  agent_id     TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  start_time   TEXT NOT NULL,
  end_time     TEXT,
  status       TEXT NOT NULL
)`,
    columns: [
      { name: "mission_id", type: "TEXT", description: "Primary key — unique mission." },
      { name: "agent_id", type: "TEXT", description: "Assigned agent." },
      { name: "mission_name", type: "TEXT", description: "Mission codename." },
      { name: "start_time", type: "TEXT", description: "Mission start time (UTC)." },
      { name: "end_time", type: "TEXT", description: "Mission end time. NULL if ongoing." },
      { name: "status", type: "TEXT", description: "Mission status (ACTIVE, COMPLETED, ABORTED)." },
    ],
  },
  {
    name: "satellite_events",
    description: "Satellite telemetry events showing what happened to KOSMOS-9147.",
    createSql: `CREATE TABLE satellite_events (
  event_id     TEXT PRIMARY KEY,
  satellite_id TEXT NOT NULL,
  event_type   TEXT NOT NULL,
  timestamp    TEXT NOT NULL,
  severity     TEXT NOT NULL,
  event_code   TEXT NOT NULL
)`,
    columns: [
      { name: "event_id", type: "TEXT", description: "Primary key — unique event." },
      { name: "satellite_id", type: "TEXT", description: "Satellite that generated the event." },
      { name: "event_type", type: "TEXT", description: "Type of telemetry event (TELEMETRY_LOSS, CHANNEL_CHANGE, SIGNAL_ANOMALY, etc.)." },
      { name: "timestamp", type: "TEXT", description: "When the event occurred (UTC)." },
      { name: "severity", type: "TEXT", description: "Event severity (INFO, WARNING, CRITICAL)." },
      { name: "event_code", type: "TEXT", description: "System event code." },
    ],
  },
  {
    name: "identity_events",
    description: "Identity verification events — who claimed to be whom.",
    createSql: `CREATE TABLE identity_events (
  event_id           TEXT PRIMARY KEY,
  access_id          TEXT NOT NULL,
  claimed_identity   TEXT NOT NULL,
  verification_method TEXT NOT NULL,
  timestamp          TEXT NOT NULL,
  result             TEXT NOT NULL
)`,
    columns: [
      { name: "event_id", type: "TEXT", description: "Primary key — unique identity event." },
      { name: "access_id", type: "TEXT", description: "Access ID used (e.g. RUS-77A)." },
      { name: "claimed_identity", type: "TEXT", description: "The identity that was claimed." },
      { name: "verification_method", type: "TEXT", description: "How identity was verified (CERTIFICATE, BIOMETRIC, TOKEN)." },
      { name: "timestamp", type: "TEXT", description: "When the verification occurred (UTC)." },
      { name: "result", type: "TEXT", description: "Verification result (VERIFIED, FAILED, ANOMALY)." },
    ],
  },
];
