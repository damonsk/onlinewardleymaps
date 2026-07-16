# Agent Work Order

- **Work-order ID:** AUD-EPIC-000
- **Title:** Repository audit and behavioural baseline stabilization
- **Repository / branch / baseline commit:** `damonsk/onlinewardleymaps` / `main` / `71f2aad88ae83862fdce27c55c6733b8ba1009aa`
- **Agent mode:** Audit, Repair, and bounded Implementation
- **Requirement IDs:** CTX-001, CTX-002, CTX-003, TST-001, AGT-001
- **Feature specification:** `docs/02-current-state-assessment-and-repository-audit.md`; `docs/11-testing-and-validation-strategy.md`
- **ADRs:** ADR-0001 (Proposed)
- **Feature flag:** Not applicable; no product capability is introduced
- **Requested output:** Reproducible audit report, compatibility matrix, green baseline tests, and CI checks for the audited commands

## 1. User outcome

Give maintainers a trustworthy, reproducible description of the current application and a green safety baseline before stable identity, schema versioning, graph/view separation, or composite work begins.

## 2. Current behaviour and evidence

- The audited working tree is based on commit `71f2aad` on `main`, with extensive existing local modifications and untracked material. The audit records rather than overwrites those changes.
- `frontend/src/components/MapEnvironment.tsx` coordinates map text, parsing, persistence, dirty state, iterations, export, and undo-aware mutation.
- `frontend/src/components/map/hooks/useMapParsing.ts` parses every text change through both `Converter` and `UnifiedConverter`.
- `frontend/src/conversion/UnifiedConverter.ts` adapts the legacy parser result to `UnifiedWardleyMap`; component IDs fall back to values derived from type and display name.
- `frontend/src/processing/MapElements.ts` creates render-ready component collections and evolved representations.
- `frontend/src/components/map/UnifiedMapCanvas.tsx` and the renderer modules consume the parsed/render-ready state and emit map-text mutations.
- `frontend/src/repository` provides save/load strategy seams. `api/src/index.ts` persists a JSON wrapper containing DSL text and JSON-encoded iterations.
- `frontend/src/hooks/useUndoRedoManager.ts` stores bounded before/after map-text snapshots.
- Frontend build succeeds with a supported Node runtime; the installed host Node 20.5.1 is below Next.js 16's minimum.
- API TypeScript build succeeds.
- ESLint check succeeds with 17 warnings and no errors.
- Runtime smoke test returns HTTP 200.
- At work-order start, Jest reported 166 passing suites, 6 failing suites, 2,036 passing tests, 23 failing tests, and 2 skipped tests. The repaired full suite now passes locally.
- At work-order start, the roadmap validator could not start because its Python dependencies were undeclared. Direct dependencies are now pinned and the validator also verifies the manifest.

## 3. Compatibility contract

- Preserve current DSL parsing, editing, rendering, remote save/load, map iterations, undo/redo, keyboard interactions, and Mermaid/PNG/SVG transfer behaviour.
- Treat existing golden-master differences as semantic evidence. Do not update expected output without reviewing and documenting each added or removed field.
- Do not change saved-map meaning, identifiers, or API payloads in this work order.
- Do not remove or reformat unrelated user changes.
- Classify an obsolete or incorrect test expectation explicitly when repairing the baseline.

## 4. Proposed delta

1. Repair the six currently failing Jest suites with the smallest evidence-backed changes.
2. Add CI checks that run the audited frontend build/lint/test commands and API build.
3. Make roadmap-pack validation reproducible without silently installing undeclared global packages.
4. Complete the repository-specific audit report, runtime/module mapping, compatibility matrix, risks, and recommended M1 seam.

## 5. Module and symbol impact

| Module/symbol | Current role | Proposed change | Risk |
|---|---|---|---|
| Failing Jest suites and directly related implementation | Behavioural evidence | Correct stale expectations, test discovery, or implementation defects after root-cause review | Medium |
| `.github/workflows/` | Existing package, translation, and image automation | Add application baseline gate using current package manager/runtime | Low |
| `api/src/index.ts`, `api/package.json`, `api/test`, `api/tsconfig.test.json` | File-backed save/fetch API | Expose an import-safe app factory and add isolated persistence round-trip characterization | Low |
| `frontend/src/__tests__/performance/UnifiedParserPerformance.test.ts` | New scale characterization | Measure parser plus render-ready derivation at three deterministic sizes | Low |
| `roadmap/tools/validate_pack.py` and roadmap metadata | Documentation-pack validation | Declare or remove hidden runtime assumptions and run validation in CI | Low |
| `roadmap/reports/repository-audit.md` | New audit evidence | Record verified current architecture, formats, compatibility, risks, and commands | Low |
| Traceability/backlog documentation | Planned evidence | Link M0 outputs and record baseline status without marking unrelated requirements complete | Low |

## 6. Data and migration

