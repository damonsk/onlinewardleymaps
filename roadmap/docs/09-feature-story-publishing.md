# Feature Specification: Interactive Story Publishing

**Feature ID:** STR  
**Status:** Proposed  
**Dependencies:** Stable views, timeline state references, renderer-neutral display model, versioned story schema

## 1. Problem

A strategy map is often shared as a screenshot, slide, or link to the full editor. Those formats either lose the ability to explore change or expose more editing complexity than an audience needs. Authors need a simple way to select map states, add explanation, and publish a focused interactive briefing or training tool.

## 2. Outcome

A user can create a story with ordered chapters. Each chapter references a map state, view, projection, scenario, time, camera, and narrative content. A compiler produces a static, portable, accessible web experience with scroll- or control-driven transitions.

## 3. Design principles

- A story is a read-only derivative, not the authoritative map.
- Story chapters reference stable map state rather than screenshots.
- Export is deterministic and does not require a backend.
- User content is sanitized; arbitrary scripts are not executed.
- The story remains understandable with animation reduced or disabled.
- The author can validate broken references before export.
- The runtime is small and independent from the full editor where practical.

## 4. Primary user stories

- As an author, I can turn selected keyframes into chapters.
- As an author, I can add text, speaker notes, prompts, and annotations to each chapter.
- As a reader, I can scroll through a story and watch the map move to each referenced state.
- As a trainer, I can present the same story with chapter navigation and discussion prompts.
- As an author, I can preview the exact exported result before sharing it.
- As a maintainer, I can test chapter activation and map state in a headless browser.
- As a security reviewer, I can verify that exported content cannot execute arbitrary map-authored code.

## 5. Story model

```text
Story
├── metadata and theme
├── map reference or embedded map
├── chapters
│   ├── narrative content
│   ├── state reference
│   ├── camera
│   ├── transition
│   ├── annotations
│   ├── prompts
│   └── speaker notes
└── assets
```

The draft schema is in `schemas/story.schema.json`.

## 6. Chapter state reference

A chapter may reference:

- document or embedded-map version;
- view ID;
- projection ID where not implied by the view;
- scenario ID;
- timeline ID and exact time or keyframe ID;
- composite collapse overrides, if deliberately story-specific;
- camera state;
- selected/highlighted entities;
- visible annotations.

The compiler resolves references before output. A missing node or keyframe is a build error or an explicit warning according to configuration, never an unexplained blank state.

## 7. Authoring workflow

### 7.1 Create story

The author creates a story from the current document and chooses:

- title and description;
- theme or branding preset;
- output mode;
- map embedding policy;
- default motion and navigation behaviour.

### 7.2 Add chapter

A chapter can be created from:

- current editor state;
- a keyframe;
- a time range;
- a saved view;
- a duplicated prior chapter.

The chapter receives a stable ID. The author adds narrative content and optional notes.

### 7.3 Reorder and preview

Chapters can be reordered without breaking their state references. Preview uses the same runtime contract as exported output as far as possible.

### 7.4 Validate and build

Validation checks:

- all references resolve;
- content is valid and sanitized;
- external assets are allowed;
- story runtime version is supported;
- map data contains no unsupported features;
- accessibility requirements are met or warnings are acknowledged;
- output path contains no unsafe filenames.

## 8. Narrative content

Initial supported content should be intentionally constrained:

- plain text or sanitized Markdown;
- headings, paragraphs, lists, emphasis, and safe links;
- images with alt text;
- prompts or questions;
- speaker notes that can be excluded from public output;
- optional captions and source notes.

Audio, video, and generated narration may be added later through explicit asset handling. Remote embeds should not be enabled by default.

## 9. Scrollytelling behaviour

A typical layout has narrative chapters in one region and a sticky map viewport in another. As a chapter crosses an activation threshold:

1. the chapter becomes current;
2. the runtime resolves its target state;
3. the map transitions from prior to target state;
4. focus and URL/history behaviour remain predictable;
5. the active chapter is reflected in navigation;
6. reduced-motion users receive an immediate state change.

