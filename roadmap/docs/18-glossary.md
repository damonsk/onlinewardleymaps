# Glossary

**Abstraction level** — The amount of internal detail exposed in a view, often controlled through composites.

**Advanced strategic-map format** — Proposed versioned representation capable of storing the full graph, view, projection, metric, timeline, and scenario model.

**Aggregation policy** — Declared rule for deriving a composite value from member values, such as sum, maximum, weighted mean, range, or mixed.

**Annotation** — Explanatory content attached to a map, entity, view, time, or story chapter.

**Application command** — Atomic representation of user intent that validates and changes state and participates in undo/redo.

**Axis source** — Attribute, metric, graph-derived measure, manual value, or approved formula used by a projection axis.

**Boundary edge** — An edge with one endpoint inside a composite membership closure and one outside.

**Canonical corpus** — Rights-controlled fixture collection used as a regression and compatibility benchmark.

**Characterization test** — Test that records current behaviour before refactoring, without necessarily declaring that behaviour ideal.

**Composite** — Non-destructive container of nodes or nested composites that can be displayed as a proxy when collapsed.

**Component definition** — Versioned reusable strategic subgraph from which instances can be created.

**Component instance** — Use of a reusable definition in a map with stable identity mapping and optional local overrides.

**Constraint** — Rule that modifies or bounds projected placement, such as pinning, ordering, or band membership.

**Current application** — The existing working fork of Online Wardley Maps that this programme evolves.

**Derived value** — A value calculated from other data, accompanied by formula/algorithm and provenance.

**Diagnostic** — Structured information describing a warning, validation failure, migration issue, or internal error.

**Display graph** — Renderer-neutral set of visible nodes/proxies and edges/bundles after composites, filters, timeline, and projection are resolved.

**Edge bundle** — Display edge representing one or more original boundary edges while retaining their IDs.

**Evidence record** — Metadata about a source supporting a metric, attribute, assumption, or strategic statement.

**Feature flag** — Controlled switch used to activate an incomplete or staged capability.

**Frame of reference** — User-facing combination of projection, metrics, scales, filters, constraints, and labels.

**Graph source of truth** — Principle that durable entity identity and topology belong to the strategic graph rather than the rendered map.

**Keyframe** — Named temporal point containing explicit changes or state needed to resolve the map at that time.

**Legacy export** — Writing current or advanced state into an older or more limited format, potentially requiring flattening and diagnostics.

**Lifecycle** — Effective appearance, activity, retirement, or hypothetical status of a node or edge over time.

**Manual override** — User-authored position or value that supersedes calculated projection output in a view while remaining distinguishable.

**Metric** — Defined measured, estimated, inferred, categorical, or time-varying value associated with an entity.

**Migration** — Versioned, testable transformation from one persisted schema to another.

**Normalized coordinate** — Renderer-independent coordinate, typically in a documented zero-to-one range.

**Projection** — Deterministic mapping from graph and metric inputs to normalized positions and diagnostics.

**Provenance** — Origin, evidence, calculation, version, and confidence associated with data or output.

**Proxy node** — Display representation of a collapsed composite; not a destructive replacement of members.

**Resolved state** — Deterministic graph/view/display state at a chosen projection, scenario, and time.

**Scenario** — Named branch of temporal history with assumptions and changes after a branch point.

**Semantic round trip** — Read/write/read operation that preserves meaning even when textual formatting changes.

**Semantic snapshot** — Canonical renderer-neutral record of visible entities, IDs, normalized positions, and represented edges used in tests.

**Stable ID** — Durable opaque identifier independent of label, position, and ordering.

**Story** — Read-only ordered narrative whose chapters reference map states and compile to a static interactive experience.

**Story compiler** — Deterministic process that validates a story and map, resolves states, sanitizes content, and emits static assets.

**Strategic graph** — Durable nodes, edges, identity, metadata, metrics, evidence, and lifecycle underlying one or more views.

**Temporal resolver** — Service that calculates exact or intermediate state from base data, scenario, keyframes, and transition policies.

**Transition policy** — Declared rule for resolving values between states, such as linear interpolation, fade, or discrete step.

**View** — Named presentation configuration over the graph, including projection, collapse state, visibility, overrides, annotations, and camera.

**Wardley projection** — First-class projection implementing the existing Wardley map semantics and conventions.
