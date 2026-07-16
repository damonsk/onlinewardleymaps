# Change Report

- **Work-order ID:** AUD-EPIC-000
- **Requirement IDs:** CTX-001, CTX-002, CTX-003, TST-001, AGT-001
- **Branch / commit:** `main` / baseline `71f2aad88ae83862fdce27c55c6733b8ba1009aa`, with the pre-existing working-tree delta preserved
- **Feature flag:** Not applicable

## Summary

The current application and the proposed roadmap have been compared at module, format, state, renderer, interaction, persistence, test, deployment, security, accessibility, and performance boundaries. The result is recorded in [`repository-audit.md`](repository-audit.md).

The bounded M0 implementation restores the frontend test baseline, adds deterministic parser/render-ready-state measurements, characterizes the file API's save/reopen contract, documents the supported Node runtime, makes roadmap validation reproducible, and adds an application-baseline CI workflow. No roadmap feature, document schema, stable-ID strategy, or saved-map migration was introduced.

Publishing scope: the independent `codex/m0-baseline` branch includes the roadmap, CI, API characterization seam, performance test, and runtime documentation. The UI expectation repairs described below target the larger uncommitted toolbar/accessibility/catalogue feature tree, so they remain unstaged working-tree evidence and must land with that feature snapshot rather than being published against `main` without their implementation dependencies.

## Behaviour before and after

Before this work order:

- the frontend full run had 166 passing and 6 failing suites, with 23 failing tests;
- a test helper under `__tests__` was collected as an empty suite;
- toolbar integration tests selected the new component parent but not its semantic node-type child;
- two UI expectations described older accessible or layering behaviour;
- the API had no automated persistence test or import-safe construction seam;
- no representative parser/render-ready-state sizes were measured;
- application build, test, lint, API, and roadmap checks were not combined in one CI gate;
- the roadmap pack still described the repository as uninspected.

After this work order:

- toolbar tests select the standard component child explicitly;
- the Escape announcement expectation matches the implemented selection-clearing behaviour;
- the thumbnail test protects the intentional centred-arrow layering rule;
- the maplette harness lives under `src/testUtils` and is no longer discovered as a suite;
- existing golden changes were reviewed as additive current semantics (`nodeType`, `labelHidden`, and `maplettes`) rather than regenerated blindly;
- the API can be constructed against an isolated directory for tests while its CLI, routes, payloads, ID validation, and storage format remain unchanged;
- a synthetic record is saved, found on disk, reopened, and compared exactly, including JSON-encoded iterations;
- synthetic 25/40, 200/400, and 1,000/2,000 node/link maps protect structural output and detect catastrophic slowdown;
- Node 22 and frozen Yarn installs are documented and used by CI.

## Modules changed

- `frontend/src/__tests__/integration/MapTextGeneration.test.tsx` and `ToolbarCompatibilitySimple.test.tsx`: current two-stage component selection.
- `frontend/src/__tests__/components/map/KeyboardShortcutHandlerSimple.test.tsx`: current accessible Escape announcement.
- `frontend/src/__tests__/components/page/BookMapThumbnail.test.tsx`: current arrow-layer expectation.
- `frontend/src/testUtils/MapletteMoveHarness.ts` and its integration test: helper discovery repair.
- `frontend/src/__tests__/performance/UnifiedParserPerformance.test.ts`: deterministic scale characterization.
- `api/src/index.ts`: exported `createApp` and `startServer` seams with unchanged route handlers.
- `api/test/mapPersistence.test.ts`, `api/tsconfig.test.json`, and `api/package.json`: built-in Node API test command.
- `.github/workflows/application-baseline.yml`: supported-runtime install, lint, frontend test/build/smoke, API test/build/smoke, and roadmap validation.
- `README.md`: Node and Corepack prerequisite correction.
- Roadmap status, traceability, requirements, audit, work-order, manifest, and validation files: repository-specific evidence.

## Architecture and ADRs

