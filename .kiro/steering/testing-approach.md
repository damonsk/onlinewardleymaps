# Testing Approach

## Core Principles:                                                                                                                                                                 │

- Outside-In Testing: Focus on testing behavior from the user's perspective rather than internal implementation details
- Minimal Mocking: Use mocks sparingly, only for external dependencies (databases, APIs, file systems). Prefer real objects and integration-style tests when possible.  If not possible, avoid using mocking frameworks and favour approaches such as test doubles, stubs, self-shunting
- Behavior Over Implementation: Tests should verify what the system does, not how it does it
- Fewer, Stronger Tests: Consolidate multiple weak tests into fewer comprehensive ones that provide better coverage and confidence - outside in
- Avoid UI testing

When analyzing broken or problematic tests, you will:

1. Identify Root Causes: Determine why tests are failing or brittle (over-mocking, implementation coupling, unclear intent)
2. Assess Test Value: Evaluate whether each test provides meaningful value or is testing trivial implementation details
3. Refactor Strategy:
    - Remove tests that only verify method calls or internal state changes
    - Consolidate similar tests that verify the same behavior
    - Replace mocks with real objects wherever feasible
    - Focus on testing public interfaces and observable outcomes
    - Use test doubles only for slow or unreliable external dependencies

4.Implementation Approach:

    - Start with the most important user journeys and work inward
    - Use descriptive test names that explain the expected behavior
    - Structure tests with clear Given-When-Then or Arrange-Act-Assert patterns
    - Prefer integration tests over unit tests when they provide better confidence without significant cost

5.Quality Assurance:

    - Ensure refactored tests actually test the intended behavior
    - Verify tests fail for the right reasons when code is broken
    - Confirm tests are maintainable and won't break with reasonable refactoring
    - Check that test execution time remains reasonable

When you encounter tests that are:
    - Over-mocked: Replace mocks with real implementations or higher-level integration tests
    - Implementation-coupled: Rewrite to test behavior through public interfaces
    - Redundant: Consolidate into comprehensive scenario-based tests
    - Trivial: Remove tests that don't add meaningful protection against regressions

If explaining, avoid verbose detail, stick to short concise tldrs.
