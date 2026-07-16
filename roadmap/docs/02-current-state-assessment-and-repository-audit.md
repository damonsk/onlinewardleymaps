# Current-State Assessment and Repository Audit

## 1. Purpose

This audit is the mandatory first implementation activity. Its purpose is to replace assumptions in this documentation with evidence from the existing fork, while preserving a record of current behaviour before structural changes begin.

The audit should be performed against the exact repository and branch intended for development. It should produce a report using `templates/repo-audit-report-template.md`, supported by diagrams, command output, file references, and baseline tests.

## 2. Required outcomes

The audit must answer five questions:

1. **What exists?** Technologies, modules, data formats, tests, build and deployment paths.
2. **How does it behave?** Editing, rendering, import, export, persistence, undo/redo, and error handling.
3. **Where are the seams?** Places where a domain model, serializer, projection boundary, command layer, or exporter can be introduced incrementally.
4. **What must not break?** User-visible and file-format compatibility obligations.
5. **What is the safest first vertical change?** A bounded path from current architecture to the proposed model.

## 3. Audit rules

- Do not begin by reorganizing the repository.
- Do not infer architecture solely from directory names.
- Run the application and trace representative user flows.
- Record exact build and test commands.
- Prefer behavioural evidence over stylistic judgement.
- Add characterization tests before changing uncertain behaviour.
- Distinguish defect, technical debt, intentional behaviour, and unknown.
- Record licence and attribution obligations for upstream code and bundled assets.

## 4. Repository identity

Record:

- repository URL or local path;
- audited branch and commit hash;
- upstream project and fork point, if known;
- uncommitted changes;
- package manager and lockfile;
- runtime and toolchain versions;
- supported operating systems and browsers;
- current deployment method;
- licence files and third-party notices.

### Exit evidence

A maintainer can reproduce the audited build from a clean checkout using the recorded instructions.

## 5. Build, test, and deployment baseline

Run and document:

- dependency installation;
- development server;
- production build;
- unit tests;
- integration or end-to-end tests;
- linting and type checking;
- static export or packaging, if present;
- deployment or preview build.

Capture:

- success or failure;
- runtime;
- warnings;
- flaky tests;
- generated artifacts;
- environment variables and secrets assumptions;
- network dependencies.

Do not normalize failures away. A failing baseline is still useful if it is reproducible and classified.

## 6. Technology and dependency inventory

Create a table containing:

- language and language version;
- UI framework;
- state management;
- rendering technology, such as SVG, Canvas, WebGL, or HTML;
- graph or layout libraries;
- parser and serializer libraries;
- persistence mechanisms;
- test frameworks;
- browser automation;
- build and bundling tools;
- deployment targets;
- accessibility tooling;
- security and dependency scanning.

For each material dependency, record:

- why it is used;
- where it enters the architecture;
- whether it is actively maintained;
- whether replacement is actually required;
- licence compatibility;
- upgrade constraints.

The audit is not an upgrade campaign. Dependency changes should be proposed only when they unblock required work, resolve a material risk, or are already necessary for support.

## 7. Runtime architecture trace

Trace at least these flows from user action to persisted or rendered result:

### Flow A — Create and move a node

Record the UI event, command or reducer, state mutation, coordinate representation, render update, undo entry, and persistence effect.

### Flow B — Create and delete an edge

Record identity, validation, direction semantics, rendering, deletion behaviour, and serialization.

### Flow C — Open an existing map

Record file detection, parsing, validation, migration, state construction, error handling, and rendering.

### Flow D — Save or export a map

Record model extraction, field ordering, format selection, versioning, loss of unknown fields, and download or storage mechanism.

### Flow E — Undo and redo

Record whether commands, snapshots, patches, reducers, or framework history are used; identify operations that are not reversible.

### Flow F — Change map-level settings

Record where title, axes, annotations, styles, and presentation state live.

For each flow, produce a sequence diagram or equivalent narrative with real module and symbol names.

## 8. Domain-model inventory

Identify every representation of a node, edge, map, annotation, position, or group. Duplicate or translated models are common and must be made visible.

For each entity, record:

- current type or interface;
- identity mechanism;
- required and optional fields;
- default values;
- mutability;
- ownership of coordinates;
- relationships to renderer objects;
- serialization mapping;
- lifecycle through import, edit, save, and export;
- unknown-field preservation;
- validation and error states.

### Critical questions

- Are node IDs globally unique, document-local, generated, or absent?
- Can labels be duplicated?
- Are edges identified independently or only by endpoints?
- Does array order carry meaning?
- Are screen coordinates stored directly?
- Is evolution normalized, categorical, textual, or calculated?
- Are current maps represented as source text, objects, or both?
- Does the UI mutate domain objects directly?

## 9. File-format and persistence audit

Collect representative, user-permitted examples of every supported format. Do not add copyrighted maps to the repository merely because they are publicly viewable.

For each format, document:

- extension and MIME type;
- schema or grammar;
- version marker;
- required fields;
- optional and unknown fields;
- coordinate convention;
- encoding and newline behaviour;
- comments and annotations;
- backwards and forwards compatibility;
- loss during import/export;
- deterministic ordering;
- failure messages;
- recovery behaviour for partial corruption.

