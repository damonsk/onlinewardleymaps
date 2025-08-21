# Implementation Plan

- [ ] 1. Create MapBoundsCalculator utility class
  - Implement core bounds calculation logic for map components
  - Add methods to calculate min/max positions from component arrays
  - Include margin adjustments for labels and evolution stages
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Implement optimal viewport calculation
  - Create viewport calculation logic that determines best zoom and center position
  - Add transform matrix generation for SVG pan zoom
  - Include validation for edge cases (empty maps, single components)
  - _Requirements: 1.1, 1.4, 2.1, 2.2_

- [ ] 3. Create ViewportManager with caching
  - Implement caching mechanism to avoid recalculating viewport on every render
  - Add cache invalidation logic for when components or canvas dimensions change
  - Include performance monitoring to track calculation times
  - _Requirements: 3.1, 3.2, 4.1_

- [ ] 4. Integrate optimized sizing into UnifiedMapCanvas
  - Modify UnifiedMapCanvas to use new viewport calculation on initialization
  - Replace delayed fitSelection approach with immediate optimal sizing
  - Add fallback mechanism for when optimization fails
  - _Requirements: 1.1, 1.2, 1.3, 4.3_

- [ ] 5. Add responsive viewport adaptation
  - Implement viewport recalculation when canvas dimensions change
  - Add smooth transitions for viewport updates
  - Handle window resize events efficiently
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 6. Implement error handling and fallbacks
  - Add graceful degradation when bounds calculation fails
  - Create fallback to default dimensions for edge cases
  - Include timeout protection for calculation operations
  - _Requirements: 4.3, 4.4_

- [ ] 7. Create unit tests for core functionality
  - Write tests for MapBoundsCalculator with various component scenarios
  - Test ViewportManager caching behavior and invalidation
  - Add tests for error handling and fallback scenarios
  - _Requirements: 4.1, 4.2_

- [ ] 8. Optimize performance for large maps
  - Implement efficient algorithms for processing many components
  - Add memory optimization for viewport calculations
  - Include performance monitoring and logging
  - _Requirements: 3.1, 3.2, 3.3_
