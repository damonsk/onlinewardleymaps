import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {KeyboardShortcutHandler} from '../../../components/map/KeyboardShortcutHandler';
import {TOOLBAR_ITEMS} from '../../../constants/toolbarItems';

// Mock the toolbar items module
jest.mock('../../../constants/toolbarItems', () => ({
    ...jest.requireActual('../../../constants/toolbarItems'),
    getToolbarItemByShortcut: jest.fn(),
}));

const mockGetToolbarItemByShortcut = require('../../../constants/toolbarItems').getToolbarItemByShortcut as jest.MockedFunction<any>;

describe('KeyboardShortcutHandler', () => {
    let container: HTMLDivElement;
    let root: any;
    const mockOnToolSelect = jest.fn();
    const defaultProps = {
        toolbarItems: TOOLBAR_ITEMS,
        onToolSelect: mockOnToolSelect,
        isEnabled: true,
        currentSelectedTool: null,
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        jest.clearAllMocks();
        // Reset the mock implementation for each test
        mockGetToolbarItemByShortcut.mockReset();
        mockGetToolbarItemByShortcut.mockImplementation((key: string) => {
            const shortcuts: Record<string, any> = {
                c: {id: 'component', label: 'Component'},
                l: {id: 'link', label: 'Link'},
                n: {id: 'note', label: 'Note'},
                p: {id: 'pipeline', label: 'Pipeline'},
                a: {id: 'anchor', label: 'Anchor'},
                m: {id: 'buy', label: 'Buy'},
            };
            return shortcuts[key.toLowerCase()];
        });
    });

    let originalActiveElementDescriptor: PropertyDescriptor | undefined;

    beforeAll(() => {
        // Save the original descriptor for document.activeElement
        originalActiveElementDescriptor = Object.getOwnPropertyDescriptor(document, 'activeElement');
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
        jest.restoreAllMocks();
        // Restore document.activeElement to its original descriptor
        if (originalActiveElementDescriptor) {
            Object.defineProperty(document, 'activeElement', originalActiveElementDescriptor);
        } else {
            // Only delete if configurable, and catch errors
            try {
                const desc = Object.getOwnPropertyDescriptor(document, 'activeElement');
                if (desc && desc.configurable) {
                    delete (document as any).activeElement;
                }
            } catch (e) {
                // Ignore if cannot delete
            }
        }
    });

    const renderComponent = (props: any = {}) => {
        act(() => {
            root.render(<KeyboardShortcutHandler {...defaultProps} {...props} />);
        });
    };

    it('renders without crashing', () => {
        renderComponent();
        // Component doesn't render anything visible
        expect(document.body).toBeInTheDocument();
    });

    it('handles keyboard shortcuts when enabled', () => {
        renderComponent();

        // Press 'c' key for component
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'}));
        });
        expect(mockOnToolSelect).toHaveBeenCalledWith('component');
    });

    it('handles escape key to deselect tool', () => {
        renderComponent({currentSelectedTool: 'component'});

        // Press escape key
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
        });
        expect(mockOnToolSelect).toHaveBeenCalledWith(null);
    });

    it('toggles tool selection when same key is pressed twice', () => {
        renderComponent({currentSelectedTool: 'component'});

        // Press 'c' key when component is already selected
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'}));
        });
        expect(mockOnToolSelect).toHaveBeenCalledWith(null);
    });

    it('does not handle shortcuts when disabled', () => {
        renderComponent({isEnabled: false});

        // Press 'c' key
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'}));
        });
        expect(mockOnToolSelect).not.toHaveBeenCalled();
    });

    it('ignores shortcuts with modifier keys', () => {
        renderComponent();

        // Press Ctrl+C
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', ctrlKey: true}));
        });
        expect(mockOnToolSelect).not.toHaveBeenCalled();

        // Press Alt+C
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', altKey: true}));
        });
        expect(mockOnToolSelect).not.toHaveBeenCalled();
    });

    it('ignores shortcuts when focus is on input elements', () => {
        const input = document.createElement('input');
        container.appendChild(input);
        renderComponent();

        // Mock document.activeElement to return the input
        Object.defineProperty(document, 'activeElement', {
            value: input,
            writable: true,
            configurable: true,
        });

        // Press 'c' key while input is focused
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'}));
        });
        expect(mockOnToolSelect).not.toHaveBeenCalled();
    });

    it('ignores shortcuts when focus is on textarea elements', () => {
        const textarea = document.createElement('textarea');
        container.appendChild(textarea);
        renderComponent();

        // Mock document.activeElement to return the textarea
        Object.defineProperty(document, 'activeElement', {
            value: textarea,
            writable: true,
            configurable: true,
        });

        // Press 'c' key while textarea is focused
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'}));
        });
        expect(mockOnToolSelect).not.toHaveBeenCalled();
    });

    it('ignores shortcuts when focus is on contenteditable elements', () => {
        const editable = document.createElement('div');
        editable.contentEditable = 'true';
        container.appendChild(editable);
        renderComponent();

        // Mock document.activeElement to return the contenteditable element
        Object.defineProperty(document, 'activeElement', {
            value: editable,
            writable: true,
            configurable: true,
        });

        // Press 'c' key while contenteditable is focused
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'}));
        });
        expect(mockOnToolSelect).not.toHaveBeenCalled();
    });

    it('handles all defined keyboard shortcuts', () => {
        const shortcuts = [
            {key: 'c', toolId: 'component'},
            {key: 'm', toolId: 'market'},
            {key: 'e', toolId: 'ecosystem'},
            {key: 'l', toolId: 'link'},
            {key: 'n', toolId: 'note'},
            {key: 'p', toolId: 'pipeline'},
            {key: 'a', toolId: 'anchor'},
            {key: 'b', toolId: 'method-build'},
            {key: 'u', toolId: 'method-buy'},
            {key: 'o', toolId: 'method-outsource'},
            {key: 't', toolId: 'pst'},
        ];

        shortcuts.forEach(shortcut => {
            // Unmount and remove previous container if present
            act(() => {
                root.unmount();
            });
            document.body.removeChild(container);
            // Create new container and root for each shortcut
            container = document.createElement('div');
            document.body.appendChild(container);
            root = createRoot(container);
            mockOnToolSelect.mockClear();
            
            // Mock the function to return the correct toolbar item for this shortcut
            const expectedToolbarItem = TOOLBAR_ITEMS.find(item => item.id === shortcut.toolId);
            mockGetToolbarItemByShortcut.mockReturnValue(expectedToolbarItem);
            
            renderComponent();
            act(() => {
                document.dispatchEvent(new KeyboardEvent('keydown', {key: shortcut.key}));
            });
            expect(mockOnToolSelect).toHaveBeenCalledWith(shortcut.toolId);
        });
    });

    it('ignores unknown keyboard shortcuts', () => {
        mockGetToolbarItemByShortcut.mockReturnValue(undefined);
        renderComponent();

        // Press 'x' key (not a defined shortcut)
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'x'}));
        });
        expect(mockOnToolSelect).not.toHaveBeenCalled();
    });

    it('handles case insensitive shortcuts', () => {
        renderComponent();
        mockOnToolSelect.mockClear();

        // Press uppercase 'C' key
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'C'}));
        });
        expect(mockOnToolSelect).toHaveBeenCalledWith('component');
    });

    it('prevents default behavior for handled shortcuts', () => {
        renderComponent();
        mockOnToolSelect.mockClear();

        const preventDefault = jest.fn();
        const mockEvent = new KeyboardEvent('keydown', {key: 'c'});
        mockEvent.preventDefault = preventDefault;

        act(() => {
            document.dispatchEvent(mockEvent);
        });

        expect(preventDefault).toHaveBeenCalled();
    });
});
