# Technical Standards and Definition of Done

## 1. Scope

These standards apply to new and materially changed code. They are intentionally stack-neutral until the repository audit confirms the current technology. Existing repository conventions remain authoritative unless an ADR approves a change.

## 2. Compatibility standard

- Treat current working behaviour and supported files as a contract until explicitly reclassified.
- Every persisted-data change has a schema version and migration.
- Unknown compatible fields are preserved where technically feasible.
- Lossy export is explicit.
- Feature flags protect incomplete major capabilities.
- Deprecation requires documented replacement, migration, warning, and removal criteria.

## 3. Architecture standard

- Domain logic is testable without browser rendering.
- Graph identity and topology do not depend on screen coordinates.
- Projections are pure or controlled deterministic services.
- Timeline resolution is independent from animation timing.
- Renderer receives resolved display state and emits user intent.
- Serializer and migration logic do not live in arbitrary UI components.
- Cross-module dependency direction is documented and, where practical, enforced.
- Material exceptions require an ADR.

## 4. Coding standard

Use the repository's formatter, linter, naming conventions, module system, and language idioms. In addition:

- enable strict type checking where the stack supports it;
- avoid untyped boundary data after validation;
- prefer explicit domain types to loosely shaped objects;
- keep functions focused and side effects visible;
- make invalid states difficult to construct;
- use stable diagnostic codes;
- avoid global mutable state;
- do not use labels or array indexes as durable IDs;
- document non-obvious algorithms and complexity;
- remove dead code only with evidence that compatibility paths are no longer used.

## 5. Command and state-change standard

A material user action should be atomic and traceable. It should define:

- input intent;
- validation;
- affected entities;
- state change;
- inverse or undo representation;
- diagnostics;
- dirty-state effect;
- persistence impact;
- event or telemetry effect, if any.

Partial updates that leave invalid composite, timeline, or reference state are not allowed.

## 6. Identity standard

- IDs are opaque and stable.
- Creation is collision-resistant or deterministically namespaced.
- Migrations record ID mappings when generated.
- IDs survive rename, reorder, projection, keyframe, and story use.
- Deleted IDs are not reused in the same document history.
- Imported label matching is never silently treated as identity when ambiguous.

## 7. Numeric and coordinate standard

- Normalized domain coordinates use a documented orientation and range.
- Screen conversion is isolated.
- Floating-point precision and rounding are defined for serialization.
- Invalid numbers are rejected.
- Projection scale and unit assumptions are explicit.
- Geometry tests use declared tolerances.
- Responsive rendering does not change authoritative normalized coordinates.

## 8. Determinism standard

Control:

- random seeds;
- entity ordering;
- serialization ordering;
- timestamps;
- locale;
- time zone;
- font and viewport in visual tests;
- graph algorithm tie-breaking;
- asset naming;
- build metadata.

Any intentionally variable output is isolated and excluded from deterministic comparisons through an explicit rule.

## 9. Error-handling standard

- Expected validation failures return structured diagnostics.
- Internal invariant violations fail loudly in development and safely in production.
- Errors identify relevant entity IDs and paths without leaking sensitive content unnecessarily.
- User messages state what happened and what can be done.
- Migration and export warnings are reviewable before data is overwritten or lost.
- Catching an error and continuing with corrupt state is prohibited.

## 10. Logging and telemetry standard

- Development logs are structured where practical.
- Sensitive labels and map contents are not logged by default.
- User analytics are off unless explicitly approved.
- Any telemetry schema, endpoint, retention, and opt-out behaviour requires a privacy decision.
- Story output contains no analytics by default.

## 11. Dependency standard

A new runtime dependency requires:

- defined capability need;
- alternatives considered;
- maintenance and security review;
- licence review;
- bundle and performance impact;
- version pinning strategy;
- removal or fallback consideration.

Do not replace working core dependencies solely to match personal preference or an agent's familiar stack.

## 12. Security standard

- Validate all boundary input.
- Sanitize rich content.
- No arbitrary code execution from documents.
- Safe URL and path policies.
- Resource limits on imported and calculated content.
- Story CSP compatibility.
- Dependency scanning.
- Security tests accompany relevant features.
- Private test data remains segregated.

## 13. Accessibility standard

- Use native controls and semantics where possible.
- Provide keyboard paths for primary actions.
- Visible focus and logical restoration.
- Reduced motion.
- Structured non-visual map representation.
- Non-colour cues.
- Test representative flows manually as well as automatically.
- Accessibility regressions are release defects, not optional polish.

## 14. Test standard

Every change includes tests at appropriate levels. A feature touching persistence, undo, rendering, or export must test those paths.

Minimum expectations:

- happy path;
- validation and failure path;
- identity/reference integrity;
- save/load where persisted;
- undo/redo where user-editable;
- compatibility impact;
- security and accessibility impact;
- requirement ID traceability.

Golden snapshots cannot be updated without reviewing and explaining semantic changes.

## 15. Documentation standard

Update:

- affected feature specification;
- requirement or acceptance criteria status;
- ADR when a material decision changes;
- migration notes;
- user-facing help where applicable;
- agent work order and change report;
- schema and examples.

Pseudocode must be labelled illustrative unless it matches actual repository interfaces.

## 16. Review standard

Reviewers check:

- requirement alignment;
- repository evidence;
- compatibility;
- architecture boundaries;
- identity and migration;
- deterministic behaviour;
- invalid input;
- tests and traceability;
- accessibility and security;
- documentation;
- unnecessary scope or dependencies.

A large diff should be split by coherent behaviour, not by arbitrary file count.

## 17. Commit and pull-request standard

Follow repository conventions. Recommended properties:

- commits are intentional and buildable where practical;
- generated files are clearly identified;
- migration and fixtures are reviewed with code;
- PR description links requirement IDs and ADRs;
- before/after behaviour and compatibility are stated;
- known limitations and follow-on work are explicit;
- no unrelated formatting sweep.

Use `templates/pull-request-checklist.md`.

## 18. Release standard

A release containing a new major capability requires:

- feature flag state decided;
- supported format/migration matrix updated;
- full relevant CI suite passing;
- representative manual workflow review;
- accessibility and security sign-off appropriate to scope;
- performance comparison to baseline;
- release notes and recovery guidance;
- sample fixture or documentation;
- rollback or disable mechanism.

## 19. Project definition of done

A work item is done when all applicable conditions hold:

1. Requirement and acceptance criteria are identified.
2. Current repository behaviour was inspected.
3. Design fits approved boundaries or an ADR records the exception.
4. Implementation is complete behind the intended release control.
5. Existing supported behaviour remains tested.
6. New tests cover semantics, persistence, undo, invalid input, and user flow as applicable.
7. Migrations and compatibility diagnostics exist where data changes.
8. Security and accessibility requirements are met.
9. Performance is measured where risk exists.
10. Documentation, schemas, examples, and traceability are updated.
11. CI passes in the required environments.
12. A reviewer can explain the change without relying on undocumented agent reasoning.

## 20. Provisional quality budgets

These must be replaced or confirmed after audit:

- no known data-loss defect in supported formats;
- no unhandled exception in canonical user journeys;
- deterministic native serialization and story build;
- interaction acknowledgement typically within 50 ms;
- simple metric projection for a medium map typically within 100 ms;
- animation avoids sustained main-thread stalls;
- accessibility automated checks pass with reviewed exceptions;
- public story output contains no high-severity injection finding in the defined test suite.

The budgets are engineering targets, not contractual service levels.
