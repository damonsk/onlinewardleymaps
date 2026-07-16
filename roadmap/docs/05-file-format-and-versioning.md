# File Format, Serialization, and Versioning

## 1. Objectives

The file-format strategy must allow the application to add composites, views, timelines, projections, metrics, and stories without making existing user maps fragile or opaque.

The exact existing formats are unknown until the repository audit. This document therefore defines principles and adapter responsibilities rather than declaring that the current format must be replaced.

## 2. Format families

The platform may need to support several format families simultaneously:

1. **Current native or source format** used by the fork today.
2. **Legacy upstream formats** accepted by Online Wardley Maps.
3. **Advanced strategic-map format** capable of representing the full model.
4. **Story format** describing narrative chapters and state references.
5. **Static story build output** consisting of HTML, CSS, JavaScript, data, and assets.
6. **Interchange formats** such as CSV or JSON for metrics and external tools.

A codec registry should detect and handle formats without making the editor state depend on any one representation.

## 3. Advanced strategic-map format

The draft advanced format is represented by `schemas/strategic-map.schema.json`. It is a design aid and test target, not an approved replacement for the current native format.

Required top-level concepts are:

- `schemaVersion`;
- `documentId`;
- metadata;
- graph nodes and edges;
- composites;
- metric definitions;
- projections;
- views;
- timelines and scenarios;
- extension fields.

## 4. Versioning policy

### 4.1 Version field

Every advanced document must contain an explicit schema version. Recommended form is semantic or ordered version text, for example `1.0.0` or `1` depending on repository convention.

### 4.2 Change classes

- **Patch-compatible:** Clarifications, optional fields, or constraints that do not require migration.
- **Backward-compatible minor:** Readers can ignore or preserve new optional fields safely.
- **Migration-required major:** Meaning or required structure changes.

The project should avoid claiming semantic-version compatibility unless reader behaviour and unknown-field preservation are actually tested.

### 4.3 Reader behaviour

A reader must distinguish:

- supported current version;
- supported older version requiring migration;
- newer compatible version that can be preserved;
- newer unsupported version;
- malformed or ambiguous input.

Opening a newer unsupported file as though it were old is dangerous and must not be the default.

## 5. Deterministic serialization

Determinism makes diffs, golden tests, caching, and agent review reliable.

The writer should define:

- stable property order where format allows;
- stable entity order, preferably by explicit order field or ID rather than incidental hash iteration;
- numeric precision and rounding;
- newline convention;
- Unicode normalization where relevant;
- timestamp inclusion policy;
- omission versus explicit null/default values;
- canonical representation of sets and maps.

Build timestamps, random IDs, and nondeterministic object ordering should not contaminate otherwise stable story or map output.

## 6. Unknown fields and extensions

Where technically feasible, readers should preserve unknown fields so that a document edited by an older compatible client does not discard newer data.

Recommended pattern:

```json
{
  "extensions": {
    "vendor.example.feature": {
      "version": 1,
      "data": {}
    }
  }
}
```

Unknown fields must never be executed as code. Namespaces should reduce collisions.

## 7. Migration design

### 7.1 Pure migrations

A migration should behave like:

```ts
migrateV2ToV3(input: V2Document): MigrationResult<V3Document>
```

It should not depend on UI state, network services, or current date unless the migration explicitly receives that information.

### 7.2 Migration result

A migration result includes:

- migrated document;
- source and target versions;
- warnings;
- losses or approximations;
- generated IDs and their mapping;
- whether a user-visible confirmation is required.

### 7.3 Idempotence

Applying a migration to an already migrated document must be prevented or produce an equivalent result. Migration tests should guard against accidental double application.

### 7.4 Backup and overwrite

The first save after a major migration should avoid silently overwriting the only copy of the legacy file. Exact UX depends on the current application, but recovery must be possible.

## 8. Legacy import

Legacy import adapters should:

