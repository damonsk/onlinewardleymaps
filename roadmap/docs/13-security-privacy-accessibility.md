# Security, Privacy, and Accessibility Requirements

## 1. Purpose

The application imports user-controlled content, renders labels and annotations, persists local strategic data, calculates derived views, and exports web applications. Those capabilities create security, privacy, and accessibility obligations that must be designed into every feature.

This is a product and engineering baseline. Repository-specific threat modelling and applicable organizational policies remain required.

# Part A — Security

## 2. Assets to protect

- Strategic maps and potentially confidential metadata.
- User-authored stories, notes, and assets.
- Local filesystem or browser storage.
- Integrity of graph identity, metrics, and history.
- Export consumers who open generated HTML.
- Build and deployment credentials.
- Private canonical-corpus fixtures.

## 3. Trust boundaries

Treat as untrusted:

- imported map files;
- labels, descriptions, Markdown, links, and annotations;
- metric CSVs;
- story assets and filenames;
- extension fields;
- external component definitions;
- URLs;
- generated or agent-authored content;
- third-party library output that is inserted into the DOM.

The fact that a document was created by the application does not make a later imported copy trustworthy.

## 4. Input validation

- Validate schema before domain construction.
- Enforce maximum file size, nesting depth, entity count, edge count, keyframe count, and asset size using configurable limits.
- Detect duplicate IDs and missing references.
- Reject cyclic composite or scenario references.
- Validate numeric finiteness; reject `NaN` and infinities where formats permit them.
- Bound formula evaluation and graph algorithms.
- Return structured diagnostics without exposing sensitive stack traces in normal UI.

## 5. Content injection

### Editor

- Render labels as text, not raw HTML.
- Sanitize supported rich text with a strict allow-list.
- Avoid framework escape hatches unless reviewed.
- Treat SVG attributes and links as injection surfaces.

### Story export

- Sanitize narrative content before build.
- Escape all map-derived text in HTML, SVG, and JavaScript data contexts.
- Never generate inline event-handler attributes from authored data.
- Block unsafe URL schemes.
- Prefer data serialized as JSON with safe escaping over source-code concatenation.

## 6. Formula and extension safety

- Do not execute arbitrary JavaScript from projection, metric, or extension definitions.
- Use a constrained expression parser or a registry of approved functions.
- Limit recursion, operation count, and memory use.
- No network, filesystem, DOM, or process access from formulas.
- Version formulas and record calculation diagnostics.

## 7. File and asset safety

- Normalize and validate paths.
- Prevent `../` traversal and absolute-path writes.
- Generate safe output filenames rather than trusting source names.
- Verify asset MIME type where practical.
- Bound image dimensions and decompression risk.
- Do not automatically fetch remote assets during import or build.
- Preserve attribution metadata where required, but strip sensitive local paths.

## 8. Static-story security

Recommended controls:

- restrictive Content Security Policy;
- no arbitrary remote scripts;
- no editor write APIs;
- no local storage unless a feature requires it;
- safe link attributes for external navigation;
- isolated or no service worker by default;
- deterministic, inspectable runtime bundle;
- security regression fixtures.

Single-file mode may require CSP trade-offs. Those must be documented and tested rather than ignored.

## 9. Dependency and supply-chain controls

- Lock dependencies.
- Review material new dependencies for maintenance, licence, size, and security.
- Run vulnerability scanning in CI.
- Avoid adding a graph or animation library solely for one small operation when current capabilities suffice.
- Reproducible builds are preferred.
- Generated story runtime dependencies should be minimal and pinned.

## 10. Denial-of-service resistance

Potential expensive operations include:

- deeply nested or cyclic structures;
- large dense graphs;
- graph centrality algorithms;
- timeline replay with many keyframes;
- composite closure resolution;
- malicious formulas;
- huge embedded assets;
- browser layout storms during scrub.

Use validation limits, cancellation, workers, caching, incremental computation, and clear errors. Do not freeze the editor indefinitely on invalid input.

## 11. Security logging

Development diagnostics may record error codes and entity IDs. They should avoid recording full confidential labels or document content by default. User telemetry is not assumed.

# Part B — Privacy

## 12. Data-minimization principles

- Store only data needed for the feature.
- Do not add cloud synchronization implicitly.
- Do not include hidden editor state in public stories.
- Speaker notes and private annotations default to excluded.
- Avoid embedding the complete graph when only selected story states are needed.
- Make remote asset and analytics behaviour explicit.

## 13. Local storage and autosave

The audit must document current local persistence. Requirements:

- identify what is stored and where;
- allow users to clear local data;
- avoid storing secrets in map files or browser storage;
- handle shared-device risks;
- document autosave recovery and retention;
- do not silently upload content.

## 14. Story publication review

Before export, provide or support a report of:

- included nodes and metadata;
- hidden data that would nevertheless be embedded;
- external links and assets;
- speaker notes and private annotations;
- document author or path metadata;
- analytics configuration;
- licences and attributions.

## 15. Canonical corpus privacy

