/**
 * Unit tests for PST type definitions
 */

import { PSTType, PSTElement, PSTCoordinates, PSTBounds, ResizeHandle } from '../../types/map/pst';

describe('PST Type Definitions', () => {
  describe('PSTType', () => {
    it('should accept valid PST types', () => {
      const pioneers: PSTType = 'pioneers';
      const settlers: PSTType = 'settlers';
      const townplanners: PSTType = 'townplanners';

      expect(pioneers).toBe('pioneers');
      expect(settlers).toBe('settlers');
      expect(townplanners).toBe('townplanners');
    });
  });

  describe('ResizeHandle', () => {
    it('should accept all valid resize handle positions', () => {
      const handles: ResizeHandle[] = [
        'top-left', 'top-center', 'top-right',
        'middle-left', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right'
      ];

      expect(handles).toHaveLength(8);
      handles.forEach(handle => {
        expect(typeof handle).toBe('string');
      });
    });
  });

  describe('PSTCoordinates', () => {
    it('should create valid PST coordinates', () => {
      const coordinates: PSTCoordinates = {
        maturity1: 0.1,
        visibility1: 0.2,
        maturity2: 0.8,
        visibility2: 0.9
      };

      expect(coordinates.maturity1).toBe(0.1);
      expect(coordinates.visibility1).toBe(0.2);
      expect(coordinates.maturity2).toBe(0.8);
      expect(coordinates.visibility2).toBe(0.9);
    });

    it('should validate coordinate ranges are within 0-1', () => {
      const coordinates: PSTCoordinates = {
        maturity1: 0,
        visibility1: 0,
        maturity2: 1,
        visibility2: 1
      };

      expect(coordinates.maturity1).toBeGreaterThanOrEqual(0);
      expect(coordinates.maturity1).toBeLessThanOrEqual(1);
      expect(coordinates.visibility1).toBeGreaterThanOrEqual(0);
      expect(coordinates.visibility1).toBeLessThanOrEqual(1);
      expect(coordinates.maturity2).toBeGreaterThanOrEqual(0);
      expect(coordinates.maturity2).toBeLessThanOrEqual(1);
      expect(coordinates.visibility2).toBeGreaterThanOrEqual(0);
      expect(coordinates.visibility2).toBeLessThanOrEqual(1);
    });
  });

  describe('PSTBounds', () => {
    it('should create valid PST bounds', () => {
      const bounds: PSTBounds = {
        x: 100,
        y: 200,
        width: 150,
        height: 80
      };

      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(200);
      expect(bounds.width).toBe(150);
      expect(bounds.height).toBe(80);
    });

    it('should handle zero and negative values', () => {
      const bounds: PSTBounds = {
        x: 0,
        y: -10,
        width: 50,
        height: 30
      };

      expect(bounds.x).toBe(0);
      expect(bounds.y).toBe(-10);
      expect(bounds.width).toBe(50);
      expect(bounds.height).toBe(30);
    });
  });

  describe('PSTElement', () => {
    it('should create valid PST element', () => {
      const element: PSTElement = {
        id: 'pst-1',
        type: 'pioneers',
        coordinates: {
          maturity1: 0.1,
          visibility1: 0.2,
          maturity2: 0.3,
          visibility2: 0.4
        },
        line: 5,
        name: 'Test PST'
      };

      expect(element.id).toBe('pst-1');
      expect(element.type).toBe('pioneers');
      expect(element.coordinates.maturity1).toBe(0.1);
      expect(element.line).toBe(5);
      expect(element.name).toBe('Test PST');
    });

    it('should create PST element without optional name', () => {
      const element: PSTElement = {
        id: 'pst-2',
        type: 'settlers',
        coordinates: {
          maturity1: 0.5,
          visibility1: 0.6,
          maturity2: 0.7,
          visibility2: 0.8
        },
        line: 10
      };

      expect(element.id).toBe('pst-2');
      expect(element.type).toBe('settlers');
      expect(element.name).toBeUndefined();
    });

    it('should support all PST types', () => {
      const pioneers: PSTElement = {
        id: 'p1',
        type: 'pioneers',
        coordinates: { maturity1: 0, visibility1: 0, maturity2: 0.2, visibility2: 0.2 },
        line: 1
      };

      const settlers: PSTElement = {
        id: 's1',
        type: 'settlers',
        coordinates: { maturity1: 0.3, visibility1: 0.3, maturity2: 0.5, visibility2: 0.5 },
        line: 2
      };

      const townplanners: PSTElement = {
        id: 't1',
        type: 'townplanners',
        coordinates: { maturity1: 0.6, visibility1: 0.6, maturity2: 0.8, visibility2: 0.8 },
        line: 3
      };

      expect(pioneers.type).toBe('pioneers');
      expect(settlers.type).toBe('settlers');
      expect(townplanners.type).toBe('townplanners');
    });
  });
});