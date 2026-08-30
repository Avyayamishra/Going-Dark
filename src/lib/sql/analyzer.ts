/**
 * SQL concept analyzer — deterministic tokenizer.
 *
 * Inspects a SQL string and returns the set of SQL concepts the player used.
 * No AI, no external calls — pure regex/string analysis.
 *
 * Used by:
 *  - the query-history record (track concepts per query)
 *  - the contextual feedback panel (show a 1-line insight after success)
 *  - the learning-progress tracker (which concepts has the player used)
 *  - the final educational summary
 */

export type SqlConcept =
  | "SELECT"
  | "FROM"
  | "WHERE"
  | "AND"
  | "OR"
  | "NOT"
  | "ORDER BY"
  | "LIMIT"
  | "DISTINCT"
  | "LIKE"
  | "IN"
  | "BETWEEN"
  | "IS NULL"
  | "GROUP BY"
  | "HAVING"
  | "COUNT"
  | "SUM"
  | "AVG"
  | "MIN"
  | "MAX"
  | "INNER JOIN"
  | "LEFT JOIN"
  | "JOIN"
  | "ALIAS"
  | "SUBQUERY"
  | "CASE"
  | "UNION"
  | "WILDCARD"
  | "DATE_FILTER"
  | "STRING_LITERAL"
  | "AGGREGATE";

export interface ConceptUsage {
  concepts: SqlConcept[];
  /** Beginner/Intermediate/Aggregation/Advanced bucket for progress display. */
  level: "BEGINNER" | "INTERMEDIATE" | "AGGREGATION" | "ADVANCED";
  /** A short contextual insight keyed off the most "advanced" concept used. */
  insight?: { concept: SqlConcept; title: string; body: string };
}

