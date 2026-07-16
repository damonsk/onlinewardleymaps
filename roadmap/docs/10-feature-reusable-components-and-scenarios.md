# Feature Specification: Reusable Components and Scenario Branching

**Feature IDs:** RCP, SCN  
**Status:** Future-facing design; not required before composite, projection, and temporal foundations  
**Dependencies:** Stable composites, versioned documents, timelines, conflict-aware updates

## 1. Purpose

Two extensions naturally follow from the core platform:

1. a composite may become a reusable strategic component that appears in several maps or contexts;
2. a temporal history may branch into alternative scenarios.

Both features introduce shared identity, overrides, conflict, and provenance. They should be designed early enough to avoid dead ends but implemented only after the local document model is dependable.

# Part A — Reusable Components

## 2. Problem

Organizations often repeat the same capability, platform, value-chain segment, or operating model across maps. Copying nodes and edges creates divergence. Authors need to reuse a defined subgraph while controlling whether updates propagate and which local differences are allowed.

## 3. Outcome

A user can publish a composite or selected subgraph as a reusable definition, instantiate it in another map, see its source and version, apply local overrides, and review incoming updates before accepting them.

## 4. Concepts

- **Component definition:** Versioned source graph fragment with interface metadata.
- **Component instance:** Reference to a definition version within a map.
- **Local override:** Explicit difference from the source definition.
- **Interface:** Named boundary points or dependency roles exposed to the containing map.
- **Update proposal:** Difference between the instance base version and a newer definition.
- **Detach:** Convert an instance to independent local graph entities while preserving provenance.

## 5. Definition model

```ts
interface ComponentDefinition {
  id: string;
  version: string;
  name: string;
  description?: string;
  graphFragment: StrategicGraph;
  composites?: Composite[];
  interfacePorts?: ComponentPort[];
  metricDefinitions?: MetricDefinition[];
  provenance?: ComponentProvenance;
}
```

A definition may initially live in a local file or library rather than a server.

## 6. Instance model

```ts
interface ComponentInstance {
  id: string;
  definitionId: string;
  baseVersion: string;
  entityIdMap: Record<string, string>;
  overrides: ComponentOverride[];
  portBindings: PortBinding[];
  updatePolicy: "manual" | "notify" | "pinned";
}
```

Entity IDs inside the definition cannot simply be reused globally if multiple instances exist. The instance keeps a stable mapping from definition-local IDs to document IDs.

## 7. Update semantics

Recommended policy is review-before-apply:

1. Resolve changes between base and candidate definition version.
2. Match entities by definition-local stable ID.
3. Classify additions, removals, field changes, and relationship changes.
4. Detect conflicts with local overrides.
5. Present an update proposal.
6. Apply accepted changes atomically.
7. Record the new base version and retained overrides.

Automatic propagation without review is inappropriate for strategic artefacts by default.

## 8. Local overrides

Potential override classes:

- label and description;
- metric value;
- view position and style;
- edge binding to external nodes;
- suppressed optional member;
- local extension node or edge;
- composite collapse state.

Core definition identity and interface contracts should be harder to override than presentation details. The exact policy needs product validation.

## 9. Interfaces

The earlier “public API” analogy becomes useful here, though the user experience need not use software terminology. A component may expose named dependency roles such as:

- consumes;
- provides;
- depends on;
- governed by;
- supplied by.

A port binds one or more internal nodes or edges to an external relationship. This allows updates to preserve boundary intent even if internal details change.

Interfaces are optional for the first reusable-component release. A simpler initial version can reuse boundary edges and stable member IDs.

## 10. Storage and library

Possible stages:

1. reusable definitions embedded in one document;
2. local component files;
3. repository or workspace library;
4. hosted shared catalogue with permissions.

The core model should not require stage 4. Every definition records provenance and licence/ownership metadata.

## 11. Acceptance criteria for reusable components

- `RCP-001` A user can create a versioned definition from a valid composite or subgraph.
- `RCP-002` An instance retains stable mapping between definition and document entities.
- `RCP-003` Local view positions do not change merely because source positions change, unless accepted.
- `RCP-004` A newer definition produces an inspectable update proposal.
- `RCP-005` Conflicts with local overrides are explicit.
- `RCP-006` Applying or rejecting an update is atomic and recorded.
- `RCP-007` Detaching preserves the current local graph and records provenance.
- `RCP-008` Save/load and migration preserve definition version and mappings.

