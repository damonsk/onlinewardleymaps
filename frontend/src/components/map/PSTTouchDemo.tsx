import React, {useState} from 'react';
import {PSTElement, PSTBounds} from '../../types/map/pst';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import PSTBox from './PSTBox';

// Demo component to test touch functionality
const PSTTouchDemo: React.FC = () => {
    const [hoveredElement, setHoveredElement] = useState<PSTElement | null>(null);
    const [resizingElement, setResizingElement] = useState<PSTElement | null>(null);

    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const mockMapStyleDefs: MapTheme = {
        className: 'wardley',
        component: {
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 1,
        },
        attitudes: {
            pioneers: {
                fill: '#FF6B6B',
                stroke: '#FF6B6B',
                fillOpacity: 0.6,
                strokeOpacity: 0.8,
            },
            settlers: {
                fill: '#4ECDC4',
                stroke: '#4ECDC4',
                fillOpacity: 0.6,
                strokeOpacity: 0.8,
            },
            townplanners: {
                fill: '#45B7D1',
                stroke: '#45B7D1',
                fillOpacity: 0.6,
                strokeOpacity: 0.8,
            },
        },
        annotations: {
            fill: '#eeeeee',
            stroke: '#999999',
            strokeWidth: 1,
        },
        links: {
            stroke: '#333333',
            strokeWidth: 1,
        },
        text: {
            fill: '#000000',
            fontSize: 12,
        },
    };

    const mockPSTElement: PSTElement = {
        id: 'demo-pst-1',
        type: 'pioneers',
        coordinates: {
            maturity1: 0.2,
            visibility1: 0.8,
            maturity2: 0.5,
            visibility2: 0.6,
        },
        line: 1,
        name: 'Touch Demo PST',
    };

    const handleResizeStart = (element: PSTElement, handle: any, startPosition: any) => {
        console.log('Touch resize start:', {element: element.id, handle, startPosition});
        setResizingElement(element);
    };

    const handleResizeEnd = (element: PSTElement, newCoordinates: any) => {
        console.log('Touch resize end:', {element: element.id, newCoordinates});
        setResizingElement(null);
    };

    const handleHover = (element: PSTElement | null) => {
        console.log('Touch hover:', element?.id || 'none');
        setHoveredElement(element);
    };

    const handleDragStart = (element: PSTElement, startPosition: any) => {
        console.log('Touch drag start:', {element: element.id, startPosition});
    };

    const handleDragEnd = (element: PSTElement) => {
        console.log('Touch drag end:', element.id);
    };

    return (
        <div style={{padding: '20px'}}>
            <h2>PST Touch Demo</h2>
            <p>
                Touch device detected: {('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'Yes' : 'No'}
            </p>
            <p>
                Hovered element: {hoveredElement?.id || 'None'}
            </p>
            <p>
                Resizing element: {resizingElement?.id || 'None'}
            </p>
            <p>
                Touch device: {('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'Yes' : 'No'}
            </p>
            
            <svg width="800" height="600" style={{border: '1px solid #ccc', background: '#f9f9f9'}}>
                <PSTBox
                    pstElement={mockPSTElement}
                    mapDimensions={mockMapDimensions}
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                    isHovered={hoveredElement?.id === mockPSTElement.id}
                    isResizing={resizingElement?.id === mockPSTElement.id}
                    onResizeStart={handleResizeStart}
                    onResizeEnd={handleResizeEnd}
                    onHover={handleHover}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    mutateMapText={() => {}}
                    mapText=""
                />
            </svg>
            
            <div style={{marginTop: '20px'}}>
                <h3>Instructions:</h3>
                <ul>
                    <li><strong>Touch devices:</strong> 
                        <ul>
                            <li>First tap: Select PST box and show resize handles (blue outline)</li>
                            <li>Second tap: Start drag operation to move the box</li>
                            <li>Touch resize handles: Resize the box</li>
                            <li>Tap outside: Deselect and hide handles</li>
                            <li>Handles auto-hide after 5 seconds</li>
                        </ul>
                    </li>
                    <li><strong>Mouse devices:</strong> Hover to show handles, drag to resize/move</li>
                    <li>Check the console for interaction logs</li>
                </ul>
            </div>
        </div>
    );
};

export default PSTTouchDemo;