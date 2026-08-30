/**
 * Seed script for the SQL Murder Mystery investigation database.
 * CASE #001 — THE MIDNIGHT ARCHIVE
 *
 * Solution: Maya Chen (CFO) killed Elias Voss.
 *   - Motive: Elias discovered her embezzlement scheme tagged with reference TR-4817
 *     (many small fraudulent payments to shell vendors aggregating to ~$340k).
 *   - Means: She secretly returned to Nexora after supposedly leaving at 21:00,
 *     and entered the Archive during the time of death (22:40–22:55).
 *   - Accomplice: Daniel Brooks (Head of Security) disabled the Archive camera
 *     and wiped the terminal afterwards — coordinated via calls/messages with Maya.
 *   - Cover-up: Elias's phone was taken; his workstation was wiped.
 *
 * Run with: node --experimental-strip-types scripts/seed-investigation.ts
 *
 * Uses sql.js (pure WASM SQLite) to write the database file — no native deps.
 */
import initSqlJs, { type Database } from "sql.js";
import { mkdirSync, existsSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, "..", "db");
const DB_PATH = path.join(DB_DIR, "investigation.db");

mkdirSync(DB_DIR, { recursive: true });
if (existsSync(DB_PATH)) rmSync(DB_PATH);

const SQL = await initSqlJs({
  locateFile: (f: string) => path.join(__dirname, "..", "node_modules", "sql.js", "dist", f),
});
const db = new SQL.Database();

// ---------- SCHEMA ----------
db.exec(`
CREATE TABLE suspects (
  suspect_id    TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  department    TEXT NOT NULL,
  hire_date     TEXT NOT NULL,
  status        TEXT NOT NULL,
  badge_id      TEXT NOT NULL,
  phone         TEXT NOT NULL,
  alibi         TEXT NOT NULL,
  notes         TEXT NOT NULL
);

CREATE TABLE employees (
  employee_id   TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  department    TEXT NOT NULL,
  hire_date     TEXT NOT NULL,
  status        TEXT NOT NULL,
  badge_id      TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL
);

CREATE TABLE locations (
  location_id   TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  floor         TEXT NOT NULL,
  description   TEXT NOT NULL,
  access_level  TEXT NOT NULL,
  has_camera    INTEGER NOT NULL,
  camera_id     TEXT
);

CREATE TABLE visits (
  visit_id      TEXT PRIMARY KEY,
  person_id     TEXT NOT NULL,
  person_name   TEXT NOT NULL,
  location_id   TEXT NOT NULL,
  location_name TEXT NOT NULL,
  entry_time    TEXT NOT NULL,
  exit_time     TEXT,
  access_method TEXT NOT NULL,
  badge_id      TEXT
);

CREATE TABLE calls (
  call_id       TEXT PRIMARY KEY,
  caller_id     TEXT NOT NULL,
  caller_name   TEXT NOT NULL,
  receiver_id   TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  call_time     TEXT NOT NULL,
  duration_sec  INTEGER NOT NULL,
  status        TEXT NOT NULL,
  carrier       TEXT NOT NULL
);

CREATE TABLE transactions (
  transaction_id   TEXT PRIMARY KEY,
  account_holder   TEXT NOT NULL,
  person_id        TEXT NOT NULL,
  amount           REAL NOT NULL,
  currency         TEXT NOT NULL,
  direction        TEXT NOT NULL,
  counterparty     TEXT NOT NULL,
  transaction_time TEXT NOT NULL,
  description      TEXT NOT NULL,
  reference        TEXT,
  suspicious       INTEGER NOT NULL
);

CREATE TABLE messages (
  message_id    TEXT PRIMARY KEY,
  sender_id     TEXT NOT NULL,
  sender_name   TEXT NOT NULL,
  receiver_id   TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  sent_time     TEXT NOT NULL,
  content       TEXT NOT NULL,
  message_type  TEXT NOT NULL,
  read_status   TEXT NOT NULL
);

CREATE TABLE security_logs (
  log_id        TEXT PRIMARY KEY,
  timestamp     TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  location_id   TEXT NOT NULL,
  location_name TEXT NOT NULL,
  person_id     TEXT NOT NULL,
  actor_name    TEXT NOT NULL,
  details       TEXT NOT NULL,
  severity      TEXT NOT NULL
);

CREATE TABLE evidence (
  evidence_id   TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  location_found TEXT NOT NULL,
  found_time    TEXT NOT NULL,
  category      TEXT NOT NULL,
  significance   TEXT NOT NULL,
  related_suspect TEXT,
  related_person_id TEXT
);
`);

// ---------- DATA ----------
// Helper: bulk-insert rows into a table using positional ? placeholders.
function insertRows(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const placeholders = cols.map(() => "?").join(",");
  const sql = `INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`;
  const stmt = db.prepare(sql);
  for (const row of rows) {
    stmt.run(cols.map((c) => row[c] ?? null));
    stmt.reset();
  }
  stmt.free();
}

// Persons of interest. Maya is the killer. Daniel is the accomplice.
const suspects = [
  {
    suspect_id: "S001", name: "Maya Chen", role: "Chief Financial Officer", department: "Finance",
    hire_date: "2017-04-12", status: "Person of Interest", badge_id: "MC-4471", phone: "+1-415-555-0142",
    alibi: "States she left the Nexora building at 21:00 and drove home. Claims to have been home alone the rest of the evening reviewing quarterly reports.",
    notes: "CFO with signatory authority over vendor payments. Recently came under pressure from Elias regarding a vendor ledger audit. Separation negotiations were underway."
  },
  {
    suspect_id: "S002", name: "Daniel Brooks", role: "Head of Security", department: "Security",
    hire_date: "2015-09-03", status: "Person of Interest", badge_id: "DB-2208", phone: "+1-415-555-0177",
    alibi: "On duty the entire evening. Claims he was in the Security Control Room monitoring feeds and conducting a routine perimeter sweep between 22:30 and 23:00.",
    notes: "Unrestricted access to all locations including the Archive. Authorized to disable cameras for maintenance. Personal relationship with Maya Chen (undisclosed)."
  },
  {
    suspect_id: "S003", name: "Sofia Martinez", role: "Senior Software Engineer", department: "Engineering",
    hire_date: "2019-02-18", status: "Person of Interest", badge_id: "SM-3390", phone: "+1-415-555-0188",
    alibi: "Badge records show her on Floor 3 (Engineering Lab) from 19:00 to 23:20. Claims she was debugging the deployment pipeline and never went below Floor 1.",
    notes: "Holds remote administrative access to Nexora servers. Denied a promotion to Staff Engineer two weeks prior. No documented financial motive."
  },
  {
    suspect_id: "S004", name: "Ryan Cole", role: "Operations Manager", department: "Operations",
    hire_date: "2018-06-22", status: "Person of Interest", badge_id: "RC-5512", phone: "+1-415-555-0193",
    alibi: "Was inside the building until 23:47. States he discovered the body during a final perimeter walk. No corroborating witness.",
    notes: "Holds Archive access for facility inspections. Filed a complaint against Elias Voss regarding unsafe staffing levels. Reported the death to emergency services at 23:52."
  },
];
insertRows("suspects", suspects);

// Broader employees (victim + non-suspects).

