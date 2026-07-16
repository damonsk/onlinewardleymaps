# ADR-0002: The Strategic Graph Is the Durable Source of Truth

- **Status:** Proposed
- **Date:** 2026-07-16
- **Related requirements:** MOD-001, MOD-002, PRJ-004, CMP-002

## Context

Hierarchy, timelines, projections, and stories all need stable entities and relationships. If rendered coordinates or view copies become authoritative, the same component can diverge across features and collapse operations can destroy meaning.

## Decision drivers

- Stable identity across views and time.
- Non-destructive abstraction.
- Semantic testing.
- Multiple projections over one model.
- Story and analysis reuse.

## Options considered

### Treat each rendered map as an independent document

Simple for current static use but duplicates nodes and edges across views and timelines, making synchronization and identity unreliable.

### Treat graph topology and metadata as durable, with separate views

Requires explicit view/projection contracts but supports all planned capabilities coherently.

## Decision

The strategic graph owns durable nodes, edges, identity, metadata, metrics, evidence references, and lifecycle. Views, projections, timelines, and stories reference or derive from it and do not silently redefine graph topology.

## Consequences

### Positive

- One component remains recognizable across views and keyframes.
- Semantic round-trip and corpus tests are possible.
- Collapse and story publication can be non-destructive.

### Trade-offs

- Current coordinate-centric models may require adapters.
- Some UI state must be separated from persisted graph state.
- Deleting or splitting entities requires explicit lifecycle semantics.

## Compatibility and migration

Legacy coordinates are mapped into a default Wardley view. Existing graph data is preserved through adapters and stable IDs.

## Validation

Current-map equivalence tests and one multi-view fixture must demonstrate that graph and view separation does not regress Wardley editing.
