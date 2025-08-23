# Design Document

## Overview

This design document outlines the implementation approach for enabling multi-line component names in OnlineWardleyMaps. The feature will extend the existing component parsing and rendering system to support quoted multi-line text, similar to the existing multi-line notes functionality. The implementation will maintain backward compatibility while adding new capabilities for complex component descriptions.

## Architecture

### High-Level Design

The multi-line component names feature will be implemented by:

1. **Extending the DSL Parser**: Modify the `setName` function in `extractionFunctions.ts` to handle quoted strings with line breaks
2. **Updating Component Rendering**: Enhance `ComponentTextSymbol` to render multi-line text with proper spacing and alignment
3. **Improving Inline Editing**: Extend the existing inline editor to support multi-line component name editing
4. **Maintaining Compatibility**: Ensure all existing component features work with multi-line names

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Map Text DSL                            │
│  component "Multi-line\nComponent Name" [0.5, 0.7]        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              ExtendableComponentExtractionStrategy          │
│  Uses setName() to parse component names                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Component Data Model                      │
│  { name: "Multi-line\nComponent Name", ... }               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                ComponentTextSymbol                         │
│  Renders multi-line text with proper tspan elements       │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Design

### 1. DSL Parser Enhancement

#### Modified setName Function

The `setName` function in `extractionFunctions.ts` will be enhanced to handle quoted strings similar to the existing `setText` function used for notes:

```typescript
export const setName = (baseElement: IProvideBaseElement & {name?: string}, element: string, config: IProvideDecoratorsConfig): void => {
    const afterKeyword = element.split(`${config.keyword} `)[1].trim();
    let name: string;

    // Check for quoted string (multi-line support)
    if (afterKeyword.startsWith('"')) {
        // Extract quoted content - handle escaped quotes and find the closing quote before coordinates
        const quotedMatch = afterKeyword.match(/^"((?:[^"\\]|\\.)*)"\s*\[/);
        if (quotedMatch) {
            // Successfully matched quoted string with coordinates
            name = quotedMatch[1]
                .replace(/\\"/g, '"') // Unescape quotes
                .replace(/\\n/g, '\n') // Convert explicit \n to actual line breaks
                .replace(/\\\\/g, '\\'); // Unescape backslashes
        } else {
            // Malformed quoted string - try to extract what we can
            const quoteEnd = findClosingQuote(afterKeyword, 1);
            if (quoteEnd !== -1) {
                name = afterKeyword.substring(1, quoteEnd).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            } else {
                // No closing quote found - fallback to legacy parsing
                name = afterKeyword.split(' [')[0].trim();
                // Remove leading quote if present
                if (name.startsWith('"')) {
                    name = name.substring(1);
                }
            }
        }
    } else {
        // Legacy single-line parsing (backward compatibility)
        name = afterKeyword.split(' [')[0].trim();
    }

    Object.assign(baseElement, {name});
};
```

#### Syntax Examples

The enhanced parser will support these syntax variations:

```
// Legacy single-line (unchanged)
component Simple Component [0.5, 0.7]

// New quoted single-line
component "Quoted Component" [0.5, 0.7]

// New multi-line
component "Multi-line\nComponent\nName" [0.5, 0.7]

// With escaped characters
component "Component with \"quotes\" and\nline breaks" [0.5, 0.7]

// With decorators
component "Multi-line\nComponent" (buy) [0.5, 0.7]

// With evolution
evolve "Multi-line\nComponent" 0.8
```

### 2. Component Rendering Enhancement

#### ComponentTextSymbol Updates

The `ComponentTextSymbol` component already has multi-line rendering capability for notes. This functionality will be leveraged for component names:

```typescript
// The existing renderMultiLineText function will be used
const renderMultiLineText = (id: string, textContent: string) => {
    const lines = textContent.split('\n');
    const tspans: JSX.Element[] = [];

    lines.forEach((line, lineIndex) => {
        if (line === '') {
            // Handle empty lines by adding a space to maintain line spacing
            tspans.push(
                <tspan
                    key={`${id}_line_${lineIndex}_empty`}
                    x={0}
                    dy={lineIndex === 0 ? 0 : 15}
                    textAnchor="middle"
                >
                    {' '}
                </tspan>
            );
        } else {
            // Render each line as a single tspan
            tspans.push(
                <tspan
                    key={`${id}_line_${lineIndex}`}
                    x={0}
                    dy={lineIndex === 0 ? 0 : 15}
                    textAnchor="middle"
                >
                    {line}
                </tspan>
            );
        }
    });

    return tspans;
};
```

The component will automatically detect line breaks in component names and render them appropriately.

### 3. Inline Editing Enhancement

#### Multi-line Editing Support

