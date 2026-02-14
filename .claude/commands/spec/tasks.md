---
description: Break down technical design into implementable TDD tasks
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), Grep(*), TodoWrite
---

# Implementation Task Breakdown

You are creating a comprehensive task breakdown from existing technical design following Test-Driven Development methodology and the Spec-Driven Agentic Development approach.

## Your Task
Generate structured implementation tasks from existing design.md in the current feature context.

## Process
1. **Read methodology**: Reference `.claude/CLAUDE.md` for TDD guidance
2. **Locate design**: Find and read the design.md file in current context
3. **Generate tasks**: Create comprehensive tasks.md with TDD approach
4. **Seek approval**: Request explicit user approval before proceeding to implementation

## TDD Task Structure
Follow Red-Green-Refactor cycle for each task:

### Task Format
```
## Task [N]: [Component/Feature Name]

### Description
Brief description of what this task accomplishes

### Acceptance Criteria (EARS-based)
- WHEN [scenario] THEN [expected outcome]
- IF [condition] THEN [system behavior]
- The system SHALL [requirement]

### TDD Implementation Steps
1. **Red Phase**: Write failing test for [specific behavior]
2. **Green Phase**: Implement minimal code to pass test
3. **Refactor Phase**: Clean up while keeping tests green

### Test Scenarios
- Unit tests: [list key unit test cases]
- Integration tests: [list integration scenarios]
- Edge cases: [list error conditions and boundary cases]

### Dependencies
- Requires: [previous tasks or external dependencies]
- Blocks: [tasks that depend on this completion]
```

## Task Breakdown Strategy

### 1. Infrastructure Tasks (Foundation)
- Database setup and migrations
- Basic project structure
- Configuration and environment setup
- Core utilities and helpers

### 2. Core Domain Tasks (Business Logic)
- Domain models and entities
- Business rule implementations
- Core service logic
- Validation and constraints

### 3. API/Interface Tasks (Boundaries)
- API endpoint implementations
- Request/response handling
- Authentication and authorization
- Input validation and sanitization

### 4. Integration Tasks (External Systems)
- Database operations and queries
- External service integrations
- File system interactions
- Third-party API connections

### 5. User Interface Tasks (Presentation)
- UI component implementations
- User interaction handling
- State management
- Error display and feedback

### 6. Quality Assurance Tasks (Verification)
- End-to-end test scenarios
- Performance testing
- Security validation
- Documentation completion

## Task Quality Gates
Ensure each task:
- [ ] Has clear acceptance criteria based on EARS requirements
- [ ] Includes specific TDD steps (Red-Green-Refactor)
- [ ] Lists comprehensive test scenarios
- [ ] Specifies dependencies and blockers
- [ ] Is small enough to complete in 2-4 hours
- [ ] Has measurable completion criteria

## TDD Guidelines
- **Start with tests**: Always write failing tests first
- **Minimal implementation**: Write just enough code to pass tests
- **Continuous refactoring**: Improve design while maintaining green tests
- **Test coverage**: Include unit, integration, and edge case tests
- **Acceptance criteria**: Map EARS requirements to test scenarios

## Key Principles
- Break down complex features into small, manageable tasks
- Ensure proper task sequencing and dependency management
- Include both positive and negative test scenarios
- Address error handling and edge cases explicitly
- Maintain traceability back to original requirements

## Approval Gate
After creating tasks.md, ask:
"Implementation task breakdown complete. Created [N] tasks following TDD methodology, covering [key areas]. Tasks are sequenced with proper dependencies and include comprehensive test scenarios. Ready to begin implementation, or would you like to review and modify the task breakdown first?"

## Implementation Options
Present these choices:
1. **TDD Implementation**: Follow Red-Green-Refactor for each task
2. **Standard Implementation**: Implement without strict TDD process
3. **Self Implementation**: User implements using tasks as guide
4. **Collaborative**: Mixed approach with user and AI collaboration

## Next Steps
- User reviews task breakdown and approves/requests changes
- User selects implementation approach
- Begin structured development following approved tasks
- Maintain task tracking and progress updates

Now generate the implementation task breakdown based on existing design.