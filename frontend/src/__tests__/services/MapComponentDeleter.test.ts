/**
 * Tests for MapComponentDeleter service
 */

import {MapComponentDeleter} from '../../services/MapComponentDeleter';
import {PSTElement} from '../../types/map/pst';

describe('MapComponentDeleter', () => {
    let deleter: MapComponentDeleter;

    beforeEach(() => {
        deleter = new MapComponentDeleter();
    });

    describe('deleteComponent', () => {
        it('should delete a simple component from map text', () => {
            const mapText = `title Test Map
component User [0.9, 0.1]
component System [0.5, 0.5]
component Database [0.2, 0.8]`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 'component-system-2',
                componentType: 'component',
            });

            expect(result.updatedMapText).toBe(`title Test Map
component User [0.9, 0.1]
component Database [0.2, 0.8]`);
            expect(result.deletedComponent.type).toBe('component');
            expect(result.deletedComponent.line).toBe(2);
        });

        it('should delete a PST component from map text', () => {
            const mapText = `title Test Map
pioneers [0.9, 0.1, 0.8, 0.3] Innovation Team
component System [0.5, 0.5]`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 'pst-pioneers-1',
                componentType: 'pst',
            });

            expect(result.updatedMapText).toBe(`title Test Map
component System [0.5, 0.5]`);
            expect(result.deletedComponent.type).toBe('pst');
            expect(result.deletedComponent.line).toBe(1);
        });

        it('should handle empty lines correctly', () => {
            const mapText = `title Test Map

component User [0.9, 0.1]

component System [0.5, 0.5]`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 'component-user-2',
                componentType: 'component',
            });

            expect(result.updatedMapText).toBe(`title Test Map


component System [0.5, 0.5]`);
        });

        it('should throw error for non-existent component', () => {
            const mapText = `title Test Map
component User [0.9, 0.1]`;

            expect(() => {
                deleter.deleteComponent({
                    mapText,
                    componentId: 'non-existent-component',
                });
            }).toThrow('Component with ID "non-existent-component" not found in map text');
        });

        it('should throw error for invalid map text', () => {
            expect(() => {
                deleter.deleteComponent({
                    mapText: '',
                    componentId: 'test-component',
                });
            }).toThrow('Map text must be a non-empty string');
        });

        it('should throw error for invalid component ID', () => {
            expect(() => {
                deleter.deleteComponent({
                    mapText: 'component Test [0.5, 0.5]',
                    componentId: '',
                });
            }).toThrow('Component ID must be a non-empty string');
        });
    });

    describe('canDelete', () => {
        it('should return true for valid component IDs', () => {
            expect(deleter.canDelete('component-test-1')).toBe(true);
            expect(deleter.canDelete('pst-pioneers-0')).toBe(true);
        });

        it('should return false for invalid component IDs', () => {
            expect(deleter.canDelete('')).toBe(false);
            expect(deleter.canDelete(null as any)).toBe(false);
            expect(deleter.canDelete(undefined as any)).toBe(false);
        });
    });

    describe('deletePSTComponent', () => {
        it('should delete PST component using PST element', () => {
            const mapText = `title Test Map
pioneers [0.9, 0.1, 0.8, 0.3] Innovation Team
component System [0.5, 0.5]`;

            const pstElement: PSTElement = {
                id: 'pst-pioneers-1',
                type: 'pioneers',
                coordinates: {
                    maturity1: 0.1,
                    visibility1: 0.9,
                    maturity2: 0.3,
                    visibility2: 0.8,
                },
                line: 1,
                name: 'Innovation Team',
            };

            const result = deleter.deletePSTComponent(mapText, pstElement);

            expect(result).toBe(`title Test Map
component System [0.5, 0.5]`);
        });

        it('should throw error for non-existent PST element', () => {
            const mapText = `title Test Map
component System [0.5, 0.5]`;

            const pstElement: PSTElement = {
                id: 'pst-pioneers-1',
                type: 'pioneers',
                coordinates: {
                    maturity1: 0.1,
                    visibility1: 0.9,
                    maturity2: 0.3,
                    visibility2: 0.8,
                },
                line: 1,
                name: 'Innovation Team',
            };

            expect(() => {
                deleter.deletePSTComponent(mapText, pstElement);
            }).toThrow('PST element not found in map text');
        });
    });

    describe('validateDeletionParams', () => {
        it('should validate correct parameters', () => {
            const result = deleter.validateDeletionParams({
                mapText: 'component Test [0.5, 0.5]',
                componentId: 'test-component',
                componentType: 'component',
            });

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid map text', () => {
            const result = deleter.validateDeletionParams({
                mapText: '',
                componentId: 'test-component',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Map text must be a non-empty string');
        });

        it('should detect invalid component ID', () => {
            const result = deleter.validateDeletionParams({
                mapText: 'component Test [0.5, 0.5]',
                componentId: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Component ID must be a non-empty string');
        });

        it('should detect invalid component type', () => {
            const result = deleter.validateDeletionParams({
                mapText: 'component Test [0.5, 0.5]',
                componentId: 'test-component',
                componentType: 'invalid-type' as any,
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid component type specified');
        });
    });
});
