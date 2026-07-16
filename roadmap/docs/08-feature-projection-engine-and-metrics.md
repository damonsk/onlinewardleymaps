# Feature Specification: Projection Engine, Frames of Reference, and Metrics

**Feature IDs:** PRJ, MET  
**Status:** Proposed  
**Dependencies:** Graph/view separation, stable IDs, metric model, current Wardley projection adapter

## 1. Problem

The existing map is primarily arranged in one Wardley frame. Authors need to choose a different frame of reference—such as cost versus risk, centrality versus adoption, or another declared pair of measures—and have the same graph redrawn without copying or corrupting it.

The product also needs a richer measurement space so positions and visual encodings can be grounded in explicit values, definitions, evidence, and uncertainty.

## 2. Outcome

A user can define or select a projection, see which data drives each axis, resolve the graph into normalized coordinates, compare projections, and move smoothly between them. The current Wardley view remains first-class and backward compatible.

## 3. Core proposition

The graph is invariant under a change of projection. A projection changes the view of entities, not their identity or dependency relationships.

```text
Strategic graph + metrics + projection definition + constraints
                             ↓
                 normalized positioned entities
                             ↓
                    renderer and story view
```

## 4. Terminology

- **Frame of reference:** User-facing combination of projection, selected data, scales, filters, constraints, and labels.
- **Projection:** Deterministic function that maps entities to normalized coordinates and diagnostics.
- **Axis source:** Attribute, metric, graph-derived measure, manual coordinate, categorical band, or extension function used by an axis.
- **Scale:** Function mapping source domain to normalized range.
- **Constraint:** Rule such as pinning, ordering, bounds, bands, or collision separation.
- **Visual encoding:** Size, shape, opacity, line weight, label, or other representation driven by a value.
- **Provenance:** Evidence and calculation history for an input or derived value.

## 5. Primary user stories

- As an author, I can preserve my current Wardley map and create a second view over the same graph.
- As an analyst, I can select cost for one axis and strategic value for another.
- As a reviewer, I can inspect why a component appears at a particular coordinate.
- As an author, I can pin or manually override selected positions without losing the calculated values.
- As a facilitator, I can animate between projections while making the frame change explicit.
- As a maintainer, I can add a projection through a stable, deterministic contract.
- As a tester, I can verify positions, missing-data behaviour, and composite aggregation without a browser.

## 6. Projection contract

Illustrative interface:

```ts
interface ProjectionInput {
  graph: StrategicGraph;
  metrics: MetricStore;
  definition: ProjectionDefinition;
  entityIds?: string[];
  manualOverrides?: Record<string, NormalizedPoint>;
  constraints?: ProjectionConstraint[];
  context?: ProjectionContext;
}

interface ProjectionResult {
  positions: Record<string, NormalizedPoint>;
  valuesUsed: Record<string, ProjectionValueTrace>;
  diagnostics: Diagnostic[];
  bounds: NormalizedBounds;
  deterministicKey: string;
}
```

The engine does not update graph entities. The application decides whether projected output is transient, stored as a view, or copied into manual overrides.

## 7. Built-in projection types

### 7.1 Wardley projection

Represents the current Wardley semantics and rendering conventions. The audit must identify exact current axis orientation, normalization, labels, stages, and source syntax.

Expected inputs include:

- visibility or value-chain position;
- evolution or maturity;
- user/authored coordinates where current files store them directly;
- optional evolution-stage bands.

The initial adapter must reproduce current positions before the application exposes alternative frames.

### 7.2 Metric projection

Each axis is driven by a metric or attribute with a declared scale, direction, domain, missing-data policy, and label.

Examples:

- x = annual cost, y = operational risk;
- x = adoption, y = strategic value;
- x = lead time, y = dependency centrality.

### 7.3 Graph-layout projection

Uses topology-derived layout such as layered dependencies, force-directed layout, or another deterministic graph algorithm. Layout seed and tie-breaking must be controlled.

Graph layouts are useful analytical views but should not replace the authored Wardley projection.

### 7.4 Categorical or banded projection

Maps values into named rows, columns, or regions. Position within a band may be manual, ordered by a secondary measure, or calculated.

### 7.5 Custom declarative projection

A future declarative format may combine supported axis sources, transforms, and constraints without arbitrary executable code.

### 7.6 Learned projection

A future capability may consume a learned embedding. It must be labelled as inferred, preserve source and model metadata, expose uncertainty where possible, and never overwrite authored positions silently.

## 8. Axis definition

```ts
interface AxisDefinition {
  id: string;
  label: string;
  source: AxisSource;
  scale: ScaleDefinition;
  direction: "ascending" | "descending";
  domain?: [number, number] | string[];
  clamp?: boolean;
  bands?: AxisBand[];
  missingValuePolicy?: MissingValuePolicy;
  formatter?: FormatDefinition;
}
```