- Schema changes: None.
- Stable IDs/references: Document current behaviour only; no ID strategy is implemented here.
- Migration: None.
- Legacy export: Unchanged.
- Unknown fields: Existing raw-text preservation behaviour remains unchanged.
- Backup/rollback: Product behaviour is unchanged. Code changes are tests, expectation repairs, and a behaviour-preserving API app-factory seam; revert each bounded patch independently if validation regresses.

## 7. Invariants

- Equivalent current DSL continues to produce equivalent current semantic and visual state.
- Current saved records remain readable and writable by the same API contract.
- Undo/redo continues to operate on map-text snapshots.
- Existing user-created maps and in-progress local files are not rewritten.
- Test helpers are not accidentally collected as suites.
- A passing golden test represents reviewed semantics, not mechanically refreshed output.

## 8. UI and interaction

- Commands: No new commands.
- Undo/redo: Preserve current behaviour; characterize failures found in toolbar integration.
- Keyboard: Preserve Escape and toolbar shortcut announcements; update only where the implemented accessible wording is intentionally more precise.
- Focus: No intended change.
- Reduced motion: Audit current support and record gaps; no broad redesign in this work order.
- Error states: Record current parser, persistence, and API behaviour.

## 9. Security and privacy

The audit records the open-CORS, unauthenticated file API, URL-launch behaviour, browser storage, input-size limits, logging, and corpus rights boundaries. This work order does not introduce external services, telemetry, authentication, or new document execution paths.

## 10. Test matrix

| Requirement | Test ID/type | Fixture | Expected evidence |
|---|---|---|---|
| CTX-002, TST-001 | Existing Jest full suite | Existing synthetic and golden fixtures | Full current suite passes with reviewed expectations |
| CTX-003 | AUD-BASE-001 / audit | Current working tree | Build, lint, test, runtime, and API commands and results are reproducible |
| CTX-002, TST-001 | API persistence integration | Synthetic temporary record | DSL text and JSON-encoded iterations survive save, disk persistence, and reopen exactly |
| TST-001 | Parser/render-ready performance characterization | Synthetic 25/40, 200/400, and 1,000/2,000 node/link maps | Structural counts remain exact and no catastrophic slowdown occurs |
| TST-001 | Baseline integration inventory | Existing map-text and toolbar suites | Open/edit/render/undo coverage and remaining save/reopen gaps are explicit |
| AGT-001 | Documentation review | Repository audit report | Real modules, symbols, versions, and commands are cited |
| CTX-001 | Regression review | Full diff and full suite | No framework, renderer, persistence, or domain rewrite |

## 11. Performance

Record current Jest, build, and smoke-start timings. Product interaction measurements for small, medium, and large invented maps are an audit follow-up if no existing deterministic harness can measure them without broad instrumentation.

## 12. Alternatives considered

- Ignore failing legacy tests and begin M1: rejected because new architecture work would lack a trustworthy regression signal.
- Refresh every golden file: rejected because it would hide semantic changes.
- Replace Jest or the current build system: rejected because current tools are functional and replacement is outside M0.
- Commit the current workspace as the audit snapshot: not authorized; record commit plus working-tree state instead.

## 13. Non-goals

- Stable-ID implementation.
- Schema-version or migration implementation.
- Graph/view separation.
- Composite, timeline, projection, metric, story, scenario, or reusable-component features.
- API authentication or deployment redesign.
- Broad dependency upgrades or formatting changes.

## 14. Implementation sequence

1. Record identity, toolchain, working-tree, and command evidence.
2. Diagnose every failing suite and classify implementation defect, stale test, accidental discovery, or reviewed semantic change.
3. Apply bounded repairs and rerun affected suites.
4. Run the full frontend suite, build, lint, API build, and smoke start.
5. Add CI gates using the verified runtime and Yarn lockfiles.
6. Complete the audit, compatibility matrix, risk classifications, and M1 recommendations.
7. Update traceability and produce a change report.

## 15. Acceptance evidence

- `corepack yarn test --runInBand` in `frontend/` passes.
- `corepack yarn lint:check` and `corepack yarn build` in `frontend/` pass with the recorded Node runtime.
- `corepack yarn test` and `corepack yarn build` in `api/` pass.
- Frontend and API production servers return HTTP 200 in local smoke tests.
- Roadmap validation has a documented, runnable dependency path.
- CI configuration runs the same baseline checks.
- `roadmap/reports/repository-audit.md` contains the required module, format, compatibility, security, accessibility, test, and risk evidence.

## 16. Documentation updates

- Repository audit report.
- M0 traceability/status evidence.
- Change report.
- Build/runtime prerequisites where existing instructions are inaccurate.

## 17. Open questions or stop conditions

- Stable IDs and advanced-format storage require owner approval after the audit and are not decided here.
- Stop if a failing expectation represents unclear product semantics rather than a demonstrable stale test or regression.
- Stop before modifying golden output if the semantic difference cannot be explained from an approved current feature.
- Escalate any third-party fixture whose redistribution rights cannot be confirmed.
