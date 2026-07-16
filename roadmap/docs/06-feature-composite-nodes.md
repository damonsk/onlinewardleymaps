# Feature Specification: Composite Nodes and Hierarchical Abstraction

**Feature ID:** CMP  
**Status:** Proposed  
**Dependencies:** Repository audit, stable IDs, graph/view seam, undo/redo integration, versioned persistence

## 1. Problem

Large Wardley maps become difficult to read and discuss. Authors need to select a meaningful subgraph, represent it as one named abstraction, and later recover the exact detail. A purely visual hide/show operation is insufficient because the abstraction must preserve boundary dependencies, support nested levels, save and reload correctly, and participate in timelines, projections, stories, and tests.

## 2. Outcome

A user can lasso or multi-select nodes, create a composite, collapse it into a proxy node, and expand it without losing graph or view information. The feature provides controlled levels of abstraction while keeping the underlying strategic graph intact.

## 3. Primary user stories

- As a strategy author, I can lasso several nodes and create a named composite so that I can simplify a dense area.
- As a reviewer, I can expand a composite to inspect the supporting components and dependencies.
- As a facilitator, I can show different abstraction levels in different views or story chapters.
- As an author, I can move a collapsed proxy without changing member positions unless I explicitly choose to reposition the group.
- As a maintainer, I can save, load, undo, redo, migrate, and test composites deterministically.
- As an advanced author, I can nest composites without creating cyclic membership.

## 4. Terminology

- **Member:** A node or permitted nested composite contained by a composite.
- **Internal edge:** An edge whose source and target are both inside the expanded membership closure.
- **Boundary edge:** An edge with exactly one endpoint inside the membership closure.
- **External edge:** An edge with neither endpoint inside the membership closure.
- **Proxy node:** The display representation of a collapsed composite.
- **Edge bundle:** A display edge representing one or more original boundary edges.
- **Membership closure:** All nodes contained directly or through nested composites.

## 5. Product behaviour

### 5.1 Selection

The user may create a composite from:

- a lasso polygon;
- shift/multi-selection;
- a command operating on an accessible selection list;
- a future query-based selection.

The first implementation should reuse the existing selection model where possible.

#### Lasso semantics

Proposed default:

- a node is selected when its anchor point lies inside the lasso polygon;
- hidden nodes are not selected;
- locked nodes may be selected but cannot be moved unless unlocked;
- edges are not direct members; they are classified from node membership;
- an accessible alternative presents a searchable list with checkboxes.

Whether partial shape intersection selects a node is a product decision after reviewing current interaction conventions.

### 5.2 Create composite

The command asks for or generates:

- label;
- optional description;
- boundary-edge policy;
- initial proxy position policy;
- optional metric aggregation overrides.

Creation is one undoable transaction.

Validation rejects:

- empty selection;
- a selection containing only the composite being edited;
- membership that creates a cycle;
- references to missing entities;
- disallowed overlapping membership under the chosen policy.

A one-node composite may be allowed for consistency or rejected as not useful. This should be decided during UX validation.

### 5.3 Collapse

When collapsed in a view:

1. member nodes and their internal edges are hidden in that view;
2. a proxy node is displayed;
3. boundary edges are resolved into visible edge bundles according to policy;
4. external edges are unchanged;
5. original graph entities remain untouched;
6. selection, annotations, and keyboard focus move predictably to the proxy;
7. the operation is undoable.

### 5.4 Expand

When expanded:

- the proxy is removed from display;
- members and internal edges reappear with their previous view state;
- boundary edges return to their original endpoints and styles;
- the composite definition remains available for later collapse;
- any proxy-only position remains stored separately.

Expansion must not recalculate or normalize member positions unless explicitly requested.

### 5.5 Delete composite

Two distinct commands are required:

- **Dissolve composite:** remove the composite definition while keeping all member nodes and edges.
- **Delete composite and contents:** destructive operation that deletes membership closure and affected edges, with strong confirmation and undo support.

The default delete key on a selected proxy should not silently delete all contents. Recommended default is to dissolve or prompt with explicit choices.

## 6. Data model

The composite definition is stored separately from graph nodes and view collapse state.

```ts
interface Composite {
  id: string;
  label: string;
  description?: string;
  memberRefs: Array<{ type: "node" | "composite"; id: string }>;
  boundaryPolicy: BoundaryEdgePolicy;
  positionPolicy: CompositePositionPolicy;
  metricAggregation?: Record<string, AggregationPolicy>;
  attributes?: Record<string, AttributeValue>;
}
```

