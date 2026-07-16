# ADR-0001: Evolve the Existing Application Rather Than Rewrite It

- **Status:** Proposed
- **Date:** 2026-07-16
- **Related requirements:** CTX-001, CTX-002, TST-001

## Context

There is already a working fork of Online Wardley Maps with user-visible behaviour, data formats, rendering, and likely accumulated local changes. The new programme introduces broad capabilities that could tempt a clean-slate implementation.

## Decision drivers

- Preserve current user value and map compatibility.
- Use working behaviour as empirical specification.
- Reduce data-loss and migration risk.
- Deliver capability incrementally.
- Make agent-generated changes reviewable.

## Options considered

### Rewrite in a new architecture

Potentially cleaner initial model, but requires recreating undocumented behaviour, format compatibility, interactions, deployment, and performance. High risk of long parallel development and incomplete parity.

### Incremental evolution with adapters and seams

Add characterization tests, versioning, domain facades, and new services around current behaviour. More transitional complexity, but lower user and data risk.

## Decision

Use incremental evolution as the default. A rewrite of a subsystem requires repository evidence that a bounded adapter/extraction approach cannot meet requirements and an accepted superseding ADR.

## Consequences

### Positive

- Existing maps and workflows remain continuously testable.
- Features can be delivered in vertical slices.
- Current implementation knowledge is retained.
- Rollback and feature flags are practical.

### Trade-offs

- Temporary duplicate paths may exist.
- Adapters can add short-term complexity.
- Some target abstractions must accommodate legacy semantics.

### Follow-on work

- Complete repository audit.
- Add characterization tests.
- Assign owners and removal conditions to transitional paths.

## Compatibility and migration

No current persisted format is replaced without explicit versioning and migration. The current renderer is adapted before replacement is considered.

## Validation

Audit and first composite vertical slice must demonstrate that the incremental seam is viable.
