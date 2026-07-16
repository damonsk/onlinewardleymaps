# Feature Specification: Temporal Maps, Keyframes, and Animation

**Feature ID:** TMP  
**Status:** Proposed  
**Dependencies:** Stable IDs, explicit views, projection contract, versioned persistence, command/undo support

## 1. Problem

A static map can describe one strategic state but cannot directly communicate how components emerge, move, mature, split, retire, or change relationships. Authors currently have to create separate maps or presentation slides, which breaks identity and makes comparison difficult.

The product needs a temporal model that supports exact states, smooth transitions, user-controlled playback, and future scenario branching.

## 2. Outcome

A user can create named keyframes, edit map state at those keyframes, scrub a timeline, and see deterministic transitions. The same timeline can drive the editor, analysis, tests, and published stories.

## 3. Product distinction

The feature separates:

- **state:** what the graph and view mean at a particular time;
- **transition policy:** how values between two states are resolved;
- **animation:** how resolved intermediate states are rendered on screen;
- **scenario:** which path of temporal changes is being examined.

Animation must not be the only stored representation of change.

## 4. Primary user stories

- As an author, I can capture the current map as a keyframe.
- As an author, I can create a future keyframe and move or change components there without altering the earlier state.
- As a reviewer, I can scrub between keyframes and understand continuity.
- As a facilitator, I can play, pause, step, and jump to named stages.
- As an author, I can define whether a property moves smoothly, fades, or changes discretely.
- As a publisher, I can reference timeline states in story chapters.
- As a tester, I can resolve an exact state at time `t` without running a visual animation.
- As a future scenario planner, I can branch from a known time without duplicating the entire document.

## 5. Timeline model

### 5.1 Base plus sparse keyframes

Recommended first design:

- the document contains a base graph and one or more base views;
- each keyframe stores sparse changes from previously resolved state or a declared baseline;
- a resolver materializes exact state at any keyframe;
- between keyframes, transition policies calculate intermediate display state;
- caches may store materialized checkpoints but are disposable.

This hybrid avoids duplicating every node at every keyframe while retaining inspectable states.

### 5.2 Time domains

Support two conceptual modes:

- **Normalized narrative time:** values such as `0.0` to `1.0` or arbitrary ordered numbers.
- **Calendar time:** ISO dates or timestamps.

A timeline declares one mode. The editor must not compare normalized values to calendar dates implicitly.

### 5.3 Linear first, branch-ready schema

The first UI may present a linear sequence. The schema includes scenario identity and parent/branch references so that branching can be added without re-identifying keyframes.

## 6. Keyframe content

A keyframe may change:

- node and edge lifecycle state;
- view position;
- visibility and opacity target;
- labels and descriptions;
- styles and annotations;
- metric values;
- composite collapse state and proxy position;
- graph structure through explicit add, retire, or relationship changes;
- camera and projection selection where the author chooses.

The first release may limit editable properties. Unsupported temporal changes must be rejected or clearly treated as global, not silently ignored.

## 7. State resolution

Given scenario `s` and time `t`:

1. Validate scenario and timeline references.
2. Determine preceding and following keyframes.
3. Materialize exact states at those keyframes by applying ordered patches.
4. Calculate normalized transition progress.
5. Apply easing and property-specific transition policies.
6. Resolve composites, projection, visibility, and display graph.
7. Return a renderer-neutral state plus diagnostics.

Illustrative pseudocode:

```ts
function resolveAt(t: number, timeline: Timeline, base: BaseState): ResolvedState {
  const [left, right] = surroundingKeyframes(timeline, t);
  const a = materialize(left, base);
  if (!right || left.time === right.time) return a;

  const raw = (t - left.time) / (right.time - left.time);
  const progress = applyEasing(raw, left.transitionToNext ?? timeline.defaultTransition);
  const b = materialize(right, base);
  return interpolateState(a, b, progress);
}
```

Exact implementation must avoid repeated full replay where performance requires checkpoints.

## 8. Transition policies

### 8.1 Numeric values

Default to linear interpolation after unit and scale validation. Optional easing includes linear, ease-in, ease-out, and ease-in-out.

### 8.2 Positions

Interpolate normalized coordinates. A projection change may require matching by stable ID and interpolating between resolved output positions.

### 8.3 Visibility and lifecycle

