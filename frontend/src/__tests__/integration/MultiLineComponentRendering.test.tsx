import {render, screen} from '@testing-library/react';
import ComponentTextSymbol from '../../components/symbols/ComponentTextSymbol';
import {TextTheme} from '../../constants/mapstyles';

describe('Multi-line Component Rendering Integration', () => {
    const mockTextTheme: TextTheme = {
        textColor: '#000000',
        fontSize: '14px',
        fontWeight: 'normal',
        evolvedTextColor: '#666666',
    };

    describe('end-to-end multi-line component name rendering', () => {
        it('should render multi-line component names with proper positioning and styling', () => {
            const multiLineComponentName = 'User Authentication\nService\n(OAuth 2.0)';

            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-multiline-component"
                        text={multiLineComponentName}
                        textTheme={mockTextTheme}
                        x="100"
                        y="50"
                        className="component-label"
                    />
                </svg>,
            );

            const textElement = screen.getByTestId('test-multiline-component');
            expect(textElement).toBeInTheDocument();

            // Verify basic attributes
            expect(textElement).toHaveAttribute('x', '100');
            expect(textElement).toHaveAttribute('y', '50');
            expect(textElement).toHaveClass('component-label');
            expect(textElement).toHaveAttribute('font-size', '14px');
            expect(textElement).toHaveAttribute('font-weight', 'normal');
            expect(textElement).toHaveAttribute('fill', '#000000');

            // Verify multi-line rendering
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);

            // Check each line content and positioning
            expect(tspans[0]).toHaveTextContent('User Authentication');
            expect(tspans[0]).toHaveAttribute('x', '0');
            expect(tspans[0]).toHaveAttribute('dy', '0');
            expect(tspans[0]).toHaveAttribute('text-anchor', 'middle');

            expect(tspans[1]).toHaveTextContent('Service');
            expect(tspans[1]).toHaveAttribute('x', '0');
            expect(tspans[1]).toHaveAttribute('dy', '15');
            expect(tspans[1]).toHaveAttribute('text-anchor', 'middle');

            expect(tspans[2]).toHaveTextContent('(OAuth 2.0)');
            expect(tspans[2]).toHaveAttribute('x', '0');
            expect(tspans[2]).toHaveAttribute('dy', '15');
            expect(tspans[2]).toHaveAttribute('text-anchor', 'middle');

            // Verify no transform is applied (no word wrapping)
            expect(textElement.getAttribute('transform')).toBe('');
        });

        it('should handle evolved multi-line component names correctly', () => {
            const multiLineComponentName = 'Legacy System\nMainframe\n(COBOL)';

            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-evolved-multiline"
                        text={multiLineComponentName}
                        textTheme={mockTextTheme}
                        evolved={true}
                    />
                </svg>,
            );

            const textElement = screen.getByTestId('test-evolved-multiline');
            expect(textElement).toBeInTheDocument();

            // Should use regular text color for evolved components (as per current implementation)
            expect(textElement).toHaveAttribute('fill', '#000000');

            // Verify multi-line rendering still works
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            expect(tspans[0]).toHaveTextContent('Legacy System');
            expect(tspans[1]).toHaveTextContent('Mainframe');
            expect(tspans[2]).toHaveTextContent('(COBOL)');
        });

        it('should handle custom text anchor for multi-line component names', () => {
            const multiLineComponentName = 'API Gateway\nNginx\nLoad Balancer';

            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-custom-anchor"
                        text={multiLineComponentName}
                        textTheme={mockTextTheme}
                        textAnchor="start"
                    />
                </svg>,
            );

            const textElement = screen.getByTestId('test-custom-anchor');
            expect(textElement).toBeInTheDocument();
            expect(textElement).toHaveAttribute('text-anchor', 'start');

            // All tspans should use the custom anchor
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            tspans.forEach(tspan => {
                expect(tspan).toHaveAttribute('text-anchor', 'start');
            });
        });

        it('should handle empty lines in multi-line component names', () => {
            const multiLineComponentName = 'Database\n\nPostgreSQL';

            render(
                <svg>
                    <ComponentTextSymbol id="test-empty-lines" text={multiLineComponentName} textTheme={mockTextTheme} />
                </svg>,
            );

            const textElement = screen.getByTestId('test-empty-lines');
            expect(textElement).toBeInTheDocument();

            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);

            expect(tspans[0]).toHaveTextContent('Database');
            expect(tspans[1]).toBeInTheDocument(); // Empty line
            expect(tspans[2]).toHaveTextContent('PostgreSQL');
        });

        it('should maintain backward compatibility with single-line component names', () => {
            const singleLineComponentName = 'Component'; // Short name (< 14 chars)

            render(
                <svg>
                    <ComponentTextSymbol id="test-single-line" text={singleLineComponentName} textTheme={mockTextTheme} />
                </svg>,
            );

            const textElement = screen.getByTestId('test-single-line');
            expect(textElement).toBeInTheDocument();

            // Should render as simple text content, not tspans
            expect(textElement.textContent).toBe('Component');
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(0);

            // No transform should be applied for short single-line text
            expect(textElement.getAttribute('transform')).toBe('');
        });

        it('should NOT apply word wrapping to long single-line component names', () => {
            const longSingleLineComponentName = 'This is a very long single line component name that should NOT be wrapped';

            render(
                <svg>
                    <ComponentTextSymbol id="test-long-single-line" text={longSingleLineComponentName} textTheme={mockTextTheme} />
                </svg>,
            );

            const textElement = screen.getByTestId('test-long-single-line');
            expect(textElement).toBeInTheDocument();

            // Should NOT apply transform for word wrapping
            expect(textElement.getAttribute('transform')).toBe('');

            // Should render as single text content, no tspans
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(0);
        });
    });

    describe('real-world component name scenarios', () => {
        it('should handle technical component names with version info', () => {
            const technicalComponentName = 'Redis Cache\nv6.2.7\n(In-Memory Store)';

            render(
                <svg>
                    <ComponentTextSymbol id="test-technical" text={technicalComponentName} textTheme={mockTextTheme} />
                </svg>,
            );

            const textElement = screen.getByTestId('test-technical');
            expect(textElement).toBeInTheDocument();

            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            expect(tspans[0]).toHaveTextContent('Redis Cache');
            expect(tspans[1]).toHaveTextContent('v6.2.7');
            expect(tspans[2]).toHaveTextContent('(In-Memory Store)');
        });

        it('should handle business process component names', () => {
            const businessProcessName = 'Customer Onboarding\nProcess\n(Automated)';

            render(
                <svg>
                    <ComponentTextSymbol id="test-business-process" text={businessProcessName} textTheme={mockTextTheme} />
                </svg>,
            );

            const textElement = screen.getByTestId('test-business-process');
            expect(textElement).toBeInTheDocument();

            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            expect(tspans[0]).toHaveTextContent('Customer Onboarding');
            expect(tspans[1]).toHaveTextContent('Process');
            expect(tspans[2]).toHaveTextContent('(Automated)');
        });

        it('should handle component names with special characters and formatting', () => {
            const specialCharComponentName = 'API Gateway\n(HTTP/HTTPS)\n& Load Balancer';

            render(
                <svg>
                    <ComponentTextSymbol id="test-special-chars" text={specialCharComponentName} textTheme={mockTextTheme} />
                </svg>,
            );

            const textElement = screen.getByTestId('test-special-chars');
            expect(textElement).toBeInTheDocument();

            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            expect(tspans[0]).toHaveTextContent('API Gateway');
            expect(tspans[1]).toHaveTextContent('(HTTP/HTTPS)');
            expect(tspans[2]).toHaveTextContent('& Load Balancer');
        });
    });
});
