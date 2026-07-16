# Decisions Needed After Repository Audit

The repository audit has resolved the implementation-discovery questions. Product policy and target-architecture choices remain unresolved until an owner accepts them. See `reports/repository-audit.md` for the evidence and compatibility matrix.

## Existing application

Audit findings:

- Baseline: `main` at `71f2aad88ae83862fdce27c55c6733b8ba1009aa`, with the extensive local working-tree delta recorded separately. Application package metadata is MIT; embedded or derived map corpora require their own rights classification.
- Stack: Next.js, React, TypeScript, MUI, Ace, custom OWM DSL conversion, React SVG rendering, Jest, and an optional Express file API.
- Current formats: unversioned OWM DSL and API wrapper, Mermaid import/export, and presentation-only SVG/PNG export.
- Identity: source-line, label, name, or index derived; links have no durable ID.
- Undo/redo: bounded, debounced before/after map-text snapshots.
- Deployment: Node 22 container/CI baseline, browser-hosted frontend, optional Compose API. The precise supported browser policy still needs owner confirmation.

Owner decisions still required:

- Which existing behaviours are contractual: exact source formatting, URL-hash IDs, map iterations, catalogue content, Mermaid semantics, and package exports?
- Is the file-backed API a trusted/self-hosted facility, or does it require authentication, privacy, and concurrency controls?
- Which browser and accessibility support matrix is a release requirement?

## Composite nodes

- Is a composite primarily a visual grouping, a semantic component, or both?
- What boundary-edge aggregation is most useful by default: one edge per original dependency, one bundle per outside node, or one bundle per edge type and direction?
- May one node belong to more than one composite in the same view?
- Should nested composites be supported in the first release or enabled only after a non-nested baseline?
- How should a composite inherit or calculate Wardley position and maturity?

## Time and scenarios

- Does the initial temporal release need only a linear timeline, or must branching be present in the first schema?
- Are keyframes complete snapshots, sparse overrides, event logs, or a hybrid?
- Which properties interpolate continuously, which change discretely, and which require per-property policies?
- How should structural changes such as node creation, deletion, split, and merge appear in animation?

## Projection and metrics

- Which built-in frames of reference are required beyond the current Wardley view?
- Audit finding: there is no formal reusable metric-definition/value model; flow values, attitudes, accelerators, and PST data are feature-specific. Which of these, if any, should become first-class metrics?
- Should custom projections be configured through UI, a declarative file format, plug-in code, or all three over time?
- How are missing metric values handled?
- Which graph-derived measures are in scope initially?

## Story publishing

- Must the first exporter be a single HTML file, a static directory, or both?
- Should published stories embed map data or reference an external map URL?
- Which content types are allowed in chapters: Markdown, rich text, images, audio, video, prompts?
- Is offline use a requirement?
- What branding and theming controls are needed?

## Testing corpus

- Which maps may legally be encoded and distributed as fixtures?
- Will the corpus store source images, structured transcriptions, expected semantic graphs, or only independently created equivalents?
- Who signs off a fixture as canonical?
- What tolerances are acceptable for geometry and visual-regression comparisons?

## Delivery and governance

- Where will ADRs live in the repository?
- Which continuous-integration service and browser test infrastructure are available?
- Who approves schema migrations and compatibility exceptions?
- Which telemetry, if any, may be collected, and under what privacy policy?
