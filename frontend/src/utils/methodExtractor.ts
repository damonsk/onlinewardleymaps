import {UnifiedComponent} from '../types/unified';

// Define an interface for method components that extends UnifiedComponent
export interface MethodComponent extends UnifiedComponent {
    targetComponentName?: string; // For "buy Water" style methods, stores the target component name
}

/**
 * Extracts method information from component decorations
 * Looks for components with (buy), (build), or (outsource) decorators
 * Returns an array of method objects ready to be rendered
 */
export function extractMethodsFromComponents(components: UnifiedComponent[]): MethodComponent[] {
    const methodRegex = /\((buy|build|outsource)\)$/i;
    const methods: MethodComponent[] = [];

    // Process all components to detect method decorations in names
    components.forEach(component => {
        if (!component.name) return;

        // Check for boolean flags (only approach now)
        let hasMethodFlag = false;
        if (component.decorators?.buy || component.decorators?.build || component.decorators?.outsource) {
            hasMethodFlag = true;
        }

        // If we found a method via decorators, use it
        if (hasMethodFlag) {
            methods.push({
                ...component,
                id: `method_${component.id}`,
                type: 'method',
                name: component.name.replace(methodRegex, '').trim(),
            } as MethodComponent);

            console.log(`Found method decoration in component "${component.name}" with flags:`, {
                buy: component.decorators?.buy,
                build: component.decorators?.build,
                outsource: component.decorators?.outsource,
            });
            return;
        }

        // Fall back to regex parsing for backward compatibility
        const match = component.name.match(methodRegex);
        if (match) {
            const legacyMethodType = match[1].toLowerCase();

            // Create a method object based on the component - need to convert legacy to boolean flags
            const methodComponent: MethodComponent = {
                ...component,
                id: `method_${component.id}`,
                type: 'method',
                name: component.name.replace(methodRegex, '').trim(),
                decorators: {
                    // Ensure all flags are present
                    buy: legacyMethodType === 'buy',
                    build: legacyMethodType === 'build',
                    outsource: legacyMethodType === 'outsource',
                    market: false,
                    ecosystem: false,
                    ...component.decorators, // Preserve any existing decorators
                },
            };

            methods.push(methodComponent);

            console.log(`Found legacy method decoration in component "${component.name}":`, legacyMethodType);
        }
    });

    console.log(`Found ${methods.length} components with method decorations`);
    return methods;
}

/**
 * Process standalone method statements like "buy Water" or "build API"
 * Links these statements with their target components
 */
export function processStandaloneMethods(
    methods: any[], // The raw methods array from the map
    components: UnifiedComponent[], // All known components
): MethodComponent[] {
    const result: MethodComponent[] = [];

    methods.forEach(method => {
        if (!method.name) return;

        // Get method type from boolean flags
        let methodType = '';
        if (method.buy) methodType = 'buy';
        else if (method.build) methodType = 'build';
        else if (method.outsource) methodType = 'outsource';

        if (!methodType) return; // No valid method type found

        console.log(`Processing standalone method: ${methodType} ${method.name}`);

        // Find the referenced component
        const targetComponentIndex = components.findIndex(c => c.name && c.name.trim().toLowerCase() === method.name.trim().toLowerCase());

        if (targetComponentIndex >= 0) {
            const targetComponent = components[targetComponentIndex];

            // Apply increaseLabelSpacing to the target component itself
            if (!targetComponent.increaseLabelSpacing) {
                // Only update if not already set to avoid double-spacing
                components[targetComponentIndex] = {
                    ...targetComponent,
                    increaseLabelSpacing: 2, // Apply the same spacing as with decorated components
                };

                console.log(`Applied increaseLabelSpacing to target component "${targetComponent.name}"`);
            }

            // Create a method component with the target component's position
            result.push({
                ...method,
                id: `method_standalone_${method.id || Math.random().toString(36).substring(2, 9)}`,
                type: 'method',
                maturity: targetComponent.maturity,
                visibility: targetComponent.visibility,
                increaseLabelSpacing: 2, // Also keep the spacing in the method component for reference
                targetComponentName: method.name,
            } as MethodComponent);

            console.log(`Found target component for method "${method.name}":`, {
                maturity: targetComponent.maturity,
                visibility: targetComponent.visibility,
                increasedLabelSpacing: components[targetComponentIndex].increaseLabelSpacing,
            });
        } else {
            console.warn(`Could not find target component for method: ${methodType} ${method.name}`);

            // Still include the method so we can at least render something
            result.push({
                ...method,
                id: `method_standalone_${method.id || Math.random().toString(36).substring(2, 9)}`,
                type: 'method',
                increaseLabelSpacing: 2, // Add increased label spacing even for fallback positioning
            } as MethodComponent);
        }
    });

    return result;
}
