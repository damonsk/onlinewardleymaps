# Draft Schemas

These JSON Schemas are design artifacts for discussion, fixture validation, and agent implementation planning. They are **not yet the authoritative format of the existing application**.

Before adoption:

1. audit current native and upstream formats;
2. decide whether the advanced model is embedded, extended in the current language, or stored as a separate format;
3. replace the `example.invalid` identifiers with project-controlled identifiers;
4. define referential and domain validation beyond structural JSON Schema;
5. approve versioning and unknown-field policy through an ADR;
6. add migration and compatibility tests.

`strategic-map.schema.json` references `projection.schema.json`. `story.schema.json` may embed a strategic map or reference one externally.
