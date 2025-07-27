---
description: Advanced mode analysis for comprehensive enterprise-grade specifications
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), TodoWrite
---

# Advanced Mode: Comprehensive Analysis

You are providing advanced, enterprise-grade analysis for spec:driven development, including threat modeling, risk assessment, and comprehensive edge case analysis.

## Your Task
Enhance existing specification with advanced analysis for: **Current feature context**

## Process
1. **Read existing specifications**: Analyze requirements.md, design.md, and/or tasks.md in current context
2. **Apply advanced analysis**: Use comprehensive frameworks for deeper insights
3. **Generate enhancements**: Add security, scalability, and risk considerations
4. **Seek approval**: Present findings and request integration approval

## Advanced Analysis Frameworks

### Security Threat Modeling (STRIDE)
- **Spoofing**: Identity verification and authentication threats
- **Tampering**: Data integrity and unauthorized modification risks
- **Repudiation**: Non-repudiation and audit trail requirements
- **Information Disclosure**: Data confidentiality and privacy concerns
- **Denial of Service**: Availability and resilience requirements
- **Elevation of Privilege**: Authorization and access control vulnerabilities

### Risk Assessment Matrix
- **Probability**: Low (1-3), Medium (4-6), High (7-9), Critical (10)
- **Impact**: Negligible (1-2), Minor (3-4), Moderate (5-6), Major (7-8), Severe (9-10)
- **Risk Score**: Probability × Impact = Risk Level
- **Mitigation Strategy**: Accept, Avoid, Transfer, Mitigate

### Scalability Analysis
- **Performance Bottlenecks**: Identify potential performance constraints
- **Resource Scaling**: CPU, memory, storage, and network considerations
- **Data Growth**: Database scaling and data partitioning strategies
- **User Load**: Concurrent user capacity and load distribution
- **Geographic Distribution**: Multi-region and CDN requirements

### Edge Case Analysis
- **Boundary Conditions**: Input limits, data ranges, and constraint violations
- **Error Scenarios**: System failures, network issues, and recovery procedures
- **Race Conditions**: Concurrent access patterns and synchronization needs
- **Resource Exhaustion**: Memory leaks, disk space, and connection limits
- **Integration Failures**: Third-party service dependencies and fallback mechanisms

## Analysis Output Format

### Security Analysis
```markdown
## Security Threat Analysis

### Identified Threats
1. **[Threat Category]**: [Description]
   - **Risk Level**: [Low/Medium/High/Critical]
   - **Attack Vector**: [How attack could occur]
   - **Impact**: [Consequences of successful attack]
   - **Mitigation**: [Recommended countermeasures]
   - **EARS Requirement**: [New security requirement to add]

### Security Controls
- **Authentication**: [Enhanced authentication requirements]
- **Authorization**: [Access control enhancements]
- **Data Protection**: [Encryption and data handling requirements]
- **Monitoring**: [Security logging and alerting requirements]
```

### Performance & Scalability Analysis
```markdown
## Scalability Assessment

### Performance Bottlenecks
1. **[Component/Operation]**: [Bottleneck description]
   - **Threshold**: [Performance limit or capacity]
   - **Scaling Strategy**: [Horizontal/Vertical scaling approach]
   - **Implementation**: [Technical solution]
   - **EARS Requirement**: [Performance requirement to add]

### Scalability Requirements
- **Throughput**: [Transaction/request volume requirements]
- **Latency**: [Response time requirements under load]
- **Availability**: [Uptime and reliability requirements]
- **Disaster Recovery**: [Backup and recovery requirements]
```

### Risk Assessment
```markdown
## Risk Analysis

### Risk Register
| Risk | Probability | Impact | Risk Score | Mitigation Strategy | Owner |
|------|-------------|--------|------------|-------------------|-------|
| [Risk description] | [1-10] | [1-10] | [Score] | [Strategy] | [Role] |

### Critical Risks
1. **[Risk Name]**: [Description]
   - **Trigger Conditions**: [What could cause this risk]
   - **Consequences**: [Business and technical impact]
   - **Mitigation Plan**: [Preventive and reactive measures]
   - **Contingency**: [Fallback plan if mitigation fails]
```

### Edge Case Analysis
```markdown
## Comprehensive Edge Cases

### Data Edge Cases
- **Empty Datasets**: [System behavior with no data]
- **Maximum Capacity**: [Behavior at data limits]
- **Invalid Data**: [Handling of corrupted or malformed data]
- **Concurrent Modifications**: [Race condition handling]

### System Edge Cases
- **Resource Exhaustion**: [Memory, disk, network limits]
- **Network Failures**: [Connectivity and timeout scenarios]
- **Dependency Failures**: [Third-party service outages]
- **Cascading Failures**: [System-wide failure scenarios]

### User Edge Cases
- **Extreme Usage Patterns**: [Unusual user behaviors]
- **Accessibility Requirements**: [Disability accommodations]
- **Multi-language Support**: [Internationalization needs]
- **Mobile/Offline Scenarios**: [Connectivity constraints]
```

## Integration with Existing Specifications

### Requirements Enhancement
Add advanced EARS requirements for:
- Security controls and threat mitigation
- Performance benchmarks and scaling thresholds
- Error handling and recovery procedures
- Monitoring and observability requirements

### Design Enhancement
Extend technical design with:
- Security architecture and controls
- Performance optimization strategies
- Scalability patterns and infrastructure
- Monitoring and alerting systems

### Tasks Enhancement
Add advanced implementation tasks for:
- Security testing and penetration testing
- Performance testing and load testing
- Chaos engineering and failure testing
- Monitoring implementation and alerting

## Quality Gates for Advanced Analysis

### Security Validation
- [ ] All STRIDE threats identified and mitigated
- [ ] Security requirements added to specifications
- [ ] Threat model documented and approved
- [ ] Security testing strategy defined

### Performance Validation
- [ ] Scalability bottlenecks identified and addressed
- [ ] Performance requirements quantified and testable
- [ ] Load testing strategy defined
- [ ] Monitoring and alerting specified

### Risk Management
- [ ] Risk register complete with mitigation strategies
- [ ] Critical risks have contingency plans
- [ ] Risk owners assigned and accountable
- [ ] Risk monitoring procedures defined

## Usage Examples

### Activate Advanced Mode
Users can request advanced analysis at any phase:
- During `/spec:plan`: "Add advanced security analysis to the project plan"
- During `/spec:requirements`: "Add advanced security analysis to the feature requirements"
- During `/spec:design`: "Include threat modeling and scalability analysis"
- During `/spec:tasks`: "Add advanced testing and monitoring tasks"
- Standalone: `/spec:advanced` for comprehensive analysis of existing specs

### Advanced Mode Outputs
- **Enhanced Requirements**: Additional EARS requirements for security, performance, and edge cases
- **Threat Model**: Comprehensive security analysis with mitigation strategies
- **Risk Assessment**: Detailed risk register with probability, impact, and mitigation plans
- **Scalability Plan**: Performance thresholds and scaling strategies
- **Advanced Tasks**: Additional implementation tasks for security, performance, and monitoring

Now provide comprehensive advanced analysis for the current feature context.