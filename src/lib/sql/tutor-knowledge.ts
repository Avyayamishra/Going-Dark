/**
 * SQL Tutor Knowledge Base — deterministic SQL teaching responses.
 *
 * This module provides educational responses about SQL concepts ONLY.
 * It will NEVER reveal case-specific information, suspect names, answers,
 * or anything related to the investigation story.
 *
 * If a user asks about the case, suspects, or solutions, it redirects to SQL.
 */

interface TopicEntry {
  keywords: string[];
  response: string;
}

const TOPICS: TopicEntry[] = [
  {
    keywords: ["select", "what is select", "how to select"],
    response: `SELECT — retrieves data from a table.

SYNTAX:
SELECT column1, column2 FROM table_name;
SELECT * FROM table_name;  -- all columns

EXAMPLE:
SELECT name, role FROM agents;

The SELECT clause specifies which columns you want. Use * to get all columns.
SELECT is always the first clause in a query.`,
  },
  {
    keywords: ["where", "filter", "condition"],
    response: `WHERE — filters rows based on a condition.

SYNTAX:
SELECT * FROM table_name WHERE column = value;

EXAMPLE:
SELECT * FROM agents WHERE status = 'ACTIVE';
SELECT * FROM transactions WHERE amount > 5000;

Operators: =, !=, <, >, <=, >=, LIKE, IN, BETWEEN, IS NULL
Combine conditions with AND, OR, NOT.`,
  },
  {
    keywords: ["order by", "sort", "order"],
    response: `ORDER BY — sorts results by one or more columns.

SYNTAX:
SELECT * FROM table_name ORDER BY column ASC|DESC;

EXAMPLE:
SELECT * FROM transactions ORDER BY amount DESC;
SELECT * FROM agents ORDER BY name ASC;

Use ASC (ascending, default) or DESC (descending).
Order multiple columns: ORDER BY col1 DESC, col2 ASC.`,
  },
  {
    keywords: ["limit", "top", "first"],
    response: `LIMIT — restricts the number of rows returned.

SYNTAX:
SELECT * FROM table_name LIMIT 10;

EXAMPLE:
SELECT * FROM transactions ORDER BY amount DESC LIMIT 5;

Often combined with ORDER BY to get the "top N" results.
LIMIT is useful when you only need a few records from a large table.`,
  },
  {
    keywords: ["distinct", "unique", "deduplicate"],
    response: `DISTINCT — removes duplicate rows, returning only unique values.

SYNTAX:
SELECT DISTINCT column FROM table_name;

EXAMPLE:
SELECT DISTINCT access_id FROM access_logs;
SELECT DISTINCT department FROM employees;

DISTINCT looks at ALL selected columns together. If you select 2 columns,
it returns unique combinations of both.`,
  },
  {
    keywords: ["count", "how many", "tally"],
    response: `COUNT() — counts rows or non-null values.

SYNTAX:
SELECT COUNT(*) FROM table_name;
SELECT COUNT(column) FROM table_name;
SELECT COUNT(DISTINCT column) FROM table_name;

EXAMPLE:
SELECT COUNT(*) FROM transactions;
SELECT department, COUNT(*) FROM employees GROUP BY department;
SELECT COUNT(DISTINCT sender_id) FROM communications;

COUNT(*) counts all rows. COUNT(column) skips NULLs. COUNT(DISTINCT) counts unique values.`,
  },
  {
    keywords: ["group by", "grouping", "aggregate"],
    response: `GROUP BY — groups rows that share a value, so you can aggregate each group.

SYNTAX:
SELECT column, COUNT(*)
FROM table_name
GROUP BY column;

EXAMPLE:
SELECT agent_id, COUNT(*) AS msg_count
FROM communications
GROUP BY agent_id
ORDER BY msg_count DESC;

Use with aggregate functions: COUNT, SUM, AVG, MIN, MAX.
Each non-aggregated column in SELECT must appear in GROUP BY.`,
  },
  {
    keywords: ["having", "filter group", "group filter"],
    response: `HAVING — filters groups AFTER aggregation (like WHERE but for groups).

SYNTAX:
SELECT column, COUNT(*)
FROM table_name
GROUP BY column
HAVING COUNT(*) > 3;

EXAMPLE:
SELECT agent_id, COUNT(*) AS cnt
FROM financial_records
GROUP BY agent_id
HAVING COUNT(*) > 3;

WHERE filters individual rows BEFORE grouping.
HAVING filters groups AFTER grouping.
You can use both in the same query.`,
  },
  {
    keywords: ["sum", "total", "add"],
    response: `SUM() — adds up all numeric values in a group.

SYNTAX:
SELECT SUM(column) FROM table_name;
SELECT category, SUM(amount) FROM table_name GROUP BY category;

EXAMPLE:
SELECT agent_id, SUM(amount) AS total
FROM financial_records
GROUP BY agent_id
ORDER BY total DESC;

SUM ignores NULL values. Use with GROUP BY to total per group.`,
  },
  {
    keywords: ["avg", "average", "mean"],
    response: `AVG() — calculates the average of numeric values.

SYNTAX:
SELECT AVG(column) FROM table_name;
SELECT category, AVG(amount) FROM table_name GROUP BY category;

EXAMPLE:
SELECT agent_id, AVG(amount) AS avg_amount
FROM financial_records
GROUP BY agent_id;

AVG ignores NULL values. Useful for finding typical values and spotting outliers.`,
  },
  {
    keywords: ["min", "minimum", "smallest"],
    response: `MIN() — finds the smallest value in a group.

SYNTAX:
SELECT MIN(column) FROM table_name;
SELECT category, MIN(amount) FROM table_name GROUP BY category;

EXAMPLE:
SELECT agent_id, MIN(timestamp) AS first_event
FROM communications
GROUP BY agent_id;

Works on text too (alphabetically first). Useful for finding earliest/latest events.`,
  },
  {
    keywords: ["max", "maximum", "largest"],
    response: `MAX() — finds the largest value in a group.

SYNTAX:
SELECT MAX(column) FROM table_name;
SELECT category, MAX(amount) FROM table_name GROUP BY category;

EXAMPLE:
SELECT agent_id, MAX(timestamp) AS last_event
FROM communications
GROUP BY agent_id;

Works on text too (alphabetically last). Combine MIN and MAX to find the time range of activity.`,
  },
  {
    keywords: ["join", "inner join", "connect tables"],
    response: `INNER JOIN — combines rows from two tables based on a matching column.

SYNTAX:
SELECT a.column, b.column
FROM table_a a
INNER JOIN table_b b ON a.id = b.foreign_id;

EXAMPLE:
SELECT c.access_id, a.name
FROM credentials c
INNER JOIN agents a ON c.owner_id = a.agent_id;

The ON clause specifies how the tables relate.
Use table aliases (a, b) to keep queries readable.
Only returns rows that have matches in BOTH tables.`,
  },
  {
    keywords: ["left join", "left outer join"],
    response: `LEFT JOIN — keeps ALL rows from the left table, even if there's no match in the right table.

SYNTAX:
SELECT a.column, b.column
FROM table_a a
LEFT JOIN table_b b ON a.id = b.foreign_id;

EXAMPLE:
SELECT a.name, c.access_id
FROM agents a
LEFT JOIN credentials c ON a.agent_id = c.owner_id;

Unmatched rows from the right table show NULL.
Useful when you want to see records that DON'T have a match.`,
  },
  {
    keywords: ["alias", "as", "rename"],
    response: `AS — assigns a temporary name (alias) to a column or table.

COLUMN ALIAS:
SELECT column AS new_name FROM table;
SELECT COUNT(*) AS total FROM table;

TABLE ALIAS:
SELECT a.name FROM agents AS a;
SELECT a.name FROM agents a;  -- AS is optional for tables

Aliases make results readable and simplify JOINs.
Column aliases appear as column headers in results.`,
  },
  {
    keywords: ["like", "pattern", "wildcard"],
    response: `LIKE — matches text patterns using wildcards.

SYNTAX:
SELECT * FROM table WHERE column LIKE 'pattern';

WILDCARDS:
%  = any sequence of characters (zero or more)
_  = exactly one character

EXAMPLE:
SELECT * FROM communications WHERE message_hash LIKE '%TR-914%';
SELECT * FROM agents WHERE name LIKE 'An%';

LIKE is case-insensitive in SQLite.
Use %keyword% to find text containing a word anywhere.`,
  },
  {
    keywords: ["in", "list", "multiple values"],
    response: `IN — matches against a list of values (cleaner than multiple ORs).

SYNTAX:
SELECT * FROM table WHERE column IN (val1, val2, val3);

EXAMPLE:
SELECT * FROM agents WHERE agent_id IN ('AGT-001', 'AGT-003', 'AGT-005');
SELECT * FROM transactions WHERE currency IN ('USD', 'EUR');

You can also use a subquery with IN:
SELECT * FROM agents WHERE agent_id IN (SELECT owner_id FROM credentials);`,
  },
  {
    keywords: ["between", "range"],
    response: `BETWEEN — filters values within a range (inclusive).

SYNTAX:
SELECT * FROM table WHERE column BETWEEN val1 AND val2;

EXAMPLE:
SELECT * FROM satellite_events
WHERE timestamp BETWEEN '2025-03-15 01:50:00' AND '2025-03-15 02:30:00';

SELECT * FROM transactions WHERE amount BETWEEN 1000 AND 5000;

BETWEEN includes both endpoints. Works with numbers, text, and dates.
For timestamps, use ISO format: 'YYYY-MM-DD HH:MM:SS'.`,
  },
  {
    keywords: ["is null", "null", "empty value"],
    response: `IS NULL — finds rows where a column has no value (NULL).

SYNTAX:
SELECT * FROM table WHERE column IS NULL;
SELECT * FROM table WHERE column IS NOT NULL;

EXAMPLE:
SELECT * FROM agent_movements WHERE departed_at IS NULL;
SELECT * FROM transactions WHERE reference_code IS NOT NULL;

IMPORTANT: You cannot use = NULL. Always use IS NULL or IS NOT NULL.
NULL means "unknown" — it's different from 0 or an empty string.`,
  },
  {
    keywords: ["and", "or", "not", "combine conditions"],
    response: `AND, OR, NOT — combine multiple conditions in WHERE.

SYNTAX:
SELECT * FROM table WHERE cond1 AND cond2;
SELECT * FROM table WHERE cond1 OR cond2;
SELECT * FROM table WHERE NOT cond;

EXAMPLE:
SELECT * FROM agents WHERE status = 'ACTIVE' AND clearance_level = 'TOP_SECRET';
SELECT * FROM transactions WHERE amount > 5000 OR reference_code = 'TR-914';

Use parentheses to control precedence:
WHERE (status = 'ACTIVE' OR status = 'PENDING') AND department = 'Security'`,
  },
  {
    keywords: ["subquery", "nested query", "inner query"],
    response: `SUBQUERY — a query inside another query.

SYNTAX:
SELECT * FROM table
WHERE column IN (SELECT column FROM other_table WHERE condition);

EXAMPLE:
SELECT * FROM agents
WHERE agent_id IN (SELECT owner_id FROM credentials WHERE access_id = 'RUS-77A');

SELECT * FROM transactions
WHERE amount > (SELECT AVG(amount) FROM transactions);

Subqueries can appear in WHERE, SELECT, FROM, and HAVING clauses.
They let you use one query's result as input to another.`,
  },
  {
    keywords: ["case", "conditional", "if then"],
    response: `CASE — conditional logic inside a query (like if/else).

SYNTAX:
SELECT column,
  CASE WHEN condition THEN result1
       WHEN condition2 THEN result2
       ELSE result3
  END AS label
FROM table;

EXAMPLE:
SELECT name,
  CASE WHEN amount > 10000 THEN 'HIGH'
       WHEN amount > 1000 THEN 'MEDIUM'
       ELSE 'LOW'
  END AS risk_level
FROM transactions;

CASE returns different values per row based on conditions.
Useful for categorizing data without modifying the table.`,
  },
  {
    keywords: ["union", "combine results", "merge"],
    response: `UNION — combines results of two queries into one set.

SYNTAX:
SELECT col1, col2 FROM table_a
UNION
SELECT col1, col2 FROM table_b;

EXAMPLE:
SELECT 'movement' AS type, arrived_at AS ts, location_id
FROM agent_movements WHERE agent_id = 'AGT-003'
UNION
SELECT 'communication' AS type, timestamp AS ts, receiver_id
FROM communications WHERE sender_id = 'AGT-003'
ORDER BY ts;

UNION removes duplicates. UNION ALL keeps all rows (faster).
Both queries must return the same number of columns with compatible types.
Great for building unified timelines from multiple tables.`,
  },
  {
    keywords: ["cte", "with", "common table expression"],
    response: `CTE (WITH) — defines a temporary named result set for use in a query.

SYNTAX:
WITH cte_name AS (
  SELECT ... FROM table WHERE ...
)
SELECT * FROM cte_name WHERE condition;

EXAMPLE:
WITH suspect_financials AS (
  SELECT agent_id, COUNT(*) AS tx_count, SUM(amount) AS total
  FROM financial_records
  WHERE reference_code = 'TR-914'
  GROUP BY agent_id
)
SELECT a.name, sf.tx_count, sf.total
FROM suspect_financials sf
JOIN agents a ON sf.agent_id = a.agent_id;

CTEs make complex queries readable by breaking them into steps.
You can chain multiple CTEs with commas.
They're especially useful for multi-step analysis.`,
  },
  {
    keywords: ["window function", "row_number", "lag", "lead", "over"],
    response: `WINDOW FUNCTIONS — perform calculations across related rows without grouping.

SYNTAX:
SELECT column, ROW_NUMBER() OVER (ORDER BY column) AS row_num
FROM table;

SELECT column, LAG(column) OVER (ORDER BY timestamp) AS prev_value
FROM table;

COMMON FUNCTIONS:
ROW_NUMBER() — sequential row number
RANK() — rank with gaps for ties
LAG(column) — value from the previous row
LEAD(column) — value from the next row
SUM(column) OVER (...) — running total

EXAMPLE:
SELECT timestamp, event_type,
  LAG(timestamp) OVER (ORDER BY timestamp) AS prev_ts
FROM satellite_events;

Window functions use OVER() to define the "window" of rows.
They don't collapse rows like GROUP BY does.`,
  },
  {
    keywords: ["string", "text", "concat", "substr"],
    response: `STRING FUNCTIONS in SQLite:

||         — concatenate strings: 'Hello' || ' ' || 'World'
UPPER(x)  — uppercase: UPPER('hello') = 'HELLO'
LOWER(x)  — lowercase
LENGTH(x) — string length
SUBSTR(x, start, len) — substring
TRIM(x)   — remove leading/trailing spaces
REPLACE(x, old, new) — replace text

EXAMPLE:
SELECT name || ' (' || codename || ')' AS display_name FROM agents;
SELECT UPPER(name) FROM agents;
SELECT SUBSTR(description, 1, 50) FROM transactions;`,
  },
  {
    keywords: ["date", "time", "timestamp", "datetime"],
    response: `DATE/TIME FUNCTIONS in SQLite:

date(x)       — extract date: date('2025-03-15 02:13:00') = '2025-03-15'
time(x)       — extract time: time('2025-03-15 02:13:00') = '02:13:00'
strftime(fmt, x) — format: strftime('%H:%M', '2025-03-15 02:13:00') = '02:13'
datetime(x)   — normalize datetime string

EXAMPLE:
SELECT date(timestamp) AS day, COUNT(*)
FROM satellite_events
GROUP BY day;

SELECT strftime('%H:%M', timestamp) AS hour_min
FROM access_logs;

Timestamps are stored as TEXT in ISO format: 'YYYY-MM-DD HH:MM:SS'.
You can compare them with <, >, BETWEEN directly.`,
  },
];

