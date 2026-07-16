# Pull Request Checklist

## Scope and evidence

- [ ] Requirement IDs and work order are linked.
- [ ] Current repository behaviour was inspected and described.
- [ ] The change is a bounded delta with explicit non-goals.
- [ ] Any material decision has an ADR.

## Compatibility and data

- [ ] Existing supported maps and workflows remain tested.
- [ ] Stable IDs and references are preserved.
- [ ] Schema changes include versioning and migration.
- [ ] Legacy export loss is explicit.
- [ ] Unknown-field behaviour is tested where promised.
- [ ] Feature flag state and removal condition are documented.

## Behaviour

- [ ] User-visible acceptance criteria are met.
- [ ] Undo/redo is complete where applicable.
- [ ] Save/load is complete where applicable.
- [ ] Invalid input and recovery are tested.
- [ ] Diagnostics are actionable.

## Quality

- [ ] Unit/integration/end-to-end tests are appropriate.
- [ ] Requirement-to-test traceability is updated.
- [ ] Golden changes were semantically reviewed.
- [ ] Performance was measured where relevant.
- [ ] No unrelated dependency or formatting sweep is included.

## Security, privacy, and accessibility

- [ ] Untrusted content is validated/sanitized.
- [ ] No arbitrary code execution was introduced.
- [ ] Public output excludes private data by default.
- [ ] Keyboard, focus, reduced motion, and structured text were considered.
- [ ] Security and accessibility tests/manual checks are recorded.

## Documentation and release

- [ ] Feature specification and status are updated.
- [ ] Schemas/examples/migration notes are updated.
- [ ] Change report states limitations and rollback.
- [ ] CI and local required commands pass.
