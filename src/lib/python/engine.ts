/**
 * Pyodide-based Python execution engine — runs entirely in the browser.
 *
 * Loads Pyodide (CPython compiled to WASM) lazily from the jsdelivr CDN,
 * then injects each table of the active story's database as a Python
 * list-of-dicts variable. Players write Python to analyse the case data
 * (loops, list comprehensions, dict operations, pickle, etc.).
 *
 * The runtime is cached for the lifetime of the page — the first run pays
 * the ~10s Pyodide load cost; subsequent runs are instant.
 */

import { STORY_REGISTRY } from "@/stories/registry";

// ---------- Result types ----------

export interface PythonSuccess {
  ok: true;
  stdout: string;
  stderr: string;
  /** The return value of the last expression, serialised for display. */
  result: unknown;
  executionTimeMs: number;
}

export interface PythonFailure {
  ok: false;
  error: {
    kind: "EMPTY" | "LOAD_ERROR" | "RUNTIME_ERROR" | "TIMEOUT";
    title: string;
    message: string;
    hint?: string;
  };
  executionTimeMs: number;
}

export type PythonResult = PythonSuccess | PythonFailure;

// ---------- Minimal Pyodide shape ----------
//
// We load Pyodide from the CDN via a dynamic import(), so TypeScript can't
// see its types directly. This loose interface describes only the surface
// area the engine touches.

interface PyodideGlobals {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  keys: () => Iterable<string>;
}

interface PyodideAPI {
  globals: PyodideGlobals;
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  toPy: (value: unknown) => unknown;
}

interface PyodideModule {
  loadPyodide: (opts?: { indexURL?: string }) => Promise<PyodideAPI>;
}

// ---------- Pyodide loader ----------

const PYODIDE_VERSION = "0.27.7";
const PYODIDE_CDN_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`;
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// 10 second hard cap so a runaway script can't hang the browser indefinitely.
const EXECUTION_TIMEOUT_MS = 10_000;

let _pyodidePromise: Promise<PyodideAPI> | null = null;
let _pyodideInstance: PyodideAPI | null = null;

/**
 * Load (and cache) the Pyodide runtime. Resolves immediately on subsequent
 * calls.
 */
function loadPyodide(): Promise<PyodideAPI> {
  if (_pyodidePromise) return _pyodidePromise;
  _pyodidePromise = (async () => {
    const mod = (await import(/* @vite-ignore */ PYODIDE_CDN_URL)) as PyodideModule;
    const pyodide = await mod.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
    _pyodideInstance = pyodide;
    return pyodide;
  })();
  return _pyodidePromise;
}

/** True once the Pyodide runtime has finished loading. */
export function isPythonReady(): boolean {
  return _pyodideInstance !== null;
}

/** Preload the Pyodide runtime without running any code. */
export function preloadPython(): Promise<void> {
  return loadPyodide().then(() => undefined);
}

// ---------- Helper function injection ----------
//
// Injected as Python globals after the tables are set. They read the tables
// back from globals() so they always reflect the freshly-injected data.

const HELPER_PY = `
def tables():
    """Return the list of available table names."""
    return list(_CASE_TABLE_NAMES)

def schema(table_name):
    """Return the column names of a table."""
    t = globals().get(table_name)
    if t is None:
        raise KeyError("Unknown table: " + str(table_name))
    if len(t) == 0:
        return []
    return list(t[0].keys())

def peek(table_name, n=5):
    """Return the first n rows of a table (default 5)."""
    t = globals().get(table_name)
    if t is None:
        raise KeyError("Unknown table: " + str(table_name))
    return list(t[:n])
