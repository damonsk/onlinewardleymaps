# Canonical Map Corpus

## 1. Purpose

The canonical map corpus is a controlled collection of fixtures used to validate import, semantic interpretation, rendering, projection, abstraction, temporal behaviour, and export. It is intended to become a durable benchmark for the application.

The corpus must balance technical value with copyright, licence, attribution, privacy, and provenance obligations. Public availability of a map does not automatically mean it can be copied into a repository or redistributed in a test package. Rights status must be reviewed and recorded.

This document is an engineering and governance plan, not legal advice. Obtain appropriate review for uncertain material.

## 2. Corpus goals

- Represent common Wardley map structures and edge cases.
- Protect current supported syntax and behaviour.
- Provide semantic golden masters independent of renderer pixels.
- Validate new features against realistic maps.
- Track source, authorship, permission, transformation, and expected results.
- Support public and private test tiers without accidental leakage.
- Make fixture approval repeatable.

## 3. What a corpus record contains

Each fixture has:

- stable fixture ID;
- title and purpose;
- source category;
- provenance and locator;
- author/owner where known;
- permission or licence status;
- redistribution scope;
- source checksum when stored;
- structured map input;
- expected semantic graph;
- expected views and normalized positions;
- expected diagnostics;
- visual references where permitted;
- tolerance policy;
- supported operations;
- reviewer and approval date;
- fixture version.

Use `templates/test-fixture-record.yaml`.

## 4. Rights classes

### R0 — Invented and project-owned

Created specifically for the test suite. Safe default for public distribution when no third-party material is used.

### R1 — Explicitly licensed for intended use

The licence or permission allows storage, modification if needed, automated testing, and distribution in the chosen repository. Record exact conditions and attribution.

### R2 — Permissioned but restricted

May be used internally or in a private CI environment but not distributed publicly. Keep source and derivatives outside public artifacts.

### R3 — Reference-only

The source may be inspected manually, but copying or structured redistribution is not approved. Create an independently designed fixture that tests the same software behaviour without reproducing protected expression, and do not claim it is the canonical transcription.

### R4 — Unknown or prohibited

Do not ingest. Record a request or research task if the source is strategically important.

## 5. Source categories

Potential sources include:

- current application examples;
- upstream project examples;
- project-created synthetic maps;
- user-contributed maps with written permission;
- books and blogs with permission or applicable licence;
- talks and training material with permission;
- private organizational maps under controlled access.

The first public corpus should be dominated by R0 fixtures so development is not blocked by rights review.

## 6. Avoiding accidental reproduction

When a public map inspires a test but permission is unclear:

- do not copy its image;
- do not reproduce distinctive labels and arrangement wholesale;
- identify the software behaviour that needs testing;
- create a new graph and labels that exercise that behaviour;
- cite the behavioural motivation in internal notes if appropriate;
- do not present the new fixture as a transcription of the source.

For exact compatibility with a published source, obtain permission or keep the validation private.

## 7. Corpus structure

Recommended repository layout:

```text
test-corpus/
├── public/
│   ├── synthetic/
│   ├── product-examples/
│   └── licensed/
├── private/
│   ├── permissioned/
│   └── customer-sanitized/
├── manifests/
├── expected/
│   ├── semantic/
│   ├── geometry/
│   ├── diagnostics/
│   └── visual/
└── tools/
```

Private paths must be excluded from public packaging and require access control.

## 8. Fixture taxonomy

### Syntax and import

- minimal node;
- labels with spaces and punctuation;
- duplicate labels;
- comments and annotations;
- evolution stages;
- directed and undirected dependencies;
- legacy syntax versions;
- malformed and recoverable input.

### Topology

- chain;
- diamond;
- cycle if allowed;
- disconnected graph;
- parallel edges;
- self-loop;
- high-degree hub;
- deep dependency tree;
- multiple user needs or anchors.

### Geometry

- boundary coordinates;
- overlapping nodes;
- very long labels;
- dense cluster;
- off-axis or invalid values;
- different viewport sizes;
- manual and calculated positions.

### Composites

- simple group;
- many boundary edges;
- nested group;
- duplicate labels;
- metric aggregation;
- collapse in one view and expand in another;
- membership lifecycle.

### Time

- two-keyframe movement;
- node introduction and retirement;
- edge lifecycle;
- collapse and expand;
- projection change;
- categorical and text transitions;
- branch-ready scenario.

