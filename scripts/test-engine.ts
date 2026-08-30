// Direct test of the SQL engine + accusation logic — bypasses the dev server.
// Run with: node --experimental-strip-types scripts/test-engine.ts
import { executeQuery, getSchema } from "../src/lib/sql/engine.ts";

async function test() {
  console.log("=== Schema ===");
  const schema = await getSchema();
  console.log("Tables:", schema.map((t) => t.name).join(", "));
  console.log("Transactions columns:", schema.find((t) => t.name === "transactions")?.columns.map((c) => c.name).join(", "));

  console.log("\n=== Path A: Movements → Maya ===");
  const mayaMoves = await executeQuery("SELECT person_name, location_name, entry_time, exit_time FROM visits WHERE person_name LIKE '%Maya%' ORDER BY entry_time;");
  if (mayaMoves.ok) {
    console.log("Maya movement rows:", mayaMoves.rowCount);
    mayaMoves.rows.forEach((r) => console.log("  ", r.entry_time, r.location_name, "→ exit:", r.exit_time));
  }

  console.log("\n=== Path A: TR-4817 aggregation ===");
  const trAgg = await executeQuery("SELECT reference, COUNT(*) AS cnt, ROUND(SUM(amount),2) AS total, account_holder FROM transactions WHERE reference IS NOT NULL GROUP BY reference ORDER BY total DESC;");
  if (trAgg.ok) {
    console.log("Reference groups:", trAgg.rowCount);
    trAgg.rows.forEach((r) => console.log("  ", r.reference, "cnt=", r.cnt, "total=", r.total, "holder=", r.account_holder));
  }

  console.log("\n=== Path A: TR-4817 individual ===");
  const trInd = await executeQuery("SELECT * FROM transactions WHERE reference = 'TR-4817' ORDER BY transaction_time;");
  if (trInd.ok) {
    console.log("TR-4817 transactions:", trInd.rowCount);
    trInd.rows.forEach((r) => console.log("  ", r.transaction_id, r.direction, r.amount, r.counterparty, "holder=", r.account_holder));
  }

  console.log("\n=== Path A: Camera disabled ===");
  const cam = await executeQuery("SELECT timestamp, event_type, actor_name, details FROM security_logs WHERE event_type = 'CAMERA_DISABLED';");
  if (cam.ok) {
    console.log("Camera disabled events:", cam.rowCount);
    cam.rows.forEach((r) => console.log("  ", r.timestamp, r.actor_name, "—", r.details));
  }

  console.log("\n=== Path A: Terminal wipe ===");
  const wipe = await executeQuery("SELECT timestamp, event_type, actor_name FROM security_logs WHERE event_type = 'TERMINAL_WIPE';");
  if (wipe.ok) {
    console.log("Terminal wipe events:", wipe.rowCount);
    wipe.rows.forEach((r) => console.log("  ", r.timestamp, r.actor_name));
  }

  console.log("\n=== Path B: Messages mentioning TR-4817 ===");
  const msgs = await executeQuery("SELECT sent_time, sender_name, receiver_name, content FROM messages WHERE content LIKE '%TR-4817%' ORDER BY sent_time;");
  if (msgs.ok) {
    console.log("TR-4817 messages:", msgs.rowCount);
    msgs.rows.forEach((r) => console.log("  ", r.sent_time, r.sender_name, "→", r.receiver_name, ":", String(r.content).slice(0, 80)));
  }

  console.log("\n=== Path C: Maya-Daniel calls ===");
  const calls = await executeQuery("SELECT call_time, caller_name, receiver_name, duration_sec FROM calls WHERE (caller_name = 'Maya Chen' AND receiver_name = 'Daniel Brooks') OR (caller_name = 'Daniel Brooks' AND receiver_name = 'Maya Chen') ORDER BY call_time;");
  if (calls.ok) {
    console.log("Maya-Daniel calls:", calls.rowCount);
    calls.rows.forEach((r) => console.log("  ", r.call_time, r.caller_name, "→", r.receiver_name, r.duration_sec + "s"));
  }

  console.log("\n=== Path C: Maya-Daniel SMS ===");
  const sms = await executeQuery("SELECT sent_time, sender_name, receiver_name, content FROM messages WHERE (sender_name = 'Maya Chen' AND receiver_name = 'Daniel Brooks') OR (sender_name = 'Daniel Brooks' AND receiver_name = 'Maya Chen') ORDER BY sent_time;");
  if (sms.ok) {
    console.log("Maya-Daniel SMS:", sms.rowCount);
    sms.rows.forEach((r) => console.log("  ", r.sent_time, r.sender_name, "→", r.receiver_name, ":", String(r.content).slice(0, 70)));
  }

  console.log("\n=== Error handling tests ===");
  const badCol = await executeQuery("SELECT suspect_name FROM suspects;");
  console.log("Bad column:", badCol.ok ? "UNEXPECTED OK" : badCol.error?.title, "—", badCol.error?.message);

  const unsafe = await executeQuery("DROP TABLE suspects;");
  console.log("Unsafe:", unsafe.ok ? "UNEXPECTED OK" : unsafe.error?.title, "—", unsafe.error?.message);

  const empty = await executeQuery("SELECT * FROM suspects WHERE 1=0;");
  console.log("Empty result:", empty.ok ? "ok, " + empty.rowCount + " rows" : empty.error?.title);

  console.log("\n=== All tests passed ===");
}

test().catch((e) => { console.error("TEST FAILED:", e); process.exit(1); });
