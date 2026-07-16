#!/usr/bin/env python3
"""Validate the documentation pack's structure, links, schemas, examples, and registers."""
from __future__ import annotations

import csv
import hashlib
import json
import re
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    raise AssertionError(message)


def validate_nonempty_files() -> None:
    files = [p for p in ROOT.rglob('*') if p.is_file()]
    if not files:
        fail('Pack contains no files')
    empty = [str(p.relative_to(ROOT)) for p in files if p.stat().st_size == 0]
    if empty:
        fail(f'Empty files: {empty}')


def validate_markdown_links() -> None:
    link_re = re.compile(r'\[[^\]]*\]\(([^)]+)\)')
    broken: list[str] = []
    for md in ROOT.rglob('*.md'):
        text = md.read_text(encoding='utf-8')
        for raw in link_re.findall(text):
            target = raw.strip().split()[0].strip('<>')
            if not target or target.startswith(('#', 'http://', 'https://', 'mailto:')):
                continue
            path_part = target.split('#', 1)[0]
            resolved = (md.parent / path_part).resolve()
            try:
                resolved.relative_to(ROOT.resolve())
            except ValueError:
                broken.append(f'{md.relative_to(ROOT)} -> path escapes pack: {target}')
                continue
            if not resolved.exists():
                broken.append(f'{md.relative_to(ROOT)} -> {target}')
    if broken:
        fail('Broken Markdown links:\n' + '\n'.join(broken))


def load_json(path: Path):
    with path.open(encoding='utf-8') as f:
        return json.load(f)


def validate_manifest() -> None:
    manifest_path = ROOT / 'MANIFEST.json'
    manifest = load_json(manifest_path)
    actual_paths = sorted(
        p.relative_to(ROOT).as_posix()
        for p in ROOT.rglob('*')
        if p.is_file() and p != manifest_path
    )
    entries = manifest.get('files', [])
    declared_paths = [entry.get('path') for entry in entries]

    if manifest.get('file_count_excluding_manifest') != len(actual_paths):
        fail(
            'Manifest file count mismatch: '
            f'declared={manifest.get("file_count_excluding_manifest")} actual={len(actual_paths)}'
        )
    if len(declared_paths) != len(set(declared_paths)):
        fail('Manifest contains duplicate paths')
    if declared_paths != actual_paths:
        missing = sorted(set(actual_paths) - set(declared_paths))
        extra = sorted(set(declared_paths) - set(actual_paths))
        fail(f'Manifest path mismatch: missing={missing} extra={extra}')

    for entry in entries:
        relative_path = entry['path']
        path = ROOT / relative_path
        content = path.read_bytes()
        actual_hash = hashlib.sha256(content).hexdigest()
        if entry.get('bytes') != len(content):
            fail(
                f'Manifest byte count mismatch for {relative_path}: '
                f'declared={entry.get("bytes")} actual={len(content)}'
            )
        if entry.get('sha256') != actual_hash:
            fail(f'Manifest checksum mismatch for {relative_path}')


def validate_json_and_schemas() -> None:
    json_files = list(ROOT.rglob('*.json'))
    parsed = {p: load_json(p) for p in json_files}

    schema_paths = [
        ROOT / 'schemas' / 'projection.schema.json',
        ROOT / 'schemas' / 'strategic-map.schema.json',
        ROOT / 'schemas' / 'story.schema.json',
    ]
    schemas = [parsed[p] for p in schema_paths]
    registry = Registry()
    for schema in schemas:
        Draft202012Validator.check_schema(schema)
        registry = registry.with_resource(schema['$id'], Resource.from_contents(schema))

    cases = [
        (ROOT / 'examples' / 'simple-map.json', schemas[1]),
        (ROOT / 'examples' / 'simple-story.json', schemas[2]),
    ]
    for path, schema in cases:
        validator = Draft202012Validator(schema, registry=registry, format_checker=FormatChecker())
        errors = sorted(validator.iter_errors(parsed[path]), key=lambda e: list(e.absolute_path))
        if errors:
            lines = []
            for e in errors:
                loc = '/'.join(map(str, e.absolute_path)) or '<root>'
                lines.append(f'{path.name}:{loc}: {e.message}')
            fail('Schema validation failed:\n' + '\n'.join(lines))

    validate_example_references(parsed[ROOT / 'examples' / 'simple-map.json'], parsed[ROOT / 'examples' / 'simple-story.json'])


