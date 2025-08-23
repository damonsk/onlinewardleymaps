# Linking Tool Bug Fix

## Problem Identified

The linking tool functionality is broken in the refactored MapView because the [useToolbarState](file:///Users/damonskelhorn/Source/currentOwm/onlinewardleymaps-ts/frontend/src/components/map/hooks/useToolbarState.ts#L36-L50) hook doesn't contain the crucial logic that handles different `toolType` values.

In the original MapView.tsx, when a linking tool is selected, the [handleToolbarItemSelect](file:///Users/damonskelhorn/Source/currentOwm/onlinewardleymaps-ts/frontend/src/components/map/MapView.tsx#L213-L217) function checks for `item?.toolType === 'linking'` and then:

1. Sets linking state to 'selecting-source'
2. Resets source and highlighted components
3. Shows user feedback

## Root Cause

The refactored version splits state management into separate hooks but doesn't properly coordinate between:

- `useToolbarState` (handles toolbar selection)
- `useLinkingState` (handles linking workflow)

## Solution Options

### Option 1: Dependency Injection (Implemented Above)

Pass linking state actions to `useToolbarState` so it can trigger linking mode when appropriate tools are selected.

### Option 2: Event-Driven Communication

Use a custom event system or callback pattern to communicate between hooks.

### Option 3: Unified Toolbar Handler (Simplest)

Create a single handler that coordinates all toolbar-related state changes.

## Recommended Fix (Simplest)

Instead of complex dependency injection, create a unified toolbar selection handler in the main MapView component that manages coordination:

```typescript
const handleUnifiedToolbarSelection = useCallback(
    (item: ToolbarItem | null) => {
        // Handle PST tool default selection
        let finalItem = item;
        if (item?.id === 'pst' && !item.selectedSubItem && item.subItems) {
            const pioneerSubItem = PST_SUB_ITEMS.find(subItem => subItem.id === 'pioneers');
            if (pioneerSubItem) {
                finalItem = {...item, selectedSubItem: pioneerSubItem};
            }
        }

        toolbarState.setSelectedToolbarItem(finalItem);

        if (!item) {
            toolbarState.setIsValidDropZone(false);
            return;
        }

        // Handle different tool types
        if (item?.toolType === 'linking') {
            linkingState.setLinkingState('selecting-source');
            linkingState.setSourceComponent(null);
            linkingState.setHighlightedComponent(null);
            linkingState.setShowCancellationHint(false);
            showUserFeedback('Hover & click components to link', 'info');
            // Reset drawing state
            drawingState.stopDrawing();
        } else if (item?.toolType === 'drawing') {
            // Reset linking state
            linkingState.resetLinkingState();
            toolbarState.setMethodHighlightedComponent(null);
            if (item.selectedSubItem) {
                showUserFeedback(`Click and drag to draw ${item.selectedSubItem.label} box`, 'info');
            } else {
                showUserFeedback('Select a PST type from the dropdown first', 'warning');
            }
        } else if (item?.toolType === 'method-application') {
            // Reset linking and drawing state
            linkingState.resetLinkingState();
            drawingState.stopDrawing();
            const methodName = item.methodName || 'method';
            showUserFeedback(`Hover over components to apply ${methodName} method`, 'info');
        } else {
            // Reset all tool states when switching to other tools
            linkingState.resetLinkingState();
            drawingState.stopDrawing();
            toolbarState.setMethodHighlightedComponent(null);
        }
    },
    [toolbarState, linkingState, drawingState, showUserFeedback],
);
```

Then pass this handler to WysiwygToolbar instead of the simple `toolbarState.handleToolbarItemSelect`.

## Implementation

The simple fix requires changing only one line in the refactored MapView:

```typescript
// Instead of:
onItemSelect={toolbarState.handleToolbarItemSelect}

// Use:
onItemSelect={handleUnifiedToolbarSelection}
```

This preserves the separation of concerns while ensuring proper coordination between different state management hooks.
