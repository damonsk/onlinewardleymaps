# Design: [Feature Name]

## Technical Overview
- **Architecture**: [architectural approach]
- **Technology Stack**: [selected technologies]
- **Design Patterns**: [key patterns used]

## System Architecture

### Components
- **[Component 1]**: [responsibility and interface]
- **[Component 2]**: [responsibility and interface]
- **[Component 3]**: [responsibility and interface]

### Data Flow
1. [Step 1 of data flow]
2. [Step 2 of data flow]
3. [Step 3 of data flow]

### Integration Points
- **[External System 1]**: [integration approach]
- **[External System 2]**: [integration approach]

## Data Design

### Database Schema
```sql
-- [Table definitions and relationships]
```

### Data Models
- **[Entity 1]**: [properties and relationships]
- **[Entity 2]**: [properties and relationships]

### Validation Rules
- [Data validation requirements]
- [Business rule constraints]

## API Design

### Endpoints
- **GET /[resource]**: [description and response]
- **POST /[resource]**: [description and payload]
- **PUT /[resource]**: [description and updates]
- **DELETE /[resource]**: [description and effects]

### Authentication
- [Authentication mechanism]
- [Authorization levels]

## Known Gotchas & Library Quirks

```
# CRITICAL: [Library/Framework name] requires [specific setup or configuration].
# Example: The chosen web framework requires async handlers for all routes.
# Example: The database driver has a batch limit of 1000 records per transaction.
```

## Security Considerations
- **Authentication**: [implementation approach]
- **Authorization**: [access control strategy]
- **Data Protection**: [encryption and security measures]
- **Input Validation**: [sanitization approach]

## Performance & Scalability
- **Performance Targets**: [response times and throughput]
- **Caching Strategy**: [what and how to cache]
- **Database Optimization**: [indexing and query optimization]
- **Scaling Approach**: [horizontal/vertical scaling plans]

## Implementation Strategy
- **Phase 1**: [initial implementation scope]
- **Phase 2**: [feature enhancements]
- **Phase 3**: [optimization and polish]

## Validation Loop

### Level 1: Syntax & Style
```bash
# Example: linter --fix && style-checker
```

### Level 2: Unit Tests
```bash
# Example: test-runner --unit
```

### Level 3: Integration Tests
```bash
# Example: test-runner --integration
```

### Level 4: End-to-End Tests
```bash
# Example: e2e-test-suite
```