Create automated tests for:

- open and render;
- open, save without edits, and compare semantically;
- open, perform a minimal edit, save, and reopen;
- malformed input;
- missing optional fields;
- duplicate labels and IDs;
- legacy variants.

## 10. Rendering and interaction audit

Record:

- coordinate systems and transformations;
- zoom, pan, camera, margins, and axis rendering;
- node and edge layout rules;
- label placement and collision handling;
- selection model;
- multi-select behaviour;
- drag and lasso support;
- keyboard commands;
- accessibility tree and focus order;
- animation or transition infrastructure;
- performance bottlenecks;
- responsive behaviour;
- touch or pointer support.

A screenshot is useful evidence but is not a substitute for semantic state capture.

## 11. State management and command audit

Determine whether the application has an application-service or command boundary. Identify direct state mutations and cross-module coupling.

Record:

- source of truth for the current document;
- transient versus persisted state;
- derived selectors;
- command or action types;
- undo/redo representation;
- asynchronous operations;
- autosave behaviour;
- conflict handling;
- error reporting;
- feature-flag mechanism.

The proposed composite, timeline, projection, and story features benefit from atomic commands. If the current application has no command model, the audit should recommend the smallest viable seam rather than a complete state-management replacement.

## 12. Test inventory and gap analysis

Classify current tests by:

- unit;
- parser/serializer;
- component;
- integration;
- end to end;
- visual regression;
- accessibility;
- performance;
- security.

Map each current test to a user flow or module. Identify untested critical behaviours, especially import/export, identity, undo/redo, and coordinate transformation.

### Baseline characterization suite

Before architectural extraction, create a minimal suite covering:

1. load a representative current map;
2. create, edit, move, and delete a node;
3. create and delete an edge;
4. save and reopen;
5. undo and redo common operations;
6. render a stable semantic snapshot;
7. export each supported format;
8. handle one malformed input case.

## 13. Accessibility and security baseline

### Accessibility

Audit keyboard-only use, visible focus, accessible names, semantic controls, screen-reader output, contrast, motion, and zoom. Record current gaps without making the audit depend on immediate remediation of every issue.

### Security

Identify:

- HTML or Markdown rendering paths;
- unsanitized labels, links, or annotations;
- dynamic code execution;
- URL fetching;
- file upload handling;
- persistent browser storage;
- exported HTML behaviour;
- dependency vulnerabilities;
- secrets in build configuration.

## 14. Performance baseline

Measure representative operations on at least three invented or permitted datasets:

- small: approximately 25 nodes and 40 edges;
- medium: approximately 200 nodes and 400 edges;
- large: a size that meaningfully stresses the current application.

Measure:

- initial load;
- parse and state construction;
- pan and zoom responsiveness;
- node drag latency;
- save/export;
- memory use where practical;
- test runtime.

The final size bands and budgets should be based on observed user maps.

## 15. Extension-seam assessment

Evaluate candidate seams for:

- `GraphDocument` access;
- command execution and undo;
- serialization and migration;
- current Wardley projection;
- view state;
- selection and lasso;
- renderer adapter;
- timeline resolution;
- static export.

For each candidate, record:

- current modules;
- coupling;
- extraction difficulty;
- test coverage;
- compatibility risk;
- recommended first step.

## 16. Current-state architecture diagram

Produce both:

1. a module or container diagram showing build-time dependencies;
2. a runtime data-flow diagram for open, edit, render, and save.

The diagrams must use actual repository names and distinguish verified flow from inference.

## 17. Compatibility contract

The audit must create an initial compatibility matrix with rows for:

- supported map formats;
- legacy files;
- editing operations;
- keyboard shortcuts;
- visual conventions;
- exported artifacts;
- URLs or embedded use;
- browser support;
- deployment mode.

Each row receives one of:

- preserve exactly;
- preserve semantically;
- migrate with warning;
- deprecate through an approved process;
- unknown pending stakeholder decision.

## 18. Risk and debt classification

Classify findings as:

- **Blocker:** prevents safe implementation.
- **High:** likely to cause data loss, severe regression, or security failure.
- **Medium:** materially increases change cost or fragility.
- **Low:** local maintainability or consistency issue.
- **Observation:** useful context without immediate action.

Do not use “technical debt” as a synonym for unfamiliar design.

## 19. Recommended transformation plan

The audit report should conclude with:

- the safest domain seam;
- the safest persistence/versioning seam;
- the minimum characterization suite;
- the first feature flag;
- the first vertical feature slice;
- migrations required before composite nodes;
- repository-specific milestones and dependency order;
- decisions that require product-owner approval.

## 20. Audit acceptance criteria

The audit is complete when:

- a clean checkout can be built and run from the recorded instructions;
- current critical user flows are documented with real module references;
- current persisted formats have round-trip fixtures;
- current identity and coordinate semantics are known;
- baseline characterization tests run in continuous integration or an equivalent local gate;
- the compatibility matrix is reviewed;
- the proposed architecture documents have been annotated with confirmed, changed, or rejected assumptions;
- a repository-specific first work order can be issued without guessing module boundaries.
