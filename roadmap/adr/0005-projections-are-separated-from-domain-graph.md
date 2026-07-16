# ADR-0005: Separate Projections and View Coordinates From the Domain Graph

- **Status:** Proposed
- **Date:** 2026-07-16
- **Related requirements:** PRJ-001 through PRJ-010, MET-001 through MET-006

## Context

The same strategic graph must be viewable in Wardley coordinates and other metric spaces. A node cannot have one universal screen position.

## Decision drivers

- Multiple frames of reference.
- Preservation of current Wardley view.
- Inspectable metric provenance.
- Timeline and story integration.
- Deterministic testing.

## Options considered

### Store one x/y on each node and overwrite it

Simple but destroys authored positions when switching frames and conflates meaning with presentation.

### Store positions in named views and calculate through projections

Requires view management but preserves graph identity and supports comparison.

## Decision

Node domain entities do not own one authoritative screen coordinate. A view references a projection and stores manual overrides or resolved authored positions. Projection output is normalized and deterministic.

The current Wardley arrangement becomes the default first-class view through a compatibility adapter.

## Consequences

### Positive

- Multiple projections coexist.
- Projection changes are reversible.
- Coordinates can be traced to metrics and scales.
- Screen-size changes do not alter domain state.

### Trade-offs

- Current source formats may need mapping.
- View selection and missing-value UX become necessary.
- Caches require invalidation.

## Compatibility and migration

Current x/y fields are mapped into a default Wardley view without visible movement. Legacy export materializes one selected view.

## Validation

Current Wardley equivalence, deterministic metric projection, missing values, manual overrides, projection switching, and save/load.
