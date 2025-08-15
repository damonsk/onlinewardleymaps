/**
 * Example component demonstrating PST resize functionality with map text mutation
 * This shows how to integrate PST elements with resize capabilities
 */

import React, {useState} from 'react';
import PSTContainer from './PSTContainer';
import {extractPSTElementsFromMapText} from '../../utils/pstMapTextMutation';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';

interface PSTResizeExampleProps {
    /** Initial map text containing PST elements */
    initialMapText: string;
    /** Map dimensions */
    mapDimensions: MapDimensions;
    /** Map theme for styling */
    mapStyleDefs: MapTheme;
    /** Scale factor for responsive sizing */
    scaleFactor?: number;
}

/**
 * Example component showing PST resize functionality
 * Demonstrates the complete workflow from map text to interactive PST elements
 */
const PSTResizeExample: React.FC<PSTResizeExampleProps> = ({
    initialMapText,
    mapDimensions,
    mapStyleDefs,
    scaleFactor = 1,
}) => {
    const [mapText, setMapText] = useState(initialMapText);
    const [showMapText, setShowMapText] = useState(false);

    // Extract PST elements from current map text
    const pstElements = extractPSTElementsFromMapText(mapText);

    // Handle map text updates from resize operations
    const handleMapTextUpdate = (newMapText: string) => {
        setMapText(newMapText);
        console.log('Map text updated:', newMapText);
    };

    return (
        <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
            <h2>PST Resize Example</h2>
            
            <div style={{marginBottom: '20px'}}>
                <p>
                    This example demonstrates PST (Pioneers, Settlers, Town Planners) resize functionality.
                    Hover over PST boxes to see resize handles, then drag to resize.
                    The map text is automatically updated when you complete a resize operation.
                </p>
                
                <div style={{marginBottom: '10px'}}>
                    <strong>Found {pstElements.length} PST elements:</strong>
                    <ul>
                        {pstElements.map(element => (
                            <li key={element.id}>
                                {element.type}: {element.name || 'Unnamed'} 
                                (Line {element.line + 1})
                            </li>
                        ))}
                    </ul>
                </div>
                
                <button 
                    onClick={() => setShowMapText(!showMapText)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {showMapText ? 'Hide' : 'Show'} Map Text
                </button>
            </div>

            {showMapText && (
                <div style={{
                    marginBottom: '20px',
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid #ddd',
                }}>
                    <strong>Current Map Text:</strong>
                    <br />
                    {mapText}
                </div>
            )}

            <div style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: 'white',
            }}>
                <svg
                    width={mapDimensions.width}
                    height={mapDimensions.height}
                    style={{
                        display: 'block',
                        backgroundColor: '#fafafa',
                    }}
                >
                    {/* Grid background for reference */}
                    <defs>
                        <pattern
                            id="grid"
                            width="50"
                            height="50"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 50 0 L 0 0 0 50"
                                fill="none"
                                stroke="#e0e0e0"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="url(#grid)"
                    />
                    
                    {/* Axis labels */}
                    <text
                        x={mapDimensions.width / 2}
                        y={mapDimensions.height - 10}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#666"
                    >
                        Maturity →
                    </text>
                    <text
                        x="15"
                        y={mapDimensions.height / 2}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#666"
                        transform={`rotate(-90, 15, ${mapDimensions.height / 2})`}
                    >
                        ← Visibility
                    </text>

                    {/* PST Container with resize functionality */}
                    <PSTContainer
                        pstElements={pstElements}
                        mapDimensions={mapDimensions}
                        mapStyleDefs={mapStyleDefs}
                        scaleFactor={scaleFactor}
                        mapText={mapText}
                        onMapTextUpdate={handleMapTextUpdate}
                    />
                </svg>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                fontSize: '14px',
            }}>
                <strong>Instructions:</strong>
                <ul style={{margin: '5px 0', paddingLeft: '20px'}}>
                    <li>Hover over any PST box to see resize handles</li>
                    <li>Drag corner handles to resize proportionally</li>
                    <li>Drag edge handles to resize in one direction</li>
                    <li>Watch the map text update automatically after resize</li>
                    <li>PST element names are preserved during resize</li>
                </ul>
            </div>
        </div>
    );
};

export default PSTResizeExample;