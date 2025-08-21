import React from 'react';
import {render, screen, act} from '@testing-library/react';
import {ComponentSelectionProvider} from '../../../components/ComponentSelectionContext';
import {UndoRedoProvider} from '../../../components/UndoRedoProvider';
import {EditingProvider} from '../../../components/EditingContext';
import {FeatureSwitchesProvider} from '../../../components/FeatureSwitchesContext';
import ComponentText from '../../../components/map/ComponentText';
import {UnifiedComponent} from '../../../types/unified';

// Mock the RelativeMovable component
jest.mock('../../../components/map/RelativeMovable', () => {
    return ({children}: any) => <g data-testid="relative-movable">{children}</g>;
});

// Mock the ComponentTextSymbol
jest.mock('../../../components/symbols/ComponentTextSymbol', () => {
    return ({text, onClick}: any) => (
        <text data-testid="component-text-symbol" onDoubleClick={onClick}>
            {text}
        </text>
    );
});

// Mock the InlineEditor to capture the isMultiLine prop
jest.mock('../../../components/map/InlineEditor', () => {
    return ({isMultiLine, placeholder, value}: any) => (
        <div data-testid="inline-editor">
            <div data-testid="multiline-indicator">{isMultiLine ? 'textarea' : 'input'}</div>
            <div data-testid="placeholder">{placeholder}</div>
            <input data-testid="editor-input" value={value} readOnly />
        </div>
    );
});

describe('ComponentText Textarea Default Behavior', () => {
    const mockMapStyleDefs = {
        component: {
            fontSize: '14px',
            text: '#000000',
            evolvedText: '#666666',
        },
    };

    const renderComponentText = (component: UnifiedComponent, mapText: string) => {
        const mutateMapText = jest.fn();
        return render(
            <UndoRedoProvider mapText={mapText} mutateMapText={mutateMapText}>
                <ComponentSelectionProvider>
                    <EditingProvider>
                        <FeatureSwitchesProvider value={{enableDoubleClickRename: true}}>
                            <svg>
                                <ComponentText
                                    component={component}
                                    cx={100}
                                    cy={200}
                                    styles={{fontSize: '14px', text: '#000000'}}
                                    mutateMapText={mutateMapText}
                                    mapText={mapText}
                                    mapStyleDefs={mockMapStyleDefs}
                                    scaleFactor={1}
                                />
                            </svg>
                        </FeatureSwitchesProvider>
                    </EditingProvider>
                </ComponentSelectionProvider>
            </UndoRedoProvider>,
        );
    };

    it('should use textarea by default for single-line component names', async () => {
        const component: UnifiedComponent = {
            id: 'comp1',
            name: 'Simple Component',
            type: 'component',
            maturity: 0.4,
            visibility: 0.6,
            line: 1,
        };

        const mapText = 'component Simple Component [0.6, 0.4]';
        renderComponentText(component, mapText);

        // Double click to enter edit mode
        const textSymbol = screen.getByTestId('component-text-symbol');

        await act(async () => {
            textSymbol.dispatchEvent(new MouseEvent('dblclick', {bubbles: true}));
        });

        // Verify that textarea is used (isMultiLine=true)
        expect(screen.getByTestId('multiline-indicator')).toHaveTextContent('textarea');
    });

    it('should use textarea by default for multi-line component names', async () => {
        const component: UnifiedComponent = {
            id: 'comp2',
            name: 'Multi-line\nComponent\nName',
            type: 'component',
            maturity: 0.4,
            visibility: 0.6,
            line: 1,
        };

        const mapText = 'component "Multi-line\\nComponent\\nName" [0.6, 0.4]';
        renderComponentText(component, mapText);

        // Double click to enter edit mode
        const textSymbol = screen.getByTestId('component-text-symbol');

        await act(async () => {
            textSymbol.dispatchEvent(new MouseEvent('dblclick', {bubbles: true}));
        });

        // Verify that textarea is used
        expect(screen.getByTestId('multiline-indicator')).toHaveTextContent('textarea');
    });

    it('should show appropriate placeholder for textarea mode', async () => {
        const component: UnifiedComponent = {
            id: 'comp3',
            name: 'Test Component',
            type: 'component',
            maturity: 0.5,
            visibility: 0.5,
            line: 1,
        };

        const mapText = 'component Test Component [0.5, 0.5]';
        renderComponentText(component, mapText);

        // Double click to enter edit mode
        const textSymbol = screen.getByTestId('component-text-symbol');

        await act(async () => {
            textSymbol.dispatchEvent(new MouseEvent('dblclick', {bubbles: true}));
        });

        // Verify the placeholder includes multi-line instructions
        expect(screen.getByTestId('placeholder')).toHaveTextContent('Enter component name... (Ctrl+Enter to save)');
    });

    it('should maintain backwards compatibility with existing functionality', async () => {
        const component: UnifiedComponent = {
            id: 'comp4',
            name: 'Legacy Component',
            type: 'component',
            maturity: 0.7,
            visibility: 0.3,
            line: 1,
        };

        const mapText = 'component Legacy Component [0.3, 0.7]';
        renderComponentText(component, mapText);

        // Verify component renders normally without editing
        expect(screen.getByTestId('component-text-symbol')).toHaveTextContent('Legacy Component');

        // Enter edit mode
        const textSymbol = screen.getByTestId('component-text-symbol');

        await act(async () => {
            textSymbol.dispatchEvent(new MouseEvent('dblclick', {bubbles: true}));
        });

        // Verify editor shows up with correct value
        expect(screen.getByTestId('editor-input')).toHaveValue('Legacy Component');
        expect(screen.getByTestId('multiline-indicator')).toHaveTextContent('textarea');
    });
});
