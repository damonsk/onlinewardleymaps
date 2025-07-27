---
description: Display help information for spec:driven development commands
allowed-tools: Read(*), Write(*)
---

# Spec-Driven Development Help

Quick reference for the spec:driven development methodology commands.

## Available Commands

### Core Workflow Commands

#### `/spec:plan [project-description]`
**Purpose**: Interactively break down a project into a plan with multiple features.
- **Input**: A high-level description of the project.
- **Output**: Numbered directories for each feature, each with a basic `requirements.md`.
- **Usage**: Start of Phase 1 - Planning.
- **Example**: `/spec:plan "A task management app"`

#### `/spec:requirements [feature-name]`
**Purpose**: Interactively detail the EARS requirements for a specific feature.
- **Input**: A feature name (e.g., `01-project-setup`).
- **Output**: A detailed `features/[feature-name]/requirements.md`.
- **Usage**: Phase 2 - After planning is complete.
- **Prerequisite**: Must have a feature directory created by `/spec:plan`.

#### `/spec:design`
**Purpose**: Generate technical design from existing requirements
- **Input**: Existing `requirements.md` in current feature context
- **Output**: `design.md` with architecture and implementation approach
- **Usage**: Phase 2 - After requirements approval
- **Prerequisite**: Must have approved requirements.md

#### `/spec:tasks`
**Purpose**: Break down design into TDD implementation tasks
- **Input**: Existing `design.md` in current feature context
- **Output**: `tasks.md` with structured implementation plan
- **Usage**: Phase 3 - After design approval
- **Prerequisite**: Must have approved design.md

#### `/spec:advanced`
**Purpose**: Apply enterprise-grade analysis with threat modeling and risk assessment
- **Input**: Existing specifications in current feature context
- **Output**: Enhanced specifications with security, scalability, and risk analysis
- **Usage**: Can be used at any phase for comprehensive analysis
- **Features**: STRIDE threat modeling, performance analysis, edge case identification

#### `/spec:help`
**Purpose**: Display this help information
- **Input**: None
- **Output**: Command reference and usage guide
- **Usage**: Anytime you need command information

## Workflow Overview

```
1. /spec:plan [project]      →  Feature List     →  [Approval Gate]
2. /spec:requirements [feature] →  requirements.md  →  [Approval Gate]
3. /spec:design               →  design.md        →  [Approval Gate]  
4. /spec:tasks                →  tasks.md         →  [Approval Gate]
5. Implementation             →  Working Code     →  [Testing & Deploy]
```

## Key Principles

### EARS Requirements Format
- **Ubiquitous**: "The system SHALL [requirement]"
- **Event-Driven**: "WHEN [trigger] THEN the system SHALL [response]"
- **State-Driven**: "WHILE [state] the system SHALL [requirement]"
- **Conditional**: "IF [condition] THEN the system SHALL [requirement]"
- **Optional**: "WHERE [feature] the system SHALL [requirement]"

### Test-Driven Development
1. **🔴 Red**: Write failing test for next functionality
2. **🟢 Green**: Write minimal code to make test pass
3. **🔄 Refactor**: Improve code while keeping tests green

### Approval Gates
- Review and approve requirements before design
- Review and approve design before tasks
- Review and approve tasks before implementation

## File Structure

```
features/[feature-name]/
├── requirements.md     # EARS-formatted requirements
├── design.md          # Technical design document
└── tasks.md           # TDD implementation tasks
```

## Templates

Reference templates are available in:
- `.claude/templates/requirements.md` - EARS requirements template
- `.claude/templates/design.md` - Technical design template  
- `.claude/templates/tasks.md` - TDD task breakdown template

## Implementation Approaches

Choose your implementation strategy:
- **🔴🟢🔄 TDD**: Strict Red-Green-Refactor methodology
- **⚡ Standard**: Traditional implementation following tasks
- **🤝 Collaborative**: Mixed human-AI development
- **👤 Self**: Use spec as implementation guide

## Advanced Features

### Tech Stack Options (in /spec:design)
1. Full-Stack JavaScript (Node.js + React/Vue)
2. Python + Modern Frontend (FastAPI/Django + React/Vue)
3. Cloud-Native Microservices (Kubernetes + API Gateway)
4. Enterprise Java/C# (Spring Boot/.NET)
5. Custom/Other (User-defined stack)

### Advanced Analysis (in /spec:advanced)
- **STRIDE Threat Modeling**: Security vulnerability analysis
- **Risk Assessment**: Probability, impact, and mitigation strategies
- **Scalability Analysis**: Performance bottlenecks and scaling strategies
- **Edge Case Analysis**: Boundary conditions and error scenarios

## Quality Gates

### Requirements Quality
- ✅ All requirements use EARS format
- ✅ Requirements are testable and specific
- ✅ Edge cases and error conditions covered
- ✅ Non-functional requirements included

### Design Quality
- ✅ All requirements mapped to technical solutions
- ✅ Security considerations addressed
- ✅ Performance and scalability planned
- ✅ Integration points defined

### Task Quality
- ✅ Tasks follow TDD methodology
- ✅ Comprehensive test scenarios included
- ✅ Clear acceptance criteria defined
- ✅ Dependencies and blockers identified

## Common Usage Patterns

### New Project Development
```bash
/spec:plan my-new-project
# [Review and approve project plan]
/spec:requirements 01-first-feature
# [Review and approve requirements.md]
/spec:design
# [Review and approve design.md]
/spec:tasks
# [Review and approve tasks.md]
# Begin implementation following task breakdown
```

### Enhanced Security Analysis
```bash
/spec:plan secure-api-gateway-project
# [Approve project plan]
/spec:requirements 01-secure-api-gateway
# [Approve requirements]
/spec:design
# [Approve design]
/spec:advanced  # Add threat modeling and security analysis
# [Review enhanced specifications]
/spec:tasks
```

### Existing Feature Enhancement
```bash
# Navigate to existing feature directory
/spec:advanced  # Analyze existing specifications
# Review security, performance, and risk recommendations
# Update specifications as needed
```

## Need More Help?

- **Complete Methodology**: See `.claude/CLAUDE.md` for detailed guidance
- **Templates**: Use `.claude/templates/` directory for reference formats
- **Command Details**: Each command file in `.claude/commands/` contains specific instructions

---

*Spec-Driven Development: Transform complex features into manageable, well-tested implementations.*