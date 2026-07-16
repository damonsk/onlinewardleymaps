# ADR-0008: Maintain a Rights-Aware Canonical Map Corpus

- **Status:** Proposed
- **Date:** 2026-07-16
- **Related requirements:** TST-003, COR-001 through COR-007

## Context

The project needs canonical examples from realistic maps, including potentially maps found in books, blogs, talks, and user work. Copying source material without a provenance and permission process creates legal, ethical, and distribution risk.

## Decision drivers

- High-quality regression coverage.
- Respect for authors and licences.
- Public/private test separation.
- Repeatable fixture review.
- Avoid blocking development on third-party permissions.

## Options considered

### Copy publicly visible maps into tests

Quick but unsafe; public visibility does not establish intended reuse rights.

### Avoid all realistic sources

Safe but loses compatibility value and community relevance.

### Rights-classified corpus with project-owned fixtures first

Provides immediate coverage and a governed path for licensed or private canonical material.

## Decision

Every corpus fixture records provenance, rights class, distribution scope, reviewer, and expected semantic output. Public tests begin with invented project-owned maps. Exact third-party transcriptions require confirmed permission or licence; restricted fixtures remain segregated.

## Consequences

### Positive

- Corpus can be shared confidently.
- Source authors and restrictions are visible.
- Private validation remains possible.
- Synthetic development is not blocked.

### Trade-offs

- Fixture intake requires governance.
- Some exact compatibility tests may remain private.
- Rights metadata must be maintained.

## Compatibility and migration

Existing ad hoc fixtures should be inventoried and assigned a rights class before reuse in the new corpus.

## Validation

Manifest validation, public-build exclusion tests, dual review for transcriptions, and periodic rights audit.
