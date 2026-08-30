# SQL SPY MYSTERY — CASE #002: THE BLACK ORBIT

## Difficulty: ★★★★★ 5/5

### THE CORE STORY

At 02:13 UTC, an encrypted Russian military communications satellite known as **KOSMOS-9147** briefly disappeared from its assigned orbital network.

For exactly **seven minutes and forty-two seconds**, the satellite transmitted an impossible signal.

Then it returned to normal.

Russian authorities claimed it was a routine telemetry malfunction.

The IMF believes otherwise.

The satellite contains a classified communications relay capable of connecting military installations across Eastern Europe. Someone attempted to access it using credentials that should have been impossible to obtain.

The operation was not supposed to be connected to Ethan Hunt.

But it was.

---

# THE INCIDENT

At 01:58 UTC, an unknown authentication request appeared in the satellite's communication logs.

The request used a legitimate Russian authorization certificate.

At 02:03 UTC, the satellite changed communication channels.

At 02:13 UTC, its telemetry became inconsistent.

At 02:20:42 UTC, normal operation resumed.

Seven minutes and forty-two seconds were missing from the satellite's public telemetry record.

The IMF intercept team believes someone used the missing period to extract a classified orbital communication key.

Ethan Hunt was sent to determine:

**Who accessed the satellite?**

**How did they obtain legitimate credentials?**

**Who inside the operation helped them?**

**What was stolen?**

**And why was Ethan deliberately given incomplete information?**

---

# THE INITIAL BRIEF

The player receives only:

**AGENT:** Ethan Hunt

**ORGANIZATION:** IMF

**TARGET:** KOSMOS-9147

**INCIDENT:** Unauthorized satellite access

**WINDOW:** 01:50–02:30 UTC

**KNOWN ACCESS ID:** RUS-77A

**UNKNOWN FACT:** Identity of the operator

The IMF database contains records from the incident.

The player is not given an investigation sequence.

They must construct it.

---

# DATABASE

The investigation database contains:

### `agents`

IMF and allied personnel.

Columns:

- `agent_id`
- `name`
- `codename`
- `role`
- `clearance_level`
- `status`

### `satellites`

Satellite registry.

Columns:

- `satellite_id`
- `name`
- `operator`
- `orbit_class`
- `status`

### `access_logs`

Authentication and access events.

Columns:

- `log_id`
- `satellite_id`
- `access_id`
- `event_type`
- `timestamp`
- `result`
- `source_region`

### `credentials`

Credential registry.

Columns:

- `credential_id`
- `access_id`
- `owner_id`
- `issued_at`
- `expires_at`
- `status`

### `communications`

Intercepted communications.

Columns:

- `message_id`
- `sender_id`
- `receiver_id`
- `timestamp`
- `channel`
- `classification`
- `message_hash`

### `locations`

Known locations.

Columns:

- `location_id`
- `name`
- `country`
- `latitude`
- `longitude`

### `agent_movements`

Movement records.

Columns:

- `agent_id`
- `location_id`
- `arrived_at`
- `departed_at`
- `method`

### `financial_records`

Financial transactions.

Columns:

- `transaction_id`
- `agent_id`
- `amount`
- `currency`
- `timestamp`
- `description`
- `reference_code`

### `mission_records`

Mission assignments.

Columns:

- `mission_id`
- `agent_id`
- `mission_name`
- `start_time`
- `end_time`
- `status`

### `satellite_events`

Satellite telemetry events.

Columns:

- `event_id`
- `satellite_id`
- `event_type`
- `timestamp`
- `severity`
- `event_code`

### `evidence`

Physical and digital evidence.

Columns:

- `evidence_id`
- `description`
- `reference_code`
- `found_at`
- `related_agent`

### `identity_events`

Identity verification events.

Columns:

- `event_id`
- `access_id`
- `claimed_identity`
- `verification_method`
- `timestamp`
- `result`

---

# THE CENTRAL MYSTERY

The IMF initially believes the attack was performed by a Russian intelligence operative.

But there is a problem.

The authentication certificate belongs to someone who was officially somewhere else.