Scroll position should not be the only navigation method. Previous/next buttons and a chapter index are required.

## 10. Presentation mode

A presentation mode may use the same story definition with:

- full-screen chapter navigation;
- keyboard next/previous;
- optional speaker notes in a separate view;
- timer or progress display;
- audience prompts.

This can be implemented after the scroll experience if runtime architecture is shared.

## 11. Training mode

Training extensions may include:

- pause points;
- questions and reflection prompts;
- reveal controls;
- optional answer notes;
- links to supporting resources;
- chapter completion state stored locally.

Assessment scoring, learner accounts, and learning-management-system integration are future scope unless separately approved.

## 12. Build outputs

### 12.1 Static directory

Recommended primary output:

```text
story-output/
├── index.html
├── story-data.json
├── map-data.json
├── runtime.js
├── styles.css
└── assets/
```

Benefits include cacheability, transparent inspection, and straightforward hosting.

### 12.2 Single-file HTML

Useful for email, offline sharing, and simple distribution. Assets and data are embedded with size limits and safe encoding.

### 12.3 Hosted bundle

A later deployment adapter may publish to a hosting service, but compilation must remain usable without it.

## 13. Compiler pipeline

```text
story source + strategic map
    -> schema validation
    -> reference resolution
    -> state materialization
    -> content sanitization
    -> asset collection and fingerprinting
    -> runtime data generation
    -> HTML/CSS/JS assembly
    -> deterministic output validation
    -> optional browser smoke test
```

The compiler should expose a programmatic interface and a command or editor action.

## 14. Runtime contract

The runtime receives a compact, read-only representation containing:

- display entities and stable IDs;
- chapter state snapshots or efficient transition data;
- represented-edge provenance where interaction exposes it;
- axis, legend, and projection labels;
- sanitized narrative HTML or structured content;
- camera targets;
- transition policies;
- theme tokens;
- accessibility labels.

The runtime must not need the editor's reducers, parser, persistence services, or authoring panels.

## 15. Snapshot versus live resolution

Two implementation options exist:

### Pre-resolved chapter states

The compiler materializes each chapter state. Runtime is simpler and stable, but output may be larger.

### Runtime resolution

The story embeds base graph and temporal/projection definitions. Runtime computes states, reducing duplication but increasing complexity and version coupling.

Recommended initial design is **pre-resolved chapter targets plus transition metadata**. It makes static output deterministic and decouples published stories from future editor algorithms. Continuous timeline segments can include sampled or compact transition inputs when needed.

## 16. Camera and responsive layout

Camera state may include:

- center or bounds;
- zoom;
- padding;
- focus entity IDs;
- responsive fallback.

The runtime recalculates pixel layout for viewport size while preserving normalized target meaning. Authors need a preview for desktop and narrow screens.

Text and map may stack on small screens. The story must remain navigable when sticky layouts are unavailable.

## 17. Theming and branding

Use constrained design tokens rather than arbitrary CSS initially:

- fonts selected from safe bundled/system choices;
- spacing and maximum text width;
- background and foreground tokens;
- node and edge theme references;
- logo and footer;
- light/dark variants;
- print styles.

Custom CSS may be considered later with clear security and support boundaries.

## 18. Accessibility

Required:

- semantic landmarks and heading hierarchy;
- skip links;
- keyboard chapter navigation;
- visible focus;
- accessible names for map entities and controls;
- text alternative or structured map summary;
- reduced-motion behaviour;
- captions and alt text for media;
- sufficient contrast;
- non-colour cues;
- no scroll-jacking that traps users;
- printable or linearized fallback.

The map runtime should provide an entity list or summary so the content is not exclusively visual.

## 19. Security

### Content sanitization

Sanitize Markdown or rich text with an allow-list. Escape labels and metadata before inserting into HTML or SVG.

### Links

Allow safe schemes such as `https`, `http`, and optionally `mailto` under policy. Block `javascript:` and unsafe data URLs.