`;

// ---------- Result serialisation ----------

/** A PyProxy exposes a toJs() method; a plain JS value does not. */
function isPyProxy(v: unknown): v is { toJs: (opts?: unknown) => unknown; destroy?: () => void } {
  return typeof v === "object" && v !== null && typeof (v as { toJs?: unknown }).toJs === "function";
}

function safeStringify(v: unknown): string {
  const replacer = (_k: string, val: unknown) =>
    val instanceof Map ? Object.fromEntries(val) : val;
  try {
    return JSON.stringify(v, replacer, 2);
  } catch {
    return String(v);
  }
}

/**
 * Convert the raw return value of runPythonAsync into a display string.
 * - undefined/null -> "" (no return value)
 * - string -> as-is
 * - PyProxy -> toJs() then JSON.stringify
 * - other JS primitives -> String(v)
 */
function serializeResult(raw: unknown): string {
  if (raw === undefined || raw === null) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
  if (isPyProxy(raw)) {
    try {
      const jsVal = raw.toJs({ dict_converter: Object.fromEntries });
      return safeStringify(jsVal);
    } finally {
      try {
        raw.destroy?.();
      } catch {
        /* ignore */
      }
    }
  }
  return safeStringify(raw);
}

// ---------- Error classification ----------

function classifyError(err: unknown): {
  kind: "RUNTIME_ERROR";
  title: string;
  message: string;
  hint?: string;
} {
  const msg = err instanceof Error ? err.message : String(err);
  // Heuristic: Pyodide PythonError objects carry the full Python traceback
  // in their message. Surface the last line (the actual exception) as the
  // title and the full message below it.
  const lastLine = msg.split("\n").map((l) => l.trim()).filter(Boolean).pop() ?? "Python error";
  return {
    kind: "RUNTIME_ERROR",
    title: lastLine.slice(0, 120),
    message: msg || "The Python interpreter raised an error.",
    hint: "Check the traceback above for the line that failed.",
  };
}

// ---------- Main entry point ----------

/**
 * Execute Python code against the active story's database.
 *
 * Tables from the story are injected as Python list-of-dicts variables
 * (one per table, named after the table). Helper functions `tables()`,
 * `schema(name)`, and `peek(name, n)` are also available.
 */
export async function executePython(
  storyId: string,
  code: string,
): Promise<PythonResult> {
  const start = performance.now();

  // --- Empty code ---
  if (!code.trim()) {
    return {
      ok: false,
      error: {
        kind: "EMPTY",
        title: "EMPTY SCRIPT",
        message: "The Python terminal is empty. Write some code and run it again.",
        hint: "Tip: try print(len(passengers))",
      },
      executionTimeMs: Math.round(performance.now() - start),
    };
  }

  // --- Load Pyodide (lazy + cached) ---
  let pyodide: PyodideAPI;
  try {
    pyodide = await loadPyodide();
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: "LOAD_ERROR",
        title: "PYTHON RUNTIME UNAVAILABLE",
        message:
          "The in-browser Python runtime could not be loaded. Check your network connection and try again.",
        hint: err instanceof Error ? err.message : undefined,
      },
      executionTimeMs: Math.round(performance.now() - start),
    };
  }

  // --- Inject story tables as Python list-of-dicts ---
  //
  // We serialise each table to JSON in JS and parse it back in Python with
  // json.loads(). This guarantees that the resulting variables are native
  // Python lists of native Python dicts (not JsProxy wrappers), so players
  // can use `row["column"]` subscripting directly.
  const story = STORY_REGISTRY.getStory(storyId);
  if (!story) {
    return {
      ok: false,
      error: {
        kind: "RUNTIME_ERROR",
        title: "NO CASE SELECTED",
        message: `No story was found for id "${storyId}".`,
      },
      executionTimeMs: Math.round(performance.now() - start),
    };
  }

  // Build a single JSON payload containing every table, then parse it once
  // in Python and unpack into individual globals. One round-trip is much
  // cheaper than N round-trips for large schemas.
  const tableNames: string[] = [];
  const payload: Record<string, Record<string, unknown>[]> = {};
  for (const table of story.database.tables) {
    payload[table.name] = table.rows;
    tableNames.push(table.name);
  }
  let payloadJson: string;
  try {
    payloadJson = JSON.stringify(payload);
  } catch {
    payloadJson = "{}";
  }

  try {
    // Inject the JSON string + the table name list, then unpack in Python.
    pyodide.globals.set("_CASE_TABLE_JSON", payloadJson);
    pyodide.globals.set("_CASE_TABLE_NAMES", tableNames);
    await pyodide.runPythonAsync(
      "import json as _json\n" +
      "_case_data = _json.loads(_CASE_TABLE_JSON)\n" +
      "for _name, _rows in _case_data.items():\n" +
      "    globals()[_name] = _rows\n" +
      "del _case_data\n",
    );
  } catch {
    /* ignore injection failures — surface errors later when user code runs */
  }

  // --- Reset stdout/stderr accumulators and wire capture ---
  let stdoutAccum = "";
  let stderrAccum = "";
  try {
    pyodide.setStdout({ batched: (s) => { stdoutAccum += s; } });
    pyodide.setStderr({ batched: (s) => { stderrAccum += s; } });
  } catch {
    /* older Pyodide versions: fall through */
  }

  // --- Define helper functions (idempotent) ---
  try {
    await pyodide.runPythonAsync(HELPER_PY);
  } catch {
    /* helpers may already be defined; ignore */
  }

  // --- Run the user code with a timeout ---
  let rawResult: unknown;
  try {
    const execPromise = pyodide.runPythonAsync(code);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("__PYTHON_TIMEOUT__")),
        EXECUTION_TIMEOUT_MS,
      );
    });
    rawResult = await Promise.race([execPromise, timeoutPromise]);
  } catch (err) {
    const elapsed = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("__PYTHON_TIMEOUT__")) {
      return {
        ok: false,
        error: {
          kind: "TIMEOUT",
          title: "EXECUTION TIMEOUT",
          message: `The script did not finish within ${EXECUTION_TIMEOUT_MS / 1000} seconds. An infinite loop or very heavy computation may be the cause.`,
          hint: "Try reducing the work or breaking out of long loops.",
        },
        executionTimeMs: elapsed,
      };
    }
    const classified = classifyError(err);
    return {
      ok: false,
      error: {
        kind: classified.kind,
        title: classified.title,
        message: classified.message,
        hint: classified.hint,
      },
      executionTimeMs: elapsed,
    };
  }

  const elapsed = Math.round(performance.now() - start);
  const resultStr = serializeResult(rawResult);

  return {
    ok: true,
    stdout: stdoutAccum,
    stderr: stderrAccum,
    result: resultStr,
    executionTimeMs: elapsed,
  };
}