- Do not use customer or employee maps without explicit authorization.
- Sanitize names, URLs, identifiers, and metadata when creating permitted examples.
- Keep restricted fixtures separate from public repositories and artifacts.
- Record retention and access rules.
- Prefer invented maps for public regression tests.

## 16. AI and external services

Any future AI capability must disclose what data is sent outside the application, to which service, for what purpose, and under what retention policy. Opt-in and redaction may be required. The base platform must remain usable without AI or external data transfer.

# Part C — Accessibility

## 17. Accessibility goals

The editor and published stories should be usable by people who rely on keyboard navigation, screen readers, zoom, high contrast, reduced motion, or non-colour cues. A visual map also needs structured textual access to entities and relationships.

## 18. Keyboard operation

Every primary action requires a keyboard path, including:

- navigate nodes and edges;
- select multiple nodes;
- accessible alternative to lasso;
- create and edit composites;
- collapse and expand;
- move or edit position through controls;
- manage keyframes and timeline;
- choose projections and metrics;
- navigate story chapters;
- open inspectors and diagnostics;
- undo and redo.

Canvas or SVG interaction must not trap focus.

## 19. Semantic representation

Provide a structured representation of the current map:

- document title and active view;
- node list with type, position meaning, metrics, and composite membership;
- edge list with source, target, type, and direction;
- current time/scenario;
- selected entity details;
- change summary between keyframes;
- active story chapter.

This may be an inspector, table, outline, or screen-reader-specific layer, but it must stay synchronized with the visual state.

## 20. Focus management

- Visible focus indicator.
- Logical tab order.
- After collapse, focus moves to the proxy.
- After expand, focus can return to the previously focused member or the composite control.
- Dialogs return focus to the invoking control.
- Timeline playback does not steal focus.
- Story chapter activation caused by scroll does not unexpectedly move keyboard focus.

## 21. Motion

- Respect `prefers-reduced-motion`.
- Provide an application setting where appropriate.
- In reduced mode, use immediate changes or minimal fades.
- Do not convey information only through movement.
- Avoid flashing and rapid repeated motion.
- Allow playback pause and manual stepping.

## 22. Colour and visual encoding

- Meet applicable contrast targets in supported themes.
- Do not encode metric or state only by colour.
- Use labels, patterns, shapes, icons, or text badges as alternatives.
- Legends are keyboard accessible and linked to semantics.
- Focus and selection remain visible in high-contrast modes.

## 23. Text, zoom, and responsive layout

- Support browser zoom without loss of content or controls.
- Long labels wrap, truncate with accessible full text, or use a reviewed strategy.
- Story text has readable line lengths and scalable units.
- Narrow layouts stack content without forcing horizontal scrolling for ordinary text.
- Tooltips are not the sole source of information.

## 24. Accessible timeline

- Slider has name, minimum, maximum, current value, and keyframe context.
- Named keyframes are reachable directly.
- Continuous scrub announcements are throttled to avoid noise.
- Play/pause state is announced.
- A textual change summary is available.
- Calendar time uses understandable formatting while retaining exact machine value.

## 25. Accessible composites

- Proxy identifies itself as a composite and states member count.
- Collapse control exposes expanded state.
- Member list is accessible without visual expansion if appropriate.
- Edge bundles state how many dependencies they represent and allow inspection.
- Lasso has a list- or search-based alternative.

## 26. Accessible story output

- Semantic sections and headings.
- Chapter navigation and current-state indication.
- Skip links.
- Map summary or entity outline.
- Descriptive annotations and image alt text.
- Reduced motion.
- Print or linear reading mode.
- No scroll-jacking.
- Focusable controls use native semantics where possible.

## 27. Testing and review

Automated tools should run in CI, but release gates also require manual review of representative flows:

- keyboard-only editor workflow;
- screen-reader map outline and selected entity;
- composite collapse/expand;
- timeline editing and playback;
- alternate projection explanation;
- published story navigation;
- zoom and reduced motion.

Record known limitations and remediation owners.

## 28. Cross-cutting acceptance criteria

- `SEC-001` Imported and authored text cannot execute script in editor or story output.
- `SEC-002` Formulas and custom projection definitions cannot execute arbitrary code.
- `SEC-003` Asset output prevents path traversal and unsafe remote fetching.
- `SEC-004` Large or cyclic inputs fail safely within configured limits.
- `SEC-005` Story output supports a restrictive security policy.
- `PRV-001` Public story builds exclude private notes and unselected metadata by default.
- `PRV-002` No map content is uploaded without explicit user action and disclosed destination.
- `PRV-003` Restricted corpus fixtures cannot enter public artifacts.
- `ACC-001` Primary features have keyboard-equivalent workflows.
- `ACC-002` Current map semantics are available in structured text.
- `ACC-003` Reduced-motion operation is supported in editor and story.
- `ACC-004` Focus remains logical through collapse, expand, dialogs, and chapter activation.
- `ACC-005` Meaning is not conveyed by colour or motion alone.