Recommended visual policy:

- node introduction: fade and optionally scale from its source or proxy;
- node retirement: fade and optionally scale toward a target;
- exact semantic activation occurs at a declared boundary even if visual opacity changes around it.

Semantic existence and visual opacity must not be conflated.

### 8.4 Categorical values

Use a step policy at start, midpoint, or end, declared per property. Do not invent intermediate categories.

### 8.5 Labels and text

Default to cross-fade or discrete replacement. Character-level morphing is not required and may harm accessibility.

### 8.6 Edges

- unchanged endpoint identities: interpolate style and path geometry;
- added edge: fade in;
- retired edge: fade out;
- endpoint identity change: represent as remove plus add unless lineage is explicit;
- bundled composite edge: cross-fade or morph between represented sets with provenance intact.

### 8.7 Metrics

Time-series metrics may interpolate according to their definition. Estimated or categorical values use explicit policies. Missing values remain missing unless a projection declares a fallback.

## 9. Editing model

### 9.1 Current-time indicator

The editor always shows:

- active scenario;
- current time;
- preceding and following keyframes;
- whether the user is exactly on a keyframe or viewing an interpolated state.

### 9.2 Editing between keyframes

Recommended first rule: structural and authored state edits occur on a keyframe. If the user edits at an intermediate time, the UI offers to:

- create a keyframe at that time; or
- move to the nearest keyframe.

Silently mutating one surrounding keyframe is not acceptable.

### 9.3 Keyframe operations

- create from current resolved state;
- duplicate;
- rename and describe;
- move in time;
- delete;
- compare with previous;
- set transition policy;
- mark as chapter candidate;
- lock.

Moving a keyframe past another requires deterministic ordering or an explicit reorder operation.

### 9.4 Onion skin and comparison

A future or optional aid may show previous/next positions or a change summary. The first release should at least offer a textual change list by stable entity ID.

## 10. Timeline controls

- slider with keyframe markers;
- play/pause;
- step to previous/next keyframe;
- playback speed;
- loop optional;
- exact-time input where appropriate;
- scenario selector when branching is enabled;
- reduced-motion mode;
- keyboard controls;
- accessible announcements of keyframe title and time.

Scrubbing should prioritize responsiveness. Expensive projection or graph calculations may be cached or moved off the main UI path after measurement.

## 11. Structural change semantics

### Add node

The node receives a stable ID and an effective-from boundary. Prior states do not include it semantically. Visual entry uses a declared transition.

### Retire node

Prefer retirement/lifecycle over historical deletion. The node remains available in earlier states and in change history.

### Delete erroneous node

A true correction may remove an entity from all history, with explicit confirmation that this is not strategic retirement.

### Split and merge

The first release can represent these as retirement plus addition, optionally linked by lineage metadata. Full semantic split/merge operations are future work.

### Edge changes

Edges have their own lifecycle and stable identity. Reversing direction is normally remove plus add unless the domain explicitly treats it as one evolving relation.

### Composite membership

Membership changes at discrete keyframes. The resolver does not interpolate set membership.

## 12. Scenario branching

### Draft model

A scenario identifies a path from a parent scenario and branch time. It stores only changes after the branch where practical.

```text
Baseline
├── Scenario A: invest early
└── Scenario B: outsource
    └── Scenario B1: supplier failure response
```

### First-release constraint

A linear timeline can be delivered first, but IDs and serialization should not assume there can only ever be one history.

### Comparison

Future UI may show synchronized side-by-side scenarios or differences at a chosen time. The domain model should support deterministic state resolution for each branch.

## 13. Projection interaction

A timeline may animate within one projection or transition between projections.

Recommended semantics:

- keyframes reference a view and projection;
- if projection is unchanged, interpolate positions normally;
- if projection changes, resolve both projections then interpolate display positions by stable entity ID;
- axis labels and guides cross-fade or transition separately;
- the story or UI identifies the frame-of-reference change explicitly.

A projection change must never masquerade as strategic movement without a visible cue.

## 14. Composite interaction

- collapse state can be keyframed;
- collapse transition may draw members toward the proxy and bundle edges;
- expand is the inverse visual sequence;
- exact state at each keyframe remains inspectable without animation;
- nested composites resolve from inner to outer;
- member lifecycle can change while an ancestor is collapsed, and becomes visible correctly on expansion.

