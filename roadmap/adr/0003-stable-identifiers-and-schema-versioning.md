# ADR-0003: Use Stable Identifiers and Explicit Schema Versions

- **Status:** Proposed
- **Date:** 2026-07-16
- **Related requirements:** MOD-002, FMT-001, TST-005

## Context

Composites, keyframes, scenarios, views, stories, and reusable components must reference entities through rename, reorder, save, and migration. Labels and array indexes are insufficient. New persisted concepts also require format evolution.

## Decision drivers

- Referential integrity.
- Reliable migration and round trip.
- Duplicate labels.
- Deterministic comparison.
- Reusable components and scenario branches.

## Options considered

### Continue with labels or positional identity

Minimal immediate change but fails under rename, duplicates, and reordered serialization.

### Assign stable opaque IDs and schema version

Requires migration and source-format design but provides durable references.

## Decision

Every durable entity receives a stable opaque ID. Advanced persisted documents contain an explicit schema version. Legacy inputs are adapted or migrated with recorded ID mappings.

## Consequences

### Positive

- References remain stable.
- Semantic diffs and tests improve.
- Features can coexist in one model.

### Trade-offs

- Legacy text formats may need directives, sidecars, or deterministic mappings.
- Migrations add complexity.
- IDs can make hand-authored files noisier if not hidden appropriately.

## Compatibility and migration

Prefer preserving current IDs. Where absent, generate deterministic or one-time persisted IDs. Never derive identity only from display label.

## Validation

Rename, duplicate-label, reorder, save/load, migration, and legacy-export tests.
