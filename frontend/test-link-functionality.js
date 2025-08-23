/**
 * Test script to validate link selection and context menu functionality
 * Run this in the browser console to test the implemented features
 */

console.log('=== Link Selection and Context Menu Test Script ===');

// Test 1: Find and test link selection
function testLinkSelection() {
    console.log('\n--- Test 1: Link Selection ---');

    const linkElements = document.querySelectorAll('line[onclick]');
    console.log(`Found ${linkElements.length} clickable link elements`);

    if (linkElements.length > 0) {
        const firstLink = linkElements[0];
        console.log('Testing click on first link:', firstLink);

        // Simulate a click
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100,
        });

        firstLink.dispatchEvent(clickEvent);
        console.log('Click event dispatched');
    } else {
        console.log('No clickable links found');
    }
}

// Test 2: Test context menu functionality
function testLinkContextMenu() {
    console.log('\n--- Test 2: Link Context Menu ---');

    const linkElements = document.querySelectorAll('line[oncontextmenu]');
    console.log(`Found ${linkElements.length} right-clickable link elements`);

    if (linkElements.length > 0) {
        const firstLink = linkElements[0];
        console.log('Testing right-click on first link:', firstLink);

        // Simulate a right-click
        const contextEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100,
            button: 2,
        });

        firstLink.dispatchEvent(contextEvent);
        console.log('Context menu event dispatched');

        // Check if context menu appeared
        setTimeout(() => {
            const contextMenu =
                document.querySelector('[role="menu"]') ||
                document.querySelector('.context-menu') ||
                document.querySelector('[data-testid*="context"]');

            if (contextMenu) {
                console.log('✓ Context menu appeared:', contextMenu);
            } else {
                console.log('✗ Context menu did not appear');
            }
        }, 100);
    } else {
        console.log('No right-clickable links found');
    }
}

// Test 3: Test keyboard shortcuts
function testKeyboardShortcuts() {
    console.log('\n--- Test 3: Keyboard Shortcuts ---');

    // Test Delete key
    console.log('Testing Delete key...');
    const deleteEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        bubbles: true,
    });

    document.dispatchEvent(deleteEvent);
    console.log('Delete key event dispatched');
}

// Test 4: Check console for our debug logs
function checkDebugLogs() {
    console.log('\n--- Test 4: Debug Logging Check ---');
    console.log('Watch the console for debug messages starting with:');
    console.log('- ComponentLink: handleLinkClick triggered');
    console.log('- ComponentLink: handleLinkContextMenu triggered');
    console.log('- useSelectionManager: selectLink called');
    console.log('- MapView: contextMenuActions updated');
}

// Run all tests
function runAllTests() {
    console.log('Starting comprehensive link functionality tests...\n');

    checkDebugLogs();

    setTimeout(() => {
        testLinkSelection();
    }, 500);

    setTimeout(() => {
        testLinkContextMenu();
    }, 1000);

    setTimeout(() => {
        testKeyboardShortcuts();
    }, 1500);

    console.log('\nTests will run with delays. Watch console for results.');
}

// Export for manual testing
window.testLinkFunctionality = {
    runAllTests,
    testLinkSelection,
    testLinkContextMenu,
    testKeyboardShortcuts,
    checkDebugLogs,
};

console.log('Test functions available:');
console.log('- window.testLinkFunctionality.runAllTests()');
console.log('- window.testLinkFunctionality.testLinkSelection()');
console.log('- window.testLinkFunctionality.testLinkContextMenu()');
console.log('- window.testLinkFunctionality.testKeyboardShortcuts()');

// Auto-run tests
setTimeout(runAllTests, 1000);