The existing `InlineEditor` component already supports multi-line editing. The `ComponentText` component will be updated to pass the appropriate configuration:

```typescript
// In ComponentText.tsx renderEditMode function
<InlineEditor
    value={component.name}
    onSave={handleSave}
    onCancel={handleCancel}
    multiLine={component.name.includes('\n')} // Auto-detect multi-line
    placeholder="Enter component name..."
    validation={{
        required: true,
        maxLength: 500
    }}
/>
```

#### Save Logic Enhancement

The save logic will need to handle proper escaping when converting back to DSL format:

```typescript
const handleSave = (newName: string) => {
    if (mutateMapText && mapText && newName !== component.name && component.line) {
        // Determine if we need quoted format
        const needsQuotes = newName.includes('\n') || newName.includes('"') || newName.includes('\\');

        let escapedName = newName;
        if (needsQuotes) {
            escapedName = `"${
                newName
                    .replace(/\\/g, '\\\\') // Escape backslashes
                    .replace(/"/g, '\\"') // Escape quotes
                    .replace(/\n/g, '\\n') // Escape line breaks
            }"`;
        }

        const result = rename(component.line, component.name, escapedName, mapText, mutateMapText);
        // Handle result...
    }
};
```

### 4. Component Feature Compatibility

#### Evolution Support

The evolution parsing will be updated to handle multi-line component names:

```typescript
// In setNameWithMaturity function
export const setNameWithMaturity = (
    baseElement: IProvideBaseElement & {
        name?: string;
        override?: string;
        maturity?: number;
    },
    element: string,
): void => {
    let nameSection = element.split('evolve ')[1].trim();
    let name: string;
    let override = '';

    // Handle quoted multi-line names in evolution
    if (nameSection.startsWith('"')) {
        const quotedMatch = nameSection.match(/^"((?:[^"\\]|\\.)*)"/);
        if (quotedMatch) {
            name = quotedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            nameSection = nameSection.substring(quotedMatch[0].length).trim();
        }
    } else {
        // Legacy parsing for single-line names
        const evolveMaturity = nameSection.match(/\s[0-9]?\.[0-9]+[0-9]?/);
        if (evolveMaturity && evolveMaturity.length > 0) {
            const newPoint = parseFloat(evolveMaturity[0]);
            const unprocessedName = nameSection.split(String(newPoint))[0].trim();
            name = unprocessedName;
            if (name.indexOf('->') > -1) {
                override = unprocessedName.split('->')[1].trim();
                name = unprocessedName.split('->')[0].trim();
            }
        } else {
            name = nameSection;
        }
    }

    // Continue with existing maturity parsing logic...
};
```

#### Decorator Support

Component decorators will continue to work with multi-line names. The existing decorator parsing logic operates on the full element string and doesn't depend on the name format.

#### Linking Support

Component linking will be enhanced to handle multi-line names by normalizing the names for comparison:

```typescript
// Helper function for component name matching
const normalizeComponentName = (name: string): string => {
    return name.replace(/\s+/g, ' ').trim().toLowerCase();
};

