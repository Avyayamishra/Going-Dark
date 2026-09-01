
/**
 * Client-side SQL execution engine — runs entirely in the browser.
 *
 * Uses sql.js (pure WASM SQLite) loaded from the static WASM file in /public.
 * No backend, no API calls. The database is created in-memory from the active
 * story's seed data.
 *
 * This makes the game fully self-contained: the database is local to the game,
 * not outsourced to a backend.
 */
import initSqlJs, { type Database, type SqlValue } from "sql.js";
import { STORY_REGISTRY } from "@/stories/registry";
import type { SeedTable } from "@/stories/types";

export type QueryRow = Record<string, unknown>;

export interface QuerySuccess {
  ok: true;
  columns: string[];
  rows: QueryRow[];
  rowCount: number;
  executionTimeMs: number;
  truncated: boolean;
}

export interface QueryFailure {
  ok: false;
  error: {
    kind:
      | "UNSAFE_QUERY"
      | "EMPTY_QUERY"
      | "SYNTAX_ERROR"
      | "NO_SUCH_TABLE"
      | "NO_SUCH_COLUMN"
      | "UNSUPPORTED"
      | "TIMEOUT"
      | "UNKNOWN_ERROR";
    title: string;
    message: string;
    hint?: string;
  };
  executionTimeMs: number;
}

export type QueryResult = QuerySuccess | QueryFailure;

// Default allowed tables for Case 1 (backward compatibility).
const DEFAULT_ALLOWED_TABLES = new Set([
  "suspects",
  "employees",
  "locations",
  "visits",
  "calls",
  "transactions",
  "messages",
  "security_logs",
]);

/** Get the set of allowed tables for a story (from its schema definition). */
function getAllowedTables(storyId: string): Set<string> {
  const story = STORY_REGISTRY.getStory(storyId);
  if (!story || !story.database.schema) return DEFAULT_ALLOWED_TABLES;
  return new Set(story.database.schema.map((t) => t.name));
}

// ---------- sql.js module loading ----------

let _sqlModulePromise: ReturnType<typeof initSqlJs> | null = null;

async function getSqlModule() {
  if (_sqlModulePromise) return _sqlModulePromise;
  // Resolve relative to the current document location so it works
  // from root hosting AND subdirectory hosting.
  const wasmUrl = new URL('sql-wasm.wasm', document.baseURI).href;
  _sqlModulePromise = initSqlJs({
    locateFile: () => wasmUrl,
  });
  return _sqlModulePromise;
}

// ---------- Story database cache ----------

const _dbCache = new Map<string, Database>();

/**
 * Create (or return a cached) in-memory SQLite database for a story.
 */
async function getStoryDatabase(storyId: string): Promise<Database> {
  const cached = _dbCache.get(storyId);
  if (cached) return cached;

  const story = STORY_REGISTRY.getStory(storyId);
  if (!story) {
    throw new Error(`Story not found: ${storyId}`);
  }

  const SQL = await getSqlModule();
  const db = new SQL.Database();
  // Create the story's schema (each story defines its own tables).
  if (story.database.schema) {
    for (const tableDef of story.database.schema) {
      db.exec(tableDef.createSql);
    }
  } else {
    // Fallback to the shared schema (backward compatibility with Case 1).
    db.exec(SCHEMA_SQL);
  }
  // Seed all tables from the story's data.
  for (const table of story.database.tables) {
    seedTable(db, table);
  }

  _dbCache.set(storyId, db);
  return db;
}

/** Destroy a story's cached database. */
export function releaseStoryDatabase(storyId: string): void {
  const db = _dbCache.get(storyId);
  if (db) {
    try {
      db.close();
    } catch {
      /* ignore */
    }
    _dbCache.delete(storyId);
  }
}

function seedTable(db: Database, table: SeedTable): void {
  if (table.rows.length === 0) return;
  const cols = Object.keys(table.rows[0]);
  const placeholders = cols.map(() => "?").join(",");
  const sql = `INSERT INTO ${table.name} (${cols.join(",")}) VALUES (${placeholders})`;
  const stmt = db.prepare(sql);
  for (const row of table.rows) {
    stmt.run(cols.map((c) => (row[c] ?? null) as SqlValue));
    stmt.reset();
  }
  stmt.free();
}

// ---------- Shared schema ----------

const SCHEMA_SQL = `
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
`;