def validate_example_references(map_doc: dict, story: dict) -> None:
    groups = {
        'nodes': [x['id'] for x in map_doc['graph']['nodes']],
        'edges': [x['id'] for x in map_doc['graph']['edges']],
        'composites': [x['id'] for x in map_doc['composites']],
        'metrics': [x['id'] for x in map_doc['metricDefinitions']],
        'evidence': [x['id'] for x in map_doc.get('evidenceRecords', [])],
        'projections': [x['id'] for x in map_doc['projections']],
        'views': [x['id'] for x in map_doc['views']],
        'timelines': [x['id'] for x in map_doc['timelines']],
        'scenarios': [x['id'] for x in map_doc['scenarios']],
    }
    for name, ids in groups.items():
        if len(ids) != len(set(ids)):
            fail(f'Duplicate IDs in example {name}: {ids}')

    node_ids = set(groups['nodes'])
    composite_ids = set(groups['composites'])
    metric_ids = set(groups['metrics'])
    evidence_ids = set(groups['evidence'])
    projection_ids = set(groups['projections'])
    view_ids = set(groups['views'])
    timeline_ids = set(groups['timelines'])
    scenario_ids = set(groups['scenarios'])

    for edge in map_doc['graph']['edges']:
        if edge['sourceId'] not in node_ids or edge['targetId'] not in node_ids:
            fail(f'Invalid edge endpoint: {edge}')
    for node in map_doc['graph']['nodes']:
        unknown_metrics = set(node['metricValues']) - metric_ids
        if unknown_metrics:
            fail(f'Unknown node metric refs for {node["id"]}: {unknown_metrics}')
        unknown_evidence = set(node.get('evidenceIds', [])) - evidence_ids
        if unknown_evidence:
            fail(f'Unknown evidence refs for {node["id"]}: {unknown_evidence}')
    for comp in map_doc['composites']:
        for ref in comp['memberRefs']:
            valid = ref['id'] in (node_ids if ref['type'] == 'node' else composite_ids)
            if not valid:
                fail(f'Invalid composite member: {comp["id"]} -> {ref}')
        unknown_metrics = set(comp.get('metricAggregation', {})) - metric_ids
        if unknown_metrics:
            fail(f'Unknown composite metric refs: {unknown_metrics}')
    for view in map_doc['views']:
        if view['projectionId'] not in projection_ids:
            fail(f'Invalid view projection: {view["id"]}')
        if view.get('scenarioId') and view['scenarioId'] not in scenario_ids:
            fail(f'Invalid view scenario: {view["id"]}')
        if set(view['entityStates']) - node_ids:
            fail(f'Invalid entity state refs in {view["id"]}')
        if set(view['compositeStates']) - composite_ids:
            fail(f'Invalid composite state refs in {view["id"]}')
    for scenario in map_doc['scenarios']:
        if scenario['timelineId'] not in timeline_ids:
            fail(f'Invalid scenario timeline: {scenario["id"]}')
        if scenario.get('parentScenarioId') and scenario['parentScenarioId'] not in scenario_ids:
            fail(f'Invalid parent scenario: {scenario["id"]}')

    keyframe_ids = {kf['id'] for tl in map_doc['timelines'] for kf in tl['keyframes']}
    for chapter in story['chapters']:
        state = chapter['state']
        if state['viewId'] not in view_ids:
            fail(f'Invalid story view: {state["viewId"]}')
        if state.get('scenarioId') and state['scenarioId'] not in scenario_ids:
            fail(f'Invalid story scenario: {state["scenarioId"]}')
        if state.get('timelineId') and state['timelineId'] not in timeline_ids:
            fail(f'Invalid story timeline: {state["timelineId"]}')
        if state.get('keyframeId') and state['keyframeId'] not in keyframe_ids:
            fail(f'Invalid story keyframe: {state["keyframeId"]}')
        valid_highlights = node_ids | composite_ids
        if set(state.get('highlightEntityIds', [])) - valid_highlights:
            fail(f'Invalid story highlights in {chapter["id"]}')
        if set(state.get('compositeCollapseOverrides', {})) - composite_ids:
            fail(f'Invalid story composite override in {chapter["id"]}')
    if story['mapReference']['documentId'] != map_doc['documentId']:
        fail('Story documentId does not match example map')


def validate_yaml() -> None:
    for path in ROOT.rglob('*.yaml'):
        with path.open(encoding='utf-8') as f:
            yaml.safe_load(f)


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def validate_registers() -> None:
    requirements = read_csv(ROOT / 'plans' / 'requirements-register.csv')
    trace = read_csv(ROOT / 'plans' / 'traceability-matrix.csv')
    tests = read_csv(ROOT / 'plans' / 'test-catalogue.csv')

    req_ids = [r['id'] for r in requirements]
    if len(req_ids) != len(set(req_ids)):
        fail('Duplicate requirement IDs')
    trace_ids = [r['requirement_id'] for r in trace]
    if set(trace_ids) != set(req_ids):
        fail(f'Traceability mismatch: missing={set(req_ids)-set(trace_ids)} extra={set(trace_ids)-set(req_ids)}')
    test_ids = [r['test_id'] for r in tests]
    if len(test_ids) != len(set(test_ids)):
        fail('Duplicate test IDs')

    known_test_ids = set(test_ids)
    for row in trace:
        if row['implementation_status'] not in {'Implemented', 'In progress'}:
            continue
        referenced_test_ids = [value.strip() for value in row['planned_test_ids'].split(';') if value.strip()]
        missing_test_ids = sorted(set(referenced_test_ids) - known_test_ids)
        if missing_test_ids:
            fail(
                f'Active traceability row {row["requirement_id"]} references '
                f'unknown tests: {missing_test_ids}'
            )

    for row in requirements:
        source = ROOT / row['source_document']
        if not source.exists():
            fail(f'Missing requirement source: {row["id"]} -> {row["source_document"]}')


def main() -> int:
    validate_nonempty_files()
    validate_manifest()
    validate_markdown_links()
    validate_json_and_schemas()
    validate_yaml()
    validate_registers()
    file_count = sum(1 for p in ROOT.rglob('*') if p.is_file())
    print(
        f'Validation passed: {file_count} files; manifest, schemas, examples, links, '
        'YAML, CSV registers, and references are valid.'
    )
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f'VALIDATION FAILED: {exc}', file=sys.stderr)
        raise
