# Core Domain Model

## 1. Purpose

This document defines the conceptual model that allows the existing application to support hierarchy, time, multiple projections, metrics, and stories without duplicating or corrupting map data.

The types and interfaces shown here are illustrative. The repository audit determines how they map to the current language, state store, parser, and renderer.

## 2. Model boundaries

The platform distinguishes six related but different concerns:

| Concern | Responsibility | Must not own |
|---|---|---|
| Graph document | Durable entities, dependencies, metadata, identity | Screen pixels, DOM objects, current camera |
| Composite hierarchy | Membership and abstraction policy | Destructive replacement of members |
| Metrics and evidence | Values, units, provenance, confidence | Implicit visual placement |
| Projection | Mapping values to normalized coordinates | Graph identity or persistence side effects |
| View | Visible state, collapse state, annotations, styles, camera | Authoritative graph topology |
| Timeline/scenario | State changes and transitions over time | Renderer-specific animation objects |
| Story | Ordered presentation of selected states | Editable authoritative graph |

## 3. Aggregate root

The proposed aggregate root is `StrategicMapDocument`.

```text
StrategicMapDocument
├── metadata
├── graph
│   ├── nodes
│   └── edges
├── composites
├── metricDefinitions
├── evidenceRecords
├── projections
├── views
├── timelines
├── scenarios
└── storyReferences
```

A repository may initially keep some of these in existing structures. The important requirement is that the application can resolve them through stable boundaries.

## 4. Identity

### 4.1 Stable identifiers

Every durable entity receives an opaque document-local or globally unique identifier. The identifier:

- does not change when the label changes;
- does not depend on array order;
- remains stable across save and load;
- remains stable across views and keyframes;
- is never reused for a different entity within the same document history.

Recommended representation is a UUID, ULID, or another collision-resistant string supported by the existing stack. The audit may justify a different compatible scheme.

### 4.2 Human-readable keys

Optional slugs or aliases may improve authoring and source formats, but they are not primary identity. Duplicate labels and renamed nodes must remain valid.

### 4.3 Identity migration

Legacy entities without IDs require deterministic migration where practical. Possible strategies, in preference order:

1. preserve existing IDs;
2. derive a one-time ID from durable legacy identity plus document namespace;
3. assign an ID during migration and persist it immediately;
4. maintain an import mapping if a source format cannot store IDs.

Hashing the display label alone is not acceptable because labels may duplicate or change.

## 5. Strategic map document

Illustrative shape:

```ts
interface StrategicMapDocument {
  schemaVersion: string;
  documentId: string;
  title: string;
  metadata: DocumentMetadata;
  graph: StrategicGraph;
  composites: Composite[];
  metricDefinitions: MetricDefinition[];
  evidenceRecords: EvidenceRecord[];
  projections: ProjectionDefinition[];
  views: ViewDefinition[];
  timelines: Timeline[];
  scenarios: Scenario[];
  extensions?: Record<string, unknown>;
}
```

### Invariants

- IDs are unique within their entity namespace or, preferably, the whole document.
- Every edge endpoint resolves to an existing or lifecycle-valid node.
- Every composite member resolves to a node or permitted nested composite.
- Composite membership is acyclic.
- Every view references a valid projection.
- Every keyframe references valid entities or records an explicit historical tombstone.
- Unknown extension data is preserved where compatible.

## 6. Node

A node represents a strategic component or other mapped entity.

```ts
interface StrategicNode {
  id: string;
  kind: string;
  label: string;
  description?: string;
  attributes: Record<string, AttributeValue>;
  metricValues: Record<string, MetricValue>;
  evidenceIds?: string[];
  lifecycle?: EntityLifecycle;
  tags?: string[];
  extensions?: Record<string, unknown>;
}
```

### Node semantics

- `kind` may begin with a small controlled set but should not prevent imported or domain-specific values.
- Wardley evolution and visibility should eventually be represented as explicit attributes or metric values consumed by the Wardley projection, even if compatibility adapters expose legacy fields.
- A node does not own one universal `x` and `y`. Authored or calculated coordinates belong to a view state.
- Styling defaults may be derived from kind or tags, but user overrides belong to a view.

## 7. Edge

```ts
interface StrategicEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: string;
  directed: boolean;
  label?: string;
  attributes: Record<string, AttributeValue>;
  metricValues?: Record<string, MetricValue>;
  evidenceIds?: string[];
  lifecycle?: EntityLifecycle;
  extensions?: Record<string, unknown>;
}
```

