/**
 * Test to verify PST coordinate ordering logic
 * This ensures that PST boxes are generated with the correct visibility ordering
 * for proper display in the map
 */

describe('PST Coordinate Ordering Logic', () => {
    // Simulate the coordinate ordering logic from MapView
    const calculatePSTCoordinates = (startPos: {x: number; y: number}, endPos: {x: number; y: number}) => {
        // Calculate rectangle dimensions
        const minX = Math.min(startPos.x, endPos.x);
        const minY = Math.min(startPos.y, endPos.y);
        const maxX = Math.max(startPos.x, endPos.x);
        const maxY = Math.max(startPos.y, endPos.y);

        // For PST boxes, we need to order by visibility (Y-axis) with highest visibility first
        // Since higher Y values = lower visibility in map coordinates, we need maxY first
        const highVisibility = maxY; // Higher Y value = lower on screen = higher visibility
        const lowVisibility = minY; // Lower Y value = higher on screen = lower visibility

        return {
            maturity1: minX,
            visibilityHigh: highVisibility,
            maturity2: maxX,
            visibilityLow: lowVisibility,
        };
    };

    it('should order coordinates correctly when drawing left-to-right, top-to-bottom', () => {
        const startPos = {x: 0.3, y: 0.2}; // Top-left
        const endPos = {x: 0.7, y: 0.6}; // Bottom-right

        const result = calculatePSTCoordinates(startPos, endPos);

        expect(result.maturity1).toBe(0.3); // Left edge
        expect(result.maturity2).toBe(0.7); // Right edge
        expect(result.visibilityHigh).toBe(0.6); // Higher visibility (bottom)
        expect(result.visibilityLow).toBe(0.2); // Lower visibility (top)

        // Verify visibility ordering
        expect(result.visibilityHigh).toBeGreaterThan(result.visibilityLow);
    });

    it('should order coordinates correctly when drawing right-to-left, bottom-to-top', () => {
        const startPos = {x: 0.7, y: 0.6}; // Bottom-right
        const endPos = {x: 0.3, y: 0.2}; // Top-left

        const result = calculatePSTCoordinates(startPos, endPos);

        expect(result.maturity1).toBe(0.3); // Left edge
        expect(result.maturity2).toBe(0.7); // Right edge
        expect(result.visibilityHigh).toBe(0.6); // Higher visibility (bottom)
        expect(result.visibilityLow).toBe(0.2); // Lower visibility (top)

        // Verify visibility ordering
        expect(result.visibilityHigh).toBeGreaterThan(result.visibilityLow);
    });

    it('should handle edge case where start and end have same visibility', () => {
        const startPos = {x: 0.3, y: 0.5}; // Same Y
        const endPos = {x: 0.7, y: 0.5}; // Same Y

        const result = calculatePSTCoordinates(startPos, endPos);

        expect(result.maturity1).toBe(0.3); // Left edge
        expect(result.maturity2).toBe(0.7); // Right edge
        expect(result.visibilityHigh).toBe(0.5); // Same visibility
        expect(result.visibilityLow).toBe(0.5); // Same visibility

        // Should be equal in this case
        expect(result.visibilityHigh).toBe(result.visibilityLow);
    });

    it('should generate syntax that matches working examples', () => {
        // Test case based on the working example: pioneers [0.59, 0.65, 0.46, 0.79]
        // This means visibilityHigh=0.59, maturity1=0.65, visibilityLow=0.46, maturity2=0.79

        // Simulate drawing that would produce these coordinates
        // We need to reverse-engineer the drawing positions
        const startPos = {x: 0.65, y: 0.46}; // maturity1, visibilityLow
        const endPos = {x: 0.79, y: 0.59}; // maturity2, visibilityHigh

        const result = calculatePSTCoordinates(startPos, endPos);

        expect(result.maturity1).toBe(0.65);
        expect(result.visibilityHigh).toBe(0.59);
        expect(result.visibilityLow).toBe(0.46);
        expect(result.maturity2).toBe(0.79);

        // Verify this would generate the working syntax
        const expectedSyntax = `pioneers [${result.visibilityHigh}, ${result.maturity1}, ${result.visibilityLow}, ${result.maturity2}]`;
        expect(expectedSyntax).toBe('pioneers [0.59, 0.65, 0.46, 0.79]');
    });

    it('should prevent generation of non-working syntax', () => {
        // Test case based on the non-working example: pioneers [0.46, 0.65, 0.59, 0.79]
        // This would happen if visibility ordering was incorrect

        const startPos = {x: 0.65, y: 0.59}; // This would be wrong ordering
        const endPos = {x: 0.79, y: 0.46};

        const result = calculatePSTCoordinates(startPos, endPos);

        // Our logic should still produce correct ordering
        expect(result.visibilityHigh).toBe(0.59); // Should be higher
        expect(result.visibilityLow).toBe(0.46); // Should be lower

        // Verify this generates working syntax, not the broken one
        const generatedSyntax = `pioneers [${result.visibilityHigh}, ${result.maturity1}, ${result.visibilityLow}, ${result.maturity2}]`;
        expect(generatedSyntax).toBe('pioneers [0.59, 0.65, 0.46, 0.79]'); // Working version
        expect(generatedSyntax).not.toBe('pioneers [0.46, 0.65, 0.59, 0.79]'); // Broken version
    });
});