### Projection and metrics

- complete numeric data;
- missing values;
- categorical bands;
- logarithmic values;
- outlier;
- pin and override;
- graph centrality;
- composite aggregation.

### Stories

- one chapter;
- multiple keyframes;
- alternate projection;
- collapsed composite;
- responsive content;
- unsafe content sanitization;
- hidden metadata exclusion;
- reduced motion.

## 9. Semantic golden master

Each fixture should have an expected semantic representation containing:

- node IDs, labels, kinds, and selected attributes;
- edge IDs, endpoints, direction, and kind;
- composite membership;
- metric definitions and values;
- view projection and normalized positions;
- timeline keyframes and lifecycle;
- expected diagnostics;
- story chapter references where relevant.

The expected form is canonicalized for stable diffing.

## 10. Visual golden master

A visual reference may be useful when rights permit and rendering is contractual. It should record:

- application and renderer version;
- browser and viewport;
- font and device-scale assumptions;
- active view/time/scenario;
- motion setting;
- crop or full-page policy;
- tolerance or review method.

Visual output is not the only ground truth. A pixel change can be acceptable while a topology change is not, and vice versa.

## 11. Fixture approval workflow

1. Proposer submits source, purpose, and rights class.
2. Reviewer confirms the fixture tests a distinct requirement.
3. Rights/provenance review approves storage and distribution scope.
4. Maintainer verifies structured transcription or invented design.
5. Expected semantic output is reviewed independently.
6. Visual references are generated in the controlled environment if needed.
7. Fixture receives version, reviewer, and approval record.
8. CI manifest places it in public, private, scheduled, or manual suite.

No fixture enters the corpus only because it makes a failing test pass.

## 12. Manual creation and dual review

For maps transcribed from an approved source:

- one person encodes the map;
- another checks labels, topology, coordinates, and metadata against the permitted source;
- discrepancies are recorded;
- the fixture states whether coordinates are exact, approximate, or interpreted;
- any ambiguous elements become explicit expected diagnostics rather than hidden guesses.

This dual-review process is especially important when comparing application output against maps from books or blogs.

## 13. Tolerance policy

Per fixture, define:

- exact entity and edge identity;
- exact or normalized coordinate precision;
- acceptable coordinate tolerance;
- ordering or region requirements;
- label and style requirements;
- visual pixel threshold if used;
- expected diagnostics;
- non-contractual details.

Tolerance changes require review and a reason.

## 14. Corpus versioning

- Fixture IDs remain stable.
- Corrections increment fixture version.
- Expected outputs identify the application schema and algorithm version.
- Old versions remain available when needed for migration tests.
- Removing a fixture requires a replacement or documented reason.
- Corpus release notes identify added rights or distribution constraints.

## 15. Public benchmark possibility

A public benchmark could eventually define:

- a rights-cleared set of structured maps;
- parser and serializer compatibility tests;
- graph semantic expectations;
- layout and projection tolerances;
- story accessibility checks;
- performance size bands.

This should be pursued only after the project has stable schemas and sufficient original or licensed fixtures. The benchmark must not imply endorsement by source authors without permission.

## 16. Initial corpus plan

Create project-owned fixtures first:

1. `SYN-001` Minimal Wardley chain.
2. `SYN-002` Duplicate labels and parallel dependencies.
3. `SYN-003` Dense cluster suitable for collapse.
4. `SYN-004` Nested composite.
5. `SYN-005` Three-keyframe evolution.
6. `SYN-006` Cost-versus-risk projection with missing values.
7. `SYN-007` Projection transition.
8. `SYN-008` Scenario-ready baseline.
9. `SYN-009` Multi-chapter story.
10. `SYN-010` Malicious content and unsafe asset test.
11. `SYN-011` Large generated performance graph.
12. `SYN-012` Legacy migration matrix.

Then identify a small set of maps from books, blogs, talks, or existing users for which permission can be requested. Their inclusion should not block the synthetic suite.

## 17. Acceptance criteria

- Every fixture has provenance and rights metadata.
- Public artifacts contain only fixtures approved for public distribution.
- Semantic expected output exists for every canonical fixture.
- Visual expected output, where used, records environment and tolerance.
- Exact transcriptions receive dual review.
- Fixture changes are versioned and reviewed.
- Private corpus content cannot be pulled into public builds accidentally.
- Tests identify fixture and requirement IDs in failure reports.
