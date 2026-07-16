# Risk Register

## 1. Scoring

Each risk should receive repository-specific probability and impact after audit. This draft uses qualitative levels and proposed mitigations.

| ID | Risk | Probability | Impact | Mitigation / response |
|---|---|---:|---:|---|
| R-001 | Clean-slate rewrite breaks current users and delays value | Medium | Critical | Evolution-not-rewrite ADR, characterization tests, adapter plan, review no-go rule |
| R-002 | Existing format lacks stable IDs | High | Critical | Identity audit, deterministic migration, ID mapping tests, no label identity |
| R-003 | Save/load loses advanced or unknown fields | Medium | Critical | Versioned codecs, unknown-field policy, round-trip matrix, warnings |
| R-004 | Composite collapse corrupts topology or hides dependencies | Medium | High | Non-destructive model, boundary-edge provenance, property tests |
| R-005 | Nested composites create cycles or ambiguous overlap | Medium | High | Acyclic validation, initial no-overlap policy, depth tests |
| R-006 | Timeline implementation stores screenshots rather than meaningful state | Medium | High | State/transition/animation separation, resolver tests, hybrid keyframes |
| R-007 | Structural changes over time become semantically ambiguous | High | High | Explicit lifecycle, stable IDs, discrete set changes, lineage deferred or specified |
| R-008 | Projection changes are mistaken for strategic movement | Medium | High | Visible frame labels, separate temporal/projection controls, transition cues |
| R-009 | Metrics create false precision or hide missing data | High | High | Provenance, status/confidence, explicit missing policies, inspectable calculations |
| R-010 | Graph algorithms are nondeterministic or too slow | Medium | High | Controlled seeds, versioned algorithms, benchmarks, cancellation and caching |
| R-011 | Story export exposes confidential hidden data | Medium | Critical | Data-minimized compiler, inclusion report, private-note exclusion tests |
| R-012 | Story content enables script injection | Medium | Critical | Strict sanitization, no arbitrary code, CSP, malicious fixtures |
| R-013 | Static story runtime becomes coupled to editor internals | Medium | High | Versioned read-only runtime contract, pre-resolved states, separate bundle |
| R-014 | Visual regression tests are brittle and block valid changes | High | Medium | Semantic snapshots, geometry tolerances, targeted pixel tests |
| R-015 | Canonical corpus copies protected maps without permission | Medium | Critical | Rights classes, manifest, project-owned fixtures first, private segregation |
| R-016 | Agent changes expand scope or replace dependencies unnecessarily | High | High | Work orders, no-go zones, ADR threshold, bounded PRs, review checklist |
| R-017 | AI-generated changes appear correct but miss edge cases | High | High | Acceptance traceability, tests, reviewer evidence, no reliance on hidden reasoning |
| R-018 | Accessibility added late requires redesign | Medium | High | Keyboard and structured-view requirements in every feature, early manual review |
| R-019 | Current renderer cannot consume a clean display-state seam easily | Medium | High | Audit runtime flow, compatibility facade, thin vertical prototype before extraction |
| R-020 | Undo/redo architecture cannot represent advanced operations | Medium | High | Command audit, atomic transaction model, vertical composite slice early |
| R-021 | Feature flags create permanent duplicate paths | Medium | Medium | Flag owner/removal condition, equivalence gates, roadmap cleanup work |
| R-022 | Multiple views duplicate graph data and diverge | Medium | High | View stores references and overrides only, graph source-of-truth invariant |
| R-023 | Reusable component updates overwrite local strategic choices | Medium | Critical | Manual update proposals, explicit overrides/conflicts, detach option |
| R-024 | Scenario branching duplicates or corrupts shared history | Medium | High | Parent/branch resolver, immutable history semantics, branch isolation tests |
| R-025 | New format alienates users who prefer current text format | Medium | High | Audit workflows, adapters/sidecars/directives analysis, migration preview |
| R-026 | Performance targets are invented rather than measured | High | Medium | M0 baseline, representative size bands, trend reporting, evidence-based budgets |
| R-027 | Large maps or malicious files freeze the browser | Medium | High | Resource limits, workers/cancellation, validation, stress fixtures |
| R-028 | Hidden telemetry or external AI transfer violates trust | Low to Medium | Critical | No telemetry by default, explicit privacy ADR, opt-in and disclosure |
| R-029 | Published stories become unviewable after editor upgrades | Medium | High | Runtime/schema versioning, self-contained output, compatibility tests |
| R-030 | Project drifts into generic diagramming and loses Wardley focus | Medium | High | Vision guardrails, user-outcome test, Wardley projection first-class |

## 2. Risk-management process

For each milestone:

1. Review open risks and repository evidence.
2. Assign owner and current score.
3. Add mitigation tasks to the backlog.
4. Define trigger or leading indicator.
5. Record residual risk at exit gate.
6. Escalate data-loss, security, privacy, and rights risks before release.

## 3. Immediate risks to validate in M0

- current identity mechanism;
- current format and unknown-field behaviour;
- undo/redo model;
- renderer coupling;
- licence and upstream obligations;
- import/render injection surfaces;
- test coverage and CI reliability;
- real map size and performance distribution.
