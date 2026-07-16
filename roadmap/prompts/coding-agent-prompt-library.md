# Coding-Agent Prompt Library

These prompts are starting points. Replace bracketed fields with repository-specific values and provide the relevant files. Do not ask an agent to implement a major feature using this documentation pack alone; it also needs the audited repository and exact work order.

## 1. Repository audit prompt

```text
You are auditing the existing repository at [REPOSITORY/PATH], branch [BRANCH], commit [COMMIT].

Read AGENTS.md, docs/02-current-state-assessment-and-repository-audit.md, docs/04-target-architecture-and-migration.md, docs/11-testing-and-validation-strategy.md, and templates/repo-audit-report-template.md.

Mission:
1. Reproduce install, run, build, test, lint, type-check, and deployment/preview paths.
2. Trace the real module and symbol flow for: create/move node, create/delete edge, open map, save/export, undo/redo, and map settings.
3. Inventory node/edge/map representations, identity, coordinate conventions, persistence formats, rendering, state management, selection, accessibility, security, and performance.
4. Add only the minimum characterization tests needed to protect critical current behaviour. Do not begin feature implementation or broad refactoring.
5. Produce a completed repository audit report, current-state diagrams, compatibility matrix, risk findings, and a repository-specific mapping from target architecture responsibilities to actual modules.
6. Mark each assumption in the draft documentation as confirmed, changed, rejected, or unresolved.

Rules:
- Do not propose a rewrite merely because the code is coupled or unfamiliar.
- Cite exact files, symbols, commands, test names, and observed output.
- Preserve failures and warnings as evidence; classify rather than hide them.
- Do not copy third-party maps into fixtures without rights review.
- Stop and report if the repository or branch is not the intended working fork.

Output:
- audit report;
- characterization tests and commands run;
- first three bounded work-order candidates;
- decisions requiring owner approval.
```

## 2. Feature design prompt

```text
Design a repository-specific implementation for requirements [REQUIREMENT IDS] using [FEATURE SPEC] and the current audit at [AUDIT PATH].

Read accepted ADRs and templates/agent-work-order-template.md. Inspect the actual modules before proposing changes.

Produce an agent work order containing:
- current behaviour and exact module/symbol map;
- smallest compatible vertical delta;
- data model and invariant changes;
- schema version, migration, legacy export, and rollback;
- command and undo/redo behaviour;
- UI, keyboard, focus, reduced-motion, and error states;
- security and privacy implications;
- deterministic algorithms and diagnostics;
- test matrix linked to requirements and fixtures;
- feature flag and rollout;
- alternatives considered and non-goals;
- any ADR required.

Do not write implementation code until the work order is coherent and conflicts are surfaced.
```

## 3. Composite-node implementation prompt

```text
Implement the approved composite-node work order [WORK ORDER].

Authoritative inputs:
- repository audit;
- accepted ADRs, especially ADR-0001 through ADR-0005 as approved or superseded;
- docs/06-feature-composite-nodes.md;
- requirement IDs [CMP IDS];
- current build and test commands.

Implementation order:
1. Add/confirm characterization tests for affected selection, renderer, persistence, and undo behaviour.
2. Implement pure membership closure, cycle validation, edge classification, bundling, and proxy-position logic.
3. Add the renderer-neutral display state and a read-only authored fixture behind the feature flag.
4. Add atomic create/collapse/expand/dissolve commands and accessible selection route.
5. Integrate undo/redo, save/load, migration, and legacy export diagnostics.
6. Add keyboard/focus behaviour, reduced-motion transition if used, performance measurement, and documentation.

Non-negotiable invariants:
- original nodes and edges remain in the graph during collapse;
- boundary bundles retain represented edge IDs;
- duplicate labels do not affect identity;
- cycles are rejected;
- flag-off current behaviour remains tested;
- no saved-format change without versioning and migration.

Return:
- code and tests;
- updated requirement traceability;
- ADR changes if needed;
- change report with commands and compatibility evidence.
```

## 4. Temporal-engine implementation prompt

```text
Implement the approved temporal-map work order [WORK ORDER] for requirements [TMP IDS].

Use a deterministic base-plus-sparse-keyframe model unless an accepted ADR supersedes it. Separate exact state resolution from visual animation.

Required sequence:
1. Pure keyframe ordering, patch application, exact materialization, and interpolation tests.
2. Stable lifecycle semantics for node/edge appearance and retirement.
3. Renderer-neutral resolved state at exact and intermediate times.
4. Timeline controls and explicit edit-at-keyframe behaviour.
5. Undo/redo, save/load, diagnostics, and static-map compatibility.
6. Composite collapse-state integration and story-reference contract.
7. Keyboard, focus, reduced motion, browser tests, and performance profiling.

Do not store screenshots or animation frames as the only truth. Do not let projection changes masquerade as temporal movement.
```

## 5. Projection and metric implementation prompt