## 15. Persistence

A timeline stores:

- stable timeline and keyframe IDs;
- time domain and duration;
- ordered keyframes;
- sparse patches;
- transition policies;
- scenario references;
- optional cached state with explicit cache version.

Migrations must preserve existing static maps by creating an implicit default state with no timeline.

## 16. Story integration

A story chapter may reference:

- exact keyframe ID;
- time within a timeline;
- scenario ID;
- view and projection;
- playback segment from one time to another;
- camera state;
- transition override.

The story compiler resolves and validates references at build time so broken chapters do not fail only in the browser.

## 17. Performance targets

Final budgets require audit. Provisional interaction targets for a representative medium map are:

- exact keyframe change visible within 100 ms after cached state is available;
- timeline scrub input handling within one animation frame where possible;
- sustained playback avoids long main-thread tasks;
- materialization and projection work are profiled separately;
- memory use grows with keyframe changes, not naively with complete document copies.

These are targets, not permission to compromise correctness.

## 18. Accessibility

- Timeline controls are real controls with labels and keyboard operation.
- Current time and keyframe changes are exposed to assistive technology without excessive announcements during continuous playback.
- Reduced-motion mode replaces movement with immediate change or gentle fades.
- Story output respects `prefers-reduced-motion`.
- Information conveyed by motion is also available as text or a change list.

## 19. Edge cases

- Two keyframes at the same time.
- Moving a keyframe across another.
- Missing entity referenced by a patch.
- Node exists in one state but not the other.
- Projection input becomes missing midway.
- Composite membership changes while collapsed.
- Nested scenario references deleted parent.
- Calendar timeline crosses daylight-saving changes; date semantics must be clear.
- Negative or out-of-range normalized time.
- Retired node still referenced by an active edge.
- Undo after keyframe deletion.
- Save during playback.
- Story chapter references a deleted keyframe.
- Large jump after scrub causing expensive replay.
- Different label lengths causing collision changes.

## 20. Acceptance criteria

- `TMP-001` A user can create, rename, move, and delete keyframes.
- `TMP-002` A user can scrub to an exact time and receive deterministic state.
- `TMP-003` Positions interpolate according to declared policy.
- `TMP-004` Categorical and text values change according to explicit step/cross-fade policy.
- `TMP-005` Node and edge lifecycle is preserved across earlier and later states.
- `TMP-006` Editing at an intermediate time creates or selects a keyframe explicitly.
- `TMP-007` Timeline operations are undoable and persist across reload.
- `TMP-008` The same entity keeps its stable ID across all keyframes.
- `TMP-009` Composite collapse state can differ by keyframe without losing members.
- `TMP-010` Projection changes are visibly distinguished from strategic movement.
- `TMP-011` Story chapters can reference and resolve timeline states.
- `TMP-012` Reduced-motion and keyboard controls are supported.
- `TMP-013` Invalid references produce structured diagnostics, not silent omission.
- `TMP-014` A static legacy map opens as a valid document with no temporal behaviour change.

## 21. Test plan

### Unit

- keyframe ordering;
- patch application;
- exact state materialization;
- interpolation by type;
- easing;
- lifecycle boundaries;
- scenario ancestry;
- invalid-reference diagnostics.

### Property-based

- resolving exactly at a keyframe equals materialized keyframe state;
- serializing and reloading preserves state at sampled times;
- progress remains within `[0, 1]` after clamping;
- unchanged properties remain unchanged across interpolation;
- adding an empty keyframe does not alter resolved state.

### Integration

- editor changes at keyframes;
- undo/redo;
- composite collapse transition;
- projection change;
- save/reload;
- story chapter reference.

### End to end

- Build three keyframes, scrub through them, reload, and verify semantic state at each keyframe and midpoint.
- Publish a story segment and use a headless browser to verify chapter activation and resolved DOM state.

### Visual

Use snapshots at exact keyframes and selected transition fractions. Combine them with semantic assertions for position tolerances, visibility, labels, and represented edge IDs.

## 22. Rollout

1. Domain resolver and fixtures.
2. Read-only playback of a pre-authored timeline.
3. Keyframe creation and exact stepping.
4. Scrubbing and interpolation.
5. Structural lifecycle changes.
6. Story integration.
7. Scenario branching after the linear model is stable.