The investigation eventually reveals that the satellite operation was not simply an external attack.

Someone inside the intelligence network manipulated the identity records.

Someone else provided access information.

And someone deliberately created a false trail pointing toward Ethan Hunt.

---

# 24 INVESTIGATION CLUES

Each clue below is an **investigative question that should require the player to write a SQL query**.

The game should NOT immediately provide the query.

The player must translate the question into SQL.

---

## CLUE 01 — FIND THE SATELLITE

### Investigative Question

Which satellite experienced critical events between 01:50 and 02:30 UTC?

### SQL Concept

`WHERE`

`BETWEEN`

### Discovery

The player identifies **KOSMOS-9147** as the satellite involved.

---

## CLUE 02 — FIND THE FIRST ANOMALY

### Investigative Question

What was the earliest recorded event involving KOSMOS-9147 during the incident window?

### SQL Concept

`ORDER BY`

`LIMIT`

### Discovery

The first anomaly occurred shortly before the authentication event.

---

## CLUE 03 — FIND THE SEVEN-MINUTE GAP

### Investigative Question

Which satellite events occurred between 02:13 and 02:21 UTC?

### SQL Concept

Time filtering.

Multiple conditions.

### Discovery

The player notices that several expected telemetry events are missing.

---

## CLUE 04 — FIND THE ACCESS ID

### Investigative Question

Which access IDs successfully authenticated with KOSMOS-9147 during the incident?

### SQL Concept

`SELECT`

`WHERE`

`DISTINCT`

### Discovery

The suspicious authentication used:

**RUS-77A**

---

## CLUE 05 — HOW OFTEN WAS RUS-77A USED?

### Investigative Question

How many times was each access ID used during the incident window?

### SQL Concept

`COUNT`

`GROUP BY`

### Discovery

RUS-77A appears far less frequently than normal credentials.

That makes it unusual.

---

## CLUE 06 — WHO OWNS THE CREDENTIAL?

### Investigative Question

Which person is registered as the owner of RUS-77A?

### SQL Concept

`JOIN`

### Discovery

The credential officially belongs to:

**Colonel Viktor Sokolov**

---

## CLUE 07 — CHECK THE CREDENTIAL STATUS

### Investigative Question

Was Sokolov's credential officially active when the satellite was accessed?

### SQL Concept

Multiple `WHERE` conditions.

### Discovery

The credential was technically valid.

The mystery becomes harder.

Someone apparently used a legitimate credential.

---

## CLUE 08 — WHERE WAS SOKOLOV?

### Investigative Question

Where was Sokolov recorded during the satellite incident?

### SQL Concept

`JOIN`

`BETWEEN`

### Discovery

Sokolov's movement record places him hundreds of kilometers away.

---

## CLUE 09 — FIND THE CONTRADICTION

### Investigative Question

Which credential owner was recorded away from the relevant operational location when their credential was used?

### SQL Concept

Multi-table `JOIN`.

Time comparison.

### Discovery

Sokolov's identity and physical location do not match the satellite access.

The credential was probably being used by someone else.

---

## CLUE 10 — FIND OTHER USES OF THE CREDENTIAL

### Investigative Question

What other systems or events used RUS-77A in the 24 hours before the incident?

### SQL Concept

`WHERE`

`ORDER BY`

### Discovery

RUS-77A was used several times shortly before the satellite incident.

One of the uses occurred at a secure facility.

---

## CLUE 11 — WHO WAS THERE?

### Investigative Question

Which agents were physically present at that facility when RUS-77A was used?

### SQL Concept

`JOIN`

Time-range comparison.

### Discovery

Three people were potentially in the area.

One of them is an IMF operative.

---

## CLUE 12 — FIND THE COMMUNICATION

### Investigative Question

Which communications occurred between the people present at the facility during the hour before the satellite access?

### SQL Concept

`JOIN`

`BETWEEN`

`ORDER BY`

### Discovery

Two people communicated shortly before the credential was used.

---

## CLUE 13 — FIND REPEATED CONTACT

### Investigative Question

Which pair of people communicated most frequently during the six hours before the incident?

### SQL Concept

`GROUP BY`

