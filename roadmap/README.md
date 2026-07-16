# Strategic Graph Platform

## Architecture and Evolution Specification — Draft 0.1

This pack is a first draft of the product, architecture, testing, and delivery documentation for evolving an existing fork of **Online Wardley Maps** into a broader strategic modelling platform.

The central design proposition is:

> A Wardley Map is one projection of an underlying strategic graph. The graph is the durable source of truth; projections, levels of abstraction, timelines, scenarios, and stories are views over it.

## Status and evidence base

This draft was produced from the product discussion that preceded it and has now been compared with the working repository at commit `71f2aad88ae83862fdce27c55c6733b8ba1009aa` plus the explicitly recorded local working-tree changes. The repository-specific findings, compatibility matrix, risks, and candidate architecture seams are in [`reports/repository-audit.md`](reports/repository-audit.md). Statements marked **Proposed**, **Provisional**, or **TBD after audit** remain proposals unless the audit or an accepted ADR resolves them.

The project is explicitly framed as an **evolution of a working application, not a greenfield rewrite**.

## Recommended reading order

For a product or architecture review:

1. [`docs/00-master-specification.md`](docs/00-master-specification.md)
2. [`docs/01-vision-and-design-principles.md`](docs/01-vision-and-design-principles.md)
3. [`docs/03-core-domain-model.md`](docs/03-core-domain-model.md)
4. [`docs/04-target-architecture-and-migration.md`](docs/04-target-architecture-and-migration.md)
5. The feature specifications in `docs/06` through `docs/10`
6. [`docs/11-testing-and-validation-strategy.md`](docs/11-testing-and-validation-strategy.md)
7. [`docs/16-transformation-roadmap.md`](docs/16-transformation-roadmap.md)

For a coding agent beginning work:

1. [`AGENTS.md`](AGENTS.md)
2. [`docs/02-current-state-assessment-and-repository-audit.md`](docs/02-current-state-assessment-and-repository-audit.md)
3. [`docs/15-agent-development-guide.md`](docs/15-agent-development-guide.md)
4. [`plans/initial-backlog.yaml`](plans/initial-backlog.yaml)
5. The relevant feature specification and ADRs

## Pack contents

- `docs/` — product vision, architecture, feature designs, testing, standards, roadmap, risks, and glossary.
- `adr/` — proposed Architecture Decision Records plus a reusable template.
- `schemas/` — draft JSON Schemas for the strategic-map, projection, and story formats.
- `examples/` — invented examples that exercise the schemas without reproducing third-party maps.
- `plans/` — initial backlog, requirements register, and test traceability.
- `templates/` — feature, audit, work-order, fixture, and pull-request templates.
- `prompts/` — reusable prompts for implementation and review agents.
- `tools/` — a local validation script for the documentation pack.
- `work-orders/` — bounded, repository-specific implementation instructions.
- `reports/` — verified audit and change evidence.

## Trust hierarchy

When documents conflict, use this order:

1. Current, verified behaviour of the existing application.
2. Accepted ADRs.
3. Approved requirements in `plans/requirements-register.csv`.
4. Feature specifications.
5. Roadmap and backlog ordering.
6. Illustrative examples and pseudocode.

A conflict between current behaviour and a proposed design must be recorded, not silently resolved.

## Immediate next deliverable

The active implementation deliverable is the **repository audit and behavioural baseline** defined in `docs/02-current-state-assessment-and-repository-audit.md`. The repository comparison is complete; the remaining M0 evidence and owner decisions are tracked in [`reports/repository-audit.md`](reports/repository-audit.md) and [`work-orders/AUD-EPIC-000.md`](work-orders/AUD-EPIC-000.md).

## Validate this pack

Use an isolated Python environment and install the pinned validation dependencies before running the pack validator:

```sh
python -m pip install --requirement roadmap/requirements.txt
python roadmap/tools/validate_pack.py
```