// ---------- Validation ----------

function stripComments(sql: string): string {
  let out = "";
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    const next = sql[i + 1];
    if (c === "-" && next === "-") {
      while (i < n && sql[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < n && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === "'") {
      out += c;
      i++;
      while (i < n) {
        out += sql[i];
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") {
            out += sql[i + 1];
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (c === '"') {
      out += c;
      i++;
      while (i < n) {
        out += sql[i];
        if (sql[i] === '"') {
          if (sql[i + 1] === '"') {
            out += sql[i + 1];
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function splitStatements(sql: string): string[] {
  const stmts: string[] = [];
  let buf = "";
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    if (c === "'") {
      buf += c;
      i++;
      while (i < n) {
        buf += sql[i];
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") {
            buf += sql[i + 1];
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (c === '"') {
      buf += c;
      i++;
      while (i < n) {
        buf += sql[i];
        if (sql[i] === '"') {
          if (sql[i + 1] === '"') {
            buf += sql[i + 1];
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (c === ";") {
      const s = buf.trim();
      if (s) stmts.push(s);
      buf = "";
      i++;
      continue;
    }
    buf += c;
    i++;
  }
  const last = buf.trim();
  if (last) stmts.push(last);
  return stmts;
}

const BLOCKED_KEYWORDS = [
  "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "ATTACH", "DETACH",
  "REPLACE", "REINDEX", "VACUUM", "ANALYZE", "PRAGMA", "BEGIN", "COMMIT",
  "ROLLBACK", "SAVEPOINT", "RELEASE", "LOAD", "IMPORT", "EXPORT", "EXPLAIN",
  "INTO", "VALUES",
];

function findBlockedKeyword(tokenised: string[]): string | null {
  for (const kw of BLOCKED_KEYWORDS) {
    if (tokenised.includes(kw)) return kw;
  }
  return null;
}

function tokenise(stmt: string): string[] {
  return stmt.toUpperCase().match(/[A-Z_]+/g) ?? [];
}

function referencedTables(stmt: string): string[] {
  const tables: string[] = [];
  const upper = stmt.toUpperCase();
  const re = /(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(upper)) !== null) {
    tables.push(m[1].toLowerCase());
  }
  return tables;
}

export interface ValidationResult {
  valid: boolean;
  statement: string;
  error?: QueryFailure["error"];
}

export function validateQuery(rawSql: string, allowedTables?: Set<string>): ValidationResult {
  const cleaned = stripComments(rawSql ?? "").trim();
  if (!cleaned) {
    return {
      valid: false,
      statement: "",
      error: {
        kind: "EMPTY_QUERY",
        title: "EMPTY QUERY",
        message: "The query editor is empty. Write a SELECT statement and run it again.",
        hint: "Tip: try SELECT * FROM suspects;",
      },
    };
  }

  const statements = splitStatements(cleaned);
  if (statements.length === 0) {
    return {
      valid: false,
      statement: "",
      error: {
        kind: "EMPTY_QUERY",
        title: "EMPTY QUERY",
        message: "The query editor is empty. Write a SELECT statement and run it again.",
      },
    };
  }
  if (statements.length > 1) {
    return {
      valid: false,
      statement: statements[0],
      error: {
        kind: "UNSUPPORTED",
        title: "MULTIPLE STATEMENTS",
        message: "Only a single read-only investigation query is permitted per execution.",
        hint: "Run one SELECT statement at a time.",
      },
    };
  }

  const stmt = statements[0];
  const upper = stmt.toUpperCase();
  if (!/^(SELECT|WITH)\b/.test(upper)) {
    return {
      valid: false,
      statement: stmt,
      error: {
        kind: "UNSAFE_QUERY",
        title: "UNSAFE QUERY",
        message: "Only read-only investigation queries are permitted.",
        hint: "Queries must begin with SELECT or WITH.",
      },
    };
  }

  const tokens = tokenise(stmt);
  const blocked = findBlockedKeyword(tokens);
  if (blocked) {
    return {
      valid: false,
      statement: stmt,
      error: {
        kind: "UNSAFE_QUERY",
        title: "UNSAFE QUERY",
        message: `Only read-only investigation queries are permitted. The keyword "${blocked}" is not allowed.`,
        hint: "Use SELECT to read from the investigation tables.",
      },
    };
  }

  const tables = referencedTables(stmt);
  for (const t of tables) {
    if (!(allowedTables ?? DEFAULT_ALLOWED_TABLES).has(t)) {
      return {
        valid: false,
        statement: stmt,
        error: {
          kind: "NO_SUCH_TABLE",
          title: "QUERY ERROR",
          message: `Table "${t}" does not exist.`,
          hint: "Check the Database Explorer to see the available tables.",
        },
      };
    }
  }

  return { valid: true, statement: stmt };
}

function classifyError(err: unknown): QueryFailure["error"] {
  const msg = err instanceof Error ? err.message : String(err);
  let m = msg.match(/no such table: (\S+)/i);
  if (m) {
    return {
      kind: "NO_SUCH_TABLE",
      title: "QUERY ERROR",
      message: `Table "${m[1]}" does not exist.`,
      hint: "Check the Database Explorer to see the available tables.",
    };
  }
  m = msg.match(/no such column: (\S+)/i);
  if (m) {
    return {
      kind: "NO_SUCH_COLUMN",
      title: "QUERY ERROR",
      message: `Column "${m[1]}" does not exist.`,
      hint: "Check the Database Explorer to see the available columns for each table.",
    };
  }
  if (/syntax error/i.test(msg) || /near ".*?": syntax error/i.test(msg)) {
    return {
      kind: "SYNTAX_ERROR",
      title: "QUERY ERROR",
      message: "The query contains a syntax error.",
      hint: "Check for missing commas, parentheses, or mismatched quotes. SQLite uses standard SQL syntax.",
    };
  }
  if (/ambiguous column name: (\S+)/i.test(msg)) {
    m = msg.match(/ambiguous column name: (\S+)/i);
    return {
      kind: "SYNTAX_ERROR",
      title: "QUERY ERROR",
      message: `Column "${m?.[1]}" is ambiguous — it exists in more than one table.`,
      hint: "Qualify the column with its table name, e.g. suspects.name",
    };
  }
  if (/no such function: (\S+)/i.test(msg)) {
    m = msg.match(/no such function: (\S+)/i);
    return {
      kind: "SYNTAX_ERROR",
      title: "QUERY ERROR",
      message: `Function "${m?.[1]}" does not exist.`,
      hint: "Only built-in SQLite functions are available.",
    };
  }
  return {
    kind: "UNKNOWN_ERROR",
    title: "QUERY ERROR",
    message: msg || "An unknown error occurred while executing the query.",
    hint: "Review your query against the Database Explorer schema.",
  };
}

const MAX_ROWS = 1000;

export async function executeQuery(storyId: string, rawSql: string): Promise<QueryResult> {
  const start = performance.now();
  const validation = validateQuery(rawSql, getAllowedTables(storyId));
  if (!validation.valid) {
    return {
      ok: false,
      error: validation.error!,
      executionTimeMs: Math.round(performance.now() - start),
    };
  }
  const stmt = validation.statement;
  try {
    const db = await getStoryDatabase(storyId);
    let execResult: { columns: string[]; values: SqlValue[][] }[] = [];
    try {
      execResult = db.exec(stmt);
    } catch (err) {
      return {
        ok: false,
        error: classifyError(err),
        executionTimeMs: Math.round(performance.now() - start),
      };
    }
    let columns: string[] = [];
    let rows: QueryRow[] = [];
    let rowCount = 0;
    if (execResult.length > 0) {
      const r = execResult[0];
      columns = r.columns;
      rowCount = r.values.length;
      const limited = r.values.length > MAX_ROWS ? r.values.slice(0, MAX_ROWS) : r.values;
      rows = limited.map((rowVals) => {
        const obj: QueryRow = {};
        columns.forEach((c, idx) => {
          obj[c] = rowVals[idx];
        });
        return obj;
      });
    } else {
      columns = inferColumns(db, stmt);
      rowCount = 0;
      rows = [];
    }
    const truncated = rowCount > MAX_ROWS;
    return {
      ok: true,
      columns,
      rows,
      rowCount,
      executionTimeMs: Math.round(performance.now() - start),
      truncated,
    };
  } catch (err) {
    return {
      ok: false,
      error: classifyError(err),
      executionTimeMs: Math.round(performance.now() - start),
    };
  }
}

function inferColumns(db: Database, stmt: string): string[] {
  try {
    const inner = stmt.replace(/;\s*$/, "");
    const wrapped = `SELECT * FROM (${inner}) AS _q WHERE 1=0`;
    const res = db.exec(wrapped);
    if (res.length > 0) return res[0].columns;
    return [];
  } catch {
    return [];
  }
}

// ---------- Schema metadata ----------

export interface ColumnInfo {
  name: string;
  type: string;
  notnull: number;
  pk: number;
  description: string;
}

export interface TableInfo {
  name: string;
  description: string;
  columns: ColumnInfo[];
}

const TABLE_DESCRIPTIONS: Record<string, string> = {
  suspects: "The persons of interest in the investigation.",
  employees: "All staff, including non-suspects and the victim.",
  locations: "Physical locations inside the facility, with camera coverage.",
  visits: "Badge access / movement records showing who entered which location and when.",
  calls: "Phone call records — internal PBX and external carriers.",
  transactions: "Financial transactions across employee accounts. Flagged when suspicious.",
  messages: "Internal email, SMS, and instant messages exchanged between parties.",
  security_logs: "Security system events: camera status, door access, logins, alarms.",
  evidence: "Catalogue of physical, digital, financial, and forensic evidence.",
};

const COLUMN_DESCRIPTIONS: Record<string, Record<string, string>> = {
  suspects: {
    suspect_id: "Primary key — unique identifier for each suspect.",
    name: "Full name of the suspect.",
    role: "Job title.",
    department: "Department the suspect belongs to.",
    hire_date: "Date the suspect joined (ISO date).",
    status: "Investigation status.",
    badge_id: "Physical access badge identifier.",
    phone: "Contact phone number.",
    alibi: "Stated alibi for the night of the incident.",
    notes: "Investigator's notes about the suspect.",
  },
  employees: {
    employee_id: "Primary key — unique employee identifier.",
    name: "Full name.",
    role: "Job title.",
    department: "Department.",
    hire_date: "Hire date (ISO).",
    status: "Employment status (Active, Deceased, On Leave).",
    badge_id: "Access badge identifier.",
    phone: "Contact phone.",
    email: "Internal email address.",
  },
  locations: {
    location_id: "Primary key — unique location identifier.",
    name: "Location name.",
    floor: "Building floor (1, B2, R for rooftop, etc.).",
    description: "Description of the location.",
    access_level: "Required access level (PUBLIC, STAFF, RESTRICTED, SECURITY, EXECUTIVE).",
    has_camera: "1 if the location has a security camera, 0 otherwise.",
    camera_id: "Identifier of the covering camera (if any).",
  },
  visits: {
    visit_id: "Primary key — unique visit record.",
    person_id: "Identifier of the person (maps to employees.employee_id).",
    person_name: "Name of the person.",
    location_id: "Location visited (maps to locations.location_id).",
    location_name: "Name of the location.",
    entry_time: "Timestamp the person entered.",
    exit_time: "Timestamp the person exited (NULL if still inside / never logged out).",
    access_method: "How access was granted (BADGE, MANUAL).",
    badge_id: "Badge used for the access event.",
  },
  calls: {
    call_id: "Primary key — unique call record.",
    caller_id: "Identifier of the caller.",
    caller_name: "Name of the caller.",
    receiver_id: "Identifier of the receiver.",
    receiver_name: "Name of the receiver.",
    call_time: "Timestamp the call was placed.",
    duration_sec: "Call duration in seconds.",
    status: "Call status (CONNECTED, MISSED).",
    carrier: "Telecom carrier that routed the call.",
  },
  transactions: {
    transaction_id: "Primary key — unique transaction reference (e.g. TXN-10001).",
    account_holder: "Name of the account holder.",
    person_id: "Employee associated with the account (maps to employees.employee_id).",
    amount: "Transaction amount.",
    currency: "ISO currency code.",
    direction: "INCOMING or OUTGOING.",
    counterparty: "Name of the other party in the transaction.",
    transaction_time: "Timestamp the transaction posted.",
    description: "Bank memo / description.",
    reference: "Optional project / reference code tagging the transaction. NULL when untagged.",
    suspicious: "1 if flagged as suspicious by the audit, 0 otherwise.",
  },
  messages: {
    message_id: "Primary key — unique message identifier.",
    sender_id: "Identifier of the sender.",
    sender_name: "Name of the sender.",
    receiver_id: "Identifier of the receiver.",
    receiver_name: "Name of the receiver.",
    sent_time: "Timestamp the message was sent.",
    content: "Full message body.",
    message_type: "Channel (EMAIL, SMS, INTERNAL).",
    read_status: "Read state (READ, UNREAD).",
  },
  security_logs: {
    log_id: "Primary key — unique log entry.",
    timestamp: "When the event occurred.",
    event_type: "Type of security event (CAMERA_DISABLED, DOOR_ACCESS, TERMINAL_WIPE, ALARM_TRIGGERED, etc.).",
    location_id: "Location the event relates to.",
    location_name: "Name of the location.",
    person_id: "Identifier of the person who triggered the event (SYSTEM for automated).",
    actor_name: "Name of the actor.",
    details: "Human-readable event details.",
    severity: "Event severity (INFO, WARNING, CRITICAL).",
  },
  evidence: {
    evidence_id: "Primary key — unique evidence identifier (e.g. EVD-001).",
    name: "Short name of the evidence item.",
    description: "Detailed description of the evidence.",
    location_found: "Where the evidence was found / recovered.",
    found_time: "Timestamp associated with the evidence.",
    category: "Evidence category (PHYSICAL, DIGITAL, FINANCIAL, FORENSIC).",
    significance: "Why this evidence matters to the investigation.",
    related_suspect: "Suspect id this evidence implicates (if any).",
    related_person_id: "Person id this evidence relates to.",
  },
};

export async function getSchema(storyId: string): Promise<TableInfo[]> {
  const db = await getStoryDatabase(storyId);
  const story = STORY_REGISTRY.getStory(storyId);
  // If the story defines its own schema, use it; otherwise fall back to Case 1 tables.
  const tableNames = story?.database.schema?.map((s) => s.name) ?? ["suspects", "employees", "locations", "visits", "calls", "transactions", "messages", "security_logs"];
  return tableNames.map((t) => {
    const res = db.exec(`PRAGMA table_info(${t})`);
    const colsRaw: { name: string; type: string; notnull: number; pk: number }[] =
      res.length > 0
        ? res[0].values.map((v) => ({
            name: String(v[1]),
            type: String(v[2] || "TEXT"),
            notnull: Number(v[3]),
            pk: Number(v[5]),
          }))
        : [];
    // Use story-provided descriptions if available, otherwise fall back to defaults.
    const storyTableDef = story?.database.schema?.find((s) => s.name === t);
    const description = storyTableDef?.description ?? TABLE_DESCRIPTIONS[t] ?? "";
    return {
      name: t,
      description,
      columns: colsRaw.map((c) => {
        const storyColDef = storyTableDef?.columns.find((sc) => sc.name === c.name);
        return {
          name: c.name,
          type: c.type || "TEXT",
          notnull: c.notnull,
          pk: c.pk,
          description: storyColDef?.description ?? COLUMN_DESCRIPTIONS[t]?.[c.name] ?? "",
        };
      }),
    };
  });
}

// ---------- Client-side accusation evaluation ----------

export interface AccusationResult {
  correct: boolean;
  correctCount: number;
  who: { correct: boolean; answer: string; correctAnswer: string };
  how: { correct: boolean; answer: string; correctAnswer: string };
  why: { correct: boolean; answer: string; correctAnswer: string };
}

export function evaluateAccusation(
  storyId: string,
  who: string,
  how: string,
  why: string,
): AccusationResult {
  const story = STORY_REGISTRY.getStory(storyId);
  if (!story) {
    return {
      correct: false,
      correctCount: 0,
      who: { correct: false, answer: who, correctAnswer: "" },
      how: { correct: false, answer: how, correctAnswer: "" },
      why: { correct: false, answer: why, correctAnswer: "" },
    };
  }
  const CORRECT = story.solution;
  const whoCorrect = who === CORRECT.who;
  const howCorrect = how === CORRECT.how;
  const whyCorrect = why === CORRECT.why;
  return {
    correct: whoCorrect && howCorrect && whyCorrect,
    correctCount: [whoCorrect, howCorrect, whyCorrect].filter(Boolean).length,
    who: { correct: whoCorrect, answer: who, correctAnswer: CORRECT.who },
    how: { correct: howCorrect, answer: how, correctAnswer: CORRECT.how },
    why: { correct: whyCorrect, answer: why, correctAnswer: CORRECT.why },
  };
}