const employees = [
  { employee_id: "EMP-001", name: "Elias Voss", role: "Founder & CEO", department: "Executive", hire_date: "2009-01-05", status: "Deceased", badge_id: "EV-0010", phone: "+1-415-555-0100", email: "elias.voss@nexora.sys" },
  { employee_id: "EMP-002", name: "Maya Chen", role: "Chief Financial Officer", department: "Finance", hire_date: "2017-04-12", status: "Active", badge_id: "MC-4471", phone: "+1-415-555-0142", email: "maya.chen@nexora.sys" },
  { employee_id: "EMP-003", name: "Daniel Brooks", role: "Head of Security", department: "Security", hire_date: "2015-09-03", status: "Active", badge_id: "DB-2208", phone: "+1-415-555-0177", email: "daniel.brooks@nexora.sys" },
  { employee_id: "EMP-004", name: "Sofia Martinez", role: "Senior Software Engineer", department: "Engineering", hire_date: "2019-02-18", status: "Active", badge_id: "SM-3390", phone: "+1-415-555-0188", email: "sofia.martinez@nexora.sys" },
  { employee_id: "EMP-005", name: "Ryan Cole", role: "Operations Manager", department: "Operations", hire_date: "2018-06-22", status: "Active", badge_id: "RC-5512", phone: "+1-415-555-0193", email: "ryan.cole@nexora.sys" },
  { employee_id: "EMP-006", name: "Priya Nair", role: "Lead Auditor", department: "Finance", hire_date: "2020-03-09", status: "Active", badge_id: "PN-6620", phone: "+1-415-555-0211", email: "priya.nair@nexora.sys" },
  { employee_id: "EMP-007", name: "Marcus Webb", role: "Security Officer", department: "Security", hire_date: "2021-07-15", status: "Active", badge_id: "MW-7781", phone: "+1-415-555-0233", email: "marcus.webb@nexora.sys" },
  { employee_id: "EMP-008", name: "Lena Hart", role: "Archive Librarian", department: "Operations", hire_date: "2016-11-30", status: "On Leave", badge_id: "LH-8890", phone: "+1-415-555-0244", email: "lena.hart@nexora.sys" },
  { employee_id: "EMP-009", name: "Tomas Reyes", role: "Junior Developer", department: "Engineering", hire_date: "2023-01-16", status: "Active", badge_id: "TR-9901", phone: "+1-415-555-0255", email: "tomas.reyes@nexora.sys" },
  { employee_id: "EMP-010", name: "Anika Desai", role: "HR Director", department: "Human Resources", hire_date: "2018-02-01", status: "Active", badge_id: "AD-1023", phone: "+1-415-555-0266", email: "anika.desai@nexora.sys" },
  { employee_id: "EMP-011", name: "Victor Sato", role: "Facilities Technician", department: "Operations", hire_date: "2022-05-10", status: "Active", badge_id: "VS-3344", phone: "+1-415-555-0277", email: "victor.sato@nexora.sys" },
  { employee_id: "EMP-012", name: "Helen Park", role: "Legal Counsel", department: "Legal", hire_date: "2019-09-23", status: "Active", badge_id: "HP-4456", phone: "+1-415-555-0288", email: "helen.park@nexora.sys" },
  { employee_id: "EMP-013", name: "Nadia Kim", role: "Vendor Accounts Analyst", department: "Finance", hire_date: "2021-10-04", status: "Active", badge_id: "NK-5567", phone: "+1-415-555-0299", email: "nadia.kim@nexora.sys" },
];
insertRows("employees", employees);

// Locations

const locations = [
  { location_id: "LOC-01", name: "Lobby", floor: "1", description: "Main entrance and reception.", access_level: "PUBLIC", has_camera: 1, camera_id: "CAM-01" },
  { location_id: "LOC-02", name: "Executive Office", floor: "12", description: "CEO and executive suites.", access_level: "EXECUTIVE", has_camera: 1, camera_id: "CAM-02" },
  { location_id: "LOC-03", name: "Engineering Lab", floor: "3", description: "Development servers and workstations.", access_level: "STAFF", has_camera: 1, camera_id: "CAM-03" },
  { location_id: "LOC-04", name: "Archive", floor: "B2", description: "Private document and prototype archive. Restricted access.", access_level: "RESTRICTED", has_camera: 1, camera_id: "CAM-04" },
  { location_id: "LOC-05", name: "Server Room", floor: "B2", description: "Primary data center.", access_level: "RESTRICTED", has_camera: 1, camera_id: "CAM-05" },
  { location_id: "LOC-06", name: "Security Control Room", floor: "1", description: "Monitoring station for all cameras and access logs.", access_level: "SECURITY", has_camera: 1, camera_id: "CAM-06" },
  { location_id: "LOC-07", name: "Finance Office", floor: "4", description: "Accounting and treasury.", access_level: "STAFF", has_camera: 1, camera_id: "CAM-07" },
  { location_id: "LOC-08", name: "Parking Garage", floor: "B1", description: "Employee parking.", access_level: "PUBLIC", has_camera: 1, camera_id: "CAM-08" },
  { location_id: "LOC-09", name: "Rooftop Terrace", floor: "R", description: "Executive rooftop access.", access_level: "EXECUTIVE", has_camera: 1, camera_id: "CAM-09" },
  { location_id: "LOC-10", name: "Loading Bay", floor: "1", description: "Deliveries and freight.", access_level: "STAFF", has_camera: 1, camera_id: "CAM-10" },
  { location_id: "LOC-11", name: "Side Entrance", floor: "1", description: "Staff side entrance on the east wing. Card-only, no guard after 20:00.", access_level: "STAFF", has_camera: 1, camera_id: "CAM-11" },
];
insertRows("locations", locations);