1. parse without mutating source data;
2. generate or recover stable IDs;
3. map coordinates into the default Wardley view;
4. preserve original labels and relationships;
5. capture unsupported syntax in diagnostics or extensions;
6. record source-format metadata;
7. validate the resulting strategic document.

A successful parse with silent semantic loss is not considered success.

## 9. Legacy export

Advanced features require explicit flattening policies.

### Composite export

Options may include:

- export expanded members;
- export current collapsed proxy as a node with a warning;
- export one selected level of abstraction;
- refuse export if the target cannot represent required semantics.

### Timeline export

The user selects a keyframe or time. The exporter materializes that state and reports that temporal history is not included.

### Projection export

The user selects a view. The exporter writes the current resolved coordinates and labels in the target convention.

### Metrics and evidence

Unsupported values may be omitted only with a visible diagnostic or exported as comments/metadata if the format permits.

## 10. Text-source compatibility

If the current application uses a text-based map language, advanced features should not automatically force users into opaque JSON. Candidate approaches include:

- backward-compatible directives in the existing language;
- a companion sidecar file for advanced view/time/story data;
- an embedded structured block;
- a new advanced format with reliable import and export to the existing text language.

The audit should compare these options using:

- human readability;
- compatibility with current parsers;
- diff quality;
- unknown-field preservation;
- ease of authoring;
- migration risk;
- ability to represent nested and temporal structures.

An ADR is required before selecting the primary persisted representation.

## 11. Story format and build output

The story authoring format is defined separately from build output.

### Authoring format

Contains chapter IDs, titles, narrative content, state references, camera, transitions, notes, prompts, theme, and asset references.

### Build output

Contains resolved, sanitized, versioned data suitable for a read-only runtime. It may be emitted as:

- a static directory;
- a single HTML file with embedded assets;
- both, if the compiler supports deterministic modes.

The runtime contract should have its own version so stories can remain viewable even as the editor evolves.

## 12. Validation and compatibility diagnostics

Every read and write operation should return diagnostics rather than only a boolean.

Example codes:

- `FORMAT_UNKNOWN`
- `SCHEMA_UNSUPPORTED_NEWER`
- `MIGRATION_ID_GENERATED`
- `REFERENCE_MISSING`
- `LEGACY_EXPORT_COMPOSITE_FLATTENED`
- `LEGACY_EXPORT_TIMELINE_STATE_SELECTED`
- `METRIC_VALUE_INVALID`
- `STORY_ASSET_EXTERNAL`

Diagnostic codes become testable contracts and should be documented.

## 13. Round-trip guarantees

Define and test three levels:

### Semantic round trip

Import and export preserve entities, relationships, identity, metrics, and supported state even if formatting changes.

### Textual round trip

Formatting, comments, and order are preserved. This is desirable for source formats but may require a concrete syntax tree rather than a simple object serializer.

### Compatibility round trip

An advanced document exported to a legacy format and re-imported preserves the subset explicitly declared representable.

The audit determines which levels the current application already promises.

## 14. File-format security

- Enforce size, depth, and entity-count limits with configurable safe defaults.
- Reject or bound cyclic references.
- Sanitize URLs and rich text.
- Do not resolve remote references automatically.
- Do not permit extension fields to trigger dynamic imports or script evaluation.
- Protect decompression paths if packaged formats are later introduced.
- Treat asset filenames as untrusted and prevent path traversal.

## 15. Test obligations

For each supported format:

- minimal valid file;
- representative full file;
- legacy version;
- newer unsupported version;
- unknown optional fields;
- malformed syntax;
- duplicate IDs;
- missing references;
- large but valid input;
- deterministic write;
- semantic round trip;
- migration chain;
- failed migration recovery;
- legacy export with each advanced feature.

## 16. Acceptance criteria

- Advanced documents carry explicit schema versions.
- Current supported files remain readable.
- Stable IDs survive all supported round trips.
- Migrations are sequential, deterministic, and tested.
- Unknown compatible data is preserved where the chosen format permits.
- Lossy legacy export is never silent.
- Story authoring and runtime formats are versioned independently.
- Every codec produces structured diagnostics.
