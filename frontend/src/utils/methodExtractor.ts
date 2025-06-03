import { UnifiedComponent } from '../types/unified';

// Define an interface for method components that extends UnifiedComponent
export interface MethodComponent extends UnifiedComponent {
    method: string; // Add the method property
    targetComponentName?: string; // For "buy Water" style methods, stores the target component name
}

/**
 * Extracts method information from component decorations
 * Looks for components with (buy), (build), or (outsource) decorators
 * Returns an array of method objects ready to be rendered
 */
export function extractMethodsFromComponents(
    components: UnifiedComponent[],
): MethodComponent[] {
    const methodRegex = /\((buy|build|outsource)\)$/i;
    const methods: MethodComponent[] = [];

    // Process all components to detect method decorations in names
    components.forEach((component) => {
        if (!component.name) return;

        const match = component.name.match(methodRegex);
        if (match) {
            const methodType = match[1].toLowerCase();

            // Create a method object based on the component
            methods.push({
                ...component,
                id: `method_${component.id}`,
                type: 'method',
                method: methodType,
                name: component.name.replace(methodRegex, '').trim(),
            } as MethodComponent);

            console.log(
                `Found method decoration in component "${component.name}":`,
                methodType,
            );
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

    methods.forEach((method) => {
        if (!method.name || !method.method) return;

        console.log(
            `Processing standalone method: ${method.method} ${method.name}`,
        );

        // Find the referenced component
        const targetComponent = components.find(
            (c) =>
                c.name &&
                c.name.trim().toLowerCase() ===
                    method.name.trim().toLowerCase(),
        );

        if (targetComponent) {
            // Create a method component with the target component's position
            result.push({
                ...method,
                id: `method_standalone_${method.id || Math.random().toString(36).substring(2, 9)}`,
                type: 'method',
                maturity: targetComponent.maturity,
                visibility: targetComponent.visibility,
                targetComponentName: method.name,
            } as MethodComponent);

            console.log(`Found target component for method "${method.name}":`, {
                maturity: targetComponent.maturity,
                visibility: targetComponent.visibility,
            });
        } else {
            console.warn(
                `Could not find target component for method: ${method.method} ${method.name}`,
            );

            // Still include the method so we can at least render something
            result.push({
                ...method,
                id: `method_standalone_${method.id || Math.random().toString(36).substring(2, 9)}`,
                type: 'method',
            } as MethodComponent);
        }
    });

    return result;
}
