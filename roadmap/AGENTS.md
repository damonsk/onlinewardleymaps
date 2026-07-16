# Instructions for Coding and Review Agents

## Mission

Evolve the existing Wardley mapping application safely and incrementally into the strategic graph platform described in this pack. Preserve working behaviour unless an approved requirement and migration plan explicitly change it.

## Non-negotiable rules

1. **Inspect before changing.** Identify the real modules, data flows, tests, build commands, and persistence format before proposing code.
2. **Do not rewrite by default.** Prefer adapters, extraction, seams, and incremental replacement over wholesale substitution.
3. **Protect existing maps.** Never change the saved-map format without a schema version, migration, round-trip tests, and a rollback story.
4. **Keep stable identities.** Nodes, edges, composites, views, keyframes, and story chapters require durable IDs. Display labels are not identities.
5. **Separate graph from presentation.** Domain relationships must not depend on screen coordinates, DOM objects, or a particular projection.
6. **Characterise first.** Before refactoring uncertain behaviour, add tests that capture what the application currently does.
7. **Make changes reversible.** Major capabilities should be introduced behind feature flags or other controlled activation mechanisms until proven.
8. **Keep output deterministic.** Given equivalent input and configuration, serialization, projection, and story compilation must be reproducible.
9. **Update the evidence.** Every completed work item must update tests, affected documentation, the requirement traceability record, and any relevant ADR.
10. **Do not ingest unlicensed reference maps.** Corpus entries must include provenance and permission status. Use invented fixtures until rights are confirmed.

## Required work-order inputs

Before implementation, create a work order from `templates/agent-work-order-template.md` that names:

- the requirement IDs being implemented;
- the repository modules affected;
- current behaviour and evidence;
- compatibility constraints;
- proposed design and alternatives;
- test additions;
- migrations and rollback;
- documentation updates;
- unresolved assumptions.

## Required implementation outputs

A feature is not complete without:

- source changes that follow the existing repository conventions;
- unit and integration tests;
- characterization tests where legacy behaviour was touched;
- migration tests when persisted data changes;
- end-to-end or visual tests for user-visible behaviour;
- an updated ADR when a material architecture decision was made;
- a short change report describing compatibility and known limitations.

## Stop conditions

Pause implementation and report the conflict when any of these occurs:

- the current application contradicts an accepted ADR;
- a requested change would invalidate existing map files without a migration;
- a dependency or framework replacement is being proposed mainly for preference;
- feature semantics cannot be made deterministic;
- a reference fixture has unclear rights or provenance;
- acceptance criteria cannot be tested with the available architecture.

## Definition of done

The project-level definition of done is in `docs/14-technical-standards.md`. Feature-specific acceptance criteria are authoritative for the feature, but they do not waive compatibility, security, accessibility, or test requirements.