`COUNT`

`ORDER BY`

### Discovery

One pair communicated dramatically more often than the others.

---

## CLUE 14 — FIND THE UNUSUAL CHANNEL

### Investigative Question

Which communication channel was used unusually frequently by that pair?

### SQL Concept

`GROUP BY`

`COUNT`

`HAVING`

### Discovery

A supposedly low-priority encrypted channel was heavily used.

---

## CLUE 15 — SEARCH THE MESSAGE REFERENCES

### Investigative Question

Which communications contain references to the satellite, its access ID, or the incident code?

### SQL Concept

`LIKE`

Multiple conditions.

### Discovery

A message contains an indirect reference to:

**RUS-77A**

But the message does not mention the satellite by name.

---

## CLUE 16 — FIND THE FINANCIAL CONNECTION

### Investigative Question

Which agents received unusual financial transfers within 48 hours before the incident?

### SQL Concept

`WHERE`

`GROUP BY`

`SUM`

### Discovery

One agent received several small payments.

Individually they look harmless.

Together they are significant.

---

## CLUE 17 — FIND THE PATTERN

### Investigative Question

Which agents received more than three transfers associated with the same reference pattern?

### SQL Concept

`GROUP BY`

`COUNT`

`HAVING`

### Discovery

One person has a repeated connection to the same financial network.

---

## CLUE 18 — DECODE TR-914

### Investigative Question

Which tables contain records associated with the reference code `TR-914`?

### SQL Concept

The player must investigate the schema and search multiple datasets.

### Discovery

The reference appears in:

- financial records
- evidence
- communications

The financial activity and the satellite operation may be connected.

---

## CLUE 19 — FOLLOW THE MONEY

### Investigative Question

Which agents are connected to both the suspicious financial records and the communications containing TR-914?

### SQL Concept

Multiple `JOIN`s.

### Discovery

The same individual appears in both investigative threads.

---

## CLUE 20 — FIND THE IDENTITY ANOMALY

### Investigative Question

Which successful satellite authentication has a claimed identity that conflicts with the registered credential owner?

### SQL Concept

Multi-table `JOIN`.

Conditional filtering.

### Discovery

The person authenticated under Sokolov's credential was not necessarily Sokolov.

---

## CLUE 21 — FIND DUPLICATE IDENTITY PATTERNS

### Investigative Question

Which access IDs were associated with more than one claimed identity?

### SQL Concept

`GROUP BY`

`COUNT(DISTINCT ...)`

`HAVING`

### Discovery

RUS-77A appears under multiple identity records.

This proves that the identity trail was manipulated.

---

## CLUE 22 — BUILD THE TIMELINE

### Investigative Question

For each suspicious agent, order their communications, movements, financial activity, and satellite-related events chronologically.

### SQL Concept

Multiple joins.

`UNION`

`ORDER BY`

### Discovery

The player can reconstruct a timeline.

One person's movements, communications, and financial activity line up almost perfectly with the satellite incident.

---

## CLUE 23 — FIND THE OUTLIER

### Investigative Question

Which agent's activity during the incident differs most significantly from their normal activity during previous missions?

### SQL Concept

Advanced aggregation.

Subquery or CTE.

Comparison against historical activity.

### Discovery

One agent displays an abnormal pattern:

- unusual communication activity
- unusual movement
- unusual financial activity
- connection to RUS-77A
- connection to TR-914

This is the strongest suspect.

---

## CLUE 24 — RECONSTRUCT THE OPERATION

### Investigative Question

Which person is simultaneously connected to:

1. RUS-77A,
2. the identity anomaly,
3. the suspicious communications,
4. TR-914,
5. the financial transfers,
6. and a physical location consistent with the incident?

### SQL Concept

**Advanced multi-table JOIN**

**CTE**

**Subqueries**

**Conditional aggregation**

### Discovery

All independent investigative threads converge on the same person.

The player now has enough evidence to accuse the real culprit.

---

# ADVANCED FINAL CLUE

For a true 5/5 experience, don't make Clue 24 the final query.

Give the player one optional **MASTER QUERY** challenge.

## MASTER QUERY