```ts
interface CompositeViewState {
  compositeId: string;
  collapsed: boolean;
  proxyPosition?: { x: number; y: number };
  proxyStyle?: StyleOverride;
}
```

### Invariants

- Membership is acyclic.
- Every referenced member exists.
- A composite cannot contain itself.
- A nested composite has one resolved ancestry path if the product disallows overlapping groups.
- Collapse state belongs to a view.
- Proxy IDs cannot collide with graph node IDs in renderer lookups.

## 7. Boundary-edge resolution

Boundary-edge policy is central to comprehensibility.

### 7.1 Preserve individual edges

Render one proxy-to-external edge per original boundary edge. This is semantically exact but may remain cluttered.

### 7.2 Bundle by external endpoint

Combine edges that connect the composite membership to the same outside node, while preserving direction and the list of represented edge IDs.

### 7.3 Bundle by endpoint, direction, and edge kind

Recommended default. Bundle key:

```text
(display source, display target, edge kind, directedness)
```

The bundle records:

- original edge IDs;
- count;
- labels or a summary label;
- aggregated style;
- warnings when edge semantics conflict.

### 7.4 Single interface edge

A future, more aggressive simplification may combine all dependencies by direction. It is not recommended as the default because it can obscure which outside components are involved.

### 7.5 Edge provenance

Clicking or expanding an edge bundle should allow the user to inspect represented edges. Story and export modes may display a count or summary.

## 8. Proxy position

Supported policies:

- **Explicit:** use a saved proxy position.
- **Centroid:** arithmetic mean of visible member positions.
- **Weighted centroid:** weight by a declared metric.
- **Medoid:** choose the member position minimizing aggregate distance.
- **Bounding-box centre:** centre of the member envelope.
- **Inherited anchor:** use a nominated member as the anchor.

Recommended first behaviour:

1. calculate the centroid at creation;
2. save it as an explicit proxy position;
3. allow the user to move it independently;
4. provide a “recalculate from members” command.

This prevents a collapsed node from unexpectedly moving when internal members change.

## 9. Metrics and attributes

A composite may expose:

- manually authored attributes;
- aggregated member metrics;
- calculated graph measures;
- missing or mixed states.

Aggregation must be defined per metric. Examples:

- cost: sum;
- risk: maximum or weighted calculation;
- evolution: weighted mean, range, or explicit value;
- confidence: minimum or evidence-weighted mean;
- category: mixed unless all members agree.

The UI must not assume that every metric has a meaningful average.

## 10. Nested composites

### 10.1 Membership model

Nested composites form a directed acyclic hierarchy. Resolution occurs from deepest child to parent.

### 10.2 Collapse precedence

If an ancestor is collapsed, descendants are not separately rendered. Their collapse states remain stored for restoration when the ancestor expands.

### 10.3 Reparenting

Moving members between composites is an atomic operation. Validation prevents cycles and reports changes to boundary edges.

### 10.4 Overlap

Allowing one node to belong to multiple composites in one view introduces ambiguous collapse and edge resolution. Recommended initial policy is **no overlapping membership within a hierarchy**. Alternative views can define different composites if needed.

An ADR is required before enabling overlaps.

## 11. Interaction design

### Contextual commands

- Create composite from selection.
- Add selection to composite.
- Remove from composite.
- Collapse or expand.
- Rename.
- Edit description and aggregation.
- Recalculate proxy position.
- Open as focused view.
- Dissolve.

### Focused view

A useful extension is “open composite” or “focus,” which creates a view showing only its contents and chosen context edges. This is separate from simple expand/collapse and can be deferred.

### Visual cues

A proxy should indicate:

- that it is a composite;
- member count;
- whether nested composites exist;
- whether boundary edges are bundled;
- whether metrics are aggregated or explicit.

Do not rely on colour alone.

### Keyboard and screen-reader behaviour

- The composite appears as a named group/proxy with member count.
- Collapse and expand are buttons or equivalent actions with `aria-expanded` semantics where appropriate.
- Lasso has a keyboard-accessible selection alternative.
- Focus is restored to a logical entity after expand/dissolve.

## 12. Projection behaviour

A composite participates in a projection using its configured position policy and metric aggregation. Projection calculation must not mutate member values.

When switching projections:

- expanded members transition individually;
- a collapsed proxy transitions using its composite output position;
- boundary-edge bundles update after position resolution;
- missing aggregate values produce a diagnostic and declared fallback.

## 13. Timeline behaviour

Composite definition, membership, collapse state, and proxy position may change over time, but the first temporal release may constrain which are keyframe-editable.

Recommended initial support:

- collapse state may vary by keyframe;
- proxy position may vary by keyframe;
- membership changes are discrete structural changes;
- collapse/expand animation may morph members toward or away from the proxy;
- edge bundles cross-fade into original edges.

Structural membership interpolation is not meaningful; it changes at a declared boundary.

## 14. Persistence and migration

- Existing files without composites load as before.
- A file gains composite fields only after the feature is used, if the format permits.
- Composite IDs and member IDs persist.
- View collapse state persists separately.
- Legacy export requires a flattening choice and loss diagnostic.
- Round-trip tests cover nested composites, styles, boundary policies, and proxy positions.

## 15. Algorithm outline

Given selected node set `S`:

```text
validate S
create composite C with memberRefs = S
for every edge e(source, target):
    if source in closure(C) and target in closure(C): internal
    else if exactly one endpoint in closure(C): boundary
    else: external
calculate proxy position
set C collapsed in current view
resolve boundary bundles
emit atomic command result and inverse
```

For nested composites, precompute or memoize membership closure and invalidate it when membership changes.

### Complexity

Basic classification should be linear in nodes plus edges for a full resolve, with incremental opportunities later. Premature graph-database adoption is not required.

## 16. Edge cases

- Duplicate labels inside and outside a composite.
- Parallel edges with different kinds.
- Self-loop on a member.
- Edge between two nested child composites.
- Empty composite after member deletion.
- Deleting a node referenced by a composite.
- Renaming a composite to match a node label.
- Composite containing hidden or retired nodes.
- Selection spanning already grouped and ungrouped nodes.
- Deep nesting.
- Collapsed ancestor with edited descendant state.
- Proxy moved outside current axis bounds.
- Missing metric used for weighted position.
- Import of corrupt cyclic membership.
- Legacy export while composite is collapsed.

Each must have an explicit validation, repair, or diagnostic rule.

## 17. Acceptance criteria

### Core

- `CMP-001` A user can create a composite from an arbitrary valid multi-selection.
- `CMP-002` Creating a composite does not remove member nodes or graph edges.
- `CMP-003` Collapse hides members and internal edges only in the active view.
- `CMP-004` Expand restores exact member identity, topology, and stored view state.
- `CMP-005` Boundary edges remain traceable to their original edge IDs.
- `CMP-006` Create, collapse, expand, dissolve, and membership edits are undoable and redoable.
- `CMP-007` Save and reload preserve the composite and collapse state.
- `CMP-008` Duplicate labels do not affect identity or restoration.

### Nested and advanced

- `CMP-009` Membership cycles are rejected with a useful diagnostic.
- `CMP-010` Nested collapse precedence is deterministic.
- `CMP-011` Composite positions follow the selected policy and can be overridden.
- `CMP-012` Metric aggregation uses the declared per-metric policy.
- `CMP-013` Legacy export reports flattening or unsupported semantics before writing.

### Accessibility and performance

- `CMP-014` All collapse and expand operations are keyboard accessible.
- `CMP-015` A non-lasso accessible selection route exists.
- `CMP-016` Resolving a representative medium map stays within the audited interaction budget.

## 18. Test plan

### Unit

- membership closure;
- cycle detection;
- edge classification;
- bundle grouping;
- proxy position policies;
- metric aggregation;
- nested precedence;
- validation diagnostics.

### Property-based

- collapse followed by expand is identity-preserving;
- bundle represented-edge sets partition the boundary-edge set;
- dissolving a composite leaves graph topology unchanged;
- serialization round trip preserves IDs and membership;
- membership hierarchy remains acyclic after valid commands.

### Integration

- lasso to command to renderer;
- undo/redo;
- save/load;
- projection switch while collapsed;
- timeline keyframe with collapse-state change.

### End to end

- Create a composite, collapse it, reload the document, expand it, and verify semantic graph state.
- Publish a story chapter with a collapsed composite and inspect represented-edge details.

### Visual

Use semantic geometry tolerances plus selected snapshots. Avoid relying solely on pixel equality for bundled paths.

## 19. Rollout

1. Domain and resolver tests with no UI.
2. Read-only rendering of pre-authored composite fixture behind a flag.
3. Create, collapse, and expand in development builds.
4. Persistence and migration.
5. Undo/redo and accessibility.
6. Limited release with diagnostics.
7. Nested composites after baseline usage is stable, unless repository evidence supports including them safely from the start.

## 20. Future extensions

- Focused submap navigation.
- Reusable component definitions and instances.
- Automatic composite suggestions.
- Composite-level interfaces and contracts.
- Comparative abstraction levels in synchronized panes.
- Animated semantic zoom.
