# Testing and Validation Strategy

## 1. Purpose

The test system must protect the existing application while making new graph, composite, temporal, projection, metric, and story capabilities safe to evolve. It should verify strategic semantics rather than relying only on screenshots.

Testing is treated as part of the product architecture. The corpus, migration fixtures, diagnostic codes, and deterministic exporters are durable assets.

## 2. Testing principles

1. Characterize current behaviour before refactoring it.
2. Test at the lowest layer that can prove the requirement.
3. Assert identity, topology, state, and provenance before pixels.
4. Use visual regression selectively, with tolerances and semantic companions.
5. Treat import/export and migration as critical paths.
6. Make fixtures small, named, reviewable, and rights-cleared.
7. Separate deterministic logic from renderer and clock dependencies.
8. Record requirement IDs in tests or test metadata.
9. Test failures must explain the semantic difference.
10. New features do not waive existing compatibility tests.

## 3. Test pyramid and layers

### 3.1 Static checks

- type checking;
- linting;
- schema validation;
- dependency rules;
- forbidden cross-layer imports;
- Markdown/link validation for specifications;
- generated-file checks.

### 3.2 Unit tests

Pure or isolated logic:

- graph invariants;
- stable ID generation and migration;
- composite membership and edge bundling;
- metric validation and aggregation;
- scale functions and projection output;
- keyframe patching and interpolation;
- scenario resolution;
- content sanitization;
- diagnostic creation;
- deterministic serialization.

### 3.3 Property-based tests

High-value invariants across generated data:

- save/load semantic identity;
- collapse/expand identity;
- bundle edge provenance partitions the boundary set;
- equivalent input ordering produces equivalent projection output;
- exact keyframe resolution equals stored state;
- valid migration chains preserve references;
- unknown fields survive compatible round trips;
- component update does not alter rejected overrides.

Generated graphs must be bounded and shrinkable so failures are reviewable.

### 3.4 Component and integration tests

- UI command to state change;
- renderer adapter with resolved view state;
- timeline controls;
- metric workbench;
- projection configuration;
- story authoring and preview;
- serializer adapters;
- undo/redo across feature boundaries.

### 3.5 End-to-end browser tests

Representative user journeys in the supported browser matrix:

- open, edit, save, and reopen a current map;
- create, collapse, reload, and expand a composite;
- create and scrub keyframes;
- switch projections and inspect provenance;
- publish and navigate a story;
- keyboard-only operation;
- malformed input and recovery.

### 3.6 Visual regression

Use for:

- established Wardley rendering;
- key UI states;
- exact keyframes;
- story chapter layouts;
- responsive breakpoints;
- reduced-motion variants.

Visual snapshots should be paired with semantic state captures containing entity IDs, normalized coordinates, visibility, labels, and represented edges.

### 3.7 Accessibility tests

- automated accessibility checks;
- keyboard navigation journeys;
- focus order and restoration;
- accessible names and roles;
- reduced motion;
- contrast and non-colour cues;
- screen-reader review of editor and story samples;
- zoom/reflow.

Automated tools cannot replace manual assistive-technology review.

### 3.8 Security tests

- script and HTML injection;
- unsafe URLs;
- path traversal in assets;
- oversized and deeply nested input;
- cyclic references;
- arbitrary formula execution attempts;
- content-security-policy compatibility;
- confidential hidden-data leakage in story output;
- dependency scanning.

### 3.9 Performance tests

- parse/load;
- graph validation;
- composite resolution;
- projection calculation;
- timeline materialization;
- scrub/playback responsiveness;
- story compilation;
- browser rendering;
- memory growth.

Budgets are set after the repository baseline and tracked as trends.

## 4. Existing-application characterization

Before domain extraction, create tests that capture current supported behaviour. These tests are not an endorsement of every implementation detail. They establish a safety boundary so intentional changes can be reviewed.

Minimum baseline:

1. load each current supported format;
2. verify node and edge semantics;
3. move a node and save;
4. add and remove an edge;
5. edit labels and annotations;
6. undo and redo;
7. export and reopen;
8. render a representative view;
9. handle one invalid document;
10. verify current keyboard behaviour.

Characterization test names should include `legacy` or `baseline` so they are not mistaken for the final architecture contract.

## 5. Semantic snapshot format

A renderer-neutral semantic snapshot should contain stable, normalized data, for example:

```json
{
  "documentId": "...",
  "viewId": "...",
  "time": 0.5,
  "entities": [
    {
      "id": "node-a",
      "displayId": "node-a",
      "visible": true,
      "position": { "x": 0.2, "y": 0.7 },
      "label": "Need",
      "kind": "component"
    }
  ],
  "edges": [
    {
      "displayId": "bundle-1",
      "sourceDisplayId": "node-a",
      "targetDisplayId": "composite-x",
      "representedEdgeIds": ["edge-1", "edge-2"]
    }
  ]
}
```

Snapshots exclude volatile renderer details unless a test explicitly concerns them.

## 6. Geometry assertions

Coordinates should be compared using declared tolerances:

- exact for deterministic manual coordinates after canonical rounding;
- absolute or relative tolerance for calculated positions;
- region or ordering assertions where exact location is not contractual;
- edge endpoint and represented-edge checks instead of exact path strings where routing may vary.

A tolerance is not a licence for drift. It must be justified by the algorithm and documented in fixture metadata.

## 7. Migration tests

For every migration:

- source fixture remains immutable;
- migrated document validates;
- IDs and references are correct;
- warnings match expectations;
- save and reload preserve migrated semantics;
- migration is not applied twice;
- failed migration leaves source recoverable;
- chain from oldest supported version to current works;
- downgrade or legacy export reports loss.

