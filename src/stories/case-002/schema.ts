import type { TableSchemaDef } from "@/stories/types";

export const CASE_002_SCHEMA: TableSchemaDef[] = [
  {
    name: "passengers",
    description: "All passengers aboard the Maharaja Meridian.",
    createSql: `CREATE TABLE passengers (
  passenger_id  TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  age           INTEGER NOT NULL,
  booking_class TEXT NOT NULL,
  status        TEXT NOT NULL
)`,
    columns: [
      { name: "passenger_id", type: "TEXT", description: "Primary key — unique passenger ID." },
      { name: "name", type: "TEXT", description: "Full name." },
      { name: "age", type: "INTEGER", description: "Age." },
      { name: "booking_class", type: "TEXT", description: "Booking class (FIRST, EXECUTIVE, SUITE)." },
      { name: "status", type: "TEXT", description: "Status (ACTIVE, PERSON_OF_INTEREST, DECEASED)." },
    ],
  },
  {
    name: "tickets",
    description: "Ticket records with coach and cabin assignments.",
    createSql: `CREATE TABLE tickets (
  ticket_id      TEXT PRIMARY KEY,
  passenger_id   TEXT NOT NULL,
  coach          TEXT NOT NULL,
  cabin          TEXT NOT NULL,
  boarding_station TEXT NOT NULL,
  destination    TEXT NOT NULL,
  boarding_time  TEXT NOT NULL
)`,
    columns: [
      { name: "ticket_id", type: "TEXT", description: "Primary key — unique ticket ID." },
      { name: "passenger_id", type: "TEXT", description: "Passenger (maps to passengers.passenger_id)." },
      { name: "coach", type: "TEXT", description: "Coach letter (A, B, C)." },
      { name: "cabin", type: "TEXT", description: "Cabin number (e.g. A-17)." },
      { name: "boarding_station", type: "TEXT", description: "Boarding station." },
      { name: "destination", type: "TEXT", description: "Destination station." },
      { name: "boarding_time", type: "TEXT", description: "Boarding time." },
    ],
  },
  {
    name: "cabin_assignments",
    description: "Cabin access assignments and access levels.",
    createSql: `CREATE TABLE cabin_assignments (
  cabin_id      TEXT PRIMARY KEY,
  passenger_id  TEXT NOT NULL,
  assigned_from TEXT NOT NULL,
  assigned_to   TEXT,
  access_level  TEXT NOT NULL
)`,
    columns: [
      { name: "cabin_id", type: "TEXT", description: "Cabin identifier (e.g. A-17)." },
      { name: "passenger_id", type: "TEXT", description: "Assigned passenger." },
      { name: "assigned_from", type: "TEXT", description: "Assignment start time." },
      { name: "assigned_to", type: "TEXT", description: "Assignment end time (NULL if ongoing)." },
      { name: "access_level", type: "TEXT", description: "Access level (GUEST, STAFF, SECURITY, VIP)." },
    ],
  },
  {
    name: "dining_transactions",
    description: "Dining car transactions for all passengers.",
    createSql: `CREATE TABLE dining_transactions (
  transaction_id TEXT PRIMARY KEY,
  passenger_id   TEXT NOT NULL,
  timestamp     TEXT NOT NULL,
  location       TEXT NOT NULL,
  amount         REAL NOT NULL,
  item           TEXT NOT NULL
)`,
    columns: [
      { name: "transaction_id", type: "TEXT", description: "Primary key — unique transaction." },
      { name: "passenger_id", type: "TEXT", description: "Passenger who made the purchase." },
      { name: "timestamp", type: "TEXT", description: "Transaction time." },
      { name: "location", type: "TEXT", description: "Dining location (Dining Car, Bar Car, Service Corridor)." },
      { name: "amount", type: "REAL", description: "Amount spent." },
      { name: "item", type: "TEXT", description: "Item purchased." },
    ],
  },
  {
    name: "station_logs",
    description: "Passenger station-related events (boarding, alerts, exits).",
    createSql: `CREATE TABLE station_logs (
  log_id        TEXT PRIMARY KEY,
  passenger_id  TEXT NOT NULL,
  station       TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  timestamp     TEXT NOT NULL
)`,
    columns: [
      { name: "log_id", type: "TEXT", description: "Primary key." },
      { name: "passenger_id", type: "TEXT", description: "Passenger involved." },
      { name: "station", type: "TEXT", description: "Station or location name." },
      { name: "event_type", type: "TEXT", description: "Event type (BOARDING, ALERT, DEPARTURE, MOVEMENT)." },
      { name: "timestamp", type: "TEXT", description: "Event time." },
    ],
  },
  {
    name: "cctv_metadata",
    description: "CCTV camera metadata — what cameras recorded and when.",
    createSql: `CREATE TABLE cctv_metadata (
  record_id   TEXT PRIMARY KEY,
  camera_id   TEXT NOT NULL,
  timestamp   TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  subject_id  TEXT,
  confidence  REAL NOT NULL
)`,
    columns: [
      { name: "record_id", type: "TEXT", description: "Primary key." },
      { name: "camera_id", type: "TEXT", description: "Camera identifier (e.g. CAM-A-CORRIDOR)." },
      { name: "timestamp", type: "TEXT", description: "Recording timestamp." },
      { name: "event_type", type: "TEXT", description: "Event type (MOTION, LOW_LIGHT, NO_MOTION, OVERRIDE)." },
      { name: "subject_id", type: "TEXT", description: "Subject detected (NULL if none)." },
      { name: "confidence", type: "REAL", description: "Detection confidence (0.0–1.0)." },
    ],
  },
  {
    name: "train_sensors",
    description: "Train telemetry sensor readings.",
    createSql: `CREATE TABLE train_sensors (
  sensor_id  TEXT PRIMARY KEY,
  timestamp  TEXT NOT NULL,
  sensor     TEXT NOT NULL,
  value      TEXT NOT NULL,
  carriage   TEXT NOT NULL,
  source     TEXT NOT NULL
)`,
    columns: [
      { name: "sensor_id", type: "TEXT", description: "Primary key." },
      { name: "timestamp", type: "TEXT", description: "Reading time." },
      { name: "sensor", type: "TEXT", description: "Sensor name (PRESSURE, TEMPERATURE, VIBRATION, ACTUATOR_STATE)." },
      { name: "value", type: "TEXT", description: "Sensor reading." },
      { name: "carriage", type: "TEXT", description: "Carriage/coach (A, B, C, ENGINE)." },
      { name: "source", type: "TEXT", description: "Source system (AUTOMATIC, MANUAL, MAINTENANCE)." },
    ],
  },
  {
    name: "maintenance_logs",
    description: "Train maintenance action records.",
    createSql: `CREATE TABLE maintenance_logs (
  log_id       TEXT PRIMARY KEY,
  timestamp    TEXT NOT NULL,
  engineer_id  TEXT NOT NULL,
  component    TEXT NOT NULL,
  action       TEXT NOT NULL,
  carriage     TEXT NOT NULL
)`,
    columns: [
      { name: "log_id", type: "TEXT", description: "Primary key." },
      { name: "timestamp", type: "TEXT", description: "Action time." },
      { name: "engineer_id", type: "TEXT", description: "Engineer who performed the action (maps to passengers.passenger_id)." },
      { name: "component", type: "TEXT", description: "Component affected (ACTUATOR, CAMERA, SENSOR, PANEL)." },
      { name: "action", type: "TEXT", description: "Action performed (INSPECT, CALIBRATE, ADJUST, REPLACE, STATE_CHANGE)." },
      { name: "carriage", type: "TEXT", description: "Carriage affected." },
    ],
  },
  {
    name: "access_logs",
    description: "Cabin door access attempts and results.",
    createSql: `CREATE TABLE access_logs (
  log_id         TEXT PRIMARY KEY,
  timestamp      TEXT NOT NULL,
  credential_id  TEXT NOT NULL,
  cabin_id       TEXT NOT NULL,
  action         TEXT NOT NULL,
  result         TEXT NOT NULL
)`,
    columns: [
      { name: "log_id", type: "TEXT", description: "Primary key." },
      { name: "timestamp", type: "TEXT", description: "Access attempt time." },
      { name: "credential_id", type: "TEXT", description: "Credential/badge used." },
      { name: "cabin_id", type: "TEXT", description: "Cabin accessed (e.g. A-17)." },
      { name: "action", type: "TEXT", description: "Action (UNLOCK, LOCK, OVERRIDE, QUERY)." },
      { name: "result", type: "TEXT", description: "Result (SUCCESS, DENIED, LOGGED)." },
    ],
  },
  {
    name: "medical_report",
    description: "Forensic medical report for the victim.",
    createSql: `CREATE TABLE medical_report (
  report_id          TEXT PRIMARY KEY,
  victim_id          TEXT NOT NULL,
  estimated_window   TEXT NOT NULL,
  cause              TEXT NOT NULL,
  wound_description  TEXT NOT NULL
)`,
    columns: [
      { name: "report_id", type: "TEXT", description: "Primary key." },
      { name: "victim_id", type: "TEXT", description: "Victim passenger ID." },
      { name: "estimated_window", type: "TEXT", description: "Estimated time of death window." },
      { name: "cause", type: "TEXT", description: "Cause of death." },
      { name: "wound_description", type: "TEXT", description: "Wound description." },
    ],
  },
];
