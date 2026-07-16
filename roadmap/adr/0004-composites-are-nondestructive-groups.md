# ADR-0004: Composites Are Non-Destructive Groups With Proxy Rendering

- **Status:** Proposed
- **Date:** 2026-07-16
- **Related requirements:** CMP-001 through CMP-013

## Context

Users need to collapse selected nodes into one abstraction. Replacing the selected subgraph with a new node would lose internal identity, topology, positions, and history or require fragile reconstruction.

## Decision drivers

- Lossless expand.
- Multiple abstraction views.
- Boundary-edge traceability.
- Timeline and projection compatibility.
- Future reusable components.

## Options considered

### Destructive graph rewrite

Delete members and create a replacement node, storing restoration data separately. Simple renderer input but high integrity and migration risk.

### Non-destructive composite definition with view collapse state

Keep graph members and edges. Resolve a proxy and bundles only for display.

## Decision

A composite is a first-class membership entity. Collapse state belongs to a view. The display graph contains a proxy node and boundary bundles while the underlying graph remains unchanged.

Initial policy should disallow overlapping composite membership within one hierarchy and reject cycles. Nested composites are supported by an acyclic membership model, though UI rollout may stage them.

## Consequences

### Positive

- Expand is lossless.
- Different views can show different abstraction levels.
- Original edge provenance remains available.
- Time and stories can reference collapse state.

### Trade-offs

- Renderer needs a display-graph resolution step.
- Selection and edge interactions become more complex.
- Proxy versus semantic node distinction must be clear.

## Compatibility and migration

Existing files contain no composites and render unchanged. Legacy export requires expansion or an explicit flattening choice.

## Validation

Property tests for collapse/expand identity, edge partition, cycles, nested precedence, save/load, and undo/redo.
