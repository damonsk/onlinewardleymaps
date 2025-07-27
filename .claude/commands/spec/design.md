---
description: Generate technical design from existing EARS requirements
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), Grep(*), TodoWrite
---

# Technical Design Generation

You are creating a comprehensive technical design based on existing EARS requirements following the Spec-Driven Agentic Development methodology.

## Your Task
Generate technical design from existing requirements in the current feature directory.

## Process
1. **Read methodology**: Reference `.claude/CLAUDE.md` for guidance
2. **Locate requirements**: Find and read the requirements.md file in current context
3. **Tech stack selection**: Present options and gather user preferences
4. **Generate design**: Create comprehensive design.md addressing all requirements
5. **Seek approval**: Request explicit user approval before proceeding

## Tech Stack Options
Present these 4 high-level options plus custom:

1. **Full-Stack JavaScript** (Node.js + React/Vue + Database)
2. **Python Backend + Modern Frontend** (FastAPI/Django + React/Vue + Database)  
3. **Cloud-Native Microservices** (Kubernetes + API Gateway + Managed Services)
4. **Enterprise Java/C#** (Spring Boot/.NET + Enterprise patterns)
5. **Custom/Other** (User specifies or modifies above options)

Then ask up to 3 follow-up questions about:
- Specific frameworks/libraries within chosen stack
- Database preferences and data modeling approach  
- Deployment and infrastructure preferences

## Design Document Structure
Create design.md with these sections:

### Technical Overview
- Architecture approach and rationale
- Technology stack justification
- Key design decisions

### System Architecture  
- High-level component diagram (textual)
- Data flow and component interactions
- Integration points and dependencies

### Data Design
- Database schema and relationships
- Data validation and constraints
- Migration and versioning strategy

### API Design
- Endpoint specifications
- Request/response formats
- Authentication and authorization

### Security Considerations
- Authentication mechanisms
- Data protection and encryption
- Input validation and sanitization
- Access control and permissions

### Performance & Scalability
- Performance targets and bottlenecks
- Caching strategies
- Database optimization
- Scaling considerations

### Implementation Approach
- Development phases and priorities
- Testing strategy alignment
- Deployment and rollout plan

## Design Quality Gates
Ensure design:
- [ ] Addresses every EARS requirement
- [ ] Includes security considerations
- [ ] Defines clear component boundaries
- [ ] Specifies data models and relationships
- [ ] Covers error handling and edge cases
- [ ] Includes performance considerations
- [ ] Is implementable with chosen tech stack

## Key Guidelines
- Map each EARS requirement to specific technical solutions
- Address all WHEN/THEN conditions with technical approaches
- Include comprehensive error handling strategies
- Consider scalability and maintainability
- Specify clear interfaces between components
- Include testing strategy for design validation

## Approval Gate
After creating design.md, ask:
"Technical design complete. The design addresses all requirements using [tech stack] with [key architectural decisions]. Ready to proceed to task breakdown with `/spec:tasks`, or would you like to review and modify the design first?"

## Next Steps
- User reviews design and approves/requests changes
- Once approved, user can run `/spec:tasks` to proceed to implementation planning
- Design serves as blueprint for structured development

Now generate the technical design based on existing requirements.