const T = (h, m, s = 0) => `2025-03-14 ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

// ---------- MOVEMENT THREAD ----------
// Maya supposedly left at 21:00 but secretly RETURNED via the side entrance at 22:18.
// This is the central movement contradiction.

const visits = [
  // Elias Voss — the victim
  { visit_id: "V-1001", person_id: "EMP-001", person_name: "Elias Voss", location_id: "LOC-01", location_name: "Lobby", entry_time: T(18, 12), exit_time: T(18, 14), access_method: "BADGE", badge_id: "EV-0010" },
  { visit_id: "V-1002", person_id: "EMP-001", person_name: "Elias Voss", location_id: "LOC-02", location_name: "Executive Office", entry_time: T(18, 15), exit_time: T(22, 33), access_method: "BADGE", badge_id: "EV-0010" },
  { visit_id: "V-1003", person_id: "EMP-001", person_name: "Elias Voss", location_id: "LOC-04", location_name: "Archive", entry_time: T(22, 35), exit_time: null, access_method: "BADGE", badge_id: "EV-0010" },

  // Maya Chen — supposedly left at 21:00, but RETURNED at 22:18 and entered the Archive at 22:41
  { visit_id: "V-2001", person_id: "EMP-002", person_name: "Maya Chen", location_id: "LOC-01", location_name: "Lobby", entry_time: T(16, 40), exit_time: T(16, 42), access_method: "BADGE", badge_id: "MC-4471" },
  { visit_id: "V-2002", person_id: "EMP-002", person_name: "Maya Chen", location_id: "LOC-07", location_name: "Finance Office", entry_time: T(16, 45), exit_time: T(20, 55), access_method: "BADGE", badge_id: "MC-4471" },
  { visit_id: "V-2003", person_id: "EMP-002", person_name: "Maya Chen", location_id: "LOC-01", location_name: "Lobby", entry_time: T(20, 57), exit_time: T(21, 0), access_method: "BADGE", badge_id: "MC-4471" },
  { visit_id: "V-2004", person_id: "EMP-002", person_name: "Maya Chen", location_id: "LOC-08", location_name: "Parking Garage", entry_time: T(21, 2), exit_time: T(21, 5), access_method: "BADGE", badge_id: "MC-4471" },
  // *** THE CONTRADICTION *** — Maya re-enters via the unguarded Side Entrance at 22:18
  { visit_id: "V-2005", person_id: "EMP-002", person_name: "Maya Chen", location_id: "LOC-11", location_name: "Side Entrance", entry_time: T(22, 18), exit_time: T(22, 19), access_method: "BADGE", badge_id: "MC-4471" },
  // *** MAYA ENTERS THE ARCHIVE during the time-of-death window ***
  { visit_id: "V-2006", person_id: "EMP-002", person_name: "Maya Chen", location_id: "LOC-04", location_name: "Archive", entry_time: T(22, 41), exit_time: T(22, 54), access_method: "BADGE", badge_id: "MC-4471" },
  // Maya leaves the building again at 22:58
  { visit_id: "V-2007", person_id: "EMP-002", person_name: "Maya Chen", location_id: "LOC-11", location_name: "Side Entrance", entry_time: T(22, 56), exit_time: T(22, 58), access_method: "BADGE", badge_id: "MC-4471" },

  // Daniel Brooks — accomplice, in the Security Control Room, leaves briefly (cover)
  { visit_id: "V-3001", person_id: "EMP-003", person_name: "Daniel Brooks", location_id: "LOC-06", location_name: "Security Control Room", entry_time: T(17, 30), exit_time: T(22, 27), access_method: "BADGE", badge_id: "DB-2208" },
  { visit_id: "V-3002", person_id: "EMP-003", person_name: "Daniel Brooks", location_id: "LOC-01", location_name: "Lobby", entry_time: T(22, 28), exit_time: T(22, 30), access_method: "BADGE", badge_id: "DB-2208" },
  // Daniel briefly visits the corridor near the archive (he does NOT enter the Archive itself)
  { visit_id: "V-3003", person_id: "EMP-003", person_name: "Daniel Brooks", location_id: "LOC-06", location_name: "Security Control Room", entry_time: T(23, 2), exit_time: T(23, 45), access_method: "BADGE", badge_id: "DB-2208" },

  // Sofia Martinez — red herring, on floor 3
  { visit_id: "V-4001", person_id: "EMP-004", person_name: "Sofia Martinez", location_id: "LOC-01", location_name: "Lobby", entry_time: T(19, 0), exit_time: T(19, 2), access_method: "BADGE", badge_id: "SM-3390" },
  { visit_id: "V-4002", person_id: "EMP-004", person_name: "Sofia Martinez", location_id: "LOC-03", location_name: "Engineering Lab", entry_time: T(19, 5), exit_time: T(23, 20), access_method: "BADGE", badge_id: "SM-3390" },
  { visit_id: "V-4003", person_id: "EMP-004", person_name: "Sofia Martinez", location_id: "LOC-01", location_name: "Lobby", entry_time: T(23, 22), exit_time: T(23, 25), access_method: "BADGE", badge_id: "SM-3390" },

  // Ryan Cole — discovered the body
  { visit_id: "V-5001", person_id: "EMP-005", person_name: "Ryan Cole", location_id: "LOC-01", location_name: "Lobby", entry_time: T(15, 10), exit_time: T(15, 12), access_method: "BADGE", badge_id: "RC-5512" },
  { visit_id: "V-5002", person_id: "EMP-005", person_name: "Ryan Cole", location_id: "LOC-07", location_name: "Finance Office", entry_time: T(15, 14), exit_time: T(17, 0), access_method: "BADGE", badge_id: "RC-5512" },
  { visit_id: "V-5003", person_id: "EMP-005", person_name: "Ryan Cole", location_id: "LOC-10", location_name: "Loading Bay", entry_time: T(17, 5), exit_time: T(17, 30), access_method: "BADGE", badge_id: "RC-5512" },
  { visit_id: "V-5004", person_id: "EMP-005", person_name: "Ryan Cole", location_id: "LOC-01", location_name: "Lobby", entry_time: T(20, 30), exit_time: T(20, 32), access_method: "BADGE", badge_id: "RC-5512" },
  { visit_id: "V-5005", person_id: "EMP-005", person_name: "Ryan Cole", location_id: "LOC-04", location_name: "Archive", entry_time: T(23, 47), exit_time: T(23, 52), access_method: "BADGE", badge_id: "RC-5512" },

  // Other employees — noise
  { visit_id: "V-6001", person_id: "EMP-006", person_name: "Priya Nair", location_id: "LOC-07", location_name: "Finance Office", entry_time: T(9, 0), exit_time: T(17, 30), access_method: "BADGE", badge_id: "PN-6620" },
  { visit_id: "V-6002", person_id: "EMP-007", person_name: "Marcus Webb", location_id: "LOC-06", location_name: "Security Control Room", entry_time: T(8, 0), exit_time: T(16, 0), access_method: "BADGE", badge_id: "MW-7781" },
  { visit_id: "V-6003", person_id: "EMP-009", person_name: "Tomas Reyes", location_id: "LOC-03", location_name: "Engineering Lab", entry_time: T(10, 15), exit_time: T(18, 45), access_method: "BADGE", badge_id: "TR-9901" },
  { visit_id: "V-6004", person_id: "EMP-011", person_name: "Victor Sato", location_id: "LOC-10", location_name: "Loading Bay", entry_time: T(7, 30), exit_time: T(16, 0), access_method: "BADGE", badge_id: "VS-3344" },
  { visit_id: "V-6005", person_id: "EMP-013", person_name: "Nadia Kim", location_id: "LOC-07", location_name: "Finance Office", entry_time: T(8, 30), exit_time: T(16, 45), access_method: "BADGE", badge_id: "NK-5567" },
  { visit_id: "V-6006", person_id: "EMP-012", person_name: "Helen Park", location_id: "LOC-02", location_name: "Executive Office", entry_time: T(9, 30), exit_time: T(17, 15), access_method: "BADGE", badge_id: "HP-4456" },
];
insertRows("visits", visits);

// ---------- COMMUNICATION THREAD ----------

const calls = [
  // Elias calls Maya to arrange the archive meeting (confrontation)
  { call_id: "C-2001", caller_id: "EMP-001", caller_name: "Elias Voss", receiver_id: "EMP-002", receiver_name: "Maya Chen", call_time: T(20, 50), duration_sec: 142, status: "CONNECTED", carrier: "Nexora Internal PBX" },
  // Maya calls Daniel after learning Elias knows (coordination)
  { call_id: "C-2002", caller_id: "EMP-002", caller_name: "Maya Chen", receiver_id: "EMP-003", receiver_name: "Daniel Brooks", call_time: T(21, 12), duration_sec: 268, status: "CONNECTED", carrier: "Verizon Wireless" },
  // Second coordination call Maya -> Daniel, very brief, right before her return
  { call_id: "C-2003", caller_id: "EMP-002", caller_name: "Maya Chen", receiver_id: "EMP-003", receiver_name: "Daniel Brooks", call_time: T(22, 9), duration_sec: 41, status: "CONNECTED", carrier: "Verizon Wireless" },
  // Daniel calls Maya after the deed (confirming cover-up complete)
  { call_id: "C-2004", caller_id: "EMP-003", caller_name: "Daniel Brooks", receiver_id: "EMP-002", receiver_name: "Maya Chen", call_time: T(23, 10), duration_sec: 73, status: "CONNECTED", carrier: "Verizon Wireless" },
  // Ryan calls 911 to report body
  { call_id: "C-2005", caller_id: "EMP-005", caller_name: "Ryan Cole", receiver_id: "EXT-911", receiver_name: "Emergency Services", call_time: T(23, 52), duration_sec: 268, status: "CONNECTED", carrier: "Verizon Wireless" },
  // Maya calls her lawyer earlier that day (looks suspicious but is routine separation talk)
  { call_id: "C-2006", caller_id: "EMP-002", caller_name: "Maya Chen", receiver_id: "EXT-LAW", receiver_name: "External: J. Pratt (Attorney)", call_time: T(15, 22), duration_sec: 312, status: "CONNECTED", carrier: "Verizon Wireless" },
  // Sofia food delivery (red herring)
  { call_id: "C-2007", caller_id: "EMP-004", caller_name: "Sofia Martinez", receiver_id: "EXT-DEL", receiver_name: "External: Food Delivery", call_time: T(21, 30), duration_sec: 95, status: "CONNECTED", carrier: "T-Mobile" },
  // Routine calls
  { call_id: "C-2008", caller_id: "EMP-006", caller_name: "Priya Nair", receiver_id: "EMP-002", receiver_name: "Maya Chen", call_time: T(14, 20), duration_sec: 410, status: "CONNECTED", carrier: "Nexora Internal PBX" },
  { call_id: "C-2009", caller_id: "EMP-001", caller_name: "Elias Voss", receiver_id: "EMP-012", receiver_name: "Helen Park", call_time: T(16, 5), duration_sec: 150, status: "CONNECTED", carrier: "Nexora Internal PBX" },
  { call_id: "C-2010", caller_id: "EMP-005", caller_name: "Ryan Cole", receiver_id: "EMP-011", receiver_name: "Victor Sato", call_time: T(11, 0), duration_sec: 64, status: "CONNECTED", carrier: "Nexora Internal PBX" },
  { call_id: "C-2011", caller_id: "EMP-004", caller_name: "Sofia Martinez", receiver_id: "EMP-009", receiver_name: "Tomas Reyes", call_time: T(13, 45), duration_sec: 220, status: "CONNECTED", carrier: "Nexora Internal PBX" },
  { call_id: "C-2012", caller_id: "EMP-013", caller_name: "Nadia Kim", receiver_id: "EMP-002", receiver_name: "Maya Chen", call_time: T(11, 30), duration_sec: 180, status: "CONNECTED", carrier: "Nexora Internal PBX" },
  { call_id: "C-2013", caller_id: "EMP-002", caller_name: "Maya Chen", receiver_id: "EXT-BNK", receiver_name: "External: Coastal Bank", call_time: T(13, 10), duration_sec: 540, status: "CONNECTED", carrier: "Verizon Wireless" },
  // Missed call to Elias from Maya (earlier, looks routine)
  { call_id: "C-2014", caller_id: "EMP-002", caller_name: "Maya Chen", receiver_id: "EMP-001", receiver_name: "Elias Voss", call_time: T(17, 50), duration_sec: 0, status: "MISSED", carrier: "Nexora Internal PBX" },
  // Elias to Priya (auditor) — pulling the vendor ledger
  { call_id: "C-2015", caller_id: "EMP-001", caller_name: "Elias Voss", receiver_id: "EMP-006", receiver_name: "Priya Nair", call_time: T(10, 5), duration_sec: 96, status: "CONNECTED", carrier: "Nexora Internal PBX" },
];
insertRows("calls", calls);

// ---------- FINANCIAL THREAD (TR-4817 mystery) ----------
// TR-4817 is a reference code that appears on MANY small transactions.
// Individually each looks like a normal vendor payment. Aggregated they reveal
// a large embezzlement by Maya Chen (and shell companies tied to her).

const transactions = [
  // *** TR-4817 — the fraudulent reference, spread across small payments over weeks ***
  // Outgoing vendor payments authorised by Maya, all tagged reference='TR-4817'
  { transaction_id: "TXN-10001", account_holder: "Nexora Systems", person_id: "EMP-002", amount: 4200, currency: "USD", direction: "OUTGOING", counterparty: "Meridian Consulting LLC", transaction_time: "2025-01-08 14:22:00", description: "Q1 advisory services - invoice MC-1188", reference: "TR-4817", suspicious: 0 },
  { transaction_id: "TXN-10002", account_holder: "Nexora Systems", person_id: "EMP-002", amount: 5800, currency: "USD", direction: "OUTGOING", counterparty: "Atlas Advisory Group", transaction_time: "2025-01-14 11:05:00", description: "Consulting retainer - invoice AA-204", reference: "TR-4817", suspicious: 0 },
  { transaction_id: "TXN-10003", account_holder: "Nexora Systems", person_id: "EMP-002", amount: 3750, currency: "USD", direction: "OUTGOING", counterparty: "Apex Partners", transaction_time: "2025-01-22 16:40:00", description: "Strategic review - invoice APX-5591", reference: "TR-4817", suspicious: 0 },
  { transaction_id: "TXN-10004", account_holder: "Nexora Systems", person_id: "EMP-002", amount: 6100, currency: "USD", direction: "OUTGOING", counterparty: "Cascade Holdings", transaction_time: "2025-02-03 09:18:00", description: "Advisory fee - invoice CH-7720", reference: "TR-4817", suspicious: 0 },
  { transaction_id: "TXN-10005", account_holder: "Nexora Systems", person_id: "EMP-002", amount: 4900, currency: "USD", direction: "OUTGOING", counterparty: "Meridian Consulting LLC", transaction_time: "2025-02-11 13:55:00", description: "Q1 retainer - invoice MC-1204", reference: "TR-4817", suspicious: 0 },
  { transaction_id: "TXN-10006", account_holder: "Nexora Systems", person_id: "EMP-002", amount: 7200, currency: "USD", direction: "OUTGOING", counterparty: "Brightline Strategy Co", transaction_time: "2025-02-19 10:30:00", description: "Consulting services - invoice BL-338", reference: "TR-4817", suspicious: 0 },
  { transaction_id: "TXN-10007", account_holder: "Nexora Systems", person_id: "EMP-002", amount: 5500, currency: "USD", direction: "OUTGOING", counterparty: "Atlas Advisory Group", transaction_time: "2025-02-27 15:12:00", description: "Advisory - invoice AA-261", reference: "TR-4817", suspicious: 0 },
  { transaction_id: "TXN-10008", account_holder: "Nexora Systems", person_id: "EMP-002", amount: 4600, currency: "USD", direction: "OUTGOING", counterparty: "Cascade Holdings", transaction_time: "2025-03-05 11:44:00", description: "Retainer - invoice CH-7891", reference: "TR-4817", suspicious: 0 },
  { transaction_id: "TXN-10009", account_holder: "Nexora Systems", person_id: "EMP-002", amount: 6300, currency: "USD", direction: "OUTGOING", counterparty: "Apex Partners", transaction_time: "2025-03-11 14:08:00", description: "Strategic review - invoice APX-5622", reference: "TR-4817", suspicious: 0 },
  // Kickbacks incoming to Maya's personal account from the SAME shell vendors (same reference)
  { transaction_id: "TXN-10010", account_holder: "Maya Chen", person_id: "EMP-002", amount: 1800, currency: "USD", direction: "INCOMING", counterparty: "Meridian Consulting LLC", transaction_time: "2025-01-09 03:14:00", description: "Personal consulting - offshore account #4471", reference: "TR-4817", suspicious: 1 },
  { transaction_id: "TXN-10011", account_holder: "Maya Chen", person_id: "EMP-002", amount: 2400, currency: "USD", direction: "INCOMING", counterparty: "Atlas Advisory Group", transaction_time: "2025-01-16 02:50:00", description: "Advisory fee - account #4471", reference: "TR-4817", suspicious: 1 },
  { transaction_id: "TXN-10012", account_holder: "Maya Chen", person_id: "EMP-002", amount: 3100, currency: "USD", direction: "INCOMING", counterparty: "Cascade Holdings", transaction_time: "2025-02-04 04:20:00", description: "Retainer - account #4471", reference: "TR-4817", suspicious: 1 },
  { transaction_id: "TXN-10013", account_holder: "Maya Chen", person_id: "EMP-002", amount: 2900, currency: "USD", direction: "INCOMING", counterparty: "Brightline Strategy Co", transaction_time: "2025-02-20 03:05:00", description: "Consulting - account #4471", reference: "TR-4817", suspicious: 1 },
  { transaction_id: "TXN-10014", account_holder: "Maya Chen", person_id: "EMP-002", amount: 2200, currency: "USD", direction: "INCOMING", counterparty: "Apex Partners", transaction_time: "2025-03-12 01:40:00", description: "Advisory - account #4471", reference: "TR-4817", suspicious: 1 },

  // Legitimate transactions with OTHER references (noise + to make TR-4817 non-obvious)
  { transaction_id: "TXN-20001", account_holder: "Elias Voss", person_id: "EMP-001", amount: 21000, currency: "USD", direction: "OUTGOING", counterparty: "Nexora Systems Payroll", transaction_time: "2025-03-01 09:00:00", description: "Salary reimbursement", reference: "TR-PAYROLL", suspicious: 0 },
  { transaction_id: "TXN-20002", account_holder: "Maya Chen", person_id: "EMP-002", amount: 95000, currency: "USD", direction: "INCOMING", counterparty: "Nexora Systems Payroll", transaction_time: "2025-03-12 09:00:00", description: "Annual bonus disbursement", reference: "TR-PAYROLL", suspicious: 0 },
  { transaction_id: "TXN-20003", account_holder: "Maya Chen", person_id: "EMP-002", amount: 7700, currency: "USD", direction: "OUTGOING", counterparty: "Coastal Realty", transaction_time: "2025-02-20 11:45:00", description: "Mortgage payment", reference: "TR-PERS", suspicious: 0 },
  { transaction_id: "TXN-20004", account_holder: "Maya Chen", person_id: "EMP-002", amount: 14000, currency: "USD", direction: "OUTGOING", counterparty: "Pratt & Associates Legal", transaction_time: "2025-03-13 16:20:00", description: "Legal consultation fee", reference: "TR-PERS", suspicious: 0 },
  { transaction_id: "TXN-20005", account_holder: "Sofia Martinez", person_id: "EMP-004", amount: 4200, currency: "USD", direction: "OUTGOING", counterparty: "TechGear Supplies", transaction_time: "2025-03-05 14:30:00", description: "Equipment purchase", reference: "TR-PERS", suspicious: 0 },
  { transaction_id: "TXN-20006", account_holder: "Ryan Cole", person_id: "EMP-005", amount: 1850, currency: "USD", direction: "OUTGOING", counterparty: "City Utilities", transaction_time: "2025-03-08 10:15:00", description: "Facilities utility payment", reference: "TR-PERS", suspicious: 0 },
  { transaction_id: "TXN-20007", account_holder: "Priya Nair", person_id: "EMP-006", amount: 5300, currency: "USD", direction: "INCOMING", counterparty: "Nexora Systems Payroll", transaction_time: "2025-03-01 09:00:00", description: "Audit completion bonus", reference: "TR-PAYROLL", suspicious: 0 },
  { transaction_id: "TXN-20008", account_holder: "Elias Voss", person_id: "EMP-001", amount: 1200000, currency: "USD", direction: "OUTGOING", counterparty: "Meridian Capital", transaction_time: "2025-03-11 13:00:00", description: "Acquisition escrow deposit", reference: "TR-ACQ-09", suspicious: 0 },
  { transaction_id: "TXN-20009", account_holder: "Daniel Brooks", person_id: "EMP-003", amount: 3300, currency: "USD", direction: "OUTGOING", counterparty: "SecureHome Monitoring", transaction_time: "2025-03-09 08:00:00", description: "Home security subscription", reference: "TR-PERS", suspicious: 0 },
  { transaction_id: "TXN-20010", account_holder: "Sofia Martinez", person_id: "EMP-004", amount: 1200, currency: "USD", direction: "OUTGOING", counterparty: "CloudSigma Hosting", transaction_time: "2025-03-07 09:30:00", description: "Personal hosting account", reference: "TR-PERS", suspicious: 0 },
  // Some legitimately-suspicious-flagged noise (red herrings)
  { transaction_id: "TXN-20011", account_holder: "Tomas Reyes", person_id: "EMP-009", amount: 9800, currency: "USD", direction: "INCOMING", counterparty: "Upwork Freelance", transaction_time: "2025-03-02 22:10:00", description: "Side project payment", reference: "TR-PERS", suspicious: 1 },
  { transaction_id: "TXN-20012", account_holder: "Victor Sato", person_id: "EMP-011", amount: 4500, currency: "USD", direction: "INCOMING", counterparty: "RefurbCo", transaction_time: "2025-02-25 19:00:00", description: "Surplus equipment resale", reference: "TR-PERS", suspicious: 1 },
  { transaction_id: "TXN-20013", account_holder: "Nadia Kim", person_id: "EMP-013", amount: 3200, currency: "USD", direction: "INCOMING", counterparty: "EduPro Tutoring", transaction_time: "2025-02-18 20:30:00", description: "Evening tutoring income", reference: "TR-PERS", suspicious: 1 },
  // A legitimate vendor payment that LOOKS like TR-4817 but is a different reference (TR-4820)
  { transaction_id: "TXN-20014", account_holder: "Nexora Systems", person_id: "EMP-013", amount: 8800, currency: "USD", direction: "OUTGOING", counterparty: "Northgate Logistics", transaction_time: "2025-02-14 12:00:00", description: "Logistics retainer - invoice NG-440", reference: "TR-4820", suspicious: 0 },
  { transaction_id: "TXN-20015", account_holder: "Nexora Systems", person_id: "EMP-013", amount: 8800, currency: "USD", direction: "OUTGOING", counterparty: "Northgate Logistics", transaction_time: "2025-03-14 12:00:00", description: "Logistics retainer - invoice NG-441", reference: "TR-4820", suspicious: 0 },
  { transaction_id: "TXN-20016", account_holder: "Nexora Systems", person_id: "EMP-013", amount: 11200, currency: "USD", direction: "OUTGOING", counterparty: "Harborview IT Services", transaction_time: "2025-02-22 10:30:00", description: "IT managed services - invoice HV-9912", reference: "TR-4821", suspicious: 0 },
  { transaction_id: "TXN-20017", account_holder: "Nexora Systems", person_id: "EMP-013", amount: 11200, currency: "USD", direction: "OUTGOING", counterparty: "Harborview IT Services", transaction_time: "2025-03-14 10:30:00", description: "IT managed services - invoice HV-9913", reference: "TR-4821", suspicious: 0 },
];
insertRows("transactions", transactions);

// ---------- MESSAGE THREAD ----------
// Fragments requiring interpretation. Never says "Maya will kill me."

const messages = [
  // Elias to Priya (auditor) — pulling the vendor ledger, mentions TR-4817
  { message_id: "M-3001", sender_id: "EMP-001", sender_name: "Elias Voss", receiver_id: "EMP-006", receiver_name: "Priya Nair", sent_time: T(10, 8), content: "Priya, pull every payment tagged with reference TR-4817 from the last 90 days. Vendor payments only. Don't flag the file in the system - run it off my terminal.", message_type: "EMAIL", read_status: "READ" },
  { message_id: "M-3002", sender_id: "EMP-006", sender_name: "Priya Nair", receiver_id: "EMP-001", receiver_name: "Elias Voss", sent_time: T(11, 35), content: "Pulled. Fourteen line items, all small, spread across five vendors. Total is sizeable. Authorising signatory on every one is the same person. Sending the file separately.", message_type: "EMAIL", read_status: "READ" },
  { message_id: "M-3003", sender_id: "EMP-001", sender_name: "Elias Voss", receiver_id: "EMP-006", receiver_name: "Priya Nair", sent_time: T(11, 52), content: "I see it. Don't speak to anyone about this. Not finance, not the board. Especially not her.", message_type: "EMAIL", read_status: "READ" },

  // Elias to Maya — arranging the archive meeting (confrontation setup, vague)
  { message_id: "M-3004", sender_id: "EMP-001", sender_name: "Elias Voss", receiver_id: "EMP-002", receiver_name: "Maya Chen", sent_time: T(20, 45), content: "Maya. I need to walk you through something in person. Tonight, 10:30, the Archive. Bring your badge. No need to loop in the auditors - I'd rather settle this between us first.", message_type: "EMAIL", read_status: "READ" },
  { message_id: "M-3005", sender_id: "EMP-002", sender_name: "Maya Chen", receiver_id: "EMP-001", receiver_name: "Elias Voss", sent_time: T(20, 48), content: "Of course. I'll be there. Should I bring the Q1 vendor file?", message_type: "EMAIL", read_status: "READ" },
  { message_id: "M-3006", sender_id: "EMP-001", sender_name: "Elias Voss", receiver_id: "EMP-002", receiver_name: "Maya Chen", sent_time: T(20, 49), content: "I have the file. Just be there.", message_type: "EMAIL", read_status: "READ" },

  // Maya to Daniel — coordination (vague, incriminating only in hindsight)
  { message_id: "M-3007", sender_id: "EMP-002", sender_name: "Maya Chen", receiver_id: "EMP-003", receiver_name: "Daniel Brooks", sent_time: T(21, 15), content: "He knows. He pulled the TR-4817 file. We're meeting at the Archive at 10:30. I need the room dark.", message_type: "SMS", read_status: "READ" },
  { message_id: "M-3008", sender_id: "EMP-003", sender_name: "Daniel Brooks", receiver_id: "EMP-002", receiver_name: "Maya Chen", sent_time: T(21, 18), content: "How dark.", message_type: "SMS", read_status: "READ" },
  { message_id: "M-3009", sender_id: "EMP-002", sender_name: "Maya Chen", receiver_id: "EMP-003", receiver_name: "Daniel Brooks", sent_time: T(21, 19), content: "CAM-04. Routine maintenance window. I'll handle the rest.", message_type: "SMS", read_status: "READ" },
  { message_id: "M-3010", sender_id: "EMP-002", sender_name: "Maya Chen", receiver_id: "EMP-003", receiver_name: "Daniel Brooks", sent_time: T(22, 9), content: "Coming back in. East side.", message_type: "SMS", read_status: "READ" },

  // Maya's separation/budget friction (red herrings, plausible alternate motive)
  { message_id: "M-3011", sender_id: "EMP-002", sender_name: "Maya Chen", receiver_id: "EMP-001", receiver_name: "Elias Voss", sent_time: T(17, 10), content: "Elias, blocking the Q2 infrastructure budget is going to force layoffs. This is a mistake and I won't have my name attached to it.", message_type: "EMAIL", read_status: "READ" },
  { message_id: "M-3012", sender_id: "EMP-001", sender_name: "Elias Voss", receiver_id: "EMP-002", receiver_name: "Maya Chen", sent_time: T(17, 25), content: "Maya, the numbers don't support the spend. We'll revisit in Q3. Please work with Anika on the separation terms if you still intend to resign.", message_type: "EMAIL", read_status: "READ" },

  // Sofia's frustration (red herring)
  { message_id: "M-3013", sender_id: "EMP-004", sender_name: "Sofia Martinez", receiver_id: "EMP-009", receiver_name: "Tomas Reyes", sent_time: T(20, 15), content: "Two years and they pass me over for Staff again. I'm done covering for this place.", message_type: "INTERNAL", read_status: "READ" },

  // Ryan's complaint (red herring)
  { message_id: "M-3014", sender_id: "EMP-005", sender_name: "Ryan Cole", receiver_id: "EMP-001", receiver_name: "Elias Voss", sent_time: T(11, 30), content: "Elias, the night shift is running on skeleton crew. This is unsafe. If something happens on my watch, that's on you.", message_type: "EMAIL", read_status: "READ" },

  // Routine
  { message_id: "M-3015", sender_id: "EMP-006", sender_name: "Priya Nair", receiver_id: "EMP-002", receiver_name: "Maya Chen", sent_time: T(14, 5), content: "Audit draft is ready for your review. Nothing material flagged in Q1.", message_type: "EMAIL", read_status: "READ" },
  { message_id: "M-3016", sender_id: "EMP-012", sender_name: "Helen Park", receiver_id: "EMP-001", receiver_name: "Elias Voss", sent_time: T(16, 30), content: "The Meridian Capital acquisition docs are signed and counter-filed. Escrow funded.", message_type: "EMAIL", read_status: "READ" },
  { message_id: "M-3017", sender_id: "EMP-007", sender_name: "Marcus Webb", receiver_id: "EMP-003", receiver_name: "Daniel Brooks", sent_time: T(15, 45), content: "Shift handover complete. Camera 4 had a flicker earlier, might want to check the feed routing.", message_type: "INTERNAL", read_status: "READ" },
  { message_id: "M-3018", sender_id: "EMP-011", sender_name: "Victor Sato", receiver_id: "EMP-005", receiver_name: "Ryan Cole", sent_time: T(13, 20), content: "Loading bay door 3 needs servicing. I'll lock it out tonight.", message_type: "INTERNAL", read_status: "READ" },
  // Daniel to Maya after the deed - vague confirmation
  { message_id: "M-3019", sender_id: "EMP-003", sender_name: "Daniel Brooks", receiver_id: "EMP-002", receiver_name: "Maya Chen", sent_time: T(23, 8), content: "Done. Drive safe.", message_type: "SMS", read_status: "READ" },
];
insertRows("messages", messages);

// ---------- SECURITY THREAD ----------
// Daniel (accomplice) disables CAM-04 at Maya's request.
// The terminal is wiped afterwards (by Maya, inside the archive).

const logs = [
  // THE KEY: camera disabled by Daniel at 22:30
  { log_id: "SL-9001", timestamp: T(22, 30, 12), event_type: "CAMERA_DISABLED", location_id: "LOC-04", location_name: "Archive", person_id: "EMP-003", actor_name: "Daniel Brooks", details: "Camera CAM-04 manually disabled from Security Control Room by admin user d.brooks. Reason logged: MAINTENANCE.", severity: "CRITICAL" },
  { log_id: "SL-9002", timestamp: T(22, 30, 14), event_type: "CAMERA_STATUS", location_id: "LOC-04", location_name: "Archive", person_id: "EMP-003", actor_name: "Daniel Brooks", details: "CAM-04 feed terminated. Recording halted.", severity: "WARNING" },

  // Door access events
  { log_id: "SL-9003", timestamp: T(22, 35, 5), event_type: "DOOR_ACCESS", location_id: "LOC-04", location_name: "Archive", person_id: "EMP-001", actor_name: "Elias Voss", details: "Badge EV-0010 granted access to Archive (RESTRICTED).", severity: "INFO" },
  // *** MAYA ENTERS THE ARCHIVE using her CFO badge (she has restricted access for finance vault) ***
  { log_id: "SL-9004", timestamp: T(22, 41, 9), event_type: "DOOR_ACCESS", location_id: "LOC-04", location_name: "Archive", person_id: "EMP-002", actor_name: "Maya Chen", details: "Badge MC-4471 granted access to Archive (RESTRICTED). Override: FINANCE_VAULT.", severity: "WARNING" },
  // *** TERMINAL WIPED — authenticated as Maya (she is inside the archive at this time) ***
  { log_id: "SL-9005", timestamp: T(22, 50, 41), event_type: "TERMINAL_WIPE", location_id: "LOC-04", location_name: "Archive", person_id: "EMP-002", actor_name: "Maya Chen", details: "Archive workstation ARC-TERM-02 issued full disk wipe command. Authenticated as m.chen from local console.", severity: "CRITICAL" },
  { log_id: "SL-9006", timestamp: T(22, 54, 7), event_type: "DOOR_EXIT", location_id: "LOC-04", location_name: "Archive", person_id: "EMP-002", actor_name: "Maya Chen", details: "Badge MC-4471 exited Archive.", severity: "INFO" },

  // Maya re-entered the building via the Side Entrance at 22:18
  { log_id: "SL-9007", timestamp: T(22, 18, 22), event_type: "DOOR_ACCESS", location_id: "LOC-11", location_name: "Side Entrance", person_id: "EMP-002", actor_name: "Maya Chen", details: "Badge MC-4471 granted access at Side Entrance (STAFF). No guard on duty.", severity: "INFO" },
  { log_id: "SL-9008", timestamp: T(22, 58, 3), event_type: "DOOR_EXIT", location_id: "LOC-11", location_name: "Side Entrance", person_id: "EMP-002", actor_name: "Maya Chen", details: "Badge MC-4471 exited Side Entrance.", severity: "INFO" },

  // Body discovery
  { log_id: "SL-9009", timestamp: T(23, 47, 2), event_type: "DOOR_ACCESS", location_id: "LOC-04", location_name: "Archive", person_id: "EMP-005", actor_name: "Ryan Cole", details: "Badge RC-5512 granted access to Archive. Manual perimeter check.", severity: "INFO" },
  { log_id: "SL-9010", timestamp: T(23, 52, 30), event_type: "ALARM_TRIGGERED", location_id: "LOC-04", location_name: "Archive", person_id: "EMP-005", actor_name: "Ryan Cole", details: "Manual panic alarm triggered from Archive. Body of Elias Voss discovered. EMS contacted.", severity: "CRITICAL" },

  // Routine logs (noise)
  { log_id: "SL-9101", timestamp: T(8, 0, 0), event_type: "SYSTEM_START", location_id: "LOC-06", location_name: "Security Control Room", person_id: "SYSTEM", actor_name: "Security System", details: "Daily security system startup. All cameras nominal.", severity: "INFO" },
  { log_id: "SL-9102", timestamp: T(8, 5, 0), event_type: "CAMERA_STATUS", location_id: "LOC-04", location_name: "Archive", person_id: "SYSTEM", actor_name: "Security System", details: "CAM-04 nominal. Recording active.", severity: "INFO" },
  { log_id: "SL-9103", timestamp: T(16, 0, 0), event_type: "SHIFT_CHANGE", location_id: "LOC-06", location_name: "Security Control Room", person_id: "EMP-007", actor_name: "Marcus Webb", details: "Day shift ended. Handover to D. Brooks.", severity: "INFO" },
  { log_id: "SL-9104", timestamp: T(18, 12, 0), event_type: "DOOR_ACCESS", location_id: "LOC-01", location_name: "Lobby", person_id: "EMP-001", actor_name: "Elias Voss", details: "Badge EV-0010 building entry.", severity: "INFO" },
  { log_id: "SL-9105", timestamp: T(19, 0, 0), event_type: "DOOR_ACCESS", location_id: "LOC-01", location_name: "Lobby", person_id: "EMP-004", actor_name: "Sofia Martinez", details: "Badge SM-3390 building entry.", severity: "INFO" },
  { log_id: "SL-9106", timestamp: T(21, 0, 0), event_type: "DOOR_EXIT", location_id: "LOC-08", location_name: "Parking Garage", person_id: "EMP-002", actor_name: "Maya Chen", details: "Badge MC-4471 exited parking garage. Vehicle departed.", severity: "INFO" },
  { log_id: "SL-9107", timestamp: T(23, 20, 0), event_type: "DOOR_EXIT", location_id: "LOC-01", location_name: "Lobby", person_id: "EMP-004", actor_name: "Sofia Martinez", details: "Badge SM-3390 building exit.", severity: "INFO" },
  { log_id: "SL-9108", timestamp: T(23, 15, 0), event_type: "REMOTE_LOGIN", location_id: "LOC-05", location_name: "Server Room", person_id: "EMP-004", actor_name: "Sofia Martinez", details: "Remote admin session opened to deploy server. IP authenticated from internal Engineering Lab terminal.", severity: "INFO" },
  { log_id: "SL-9109", timestamp: T(13, 0, 0), event_type: "CAMERA_STATUS", location_id: "LOC-08", location_name: "Parking Garage", person_id: "SYSTEM", actor_name: "Security System", details: "CAM-08 brief signal loss. Auto-recovered.", severity: "INFO" },
  { log_id: "SL-9110", timestamp: T(7, 45, 0), event_type: "DOOR_ACCESS", location_id: "LOC-10", location_name: "Loading Bay", person_id: "EMP-011", actor_name: "Victor Sato", details: "Badge VS-3344 early access for deliveries.", severity: "INFO" },
  { log_id: "SL-9111", timestamp: T(10, 12, 0), event_type: "AUTH_SUCCESS", location_id: "LOC-07", location_name: "Finance Office", person_id: "EMP-001", actor_name: "Elias Voss", details: "Elias Voss authenticated to vendor ledger system. Exported reference TR-4817 records.", severity: "INFO" },
  { log_id: "SL-9112", timestamp: T(20, 46, 0), event_type: "AUTH_SUCCESS", location_id: "LOC-02", location_name: "Executive Office", person_id: "EMP-001", actor_name: "Elias Voss", details: "Elias Voss authenticated to corporate email from Executive Office terminal.", severity: "INFO" },
];
insertRows("security_logs", logs);

// ---------- EVIDENCE (physical / catalog) ----------

const evidence = [
  { evidence_id: "EVD-001", name: "Reference TR-4817 in Audit Notes", description: "A handwritten reference 'TR-4817' was found in Elias Voss's personal audit notebook near the Archive terminal. No further context — the player must search the database to determine what TR-4817 represents.", location_found: "Archive (Elias's notebook)", found_time: "2025-03-15 02:10:00", category: "PHYSICAL", significance: "The starting clue. TR-4817 is a reference code that recurs across many small transactions and several messages.", related_suspect: null, related_person_id: "EMP-001" },
  { evidence_id: "EVD-002", name: "Disabled Camera Feed", description: "Archive security camera CAM-04 was manually disabled at 22:30:12, approximately 10 minutes before the estimated time of death. The disable command was authenticated by admin user d.brooks.", location_found: "Security Control Room (log)", found_time: "2025-03-14 22:30:12", category: "DIGITAL", significance: "Establishes premeditation and an accomplice. The camera was disabled from the Security Control Room, not from inside the Archive.", related_suspect: "S002", related_person_id: "EMP-003" },
  { evidence_id: "EVD-003", name: "Maya's Archive Access", description: "Badge MC-4471 (Maya Chen) accessed the Archive at 22:41:09 and exited at 22:54:07 — during the estimated time of death. Maya's stated alibi was that she left the building at 21:00.", location_found: "Archive door access log", found_time: "2025-03-14 22:41:09", category: "DIGITAL", significance: "Places Maya at the scene during the time of death and contradicts her stated alibi.", related_suspect: "S001", related_person_id: "EMP-002" },
  { evidence_id: "EVD-004", name: "Maya's Return to the Building", description: "Badge MC-4471 (Maya Chen) re-entered the building via the Side Entrance at 22:18:22 — after her badge had exited the Parking Garage at 21:00. Maya had supposedly driven home.", location_found: "Side Entrance access log", found_time: "2025-03-14 22:18:22", category: "DIGITAL", significance: "Direct contradiction of Maya's alibi. She returned to the building secretly via the unguarded side entrance.", related_suspect: "S001", related_person_id: "EMP-002" },
  { evidence_id: "EVD-005", name: "Wiped Archive Terminal", description: "Archive workstation ARC-TERM-02 received a full disk wipe command at 22:50:41, authenticated as m.chen from the local console. This destroyed local records of what was reviewed during the meeting.", location_found: "Archive (ARC-TERM-02)", found_time: "2025-03-14 22:50:41", category: "DIGITAL", significance: "Maya was inside the Archive at the time of the wipe. Indicates an attempt to destroy evidence of the motive.", related_suspect: "S001", related_person_id: "EMP-002" },
  { evidence_id: "EVD-006", name: "TR-4817 Financial Pattern", description: "Aggregating all transactions tagged with reference TR-4817 reveals 14 line items totalling approximately $69,300 in outgoing vendor payments and $12,400 in incoming kickbacks — all authorised by the same signatory, all routed through five shell vendors, with kickbacks landing in Maya Chen's personal account.", location_found: "Financial ledger (audit)", found_time: "2025-03-14 10:08:00", category: "FINANCIAL", significance: "Provides motive: embezzlement. The pattern only becomes visible when transactions are aggregated by reference code.", related_suspect: "S001", related_person_id: "EMP-002" },
  { evidence_id: "EVD-007", name: "Elias's Confrontation Invitation", description: "Email chain between Elias Voss and Maya Chen at 20:45–20:49. Elias requests a private meeting at the Archive at 22:30 'to walk you through something' and references a file he already has. Maya agrees.", location_found: "Email server", found_time: "2025-03-14 20:45:00", category: "DIGITAL", significance: "Establishes that Elias arranged the meeting and was already in possession of the evidence — Maya was being confronted.", related_suspect: "S001", related_person_id: "EMP-002" },
  { evidence_id: "EVD-008", name: "Maya-Daniel Coordination", description: "SMS chain between Maya Chen and Daniel Brooks between 21:15 and 22:09. Maya writes 'He knows. He pulled the TR-4817 file... I need the room dark.' Daniel asks 'How dark.' Maya replies 'CAM-04.' Later: 'Coming back in. East side.'", location_found: "SMS gateway", found_time: "2025-03-14 21:15:00", category: "DIGITAL", significance: "Establishes Daniel as accomplice (disabled the camera) and Maya as the principal (returned to the building, entered the Archive).", related_suspect: "S001", related_person_id: "EMP-002" },
  { evidence_id: "EVD-009", name: "Cause of Death", description: "Preliminary forensic report: asphyxiation by manual strangulation. No defensive wounds. Consistent with a victim caught off guard by a trusted individual.", location_found: "Archive (body)", found_time: "2025-03-15 01:30:00", category: "FORENSIC", significance: "Confirms homicide and suggests the victim knew and did not fear the killer — consistent with Maya, whom Elias had invited.", related_suspect: null, related_person_id: "EMP-001" },
  { evidence_id: "EVD-010", name: "Missing Phone", description: "Elias Voss's mobile phone has not been recovered. Last signal registered at 22:51 near the Archive.", location_found: "Archive (last ping)", found_time: "2025-03-14 22:51:00", category: "PHYSICAL", significance: "Likely removed by the killer to suppress communications. The wipe of the terminal and removal of the phone happened within seconds of each other.", related_suspect: "S001", related_person_id: "EMP-002" },
  { evidence_id: "EVD-011", name: "Maya's Authorising Signatory", description: "Every transaction tagged with reference TR-4817 carries the same authorising signatory: Maya Chen (CFO). No other employee authorised any TR-4817 payment.", location_found: "Vendor ledger (audit)", found_time: "2025-03-14 11:35:00", category: "FINANCIAL", significance: "Ties the embezzlement directly to Maya — not to a vendor, not to another employee.", related_suspect: "S001", related_person_id: "EMP-002" },
  { evidence_id: "EVD-012", name: "Building Movement Log", description: "Complete badge access log showing all persons who entered and exited Nexora Systems on 2025-03-14. Establishes the full set of individuals present at the scene timeframe and reveals Maya's return.", location_found: "Building access system", found_time: "2025-03-14 23:59:00", category: "DIGITAL", significance: "The master movement record. Cross-referencing it reveals Maya's secret return and the contradiction with her alibi.", related_suspect: null, related_person_id: null },
];
insertRows("evidence", evidence);

// Sanity counts
const counts: Record<string, number> = {};
for (const t of ["suspects", "employees", "locations", "visits", "calls", "transactions", "messages", "security_logs", "evidence"]) {
  const res = db.exec(`SELECT COUNT(*) as c FROM ${t}`);
  counts[t] = res.length > 0 ? Number(res[0].values[0][0]) : 0;
}
// Export the in-memory database to a file on disk.
const data = db.export();
writeFileSync(DB_PATH, Buffer.from(data));
db.close();
console.log("Investigation database seeded at", DB_PATH);
console.log("Row counts:", counts);
console.log("TR-4817 transaction count:", transactions.filter((t) => t.reference === "TR-4817").length);