// Guard words — if the user asks about case content, redirect to SQL.
const CASE_KEYWORDS = [
  "who killed", "who is the killer", "who is the murderer", "murderer", "killer",
  "who stole", "who accessed", "who hacked", "suspect", "culprit", "guilty",
  "answer", "solution", "who did it", "tell me the answer",
  "maya", "daniel", "sofia", "ryan", "elias", "voss", "nexora",
  "sokolov", "ethan", "anya", "petrova", "dmitri", "volkov", "lena", "kovac",
  "kosmos", "satellite", "tr-4817", "tr-914", "rus-77a",
  "archive", "midnight", "black orbit", "case 1", "case 2",
  "evidence", "accuse", "accusation",
];

export function getSqlTutorResponse(userInput: string): string {
  const input = userInput.toLowerCase().trim();

  // Check if the user is asking about the case
  for (const keyword of CASE_KEYWORDS) {
    if (input.includes(keyword)) {
      return `I'm a SQL tutor, not a case investigator. I can only teach you SQL concepts (SELECT, WHERE, JOIN, GROUP BY, etc.). I cannot discuss case details, suspects, evidence, or solutions. Try asking me about a SQL topic like "How does JOIN work?" or "What is GROUP BY?"`;
    }
  }

  // Find matching topic
  for (const topic of TOPICS) {
    for (const keyword of topic.keywords) {
      if (input.includes(keyword)) {
        return topic.response;
      }
    }
  }

  // Default: show available topics
  return `I can teach you about these SQL concepts:

BASIC: SELECT, WHERE, ORDER BY, LIMIT, DISTINCT
AGGREGATION: COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING
JOINING: INNER JOIN, LEFT JOIN, aliases (AS)
FILTERING: LIKE, IN, BETWEEN, IS NULL, AND/OR/NOT
ADVANCED: subqueries, CASE, UNION, CTE (WITH), window functions
HELPERS: string functions, date/time functions

Ask me about any of these, e.g. "How does GROUP BY work?"`;
}