### Edge invariants

- Endpoint identity is explicit.
- Parallel edges are allowed if their IDs or kinds distinguish them.
- Direction and visual arrow style are separate concerns.
- Edges remain in the graph while a composite is collapsed.
- Aggregated display edges retain the IDs of all represented source edges.

## 8. Composite

A composite is a first-class, non-destructive abstraction container.

```ts
interface Composite {
  id: string;
  label: string;
  description?: string;
  memberRefs: EntityRef[];
  boundaryPolicy: BoundaryEdgePolicy;
  positionPolicy: CompositePositionPolicy;
  attributes?: Record<string, AttributeValue>;
  metricAggregation?: Record<string, AggregationPolicy>;
  evidenceIds?: string[];
  extensions?: Record<string, unknown>;
}
```

`EntityRef` may reference a node or another composite. Nested membership must form a directed acyclic hierarchy.

### Composite versus node

A composite can be displayed as a proxy node when collapsed, but it should not erase the distinction between:

- a real strategic component represented by a node; and
- a temporary or authored abstraction containing several components.

Where the product requires a composite to behave semantically as a component, it may have explicit attributes and metrics, but its membership remains inspectable.

### Collapse state

Collapse is view-specific:

```ts
interface CompositeViewState {
  compositeId: string;
  collapsed: boolean;
  proxyPosition?: NormalizedPoint;
  proxyStyle?: StyleOverride;
}
```

The same composite may be expanded in one view and collapsed in another.

## 9. Metrics and evidence

### 9.1 Metric definition

```ts
interface MetricDefinition {
  id: string;
  name: string;
  description?: string;
  valueType: "number" | "ordinal" | "category" | "boolean" | "timeseries";
  unit?: string;
  allowedValues?: string[];
  scale?: ScaleDefinition;
  aggregation?: AggregationPolicy;
  missingValuePolicy?: MissingValuePolicy;
  provenanceExpectation?: "required" | "recommended" | "optional";
}
```

Examples include cost, user visibility, evolution, adoption, strategic value, lead time, operational risk, confidence, and dependency criticality.

### 9.2 Metric value

```ts
interface MetricValue {
  value: number | string | boolean | TimeSeriesPoint[] | null;
  observedAt?: string;
  validFrom?: string;
  validTo?: string;
  sourceEvidenceIds?: string[];
  confidence?: number;
  status?: "measured" | "estimated" | "inferred" | "missing";
}
```

A value used for projection should not lose its provenance or uncertainty.

### 9.3 Evidence record

```ts
interface EvidenceRecord {
  id: string;
  title: string;
  kind: "note" | "url" | "file" | "dataset" | "interview" | "calculation";
  locator?: string;
  summary?: string;
  capturedAt?: string;
  author?: string;
  rights?: string;
  checksum?: string;
}
```

The first release need not implement a complete evidence-management UI. The model leaves a stable place for provenance.

## 10. Projection definition

A projection maps entities to a normalized coordinate space.

```ts
interface ProjectionDefinition {
  id: string;
  name: string;
  type: "wardley" | "metric" | "graph-layout" | "custom";
  xAxis: AxisDefinition;
  yAxis: AxisDefinition;
  constraints?: ProjectionConstraint[];
  missingValuePolicy: MissingValuePolicy;
  compositePositionPolicy?: CompositePositionPolicy;
  transitionDefaults?: TransitionPolicySet;
  extensions?: Record<string, unknown>;
}
```

An axis definition names the source, scale, direction, domain, labels, bands, and clamp behaviour. Projection output is normalized rather than expressed directly in screen pixels.

## 11. View definition

```ts
interface ViewDefinition {
  id: string;
  name: string;
  projectionId: string;
  scenarioId?: string;
  entityStates: Record<string, EntityViewState>;
  compositeStates: Record<string, CompositeViewState>;
  filters?: ViewFilter[];
  annotations?: Annotation[];
  camera?: CameraState;
  themeId?: string;
  extensions?: Record<string, unknown>;
}
```

### Entity view state

```ts
interface EntityViewState {
  visible?: boolean;
  position?: NormalizedPoint;
  positionMode?: "manual" | "projected" | "constrained";
  pinned?: boolean;
  labelOverride?: string;
  style?: StyleOverride;
  zIndex?: number;
}
```

### Coordinate convention

Use a documented normalized coordinate convention, provisionally:

- `x` in `[0, 1]`, increasing left to right;
- `y` in `[0, 1]`, increasing bottom to top at the domain level;
- the renderer converts this into screen coordinates, where pixel `y` may increase downward.

The current application convention remains authoritative until migration is proven.

## 12. Timeline and keyframe

```ts
interface Timeline {
  id: string;
  name: string;
  duration: number;
  timeUnit: "normalized" | "seconds" | "days" | "months" | "years";
  keyframes: Keyframe[];
  defaultTransition: TransitionPolicySet;
}

interface Keyframe {
  id: string;
  time: number;
  label?: string;
  description?: string;
  graphPatch?: GraphPatch;
  viewPatch?: ViewPatch;
  metricPatch?: MetricPatch;
  transitionToNext?: TransitionPolicySet;
}
```

The initial implementation should use a hybrid approach: a base document plus sparse, explicit changes at keyframes. Periodic materialized snapshots may be cached for performance but should not become a second uncontrolled source of truth.

## 13. Scenario

A scenario identifies a path through temporal states.

```ts
interface Scenario {
  id: string;
  name: string;
  parentScenarioId?: string;
  branchTime?: number;
  timelineId: string;
  description?: string;
  assumptions?: AssumptionRecord[];
}
```

The first UI may expose only one linear scenario. Including stable scenario references prevents later branching from requiring a destructive format redesign.

## 14. Story

```ts
interface StoryDocument {
  schemaVersion: string;
  storyId: string;
  title: string;
  mapReference: MapReference;
  theme?: StoryTheme;
  chapters: StoryChapter[];
  assets?: StoryAsset[];
}

interface StoryChapter {
  id: string;
  title: string;
  body?: string;
  state: StoryStateReference;
  camera?: CameraState;
  transition?: StoryTransition;
  prompts?: AudiencePrompt[];
  speakerNotes?: string;
}
```

The story references map state rather than copying screenshots. A compiler resolves those references into a static package.

## 15. Lifecycle and structural change

An entity lifecycle supports temporal appearance without deleting historical meaning.

```ts
interface EntityLifecycle {
  effectiveFrom?: number | string;
  effectiveTo?: number | string;
  status?: "planned" | "active" | "retired" | "hypothetical";
}
```

Structural operations such as split and merge may later require explicit lineage records. For the first temporal release, node addition and retirement can be represented by lifecycle and keyframe patches while keeping IDs stable.

## 16. Commands and domain operations

User operations should be represented as atomic commands or equivalent application services, including:

- create, update, and delete node;
- create, update, and delete edge;
- create composite from selection;
- add or remove composite member;
- collapse or expand composite in a view;
- create projection;
- apply projection to view;
- create, move, or delete keyframe;
- update timeline state;
- create story chapter;
- compile story;
- migrate document schema.

Each command should validate invariants and produce an undoable inverse or an equivalent reversible history record where supported.

## 17. Validation layers

### Schema validation

Checks structural types, required fields, and allowed values.

### Referential validation

Checks IDs, endpoints, memberships, projection references, timeline references, and story references.

### Domain validation

Checks acyclic composite hierarchy, metric compatibility, lifecycle consistency, and projection constraints.

### Compatibility validation

Checks whether a document can be exported to a legacy format without loss and reports unsupported features.

### Security validation

Checks unsafe URLs, unsanitized rich content, unsupported assets, and extension fields before story publication.

## 18. Serialization principles

- Every document contains a schema version.
- Field ordering is deterministic where the format permits.
- Unknown compatible fields are preserved.
- Floating-point values use a documented precision policy.
- Timestamps use ISO 8601 where calendar time is intended.
- Normalized timeline values and real dates are not mixed without explicit conversion.
- Migrations are pure, testable functions where practical.
- A migration records source and target versions in diagnostics.

## 19. Derived state

The following should generally be derived rather than persisted as authoritative data:

- screen pixel coordinates;
- edge paths;
- label bounding boxes;
- projection caches;
- resolved timeline frames;
- bundled-edge geometry;
- story runtime DOM;
- graph-analysis caches.

Caches may be persisted for performance only if they are versioned, invalidatable, and reproducible.

## 20. Open design choices

Repository evidence is required before finalizing:

- whether composites share one namespace with nodes;
- whether manual Wardley coordinates are migrated into a default view or retained through an adapter;
- how text-source formats express IDs and advanced features;
- how sparse patches interact with the current undo/redo model;
- whether view style overrides are stored in the main file or a companion format;
- how much unknown-field preservation the current serializer can support.
