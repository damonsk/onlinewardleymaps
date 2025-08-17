/**
 * Unit tests for PST configuration constants
 */

import {
    DEFAULT_RESIZE_CONSTRAINTS,
    PST_CONFIG,
    PST_EDGE_MARGIN,
    RESIZE_HANDLE_SIZE,
    RESIZE_PREVIEW_OPACITY,
} from '../../constants/pstConfig';
import {PSTType} from '../../types/map/pst';

describe('PST Configuration Constants', () => {
    describe('PST_CONFIG', () => {
        it('should contain configuration for all PST types', () => {
            const expectedTypes: PSTType[] = ['pioneers', 'settlers', 'townplanners'];

            expectedTypes.forEach(type => {
                expect(PST_CONFIG[type]).toBeDefined();
            });
        });

        it('should have valid pioneers configuration', () => {
            const pioneersConfig = PST_CONFIG.pioneers;
            expect(pioneersConfig.label).toBe('Pioneers');
            expect(pioneersConfig.minWidth).toBe(50);
            expect(pioneersConfig.minHeight).toBe(30);
        });

        it('should have valid settlers configuration', () => {
            const settlersConfig = PST_CONFIG.settlers;
            expect(settlersConfig.label).toBe('Settlers');
            expect(settlersConfig.minWidth).toBe(50);
            expect(settlersConfig.minHeight).toBe(30);
        });

        it('should have valid townplanners configuration', () => {
            const townplannersConfig = PST_CONFIG.townplanners;
            expect(townplannersConfig.label).toBe('Town Planners');
            expect(townplannersConfig.minWidth).toBe(50);
            expect(townplannersConfig.minHeight).toBe(30);
        });

        it('should have consistent minimum dimensions across all types', () => {
            const types: PSTType[] = ['pioneers', 'settlers', 'townplanners'];

            types.forEach(type => {
                expect(PST_CONFIG[type].minWidth).toBe(50);
                expect(PST_CONFIG[type].minHeight).toBe(30);
            });
        });

        it('should have unique colors for each PST type', () => {
            const colors = Object.values(PST_CONFIG).map(config => config.color);
            const uniqueColors = new Set(colors);

            expect(uniqueColors.size).toBe(colors.length);
        });

        it('should have valid hex color format', () => {
            const hexColorRegex = /^#[0-9A-F]{6}$/i;

            Object.values(PST_CONFIG).forEach(config => {
                expect(config.color).toMatch(hexColorRegex);
            });
        });
    });

    describe('DEFAULT_RESIZE_CONSTRAINTS', () => {
        it('should have valid default resize constraints', () => {
            expect(DEFAULT_RESIZE_CONSTRAINTS.minWidth).toBe(50);
            expect(DEFAULT_RESIZE_CONSTRAINTS.minHeight).toBe(30);
            expect(DEFAULT_RESIZE_CONSTRAINTS.maxWidth).toBe(800);
            expect(DEFAULT_RESIZE_CONSTRAINTS.maxHeight).toBe(600);
            expect(DEFAULT_RESIZE_CONSTRAINTS.snapToGrid).toBe(false);
            expect(DEFAULT_RESIZE_CONSTRAINTS.maintainAspectRatio).toBe(false);
        });

        it('should have minimum dimensions that match PST config', () => {
            expect(DEFAULT_RESIZE_CONSTRAINTS.minWidth).toBe(PST_CONFIG.pioneers.minWidth);
            expect(DEFAULT_RESIZE_CONSTRAINTS.minHeight).toBe(PST_CONFIG.pioneers.minHeight);
        });

        it('should have logical constraint relationships', () => {
            expect(DEFAULT_RESIZE_CONSTRAINTS.maxWidth).toBeGreaterThan(DEFAULT_RESIZE_CONSTRAINTS.minWidth);
            expect(DEFAULT_RESIZE_CONSTRAINTS.maxHeight).toBeGreaterThan(DEFAULT_RESIZE_CONSTRAINTS.minHeight);
        });
    });

    describe('RESIZE_HANDLE_SIZE', () => {
        it('should be a positive number', () => {
            expect(RESIZE_HANDLE_SIZE).toBe(8);
            expect(RESIZE_HANDLE_SIZE).toBeGreaterThan(0);
        });

        it('should be a reasonable size for interaction', () => {
            expect(RESIZE_HANDLE_SIZE).toBeGreaterThanOrEqual(6);
            expect(RESIZE_HANDLE_SIZE).toBeLessThanOrEqual(12);
        });
    });

    describe('PST_EDGE_MARGIN', () => {
        it('should be a positive number', () => {
            expect(PST_EDGE_MARGIN).toBe(10);
            expect(PST_EDGE_MARGIN).toBeGreaterThan(0);
        });

        it('should be a reasonable margin size', () => {
            expect(PST_EDGE_MARGIN).toBeGreaterThanOrEqual(5);
            expect(PST_EDGE_MARGIN).toBeLessThanOrEqual(20);
        });
    });

    describe('RESIZE_PREVIEW_OPACITY', () => {
        it('should be a valid opacity value', () => {
            expect(RESIZE_PREVIEW_OPACITY).toBe(0.5);
            expect(RESIZE_PREVIEW_OPACITY).toBeGreaterThan(0);
            expect(RESIZE_PREVIEW_OPACITY).toBeLessThan(1);
        });

        it('should provide good visual feedback', () => {
            // Opacity should be visible but not too opaque
            expect(RESIZE_PREVIEW_OPACITY).toBeGreaterThanOrEqual(0.3);
            expect(RESIZE_PREVIEW_OPACITY).toBeLessThanOrEqual(0.7);
        });
    });

    describe('Configuration Integration', () => {
        it('should have consistent minimum sizes between PST_CONFIG and DEFAULT_RESIZE_CONSTRAINTS', () => {
            Object.values(PST_CONFIG).forEach(config => {
                expect(config.minWidth).toBe(DEFAULT_RESIZE_CONSTRAINTS.minWidth);
                expect(config.minHeight).toBe(DEFAULT_RESIZE_CONSTRAINTS.minHeight);
            });
        });

        it('should have handle size smaller than minimum PST dimensions', () => {
            expect(RESIZE_HANDLE_SIZE).toBeLessThan(DEFAULT_RESIZE_CONSTRAINTS.minWidth);
            expect(RESIZE_HANDLE_SIZE).toBeLessThan(DEFAULT_RESIZE_CONSTRAINTS.minHeight);
        });

        it('should have edge margin smaller than minimum PST dimensions', () => {
            expect(PST_EDGE_MARGIN).toBeLessThan(DEFAULT_RESIZE_CONSTRAINTS.minWidth);
            expect(PST_EDGE_MARGIN).toBeLessThan(DEFAULT_RESIZE_CONSTRAINTS.minHeight);
        });
    });
});