// Updated linking logic
const findComponentByName = (components: Component[], targetName: string): Component | undefined => {
    const normalizedTarget = normalizeComponentName(targetName);
    return components.find(component => normalizeComponentName(component.name) === normalizedTarget);
};
```

### 5. Map Text Generation

#### Export Format

When generating map text for export, multi-line component names will be properly escaped:

```typescript
// In mapTextGeneration.ts
const generateComponentText = (component: Component): string => {
    let nameText = component.name;

    // Check if we need quoted format
    if (nameText.includes('\n') || nameText.includes('"') || nameText.includes('\\')) {
        nameText = `"${nameText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
    }

    let result = `component ${nameText}`;

    // Add decorators
    if (component.decorators) {
        const decoratorList = [];
        if (component.decorators.buy) decoratorList.push('buy');
        if (component.decorators.build) decoratorList.push('build');
        if (component.decorators.outsource) decoratorList.push('outsource');
        if (decoratorList.length > 0) {
            result += ` (${decoratorList.join(', ')})`;
        }
    }

    // Add coordinates
    result += ` [${component.visibility}, ${component.maturity}]`;

    return result;
};
```

### 6. Testing Strategy

#### Unit Tests

New unit tests will be added to verify:

1. **Parser Tests**: Verify `setName` correctly handles quoted multi-line strings
2. **Rendering Tests**: Ensure `ComponentTextSymbol` renders multi-line names properly
3. **Editing Tests**: Validate inline editing works with multi-line content
4. **Export Tests**: Confirm map text generation produces correct DSL syntax

#### Integration Tests

Integration tests will cover:

1. **End-to-End Workflows**: Complete create/edit/save cycles with multi-line names
2. **Feature Compatibility**: Verify decorators, evolution, and linking work with multi-line names
3. **Theme Compatibility**: Test rendering across all map themes
4. **Backward Compatibility**: Ensure existing maps continue to work

#### Test Examples

```typescript
// Parser test example
describe('setName with multi-line support', () => {
    it('should parse quoted multi-line component names', () => {
        const element = 'component "Multi-line\\nComponent\\nName" [0.5, 0.7]';
        const baseElement = {};
        const config = { keyword: 'component' };

        setName(baseElement, element, config);

        expect(baseElement.name).toBe('Multi-line\nComponent\nName');
    });

    it('should handle escaped quotes in multi-line names', () => {
        const element = 'component "Component with \\"quotes\\" and\\nline breaks" [0.5, 0.7]';
        const baseElement = {};
        const config = { keyword: 'component' };

        setName(baseElement, element, config);

        expect(baseElement.name).toBe('Component with "quotes" and\nline breaks');
    });
});

// Rendering test example
describe('ComponentTextSymbol multi-line rendering', () => {
    it('should render multi-line component names with proper tspan elements', () => {
        const props = {
            id: 'test-component',
            text: 'Line 1\nLine 2\nLine 3',
            textTheme: { fontSize: '14px', textColor: 'black' }
        };

        const { container } = render(<ComponentTextSymbol {...props} />);

        const tspans = container.querySelectorAll('tspan');
        expect(tspans).toHaveLength(3);
        expect(tspans[0]).toHaveTextContent('Line 1');
        expect(tspans[1]).toHaveTextContent('Line 2');
        expect(tspans[2]).toHaveTextContent('Line 3');
    });
});
```

### 7. Migration and Compatibility

#### Backward Compatibility

The implementation maintains full backward compatibility:

1. **Existing Maps**: All existing single-line component names continue to work unchanged
2. **Mixed Syntax**: Maps can contain both single-line and multi-line component names
3. **Legacy Parsing**: The parser gracefully handles both old and new syntax
4. **Export Format**: Single-line names are exported in the original format

#### Migration Path

Users can gradually adopt multi-line component names:

1. **No Breaking Changes**: Existing functionality remains unchanged
2. **Opt-in Feature**: Users choose when to use multi-line names
3. **Seamless Transition**: Converting from single-line to multi-line is straightforward
4. **Rollback Support**: Multi-line names can be converted back to single-line if needed

## Performance Considerations

### Rendering Performance

Multi-line component names may have slight performance implications:

1. **Text Measurement**: Additional calculations for multi-line text positioning
2. **DOM Complexity**: More tspan elements for multi-line text
3. **Layout Calculations**: Increased complexity in component positioning

### Mitigation Strategies

1. **Memoization**: Use React.memo and useMemo for expensive calculations
2. **Virtualization**: Consider virtualization for maps with many multi-line components
3. **Lazy Rendering**: Only render detailed text when components are visible
4. **Caching**: Cache text measurements and layout calculations

## Security Considerations

### Input Validation

Multi-line component names require careful input validation:

1. **Length Limits**: Prevent excessively long component names
2. **Character Filtering**: Sanitize input to prevent injection attacks
3. **Escape Handling**: Properly handle escape sequences to prevent parsing errors
4. **Memory Limits**: Prevent memory exhaustion from large text content

### Implementation

```typescript
const validateComponentName = (name: string): ValidationResult => {
    const errors: string[] = [];

    // Length validation
    if (name.length > 500) {
        errors.push('Component name too long (max 500 characters)');
    }

    // Character validation
    const invalidChars = /[<>{}]/g;
    if (invalidChars.test(name)) {
        errors.push('Component name contains invalid characters');
    }

    // Line count validation
    const lineCount = name.split('\n').length;
    if (lineCount > 10) {
        errors.push('Component name has too many lines (max 10)');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
```

## Future Enhancements

### Potential Extensions

1. **Rich Text Support**: Add support for formatting (bold, italic, etc.)
2. **Auto-wrapping**: Automatic text wrapping based on component size
3. **Font Customization**: Per-component font size and style options
4. **Template System**: Predefined templates for common multi-line patterns

### API Extensions

Future API enhancements could include:

1. **Component Name Formatting**: Programmatic access to text formatting
2. **Bulk Operations**: Batch updates for multiple component names
3. **Search and Replace**: Advanced text manipulation capabilities
4. **Import/Export**: Enhanced import/export with formatting preservation

## Conclusion

The multi-line component names feature will significantly enhance the expressiveness of Wardley Maps while maintaining full backward compatibility. The implementation leverages existing multi-line text infrastructure and follows established patterns in the codebase. The feature will be delivered incrementally with comprehensive testing to ensure reliability and performance.