### Axis sources

- numeric metric;
- ordinal metric;
- categorical metric;
- node attribute;
- graph-derived measure;
- manual value in a view;
- formula using approved operators;
- extension source through a governed interface.

### Scales

Initial supported scales should be deliberately small:

- linear;
- logarithmic for positive numeric values;
- ordinal;
- categorical bands;
- quantile or percentile, if justified;
- explicit lookup.

Every scale records domain, range, direction, clamping, and invalid-input behaviour.

## 9. Metrics model

### 9.1 Definition

A metric definition records:

- stable ID and name;
- description and decision purpose;
- value type;
- unit;
- allowed values or scale;
- aggregation policy;
- provenance expectation;
- missing-value policy;
- optional formula or calculation version;
- whether values may vary over time.

### 9.2 Values

A metric value records:

- value;
- entity ID;
- observation or validity time;
- status: measured, estimated, inferred, or missing;
- confidence where applicable;
- evidence references;
- author or source;
- notes.

### 9.3 Metric workbench

Proposed UI capabilities:

- define and edit metric metadata;
- enter values in a grid or inspector;
- import values from CSV;
- identify missing or invalid values;
- show provenance and confidence;
- preview aggregations for composites;
- choose metrics for axes and visual encodings;
- see distributions and outliers.

A full data-science notebook is out of scope.

## 10. Derived graph measures

Potential built-in calculations include:

- in-degree and out-degree;
- dependency depth;
- reachability count;
- betweenness or another centrality measure;
- articulation or single-point-of-failure indicators;
- connected-component membership;
- path criticality when weights exist.

The initial set should be chosen for strategic utility and testability. Every measure must define:

- directed or undirected treatment;
- edge kinds included;
- weight handling;
- disconnected graph behaviour;
- normalization;
- algorithm version;
- performance limits.

A familiar mathematical name is not sufficient specification.

## 11. Missing and uncertain data

Supported missing-value policies:

- exclude entity from projection and report it;
- retain manual/current position;
- place in an explicit “unknown” band;
- use a declared default;
- use a declared imputation method with visible provenance;
- fail projection when the metric is mandatory.

Recommended default for authoring is to preserve current/manual position and visibly mark missing input. Automatic median imputation should not be invisible.

Confidence may drive a secondary encoding such as opacity, outline, or an uncertainty range. Do not use opacity in a way that makes low-confidence entities inaccessible.

## 12. Manual overrides and constraints

An author may need to adjust calculated layouts for communication. The model distinguishes:

- calculated position;
- constraint-adjusted position;
- manual override;
- pinned state.

The UI should show the difference and offer:

- reset to calculated;
- pin/unpin;
- recalculate all except pinned;
- inspect input values;
- copy calculated coordinates into an authored snapshot.

Constraints may include:

- fixed coordinate;
- axis-only pin;
- min/max bound;
- relative ordering;
- same band;
- minimum separation;
- composite containment or proxy policy.

Conflicting constraints produce diagnostics rather than nondeterministic compromise.

## 13. Composite projection

A collapsed composite needs projection inputs. Policies may be explicit or derived:

- aggregate member metrics using each metric definition;
- calculate centroid from member projected positions;
- use a nominated representative member;
- use an explicit composite metric and position;
- report mixed or missing state.

The values used must be inspectable. The projection must not silently average categorical or non-aggregatable metrics.

## 14. Multiple views and comparison

A graph may have several named views:

- Current Wardley Map;
- Cost vs Risk;
- Adoption vs Strategic Value;
- Dependency Topology;
- Training View.

Each view stores:

- projection ID;
- filters;
- manual overrides;
- collapse state;
- annotations;
- camera and style.

Proposed comparison modes:

- switch with animated transition;
- side-by-side synchronized selection;
- overlay change vectors;
- difference table of coordinates and input values.

Only switch and basic side-by-side need be considered early; the others are future extensions.

## 15. Transition between projections

When switching:

1. Resolve both source and destination positions by stable entity ID.
2. Make axis and legend changes visible.
3. Interpolate entity positions in normalized screen space.
4. Fade entities missing from one view according to visibility policy.
5. Re-resolve edge paths continuously or at frames.
6. Respect reduced-motion settings.

The UI should label the destination frame throughout the transition so movement is not confused with temporal evolution.

## 16. Visual encodings

Metrics may drive:

- node size;
- shape or icon;
- outline or pattern;
- label suffix;
- edge weight;
- badges;
- region or band placement.

Colour may be used, but every meaning must have a non-colour cue or accessible legend. Encodings should be limited to avoid overloaded maps.