Maintain a migration matrix covering all supported source versions.

## 8. Import/export round-trip tests

Test levels:

### Native semantic round trip

`read -> write -> read` yields equivalent current-domain state.

### Current-format text stability

Where promised, unchanged source retains comments/order/formatting or produces a reviewed canonical form.

### Legacy subset round trip

Advanced document is materialized into a target-supported state, exported, re-imported, and compared against the declared subset.

### Story build determinism

Equivalent input and compiler version yield equivalent normalized output trees and checksums.

## 9. Composite test matrix

Dimensions include:

- non-nested/nested;
- collapsed/expanded;
- zero/one/many boundary edges;
- parallel edges;
- directed/undirected;
- duplicate labels;
- manual/centroid/weighted position;
- missing metrics;
- save/load;
- undo/redo;
- projection switch;
- keyframe change;
- legacy export.

A small pairwise set may cover combinations without combinatorial explosion, supplemented by property tests.

## 10. Temporal test matrix

- exact keyframe;
- midpoint;
- before first and after last;
- numeric, categorical, text, visibility, and lifecycle transitions;
- node add/retire;
- edge add/retire;
- composite collapse;
- projection change;
- keyframe reorder;
- duplicate time validation;
- scenario branch;
- save/reload;
- reduced motion;
- story segment.

Use a fake clock or direct time input. Tests must not depend on wall-clock timing for semantic correctness.

## 11. Projection and metric test matrix

- linear/log/ordinal/categorical scales;
- reversed axes;
- clamping;
- identical values;
- outliers;
- missing values;
- invalid units;
- manual overrides;
- pins and constraints;
- composite aggregation;
- graph-derived values;
- deterministic tie-breaking;
- CSV mapping ambiguity;
- timeline-varying metrics;
- legacy view equivalence.

## 12. Story test matrix

- one and many chapters;
- keyframe and exact-time references;
- alternate projection;
- collapsed composite;
- scroll and button navigation;
- direct fragment;
- desktop and narrow viewport;
- reduced motion;
- no-JavaScript/print fallback where supported;
- sanitized content;
- unsafe link rejection;
- missing asset;
- hidden-data filtering;
- deterministic build;
- runtime version compatibility.

## 13. Canonical fixture tiers

### Tier 0 — Synthetic unit fixtures

Tiny invented graphs designed to isolate one rule.

### Tier 1 — Product examples

Invented, realistic maps covering common workflows and included with the project.

### Tier 2 — Independently transcribed public examples

Structured fixtures created from publicly described maps only after rights and attribution review. Store the minimum material needed for testing.

### Tier 3 — Permissioned canonical sources

Maps from books, blogs, talks, or users where explicit permission or an applicable licence allows the intended storage and distribution.

### Tier 4 — Private validation corpus

Rights-restricted fixtures available only in controlled test environments. These must not leak into public builds or repositories.

Details are in `docs/12-canonical-map-corpus.md`.

## 14. Test identifiers and traceability

Tests should reference requirement IDs such as `CMP-004` or `TMP-002`. Exact mechanism depends on the test framework:

- test name prefix;
- metadata annotation;
- manifest entry;
- linked issue.

`plans/traceability-matrix.csv` connects requirements to planned test IDs and documents. Continuous integration may later check that approved requirements have at least one linked test.

## 15. Test data management

- Fixtures are immutable once released; corrections create a new version.
- Every fixture has a stable ID and metadata record.
- Generated IDs and dates are fixed.
- Assets use checksums.
- Large fixtures are stored appropriately and do not bloat normal unit-test runs.
- Private fixtures are clearly separated.
- No production user data is used without explicit authorization and sanitization.

## 16. Continuous-integration gates

Proposed gates:

### Pull request

- install/build;
- static checks;
- unit and property tests;
- native schema and migration tests;
- selected component tests;
- documentation validation.

### Protected branch

- full integration suite;
- browser smoke tests;
- accessibility automation;
- story build determinism;
- selected visual regression;
- dependency/security scan.

### Scheduled or release

- full browser matrix;
- full visual corpus;
- performance trends;
- large fixtures;
- private permissioned corpus where available;
- manual accessibility and story review checklist.

The repository audit determines practical split and runtime.

## 17. Failure triage

A failure report should identify:

- requirement and fixture IDs;
- semantic difference;
- current versus expected IDs, positions, topology, or diagnostics;
- whether the change is intentional;
- related migration or ADR;
- screenshot only as supporting evidence.

Updating a golden snapshot without explaining the semantic change is prohibited.

## 18. Flakiness policy

- Control time, randomness, locale, viewport, fonts, and network.
- Use deterministic graph-layout seeds.
- Disable external analytics and asset fetching.
- Quarantine only with an owner, issue, and expiry condition.
- Repeated reruns are not a substitute for diagnosis.
- Pixel tests use stable rendering environments and minimal animation.

## 19. Definition of tested

A work item is tested when:

- each acceptance criterion has an automated or explicitly manual verification method;
- failure cases and invalid input are covered;
- persistence and undo are covered where relevant;
- compatibility with existing behaviour is addressed;
- accessibility and security implications are addressed;
- test data rights are recorded;
- tests fail for the intended reason when the implementation is deliberately broken.

## 20. Initial test deliverables

1. Baseline current-format fixture set.
2. Current open/edit/save characterization suite.
3. Draft advanced-schema validation tests.
4. Composite unit/property fixture set.
5. Timeline interpolation fixture set.
6. Wardley projection equivalence fixture.
7. Metric projection fixture.
8. Single-story compiler/browser fixture.
9. Rights and provenance manifest.
10. CI documentation and local commands.
