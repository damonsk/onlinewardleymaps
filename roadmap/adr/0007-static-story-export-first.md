# ADR-0007: Compile Stories to Static, Read-Only Web Output First

- **Status:** Proposed
- **Date:** 2026-07-16
- **Related requirements:** STR-001 through STR-014, SEC-001, PRV-001, ACC-003

## Context

Users want a mini web application for a selected strategy or training sequence. A server-backed publication system would add accounts, hosting, permissions, availability, and privacy dependencies that are not required for the core outcome.

## Decision drivers

- Easy sharing and hosting.
- Offline or local use.
- Deterministic tests.
- Security isolation from editor.
- Minimal operational burden.

## Options considered

### Hosted dynamic application

Supports updates and analytics but requires backend infrastructure and creates privacy and availability dependencies.

### Reuse the entire editor in read-only mode

Fast initially but produces a large bundle, couples stories to editor releases, and risks exposing hidden data or edit capabilities.

### Dedicated static compiler and small read-only runtime

Requires a compiler/runtime contract but provides portable, testable, secure output.

## Decision

The first publication target is a deterministic static directory with a dedicated read-only runtime. Pre-resolve chapter target states where practical. A single-file mode may follow. Hosted publishing is an adapter, not a core dependency.

## Consequences

### Positive

- Simple hosting and archival.
- No server required.
- Stronger data minimization and CSP.
- Browser automation can test exact output.

### Trade-offs

- Published output is a snapshot and must be rebuilt for updates.
- Large stories may increase bundle size.
- Runtime compatibility must be versioned.

## Compatibility and migration

Story schema and runtime version are independent from the editor schema. Existing maps require no change until a story is authored.

## Validation

Deterministic build, offline/static-server use, sanitization, hidden-data filtering, navigation, responsive layout, and accessibility tests.