The projection definition and visual encoding definition should remain separate concepts even if configured in one UI.

## 17. Projection configuration UI

Minimum viable flow:

1. Duplicate or create a view.
2. Choose projection type.
3. Select x and y sources.
4. Configure direction, domain, scale, and missing values.
5. Preview diagnostics and coverage.
6. Apply to the view.
7. Pin or adjust selected entities.
8. Save the view.

The UI should show a coverage summary such as “42 of 50 nodes have valid values,” without presenting incomplete output as fully measured.

## 18. Determinism and precision

Projection results require:

- stable tie-breaking by ID or explicit order;
- controlled random seeds for graph layouts;
- documented floating-point precision;
- versioned formulas and algorithms;
- normalized output bounds;
- deterministic aggregation order;
- no dependence on object iteration order or current viewport size.

Screen pixel conversion may vary with viewport, but normalized output must remain testable.

## 19. Performance

Repository baseline determines final budgets. Provisional targets for 500 nodes and 1,000 edges:

- simple metric projection computation below 100 ms in a production build;
- graph-derived measures reported separately and cached by input hash;
- UI input acknowledgement below 50 ms;
- long calculations cancellable and unable to block document recovery;
- projection changes do not rewrite graph entities.

Expensive algorithms may run in a worker or incremental pipeline after evidence shows need.

## 20. Persistence and import/export

- Projection definitions and metric metadata are versioned.
- Values retain type, unit, provenance, and time semantics.
- Views reference projections by stable ID.
- Legacy export materializes one selected view and reports lost definitions.
- CSV metric import requires explicit entity matching by ID or a reviewed mapping; label-only matching must show ambiguity.
- Exported CSV includes IDs to support reliable round trip.

## 21. Security and formula safety

Custom formulas should use a constrained expression language or registered functions. Do not evaluate arbitrary JavaScript from a map file.

Formula validation should limit:

- available operators and functions;
- recursion;
- execution time;
- input size;
- external access.

## 22. Edge cases

- Zero or negative values on a logarithmic scale.
- All values identical.
- Outlier compresses useful range.
- Unit mismatch between values.
- Duplicate categories or inconsistent spelling.
- Missing data for a collapsed composite.
- Pinned node outside domain.
- Conflicting ordering constraints.
- Graph layout changes after an unrelated metadata edit.
- Projection formula references itself.
- Metric definition changed after values exist.
- Time-varying metric requested without timeline context.
- View deleted while story references it.
- Node label changed after CSV export.
- Imported values match multiple nodes by label.

## 23. Acceptance criteria

### Projection

- `PRJ-001` The current Wardley view is represented through the projection/view contract without visible regression.
- `PRJ-002` A user can create a named view with declared x and y sources.
- `PRJ-003` Projection output is normalized and deterministic.
- `PRJ-004` Changing projection does not change graph identity or topology.
- `PRJ-005` A user can inspect values and rules used for a node position.
- `PRJ-006` Missing values follow a declared policy and produce diagnostics.
- `PRJ-007` Manual overrides and pins are distinguishable and reversible.
- `PRJ-008` Composite projection uses declared aggregation or position policy.
- `PRJ-009` Projection switching supports an accessible reduced-motion alternative.
- `PRJ-010` Invalid or conflicting constraints do not produce silent nondeterminism.

### Metrics

- `MET-001` A user can define numeric, ordinal, categorical, boolean, or time-series metrics as supported by release scope.
- `MET-002` Values retain unit, status, confidence, and evidence references where supplied.
- `MET-003` CSV import matches by stable ID or requires explicit ambiguity resolution.
- `MET-004` Derived measures record algorithm and configuration version.
- `MET-005` Aggregation is defined per metric rather than assumed globally.
- `MET-006` Legacy export reports metric and projection information that will be lost.

## 24. Test plan

### Unit

- scale transforms;
- direction and clamping;
- missing-value policies;
- deterministic tie-breaking;
- metric type validation;
- composite aggregation;
- constraints;
- graph-derived measures;
- formula validation.

### Property-based

- equivalent input order produces equivalent positions;
- valid linear-scale output remains within bounds when clamped;
- reset of overrides returns calculated output;
- serialization round trip preserves projection semantics;
- aggregation follows declared commutative/ordered behaviour.

### Integration

- current Wardley adapter equivalence;
- metric workbench to view;
- CSV import with IDs and ambiguity;
- projection switch while timeline is active;
- story chapter using alternate projection;
- legacy export of selected view.

### End to end

- Create cost and risk metrics, build a view, inspect one node trace, pin it, save, reload, reset, and verify deterministic position.
- Switch between Wardley and metric views and verify graph IDs, selected entity, and edge topology remain unchanged.