# Part B — Scenario Branching

## 12. Problem

Strategic planning involves alternatives. Duplicating a map for each future loses common history and makes comparison difficult. Users need to branch from a shared state, make different assumptions and changes, and compare outcomes.

## 13. Outcome

A user can create a named scenario from a point on a baseline timeline, edit it independently, and resolve or compare states without duplicating unaffected history.

## 14. Scenario model

```ts
interface Scenario {
  id: string;
  name: string;
  description?: string;
  parentScenarioId?: string;
  branchTime?: number;
  timelineId: string;
  assumptions: AssumptionRecord[];
  status?: "draft" | "active" | "archived";
}
```

A scenario path is resolved by applying parent history through branch time and branch-specific changes thereafter.

## 15. Branch operations

- branch from current time;
- rename and describe;
- record assumptions;
- edit keyframes and graph lifecycle after branch;
- duplicate or derive a sub-scenario;
- archive;
- compare to parent or sibling;
- merge selected changes only through an explicit reviewed operation.

Deleting a parent scenario with descendants requires reparenting, archiving, or deleting the subtree; it cannot silently orphan references.

## 16. Assumptions and evidence

Each scenario should make assumptions visible:

```ts
interface AssumptionRecord {
  id: string;
  statement: string;
  confidence?: number;
  evidenceIds?: string[];
  owner?: string;
  reviewDate?: string;
  status?: "open" | "supported" | "challenged" | "invalidated";
}
```

This helps distinguish alternative strategic belief from unexplained coordinate changes.

## 17. Comparison

Useful comparison outputs include:

- entities added, retired, or changed;
- dependency changes;
- position changes under the same projection;
- metric differences;
- composite and abstraction differences;
- assumption differences;
- story-ready side-by-side or transition view.

Comparisons should be calculated by stable ID and semantics, not label matching.

## 18. Merge semantics

A general automatic scenario merge is complex and risky. Initial support should allow the user to copy selected changes from one scenario to another through a reviewed patch.

Conflicts include:

- same metric changed differently;
- entity retired in one branch and edited in another;
- incompatible composite membership;
- definition update applied in only one branch;
- projection or view deleted;
- edge endpoints changed.

## 19. Story integration

A story may compare scenarios by:

- one chapter per scenario at the same time;
- a transition from baseline to alternative;
- synchronized split-screen views;
- an assumptions chapter followed by outcomes.

The first story integration can simply reference scenario ID in each chapter.

## 20. Acceptance criteria for scenarios

- `SCN-001` A scenario can branch from an exact parent time.
- `SCN-002` Parent history before branch remains shared and unchanged.
- `SCN-003` Branch edits do not alter sibling scenarios.
- `SCN-004` Assumptions are first-class and referenceable.
- `SCN-005` State resolution is deterministic for every branch.
- `SCN-006` Comparison uses stable identity and produces a structured change set.
- `SCN-007` Invalid parent or branch references produce diagnostics.
- `SCN-008` Story chapters can reference scenario-specific states.
- `SCN-009` Save/load and migrations preserve the scenario tree.

## 21. Test strategy

### Reusable components

- version diff;
- entity mapping;
- override preservation;
- conflict detection;
- update atomicity;
- detach;
- definition deletion;
- multiple instances;
- nested components;
- migration.

### Scenarios

- parent resolution;
- branch isolation;
- deterministic comparison;
- invalid ancestry;
- reparent/archive rules;
- story reference;
- structural conflict fixtures;
- large shared history performance.

## 22. Rollout guidance

Do not implement shared remote libraries or complex merges before local component definitions and linear timeline state are proven. The recommended order is:

1. document-local reusable definitions;
2. local files and manual update proposals;
3. linear timeline with scenario IDs;
4. one-level branching;
5. comparison;
6. deeper trees and reviewed change transfer;
7. shared catalogue and permissions, if product demand justifies them.
