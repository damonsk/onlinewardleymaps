# Vision and Design Principles

## 1. Vision statement

Create a strategic modelling platform that allows people to represent a system once, examine it through multiple frames of reference, move between levels of abstraction, explore change over time, and publish selected insights as an interactive narrative.

The platform begins with and remains grounded in Wardley mapping. It does not dilute the Wardley experience into a generic drawing canvas. Instead, it makes explicit the deeper model already implied by serious map use: components have identity, dependencies, attributes, position under a chosen frame, lifecycle, evidence, and changing strategic meaning.

## 2. Product thesis

Most map editors bind meaning too tightly to a single rendered arrangement. That makes advanced operations difficult:

- collapsing detail risks deleting or rewriting edges;
- animation becomes a sequence of screenshots rather than a continuous model;
- changing axes requires copying the map;
- publishing requires bespoke code;
- tests compare pixels because the underlying semantics are inaccessible.

The product thesis is that these problems become tractable when graph, view, projection, and time are separate but coordinated concepts.

## 3. Design principles

### P-01 — The graph is the durable source of truth

Nodes, edges, identity, metadata, and evidence belong to the graph. Rendering state is derived or separately stored.

**Implication:** A user may create several views over the same graph without duplicating the strategic model.

### P-02 — Wardley remains a first-class projection

The current Wardley map must feel native, not emulated as a generic chart. Existing terminology, interaction patterns, and mapping conventions should remain available.

**Implication:** The projection abstraction must be shaped around real Wardley requirements rather than forcing Wardley data into an unsuitable generic API.

### P-03 — Evolution, not rewrite

The working application is an asset and an empirical specification. New architecture is introduced through seams, adapters, characterization tests, and migrations.

**Implication:** A cleaner theoretical design is not sufficient reason to break current behaviour.

### P-04 — Position belongs to a view at a time

A node may occupy different positions under different projections or keyframes. Its identity and dependency relationships remain stable.

**Implication:** `node.x` and `node.y` should not remain the only or ultimate representation of strategic position.

### P-05 — Abstraction must be non-destructive

Grouping and collapsing change what is displayed, not what exists.

**Implication:** Expand after collapse must recover the exact internal graph and relevant view state.

### P-06 — Time is a model, not an animation effect

A slider should resolve a meaningful state. Animation is the presentation of a transition between states, not the storage mechanism.

**Implication:** Keyframes, lifecycle, and transition policies must be serializable and testable independently of rendering.

### P-07 — Frames of reference are explicit

Axes, scales, metric sources, missing-data policies, constraints, and derived measures must be named and inspectable.

**Implication:** A position calculated from cost and risk cannot be mistaken for a manually authored Wardley position.

### P-08 — Derived output must explain itself

Calculated coordinates, aggregated edges, graph measures, and AI suggestions should retain provenance and uncertainty.

**Implication:** The UI should expose why a node appears where it does.

### P-09 — Communication is a product capability

A strategic model is valuable only when it can be understood and discussed. Story publishing is part of the architecture, not an afterthought.

**Implication:** Views, keyframes, annotations, and camera state need stable references suitable for a compiler.

### P-10 — Determinism enables trust

Equivalent inputs must produce equivalent model state and export output, apart from deliberately variable metadata such as build timestamps.

**Implication:** Serialization order, ID creation, interpolation, and projection behaviour require explicit rules.

### P-11 — Accessibility is part of the interaction model

Keyboard operation, reduced motion, semantic text, focus management, and non-colour cues are core requirements.

**Implication:** Lasso, collapse, timeline control, and story navigation need accessible alternatives from the first implementation.

### P-12 — AI assists; people remain accountable

AI may draft, explain, compare, flag inconsistencies, or suggest options. It must not silently alter the authoritative graph or present uncertain inference as fact.

**Implication:** Suggested changes appear as proposals with evidence and require explicit acceptance.

### P-13 — Tests describe strategic semantics

The most valuable tests assert graph meaning, identity, topology, migrations, transitions, and output structure. Pixel comparison is supplementary.

**Implication:** The canonical corpus stores structured expectations, not only screenshots.

### P-14 — Open boundaries, controlled core

Importers, exporters, projection definitions, and analysis functions should eventually be extensible. Core identity, migration, security, and command semantics remain governed.

**Implication:** Extensibility is introduced through validated interfaces rather than arbitrary script execution.

## 4. Experience principles

### Progressive disclosure

The interface should reveal complexity when requested. A collapsed composite, a simple timeline, and a default Wardley projection should remain understandable without exposing all advanced controls.

### Reversibility

Risky actions are undoable. Collapse can expand. Projection changes can return to the authored view. A migrated file keeps a recoverable original or supports export to a compatible form where practical.

### Visible mode and provenance

The user should always be able to tell:

- which view and projection are active;
- which timeline or scenario is active;
- whether coordinates are manual or calculated;
- whether a value is measured, estimated, inferred, or missing;
- whether a composite is collapsed;
- whether the document contains unsaved changes.

### Stable mental model

The same entity should retain recognizable identity across views, keyframes, and stories. Transitions should help users follow continuity rather than merely decorate movement.

### Safe defaults

Default edge aggregation, interpolation, missing-data handling, export security, and motion settings should produce understandable, non-destructive results.

## 5. Scope guardrails

The platform should resist three forms of scope drift:

1. **Generic diagramming drift:** adding arbitrary shape tools that do not strengthen strategic modelling.
2. **Analytics theatre:** adding impressive calculations without evidence, definitions, or decision value.
3. **AI theatre:** generating fluent commentary that cannot be traced to the graph and metadata.

Every proposed feature should answer:

- Which strategic task becomes possible or materially easier?
- Which core model capability does it reuse?
- Can its result be inspected, tested, and reversed?
- Does it preserve current Wardley use?

## 6. Product boundaries

The editor owns authoring, analysis, state management, and export. A published story is a read-only derivative. A canonical corpus is a development and validation asset, not user content. External data integration is an adapter concern and does not redefine graph identity.

## 7. Long-term direction

After the lower layers are mature, the same architecture can support:

- reusable strategic components with local overrides;
- scenario trees and comparative playback;
- evidence-linked metrics and uncertainty;
- graph-derived risk and centrality views;
- learned projections that are clearly labelled as inferred;
- collaborative review and comments;
- agent-assisted map creation, critique, and change explanation.

These are extensions of the graph/view/projection/time/story model, not separate product concepts.
