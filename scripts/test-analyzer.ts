// Test the SQL analyzer.
import { analyzeQuery } from "../src/lib/sql/analyzer.ts";

const tests = [
  "SELECT * FROM suspects;",
  "SELECT * FROM visits WHERE entry_time BETWEEN '2025-03-14 22:40:00' AND '2025-03-14 22:55:00' ORDER BY entry_time;",
  "SELECT reference, COUNT(*) AS cnt, SUM(amount) AS total, account_holder FROM transactions WHERE reference IS NOT NULL GROUP BY reference ORDER BY total DESC;",
  "SELECT s.name, v.location_name, v.entry_time FROM suspects s INNER JOIN visits v ON s.badge_id = v.badge_id WHERE v.location_name = 'Archive';",
  "SELECT * FROM transactions WHERE reference = 'TR-4817' LIMIT 5;",
  "SELECT DISTINCT account_holder FROM transactions WHERE reference = 'TR-4817';",
];

for (const sql of tests) {
  const a = analyzeQuery(sql);
  console.log("---");
  console.log("SQL:", sql.slice(0, 70), "...");
  console.log("concepts:", a.concepts.join(", "));
  console.log("level:", a.level);
  console.log("insight:", a.insight ? `${a.insight.title} — ${a.insight.body.slice(0, 70)}...` : "(none)");
}
