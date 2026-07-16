# Agent Development Guide

## 1. Purpose

This guide defines how an implementation or review agent should consume the specification and modify the existing repository. It is designed to prevent common failure modes: clean-slate rewrites, untested format changes, architecture invented from filenames, broad dependency replacement, and apparently complete features that omit undo, persistence, accessibility, or migration.

## 2. Required context

Before coding, the agent must have:

- repository and target branch;
- exact task or requirement IDs;
- current repository audit or a bounded instruction to produce it;
- relevant feature specification;
- accepted and proposed ADRs;
- build and test commands;
- compatibility constraints;
- expected output and review process.

If repository evidence contradicts this draft, the agent records the conflict and proposes a change to the specification or an ADR. It does not silently force the repository into the draft model.

## 3. Work modes

### Audit mode

Inspect, run, trace, and document. Add only minimal characterization tests or diagnostic tooling. Do not begin feature implementation.

### Design mode

Map a requirement to real modules, alternatives, data changes, tests, and migration. Produce a work order and ADR as needed.

### Implementation mode

Make a bounded change from an approved work order. Keep the application buildable and preserve compatibility.

### Review mode

Evaluate correctness, architecture, migration, tests, security, accessibility, and scope. Do not focus only on style.

### Repair mode

Reproduce a failing test or user flow, identify the smallest root cause, and avoid opportunistic unrelated refactoring.

## 4. Standard agent loop

### Step 1 — Read the authority set

Read:

1. `AGENTS.md`;
2. the repository audit;
3. relevant accepted ADRs;
4. requirement rows;
5. feature specification;
6. technical standards;
7. work-order template.

### Step 2 — Verify the repository

Run recorded install, build, test, lint, and type-check commands. Record the baseline. If commands differ, update the audit evidence.

### Step 3 — Trace current behaviour

Locate the actual path from user action through state and rendering to persistence. Cite modules and symbols in the work order.

### Step 4 — Add characterization tests

For behaviour that will be changed or wrapped, create the smallest test that proves current semantics.

### Step 5 — Propose the delta

Describe:

- existing state;
- desired state;
- smallest seam;
- affected interfaces;
- data/migration impact;
- feature flag;
- tests;
- rollback;
- unresolved decisions.

### Step 6 — Implement vertically

Prefer a thin end-to-end slice over a large unintegrated subsystem. For example, a composite slice should include domain creation, one resolver path, renderer display, save/load, undo, and a representative test.

### Step 7 — Validate broadly

Run relevant unit, integration, browser, migration, accessibility, visual, and performance tests. Confirm flag-off behaviour.

### Step 8 — Update documentation

Update requirements, traceability, ADRs, schemas, examples, and feature status.

### Step 9 — Produce a change report

Summarize what changed, why, compatibility, migrations, tests, limitations, and follow-on tasks.

## 5. Work-order requirements

Use `templates/agent-work-order-template.md`. A valid work order includes:

- work-order ID and requirement IDs;
- problem and user outcome;
- audited current behaviour;
- real module/symbol map;
- proposed design;
- alternatives considered;
- invariants;
- schema and migration;
- UI and accessibility;
- security and privacy;
- test matrix;
- feature flag and rollout;
- rollback;
- explicit non-goals;
- acceptance evidence.

The work order should be small enough that a reviewer can understand the intended delta before seeing code.

## 6. No-go zones

Unless an approved ADR explicitly allows it, an agent must not:

- rewrite the application in a different framework;
- replace the current renderer before equivalence is proven;
- alter saved-map meaning without migration;
- use labels as identifiers;
- mutate graph topology to implement visual collapse;
- store animation frames as the only temporal truth;
- insert arbitrary JavaScript evaluation for formulas or stories;
- add remote services or telemetry implicitly;
- import maps from books or blogs without rights review;
- update golden snapshots merely to make CI green;
- suppress failing tests without an issue and owner;
- refactor unrelated modules while implementing a bounded feature;
- claim completion when save/load, undo, or accessibility is omitted from an editable feature.

## 7. Repository exploration strategy

Use targeted exploration:

- inspect package/build manifests;
- search for core entity types and current coordinate fields;
- locate parser and writer entry points;
- locate state mutation and undo mechanisms;
- locate renderer boundary and selection events;
- trace one user flow with debugger or temporary instrumentation;
- inspect tests that already define behaviour;
- read upstream documentation only to clarify inherited behaviour, not to override the fork.

Avoid loading or rewriting the entire repository before a hypothesis exists.

## 8. Design decision threshold

Create or update an ADR when the change affects:

- source-of-truth model;
- persisted format or migration policy;
- stable identity;
- projection or timeline semantics;
- composite overlap or nesting rules;
- story runtime contract;
- security boundary;
- major dependency or framework;
- extensibility model;
- public compatibility contract.

Local implementation choices can remain in code and work-order notes.

## 9. Testing expectations by feature type

### Domain-only

Unit, property, schema, and deterministic serialization tests.

### Editable UI

Domain tests plus component/integration, keyboard, undo/redo, save/load, and end-to-end journey.

### Persisted feature

Migration matrix, round trip, legacy export diagnostics, unknown-field preservation where promised.

### Renderer change

Semantic snapshot, selected visual regression, responsive and accessibility checks.

### Story output

Compiler unit tests, deterministic output, browser tests, sanitization, CSP, hidden-data review, and accessibility.

### Algorithmic analysis

Definition/version test, edge cases, deterministic input ordering, performance bounds, provenance, and failure diagnostics.

## 10. Implementation patterns

### Compatibility facade

Wrap current state behind a stable interface before changing storage.

### Adapter

Translate current renderer or format input into the target contract.

### Characterization harness

Capture legacy output and semantic state before extraction.

### Feature flag

Allow new code paths to coexist until equivalence and migration are proven.

### Pure migration

Transform validated source data without UI or network dependencies.

### Resolved display model

Feed both editor renderer and story compiler from a common renderer-neutral state.

### Explicit provenance

Attach source values and calculations to derived output.

## 11. Common agent failure modes

### “The architecture would be cleaner if rewritten”

Response: demonstrate why an incremental seam cannot meet requirements, quantify migration risk, and write an ADR. Preference is not evidence.

### “Tests are hard because the code is coupled”

Response: add a narrow seam or characterization test around the current boundary. Do not proceed unprotected.

### “The format has no IDs, so labels will do for now”

Response: design a migration or mapping strategy. Temporary label identity becomes permanent data corruption.

### “Pixel snapshots prove it works”

Response: add semantic assertions for topology, IDs, normalized positions, and represented edges.

### “The new field is optional, so no migration is needed”

Response: confirm reader/writer behaviour, default semantics, unknown-field preservation, and legacy clients.

### “The story is static, so sanitization is unnecessary”

Response: static HTML can still execute scripts and expose data. Apply the security model.

### “The AI generated the code and tests”

Response: source does not change review obligations. Validate behaviour and assumptions against the repository.

## 12. Change report template

A completed agent task should report:

- requirements implemented;
- repository baseline and branch;
- modules changed;
- behaviour before and after;
- architecture decision and ADR link;
- persisted-data effect and migration;
- feature flag state;
- tests added and commands run;
- compatibility results;
- accessibility/security review;
- performance result where relevant;
- known limitations;
- follow-on work.

## 13. Review-agent checklist

A review agent asks:

1. Does the change solve the named user outcome?
2. Is current behaviour accurately represented?
3. Is the delta smaller than a rewrite and well bounded?
4. Are graph, view, projection, and timeline concerns separated?
5. Are IDs and references stable?
6. Is data migration safe and tested?
7. Is undo/redo complete?
8. Are invalid inputs handled?
9. Are security and accessibility requirements met?
10. Are tests semantic, deterministic, and traceable?
11. Did scope or dependencies expand without approval?
12. Can the feature be disabled or rolled back?

## 14. Initial agent sequence

Recommended first sequence after access to the repository:

1. Run the repository audit prompt from `prompts/coding-agent-prompt-library.md`.
2. Produce the audit report and baseline characterization tests.
3. Draft repository-specific ADR updates.
4. Implement stable ID and schema-version support if missing.
5. Create the graph/view compatibility seam.
6. Implement a read-only composite fixture through the current renderer.
7. Expand into the first complete composite vertical slice.

No later feature should begin by bypassing unfinished persistence or identity foundations.