### Question

Can you produce a single result showing every suspect who satisfies all of the following?

- possessed access to the relevant credential network,
- had contact with the associated conspirator,
- appeared near a relevant location,
- had suspicious financial activity,
- and was connected to the satellite incident.

The result should include:

- name
- codename
- credential
- number of suspicious communications
- number of suspicious transactions
- relevant location
- first suspicious event
- last suspicious event

### Expected SQL Skills

This should require several advanced concepts:

`WITH`

`JOIN`

`GROUP BY`

`COUNT`

`COUNT(DISTINCT ...)`

`SUM`

`CASE`

`HAVING`

subqueries

time comparisons

possibly window functions such as:

`ROW_NUMBER()`

or

`LAG()`

The player should feel that they have moved from beginner SQL into genuine investigative data analysis.

---

# THE FINAL REVELATION

The investigation eventually reveals that the satellite access was not performed by the person whose credentials appeared in the logs.

A second individual obtained access information from inside the network.

The financial records reveal the hidden relationship.

The communications reveal coordination.

The movement records establish opportunity.

The identity records reveal the deception.

The satellite logs establish the operation.

And the evidence connecting all five threads reveals the person who orchestrated the incident.

The crucial twist:

**Ethan Hunt was deliberately inserted into the investigation trail.**

Someone wanted the IMF to believe Ethan had unauthorized knowledge of the operation.

The purpose was not simply to steal the satellite key.

It was to create an intelligence incident that would cause multiple agencies to suspect one another.

The satellite was only one part of a much larger operation.

---

# FINAL ACCUSATION

The player must answer:

### WHO WAS RESPONSIBLE?

Select the suspect.

### WHAT WAS THE OBJECTIVE?

Select the most likely objective.

### HOW WAS THE IDENTITY TRAIL MANIPULATED?

Select the supporting evidence.

### WHAT CONNECTS THE SUSPECT TO THE SATELLITE?

Select the strongest database evidence.

### WHAT PROVES THE SUSPECT'S STORY IS FALSE?

Select the movement/communication contradiction.

---

# DIFFICULTY DESIGN — 5/5

The player should encounter SQL concepts progressively:

### Level 1
`SELECT`

`WHERE`

`BETWEEN`

`ORDER BY`

`LIMIT`

### Level 2
`DISTINCT`

`COUNT`

`GROUP BY`

`HAVING`

`LIKE`

### Level 3
`JOIN`

Multiple joins

Time comparisons

Self-joins

### Level 4
Subqueries

`CASE`

Conditional aggregation

`UNION`

### Level 5
CTEs

Window functions

Cross-table timeline reconstruction

Nested queries

Multi-condition evidence correlation

---

# THE DESIGN PRINCIPLE

The game should never say:

> "Now use a JOIN."

Instead it asks:

**"Sokolov owns the credential, but he wasn't there. Who else can explain this?"**

The player realizes that the information exists in different tables.

They need a `JOIN`.

It should never say:

> "Use HAVING."

Instead:

**"Which agents had more than three suspicious transfers?"**

The player realizes that `GROUP BY` alone isn't enough.

They discover `HAVING`.

It should never say:

> "Use a CTE."

Instead:

**"Compare each suspect's activity during the incident against their normal activity during previous missions."**

The player realizes that the problem is too complex for a simple query.

They discover CTEs.

---

# THE CORE GAME LOOP

CASE

↓

INCIDENT

↓

QUESTION

↓

WRITE SQL

↓

QUERY DATABASE

↓

DISCOVER RECORD

↓

CONNECT EVIDENCE

↓

FORM HYPOTHESIS

↓

ASK A HARDER QUESTION

↓

WRITE MORE COMPLEX SQL

↓

RECONSTRUCT TIMELINE

↓

IDENTIFY CONTRADICTION

↓

CONNECT MULTIPLE TABLES

↓

BUILD THE CASE

↓

FINAL ACCUSATION

↓

CASE SOLVED

The player should finish thinking:

**"I didn't solve a set of SQL exercises."**

**"I investigated a spy operation, and SQL was the only way to uncover what really happened."**