The changes follow proposed ADR-0001 by extending current seams and avoiding a rewrite. They do not accept the proposed graph-source-of-truth, stable-ID, schema, projection, composite, or timeline ADRs. The audit recommends a version-aware document-codec facade as the M1 boundary, followed by read-only graph/view and renderer-neutral display facades.

## Persisted-data and migration impact

None. The API continues to store `{id, text, mapIterations}` as the same pretty-printed JSON wrapper. The OWM DSL remains canonical current authoring state. There is no schema version, ID migration, wrapper-field change, or rewrite of user maps.

## Compatibility results

- Current OWM parser, editing, renderer, undo/redo, keyboard, catalogue, and integration suites pass.
- API DSL and iteration values survive save and reopen byte-for-value.
- Current golden output differences were semantically reviewed and retained.
- No browser-facing product implementation changed under this work order.
- A complete browser open/edit/save/reopen journey, visual-regression baseline, and native advanced-format round trip remain future evidence.

## Tests added and commands run

- Frontend full Jest suite: 172 suites pass; 2,062 tests pass, 2 skip, and none fail in approximately 19.0 seconds.
- Independent branch candidate from a clean tree: 137 suites pass; 1,802 tests pass, 2 skip, lint passes with 17 warnings, and the production build passes after a frozen install.
- Focused toolbar, keyboard, thumbnail, maplette, golden, and performance suites: pass.
- Frontend lint check: pass with 17 pre-existing hook-dependency warnings and no errors.
- Frontend production build: pass on a supported Node runtime.
- API built-in test: 1 pass, 0 failures.
- API strict TypeScript build and compiled-server health smoke: pass.
- Roadmap schemas, examples, links, YAML, CSV registers, manifest, and references: pass with pinned Python dependencies.

## Security, privacy, and accessibility review

The API test uses a temporary local directory and loopback-only ephemeral port, then removes its data. No external service, telemetry, credential, or new data transfer is introduced. Existing API risks remain: unrestricted CORS, no authentication/ownership/concurrency, and unconditional overwrite by known ID.

A bounded rendered-page smoke confirmed an English document title, labelled map toolbar, labelled toolbar actions, a live region, and no browser console warnings. It also found no `main` landmark or `h1`, and the header's `more-menu-button` has no accessible name. This is evidence for follow-up, not a WCAG conformance claim; axe-style automation, keyboard-only journey evidence, focus restoration, contrast/reflow, reduced motion, and screen-reader review remain open.

## Performance results

The new characterization warms each fixture, measures three runs, parses through `UnifiedConverter`, then derives `MapElements` and processed links. Initial local median total times were approximately 1.8 ms for 25 nodes/40 links, 25.9 ms for 200/400, and 395.2 ms for 1,000/2,000. A generous 30-second ceiling detects catastrophic regression without presenting machine-specific timings as a product budget.

## Known limitations

- The new workflow is syntactically and locally reproducible but has not yet produced a GitHub-hosted green run from this uncommitted working tree.
- The working tree began with extensive user-owned changes and still needs an owner-approved integration snapshot.
- Seventeen lint warnings remain.
- The API test covers persistence directly; the full browser editor/API journey remains planned.
- Accessibility and visual-browser automation remain below the roadmap's release target.
- Stable identity, schema versioning, migration, graph/view separation, and advanced features remain design work.
- Corpus distribution rights and the browser/product compatibility contract require owner decisions.

## Rollback or disable path

No feature flag is required because product behaviour is unchanged. The API app-factory refactor, its test/config, the performance test, CI workflow, individual expectation repairs, and roadmap evidence can each be reverted independently. No saved data requires rollback.

## Follow-on work

1. Obtain one hosted green run of the application-baseline workflow and freeze an owner-approved integration snapshot.
2. Add a browser-level open/edit/save/reopen journey and selected visual/accessibility automation.
3. Fix the unnamed header menu and establish semantic page/map structure.
4. Review the audit compatibility matrix and decide the M1 durable-storage/stable-ID strategy.
5. Start M1 with a version-aware codec diagnostic and rename/reorder/duplicate-label fixtures, not composite implementation.
