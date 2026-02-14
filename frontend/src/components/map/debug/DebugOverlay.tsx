import React from 'react';

interface DebugPosition {
    x: number;
    y: number;
    correctedX?: number;
    correctedY?: number;
}

interface DebugOverlayProps {
    enabled: boolean;
    lastClickPosition: DebugPosition | null;
}

export function DebugOverlay({enabled, lastClickPosition}: DebugOverlayProps) {
    if (!enabled || !lastClickPosition) {
        return null;
    }

    return (
        <g data-testid="debug-overlay">
            {/* Original click position */}
            <circle cx={lastClickPosition.x} cy={lastClickPosition.y} r="5" fill="red" fillOpacity="0.7" />
            <circle cx={lastClickPosition.x} cy={lastClickPosition.y} r="10" stroke="red" strokeWidth="2" fill="none" strokeOpacity="0.7" />
            <line
                x1={lastClickPosition.x - 20}
                y1={lastClickPosition.y}
                x2={lastClickPosition.x + 20}
                y2={lastClickPosition.y}
                stroke="red"
                strokeWidth="2"
                strokeOpacity="0.7"
            />
            <line
                x1={lastClickPosition.x}
                y1={lastClickPosition.y - 20}
                x2={lastClickPosition.x}
                y2={lastClickPosition.y + 20}
                stroke="red"
                strokeWidth="2"
                strokeOpacity="0.7"
            />
            <text x={lastClickPosition.x + 15} y={lastClickPosition.y} fill="red" fontSize="12px">
                Cursor: ({lastClickPosition.x.toFixed(0)}, {lastClickPosition.y.toFixed(0)})
            </text>

            {/* Corrected position */}
            {lastClickPosition.correctedX && lastClickPosition.correctedY && (
                <>
                    <circle cx={lastClickPosition.correctedX} cy={lastClickPosition.correctedY} r="5" fill="blue" fillOpacity="0.7" />
                    <circle
                        cx={lastClickPosition.correctedX}
                        cy={lastClickPosition.correctedY}
                        r="10"
                        stroke="blue"
                        strokeWidth="2"
                        fill="none"
                        strokeOpacity="0.7"
                    />
                    <line
                        x1={lastClickPosition.correctedX - 20}
                        y1={lastClickPosition.correctedY}
                        x2={lastClickPosition.correctedX + 20}
                        y2={lastClickPosition.correctedY}
                        stroke="blue"
                        strokeWidth="2"
                        strokeOpacity="0.7"
                    />
                    <line
                        x1={lastClickPosition.correctedX}
                        y1={lastClickPosition.correctedY - 20}
                        x2={lastClickPosition.correctedX}
                        y2={lastClickPosition.correctedY + 20}
                        stroke="blue"
                        strokeWidth="2"
                        strokeOpacity="0.7"
                    />
                    <text x={lastClickPosition.correctedX + 15} y={lastClickPosition.correctedY + 20} fill="blue" fontSize="12px">
                        Component: ({lastClickPosition.correctedX.toFixed(0)}, {lastClickPosition.correctedY.toFixed(0)})
                    </text>

                    {/* Line connecting original and corrected positions */}
                    <line
                        x1={lastClickPosition.x}
                        y1={lastClickPosition.y}
                        x2={lastClickPosition.correctedX}
                        y2={lastClickPosition.correctedY}
                        stroke="purple"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        strokeOpacity="0.7"
                    />
                </>
            )}
        </g>
    );
}