const CONCEPT_PATTERNS: { concept: SqlConcept; re: RegExp }[] = [
  { concept: "SELECT", re: /\bSELECT\b/i },
  { concept: "FROM", re: /\bFROM\b/i },
  { concept: "WHERE", re: /\bWHERE\b/i },
  { concept: "AND", re: /\bAND\b/i },
  { concept: "OR", re: /\bOR\b/i },
  { concept: "NOT", re: /\bNOT\b/i },
  { concept: "ORDER BY", re: /\bORDER\s+BY\b/i },
  { concept: "LIMIT", re: /\bLIMIT\b/i },
  { concept: "DISTINCT", re: /\bDISTINCT\b/i },
  { concept: "LIKE", re: /\bLIKE\b/i },
  { concept: "IN", re: /\bIN\s*\(/i },
  { concept: "BETWEEN", re: /\bBETWEEN\b/i },
  { concept: "IS NULL", re: /\bIS\s+NULL\b/i },
  { concept: "GROUP BY", re: /\bGROUP\s+BY\b/i },
  { concept: "HAVING", re: /\bHAVING\b/i },
  { concept: "COUNT", re: /\bCOUNT\s*\(/i },
  { concept: "SUM", re: /\bSUM\s*\(/i },
  { concept: "AVG", re: /\bAVG\s*\(/i },
  { concept: "MIN", re: /\bMIN\s*\(/i },
  { concept: "MAX", re: /\bMAX\s*\(/i },
  { concept: "INNER JOIN", re: /\bINNER\s+JOIN\b/i },
  { concept: "LEFT JOIN", re: /\bLEFT\s+(OUTER\s+)?JOIN\b/i },
  { concept: "JOIN", re: /\bJOIN\b/i },
  { concept: "CASE", re: /\bCASE\b/i },
  { concept: "UNION", re: /\bUNION\b/i },
  { concept: "WILDCARD", re: /\*\s*(,|\bFROM|\bFROM)/i },
  // Alias: a table alias on FROM/JOIN — `FROM table AS alias` or `JOIN table alias` (short, non-keyword).
  // Requires AS or a short 1-2 letter alias to avoid matching `FROM suspects WHERE`.
  { concept: "ALIAS", re: /\b(?:FROM|JOIN)\s+[a-zA-Z_][a-zA-Z0-9_]*\s+(?:AS\s+[a-zA-Z_][a-zA-Z0-9_]*\b|[a-z][a-z]?\b)/i },
];

const DATE_FILTER_RE = /\b(entry_time|exit_time|call_time|sent_time|transaction_time|timestamp|transaction_time)\s*(=|<|>|<=|>=|BETWEEN)\s*['"]?\d{4}-\d{2}-\d{2}/i;
const STRING_LITERAL_RE = /'[^']*'/;
// Subquery: a parenthesised SELECT inside the statement (very rough heuristic)
const SUBQUERY_RE = /\(\s*SELECT\b/i;

/**
 * Analyze a SQL string and return the concepts used, the level, and a contextual insight.
 */
export function analyzeQuery(sql: string): ConceptUsage {
  const cleaned = stripComments(sql).trim();
  const concepts = new Set<SqlConcept>();
  for (const { concept, re } of CONCEPT_PATTERNS) {
    if (re.test(cleaned)) concepts.add(concept);
  }
  if (DATE_FILTER_RE.test(cleaned)) concepts.add("DATE_FILTER");
  if (STRING_LITERAL_RE.test(cleaned)) concepts.add("STRING_LITERAL");
  if (SUBQUERY_RE.test(cleaned)) concepts.add("SUBQUERY");
  if (/\bCOUNT\s*\(|\bSUM\s*\(|\bAVG\s*\(|\bMIN\s*\(|\bMAX\s*\(/.test(cleaned)) concepts.add("AGGREGATE");

  const level = classifyLevel(concepts);
  const insight = pickInsight(concepts);
  return {
    concepts: Array.from(concepts).sort(),
    level,
    insight,
  };
}

function classifyLevel(concepts: Set<SqlConcept>): ConceptUsage["level"] {
  const adv: SqlConcept[] = ["INNER JOIN", "LEFT JOIN", "JOIN", "ALIAS", "SUBQUERY", "CASE", "UNION"];
  const agg: SqlConcept[] = ["GROUP BY", "HAVING", "COUNT", "SUM", "AVG", "MIN", "MAX", "AGGREGATE"];
  const inter: SqlConcept[] = ["AND", "OR", "LIKE", "IN", "BETWEEN", "DISTINCT", "NOT", "IS NULL"];
  if (concepts.has("LEFT JOIN") || concepts.has("INNER JOIN") || concepts.has("SUBQUERY") || concepts.has("CASE") || concepts.has("UNION")) {
    return "ADVANCED";
  }
  if (adv.some((c) => concepts.has(c)) || (concepts.has("JOIN") && concepts.has("ALIAS"))) {
    return "ADVANCED";
  }
  if (agg.some((c) => concepts.has(c))) {
    return "AGGREGATION";
  }
  if (inter.some((c) => concepts.has(c))) {
    return "INTERMEDIATE";
  }
  return "BEGINNER";
}

const INSIGHTS: Record<SqlConcept, { title: string; body: string }> = {
  SELECT: { title: "SELECT", body: "SELECT chooses which columns to return. You used it to pick the data you needed to see." },
  FROM: { title: "FROM", body: "FROM names the table your data lives in. Every investigation starts by pointing at a source." },
  WHERE: { title: "WHERE", body: "WHERE filters rows to a condition. You used it to narrow the records to what matters for the case." },
  AND: { title: "AND", body: "AND combines conditions. You stacked filters to pinpoint records matching every criterion at once." },
  OR: { title: "OR", body: "OR broadens a search — matching any of several conditions. Useful when a suspect might be listed under alternate fields." },
  NOT: { title: "NOT", body: "NOT excludes rows matching a condition. Helpful for removing records you have already ruled out." },
  "ORDER BY": { title: "ORDER BY", body: "ORDER BY sorts the results. Sorting by timestamp turns a list into a sequence — the order events actually happened." },
  LIMIT: { title: "LIMIT", body: "LIMIT caps the number of rows. Useful when you only need the first few records — the earliest entry, the largest amount." },
  DISTINCT: { title: "DISTINCT", body: "DISTINCT removes duplicate rows. You used it to see the unique values — the set of people, the set of references." },
  LIKE: { title: "LIKE", body: "LIKE matches text patterns with % and _. You used it to find names or descriptions containing a fragment." },
  IN: { title: "IN", body: "IN matches against a list of values. Cleaner than a chain of OR conditions when checking several suspects at once." },
  BETWEEN: { title: "BETWEEN", body: "BETWEEN filters a range inclusive of both ends. You used it to scope records to a time window — like the estimated time of death." },
  "IS NULL": { title: "IS NULL", body: "IS NULL finds rows with no value in a column. An absent exit_time can itself be evidence — someone never logged out." },
  "GROUP BY": { title: "GROUP BY", body: "GROUP BY organizes rows into groups so you can calculate per-group totals. You used it to reveal the pattern hidden across many small records." },
  HAVING: { title: "HAVING", body: "HAVING filters groups — like WHERE, but after aggregation. You used it to keep only the groups whose totals crossed a threshold." },
  COUNT: { title: "COUNT", body: "COUNT tallies the rows in each group. You used it to see how often something happened — how many payments, how many visits." },
  SUM: { title: "SUM", body: "SUM adds the values in each group. You used it to total amounts — turning many small payments into one damning number." },
  AVG: { title: "AVG", body: "AVG finds the mean of a group's values. Useful for spotting transactions far outside the ordinary." },
  MIN: { title: "MIN", body: "MIN finds the smallest value in a group — the earliest timestamp, the smallest amount." },
  MAX: { title: "MAX", body: "MAX finds the largest value — the biggest payment, the latest exit." },
  "INNER JOIN": { title: "INNER JOIN", body: "INNER JOIN combines rows from two tables that match on a key. You used it to connect records across tables — a badge to a name, a log to a location." },
  "LEFT JOIN": { title: "LEFT JOIN", body: "LEFT JOIN keeps every row from the first table even when there is no match in the second. Useful when absence is itself information." },
  JOIN: { title: "JOIN", body: "JOIN connects rows from two tables on a shared column. You used it to link records across tables — the heart of multi-table investigation." },
  ALIAS: { title: "ALIAS", body: "Aliases (AS or a bare name) rename tables or columns for brevity. They make joins readable: visits v JOIN suspects s ON …" },
  SUBQUERY: { title: "SUBQUERY", body: "A subquery is a query inside a query. You used one query's result as input to another — powerful for chaining discoveries." },
  CASE: { title: "CASE", body: "CASE returns different values per row based on conditions. It lets you classify records inside the query itself." },
  UNION: { title: "UNION", body: "UNION stacks the results of two queries into one set. Useful when evidence is split across tables." },
  WILDCARD: { title: "*", body: "* returns every column. Fast for exploration, but selecting specific columns keeps your evidence focused." },
  DATE_FILTER: { title: "Date/Time Filtering", body: "You filtered on a timestamp column. Time is the spine of any investigation — when something happened is often as important as what." },
  STRING_LITERAL: { title: "String Comparison", body: "You matched against a quoted text value. Use single quotes for text in SQL — double quotes are for identifiers." },
  AGGREGATE: { title: "Aggregation", body: "You used an aggregate function. Aggregates summarise many rows into one number — the difference between a list and a pattern." },
};

/**
 * Pick the most "educational" insight to surface — the highest-level concept
 * the player hasn't seen before in tracked progress would be ideal, but as a
 * simple deterministic rule we pick the most advanced concept present.
 */
function pickInsight(concepts: Set<SqlConcept>): ConceptUsage["insight"] {
  const priority: SqlConcept[] = [
    "SUBQUERY",
    "LEFT JOIN",
    "INNER JOIN",
    "JOIN",
    "CASE",
    "UNION",
    "HAVING",
    "GROUP BY",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "AGGREGATE",
    "ALIAS",
    "BETWEEN",
    "LIKE",
    "IN",
    "DISTINCT",
    "IS NULL",
    "NOT",
    "OR",
    "AND",
    "ORDER BY",
    "LIMIT",
    "WHERE",
    "DATE_FILTER",
    "STRING_LITERAL",
  ];
  for (const c of priority) {
    if (concepts.has(c)) {
      const def = INSIGHTS[c];
      return { concept: c, title: def.title, body: def.body };
    }
  }
  return undefined;
}

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

/**
 * Concept metadata for the learning-progress display.
 */
export const CONCEPT_META: {
  id: SqlConcept;
  label: string;
  level: ConceptUsage["level"];
  hint: string;
}[] = [
  { id: "SELECT", label: "SELECT", level: "BEGINNER", hint: "Choose columns to return" },
  { id: "FROM", label: "FROM", level: "BEGINNER", hint: "Name the source table" },
  { id: "WHERE", label: "WHERE", level: "BEGINNER", hint: "Filter rows by condition" },
  { id: "ORDER BY", label: "ORDER BY", level: "BEGINNER", hint: "Sort results" },
  { id: "LIMIT", label: "LIMIT", level: "BEGINNER", hint: "Cap row count" },
  { id: "AND", label: "AND", level: "INTERMEDIATE", hint: "Combine conditions" },
  { id: "OR", label: "OR", level: "INTERMEDIATE", hint: "Broaden a search" },
  { id: "LIKE", label: "LIKE", level: "INTERMEDIATE", hint: "Match text patterns" },
  { id: "IN", label: "IN", level: "INTERMEDIATE", hint: "Match a list of values" },
  { id: "BETWEEN", label: "BETWEEN", level: "INTERMEDIATE", hint: "Filter a range" },
  { id: "DISTINCT", label: "DISTINCT", level: "INTERMEDIATE", hint: "Remove duplicates" },
  { id: "COUNT", label: "COUNT", level: "AGGREGATION", hint: "Tally rows per group" },
  { id: "SUM", label: "SUM", level: "AGGREGATION", hint: "Total values per group" },
  { id: "AVG", label: "AVG", level: "AGGREGATION", hint: "Average per group" },
  { id: "GROUP BY", label: "GROUP BY", level: "AGGREGATION", hint: "Organize rows into groups" },
  { id: "HAVING", label: "HAVING", level: "AGGREGATION", hint: "Filter groups" },
  { id: "JOIN", label: "JOIN", level: "ADVANCED", hint: "Connect two tables" },
  { id: "LEFT JOIN", label: "LEFT JOIN", level: "ADVANCED", hint: "Keep unmatched rows" },
  { id: "ALIAS", label: "Aliases", level: "ADVANCED", hint: "Rename tables/columns" },
  { id: "SUBQUERY", label: "Subquery", level: "ADVANCED", hint: "Nest a query" },
  { id: "CASE", label: "CASE", level: "ADVANCED", hint: "Conditional logic" },
];
