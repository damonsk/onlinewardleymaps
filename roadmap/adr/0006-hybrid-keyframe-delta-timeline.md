# ADR-0006: Use a Base-Plus-Sparse-Keyframe Timeline Model

- **Status:** Proposed
- **Date:** 2026-07-16
- **Related requirements:** TMP-001 through TMP-014, SCN-001 through SCN-009

## Context

Temporal maps need exact keyframe states, efficient storage, deterministic interpolation, undo, and future branching. Complete snapshots duplicate unchanged data; pure event sourcing can be difficult to author, migrate, and inspect.

## Decision drivers

- Human-readable states and changes.
- Stable identity.
- Efficient common case.
- Deterministic resolution.
- Branch-ready history.
- Testability.

## Options considered

### Full snapshot per keyframe

Simple resolution but duplicates graph and view data, increases merge/migration cost, and risks identity divergence.

### Pure event log

Compact and expressive but can make exact state editing and migration complex, with long replay paths.

### Base document plus sparse keyframe patches and optional caches

Balances explicit changes with deterministic materialization. Caches are disposable.

## Decision

Store a base graph/view and sparse, ordered keyframe patches. Resolve exact state through pure or controlled functions. Interpolate between materialized surrounding states using property-specific policies. Support scenario IDs and ancestry in the schema even if the first UI is linear.

## Consequences

### Positive

- Unchanged data is not duplicated.
- Exact state and change lists are testable.
- Branches can share history.
- Caches can improve performance without becoming authoritative.

### Trade-offs

- Patch semantics require careful versioning.
- Reordering keyframes can affect downstream state and needs clear UX.
- Materialization caching and invalidation add complexity.

## Compatibility and migration

Static maps have an implicit base state and no required keyframes. No current behaviour changes until a timeline is created.

## Validation

Exact keyframe resolution, midpoint interpolation, lifecycle, reorder, save/load, branch isolation, and cache equivalence tests.
