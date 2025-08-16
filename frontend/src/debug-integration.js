// Debug script to test context menu integration
// Run this in the browser console to test the functionality

console.log('=== Context Menu Integration Debug ===');

// Test 1: Check if providers are available
console.log('1. Checking providers...');
try {
    // Check if ComponentSelectionProvider context is available
    const selectionContext = document.querySelector('[data-testid*="component"]') || document.querySelector('[data-testid*="pst"]');
    console.log('Found components:', !!selectionContext);

    // Check if ContextMenuProvider is available
    const contextMenus = document.querySelectorAll('[role="menu"]');
    console.log('Context menus found:', contextMenus.length);
} catch (error) {
    console.error('Error checking providers:', error);
}

// Test 2: Check component selection
console.log('2. Testing component selection...');
try {
    const components = document.querySelectorAll('[data-testid*="pst-box"], [id*="component"]');
    console.log('Found components:', components.length);

    components.forEach((comp, index) => {
        console.log(`Component ${index}:`, {
            id: comp.id,
            testId: comp.getAttribute('data-testid'),
            tagName: comp.tagName,
        });
    });
} catch (error) {
    console.error('Error checking components:', error);
}

// Test 3: Simulate right-click
console.log('3. Testing right-click simulation...');
try {
    const firstComponent = document.querySelector('[data-testid*="pst-box-rect"]') || document.querySelector('[id*="component"]');
    if (firstComponent) {
        console.log('Found component to test:', firstComponent);

        // Create and dispatch context menu event
        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100,
        });

        firstComponent.dispatchEvent(contextMenuEvent);
        console.log('Context menu event dispatched');

        // Check if context menu appeared
        setTimeout(() => {
            const contextMenu = document.querySelector('[role="menu"]');
            console.log('Context menu appeared:', !!contextMenu);
            if (contextMenu) {
                console.log('Context menu items:', contextMenu.querySelectorAll('[role="menuitem"]').length);
            }
        }, 100);
    } else {
        console.log('No component found to test');
    }
} catch (error) {
    console.error('Error testing right-click:', error);
}

// Test 4: Check keyboard deletion
console.log('4. Testing keyboard deletion...');
try {
    // Simulate Delete key press
    const deleteEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        bubbles: true,
        cancelable: true,
    });

    document.dispatchEvent(deleteEvent);
    console.log('Delete key event dispatched');
} catch (error) {
    console.error('Error testing keyboard deletion:', error);
}

// Test 5: Check for React DevTools
console.log('5. Checking React DevTools...');
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools available');
} else {
    console.log('React DevTools not available');
}

console.log('=== Debug Complete ===');
console.log('Check the console output above for any issues.');
console.log('If context menu is not working:');
console.log('1. Make sure you right-clicked on a map component');
console.log('2. Check if the component is properly selected (should have blue border)');
console.log('3. Look for any JavaScript errors in the console');