```text
Implement the approved projection/metric work order [WORK ORDER] for [PRJ/MET IDS].

First prove that the current Wardley view can pass through the projection/view adapter without regression. Then implement a small declarative metric projection.

Requirements:
- normalized deterministic output;
- explicit metric definitions, units, status, confidence, evidence, and missing data;
- controlled scales and tie-breaking;
- manual override/pin distinction and reset;
- composite aggregation by declared policy;
- provenance trace for each position;
- constrained formula evaluation only, with no arbitrary JavaScript;
- ID-based CSV mapping and explicit ambiguity resolution;
- timeline/story integration and reduced-motion switching;
- no mutation of graph identity or topology.

Return semantic snapshots and performance evidence as well as UI output.
```

## 6. Story compiler implementation prompt

```text
Implement the approved story-publishing work order [WORK ORDER] for [STR IDS].

Build a dedicated deterministic static compiler and small read-only runtime; do not simply ship the full editor in read-only mode unless an accepted ADR says otherwise.

Required work:
1. Validate story schema and map references.
2. Pre-resolve chapter target states where practical.
3. Sanitize narrative and map text with a strict allow-list.
4. Copy/fingerprint approved assets safely; prevent traversal and remote fetch by default.
5. Emit static-directory output and the defined runtime contract.
6. Add multiple chapters, scroll and button navigation, direct fragments, responsive layout, structured map summary, and reduced motion.
7. Exclude speaker notes, hidden metadata, and unreferenced graph data by default.
8. Support a restrictive CSP and no arbitrary authored script.
9. Prove deterministic output and run headless-browser, accessibility, privacy, and malicious-fixture tests.

Return the compiler, runtime, tests, sample output used only for internal verification, documentation updates, and change report.
```

## 7. Migration design and review prompt

```text
Review or design the migration from [SOURCE VERSION/FORMAT] to [TARGET VERSION].

Inspect real parser/writer behaviour and fixtures. Produce:
- source and target schemas;
- stable ID mapping;
- sequential pure migration steps;
- warnings and losses;
- unknown-field preservation policy;
- backup/overwrite UX;
- failed-migration recovery;
- legacy export behaviour;
- migration matrix tests from oldest supported version;
- idempotence/double-application protection;
- rollback or recovery plan.

Reject any design that silently drops unsupported fields or uses mutable labels as identity.
```

## 8. Canonical-corpus intake prompt

```text
Evaluate candidate map fixture [SOURCE] for the canonical corpus.

Read docs/12-canonical-map-corpus.md and templates/test-fixture-record.yaml.

Tasks:
1. Identify the exact software behaviour and requirement IDs the fixture would test.
2. Determine source category, provenance, author/owner, and proposed rights class R0-R4.
3. State whether source image/text/structured transcription may be stored and publicly distributed. Do not assume public visibility grants permission.
4. When permission is unclear, design an original project-owned fixture that tests the behaviour without reproducing distinctive expression.
5. Define expected semantic graph, geometry tolerance, diagnostics, test suite, and review steps.
6. Produce the fixture record but do not ingest restricted material into public paths.
```

## 9. Pull-request review prompt

```text
Review pull request [PR/DIFF] against work order [WORK ORDER], requirements [IDS], and accepted ADRs.

Prioritize correctness and risk over style. Check:
- user outcome and scope;
- current-behaviour evidence;
- stable IDs and references;
- graph/view/projection/time separation;
- migration and legacy export;
- deterministic algorithms and serialization;
- undo/redo and error recovery;
- tests linked to acceptance criteria;
- security, privacy, accessibility, and performance;
- feature-flag behaviour and rollback;
- unnecessary dependencies or rewrite scope;
- documentation and traceability.

For each finding, cite exact file/line or symbol, explain user/architecture impact, and propose the smallest corrective action. Distinguish blockers from follow-up improvements.
```

## 10. Regression repair prompt

```text
Repair failing test [TEST ID/LOG] on branch [BRANCH].

First reproduce it using the documented command. Identify whether the failure is:
- intended behaviour change without updated requirement/ADR;
- real regression;
- flaky environment;
- invalid fixture expectation;
- migration or compatibility issue;
- visual-only difference with semantic equivalence.

Do not update snapshots or tolerances until the semantic difference is explained. Make the smallest root-cause change, add a regression test if missing, run affected and broader gates, and produce a change report.
```

## 11. Agent completion prompt

```text
Before declaring this task complete, produce a change report from templates/change-report-template.md and answer:
- Which requirements are fully met, partially met, or deferred?
- Which current behaviours were preserved and how were they tested?
- What persisted data changed and how is it migrated/recovered?
- What feature flag controls the change and when can it be removed?
- Which tests, fixtures, and commands prove acceptance?
- What security, privacy, accessibility, and performance checks were completed?
- Which ADRs and documentation changed?
- What known limitations remain?

Do not claim completion without repository evidence.
```