### Assets

- copy local approved assets into the output;
- fingerprint filenames;
- prevent path traversal;
- apply size limits;
- record attribution where required;
- avoid automatic remote fetching.

### Content Security Policy

The directory output should support a restrictive CSP. Inline scripts should be avoided or hashed/nonced in single-file mode.

### No arbitrary code

Map and story documents cannot contain executable JavaScript, dynamic imports, or event-handler attributes.

## 20. Privacy

- Do not include editor history, hidden notes, or local paths unless selected.
- Speaker notes default to excluded from public output.
- Strip personal metadata from assets where practical or warn the author.
- External analytics are absent by default and require explicit configuration and policy.
- Embedded map data may reveal hidden entities; the compiler must include only states and metadata required by the story or clearly warn when full data is embedded.

## 21. Link stability and versioning

- Story schema version and runtime version are explicit.
- Chapter IDs may be used as URL fragments.
- Output includes generator version but avoids nondeterministic timestamps in content hashes unless requested.
- A published story remains self-contained and does not break when the editor document later changes.
- Rebuild compares source document version and reports stale references.

## 22. Edge cases

- Story references a deleted view or keyframe.
- Chapter transition crosses a projection change.
- Entity is hidden in target state but selected for highlight.
- Composite is expanded in editor but collapsed in story override.
- Very long labels or right-to-left text.
- No JavaScript or print rendering.
- Asset missing after story was authored.
- Single-file output exceeds browser or sharing limits.
- External link is unsafe.
- Story contains confidential hidden map data.
- Reader resizes during transition.
- User jumps directly to a later URL fragment.
- Reduced-motion setting changes during session.
- Two chapters target identical state but different camera.

## 23. Acceptance criteria

- `STR-001` An author can create, reorder, rename, and delete chapters.
- `STR-002` Each chapter can reference a valid view and timeline state.
- `STR-003` The compiler validates references before output.
- `STR-004` Static directory output works from a simple web server without the editor backend.
- `STR-005` A supported single-file mode works within documented size limits, if included in release scope.
- `STR-006` Scroll and explicit navigation activate the same deterministic chapter states.
- `STR-007` Published output contains only selected narrative, map, and asset data.
- `STR-008` User content is sanitized and arbitrary scripts cannot execute.
- `STR-009` Reduced-motion and keyboard navigation are supported.
- `STR-010` A structured non-visual map summary or entity list is available.
- `STR-011` Build output is deterministic for equivalent source and compiler version.
- `STR-012` Headless browser tests can assert active chapter, entity state, and navigation.
- `STR-013` Broken or stale references produce actionable diagnostics.
- `STR-014` Speaker notes are excluded from public output by default.

## 24. Test plan

### Unit

- schema validation;
- reference resolution;
- content sanitization;
- asset path validation;
- deterministic filename generation;
- chapter state materialization;
- public/private field filtering.

### Integration

- editor story authoring to compiler;
- timeline and projection state resolution;
- composite states;
- directory and single-file modes;
- stale reference diagnostics.

### Browser

- chapter activation by scroll;
- next/previous navigation;
- direct fragment navigation;
- map entity positions and visibility;
- reduced-motion behaviour;
- keyboard focus;
- responsive layout;
- no console errors;
- CSP compatibility.

### Accessibility

Automated checks plus manual keyboard and screen-reader review of a representative story.

### Security

Fixtures with script tags, event handlers, unsafe URLs, path traversal, oversized assets, and hidden confidential metadata.

### Determinism

Build the same source twice and compare normalized output trees and checksums after excluding declared variable fields.

## 25. Rollout

1. Story schema and reference validator.
2. Compiler producing one static chapter.
3. Multi-chapter navigation without animation.
4. State transitions and scroll activation.
5. Authoring UI and preview.
6. Accessibility, security, and deterministic-build gates.
7. Single-file and presentation modes.
8. Training extensions and optional narration.
