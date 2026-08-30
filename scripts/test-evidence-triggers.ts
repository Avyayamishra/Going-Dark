// Test evidence triggers fire for each investigation path's key queries.
// Run with: node --experimental-strip-types scripts/test-evidence-triggers.ts
import { executeQuery } from "../src/lib/sql/engine.ts";
import { EVIDENCE_TRIGGERS, type EvidenceTriggerContext } from "../src/data/caseData.ts";

function inferTableName(sql: string): string | undefined {
  const m = sql.match(/from\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
  return m ? m[1].toLowerCase() : undefined;
}

async function checkTriggers(label: string, sql: string) {
  const result = await executeQuery(sql);
  if (!result.ok) {
    console.log(`  [${label}] query failed: ${result.error.title}`);
    return [];
  }
  const ctx: EvidenceTriggerContext = {
    sql,
    sqlUpper: sql.toUpperCase(),
    columns: result.columns,
    rows: result.rows,
    rowCount: result.rowCount,
    tableName: inferTableName(sql),
  };
  const fired = EVIDENCE_TRIGGERS.filter((t) => {
    try {
      return t.test(ctx);
    } catch {
      return false;
    }
  });
  console.log(`  [${label}] rows=${result.rowCount} evidence fired: ${fired.map((t) => t.evidenceId).join(", ") || "(none)"}`);
  return fired;
}

async function test() {
  console.log("=== Path A: Movements → Maya → transactions → security ===");
  await checkTriggers("Maya movements", "SELECT person_name, location_name, entry_time FROM visits WHERE person_name LIKE '%Maya%' ORDER BY entry_time;");
  await checkTriggers("Maya archive visits", "SELECT person_name, entry_time, exit_time FROM visits WHERE location_name = 'Archive' AND person_name = 'Maya Chen';");
  await checkTriggers("TR-4817 aggregate", "SELECT reference, COUNT(*) AS cnt, SUM(amount) AS total, account_holder FROM transactions WHERE reference = 'TR-4817' GROUP BY reference;");
  await checkTriggers("TR-4817 detail", "SELECT * FROM transactions WHERE reference = 'TR-4817';");
  await checkTriggers("Camera disabled", "SELECT timestamp, event_type, actor_name FROM security_logs WHERE event_type = 'CAMERA_DISABLED';");
  await checkTriggers("Terminal wipe", "SELECT timestamp, event_type, actor_name FROM security_logs WHERE event_type = 'TERMINAL_WIPE';");

  console.log("\n=== Path B: Messages → TR-4817 ===");
  await checkTriggers("Elias messages", "SELECT sent_time, sender_name, receiver_name, content FROM messages WHERE sender_id = 'EMP-001' OR receiver_id = 'EMP-001' ORDER BY sent_time;");
  await checkTriggers("TR-4817 messages", "SELECT * FROM messages WHERE content LIKE '%TR-4817%';");

  console.log("\n=== Path C: Calls → Daniel → Maya ===");
  await checkTriggers("Maya-Daniel SMS", "SELECT sent_time, sender_name, receiver_name, content FROM messages WHERE (sender_name = 'Maya Chen' AND receiver_name = 'Daniel Brooks') OR (sender_name = 'Daniel Brooks' AND receiver_name = 'Maya Chen') ORDER BY sent_time;");
  await checkTriggers("Maya-Daniel calls", "SELECT call_time, caller_name, receiver_name FROM calls WHERE (caller_name = 'Maya Chen' AND receiver_name = 'Daniel Brooks') OR (caller_name = 'Daniel Brooks' AND receiver_name = 'Maya Chen') ORDER BY call_time;");

  console.log("\n=== Cross-thread: broad visits query ===");
  await checkTriggers("All visits", "SELECT * FROM visits;");

  console.log("\n=== Evidence table query ===");
  await checkTriggers("Evidence catalog", "SELECT * FROM evidence;");

  console.log("\n=== All trigger tests complete ===");
}

test().catch((e) => { console.error("TEST FAILED:", e); process.exit(1); });
