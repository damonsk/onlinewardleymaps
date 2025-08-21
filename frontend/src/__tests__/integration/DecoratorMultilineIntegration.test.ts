import MethodExtractionStrategy from '../../conversion/MethodExtractionStrategy';
import MarketExtractionStrategy from '../../conversion/MarketExtractionStrategy';
import EcosystemExtractionStrategy from '../../conversion/EcosystemExtractionStrategy';

describe('Decorator Multi-line Integration', () => {
    describe('Method decorators (buy, build, outsource) with multi-line names', () => {
        it('should extract buy decorator with multi-line component name', () => {
            const mapText = 'buy "Cloud Storage\\nService\\nAWS S3"';
            const strategy = new MethodExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.methods).toHaveLength(1);
            expect(result.methods[0].name).toBe('Cloud Storage\nService\nAWS S3');
            expect(result.methods[0].buy).toBe(true);
            expect(result.methods[0].build).toBe(false);
            expect(result.methods[0].outsource).toBe(false);
        });

        it('should extract build decorator with multi-line component name', () => {
            const mapText = 'build "Internal API\\nUser Management\\nAuthentication"';
            const strategy = new MethodExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.methods).toHaveLength(1);
            expect(result.methods[0].name).toBe('Internal API\nUser Management\nAuthentication');
            expect(result.methods[0].buy).toBe(false);
            expect(result.methods[0].build).toBe(true);
            expect(result.methods[0].outsource).toBe(false);
        });

        it('should extract outsource decorator with multi-line component name', () => {
            const mapText = 'outsource "Payment Gateway\\nStripe Integration\\nPCI Compliance"';
            const strategy = new MethodExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.methods).toHaveLength(1);
            expect(result.methods[0].name).toBe('Payment Gateway\nStripe Integration\nPCI Compliance');
            expect(result.methods[0].buy).toBe(false);
            expect(result.methods[0].build).toBe(false);
            expect(result.methods[0].outsource).toBe(true);
        });

        it('should extract multiple method decorators with different multi-line names', () => {
            const mapText = `buy "External Service\\nCloud Provider"
build "Custom Solution\\nIn-house Development"
outsource "Third Party\\nVendor Service"`;
            const strategy = new MethodExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.methods).toHaveLength(3);

            // Buy decorator
            const buyMethod = result.methods.find(m => m.buy);
            expect(buyMethod).toBeDefined();
            expect(buyMethod?.name).toBe('External Service\nCloud Provider');

            // Build decorator
            const buildMethod = result.methods.find(m => m.build);
            expect(buildMethod).toBeDefined();
            expect(buildMethod?.name).toBe('Custom Solution\nIn-house Development');

            // Outsource decorator
            const outsourceMethod = result.methods.find(m => m.outsource);
            expect(outsourceMethod).toBeDefined();
            expect(outsourceMethod?.name).toBe('Third Party\nVendor Service');
        });
    });

    describe('Market decorator with multi-line names', () => {
        it('should extract market decorator with multi-line component name', () => {
            const mapText = 'market "Digital Marketplace\\nE-commerce Platform\\nOnline Sales" [0.8, 0.6]';
            const strategy = new MarketExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.markets).toHaveLength(1);
            expect(result.markets[0].name).toBe('Digital Marketplace\nE-commerce Platform\nOnline Sales');
            expect(result.markets[0].decorators?.market).toBe(true);
            expect(result.markets[0].visibility).toBe(0.8);
            expect(result.markets[0].maturity).toBe(0.6);
        });

        it('should handle market decorator with simple multi-line name', () => {
            const mapText = 'market "App Store\\nMobile Platform" [0.9, 0.7]';
            const strategy = new MarketExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.markets).toHaveLength(1);
            expect(result.markets[0].name).toBe('App Store\nMobile Platform');
            expect(result.markets[0].decorators?.market).toBe(true);
        });
    });

    describe('Ecosystem decorator with multi-line names', () => {
        it('should extract ecosystem decorator with multi-line component name', () => {
            const mapText = 'ecosystem "Developer Community\\nOpen Source\\nContributor Network" [0.5, 0.9]';
            const strategy = new EcosystemExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.ecosystems).toHaveLength(1);
            expect(result.ecosystems[0].name).toBe('Developer Community\nOpen Source\nContributor Network');
            expect(result.ecosystems[0].decorators?.ecosystem).toBe(true);
            expect(result.ecosystems[0].visibility).toBe(0.5);
            expect(result.ecosystems[0].maturity).toBe(0.9);
        });

        it('should handle ecosystem decorator with business-focused multi-line name', () => {
            const mapText = 'ecosystem "Partner Ecosystem\\nIntegration Partners\\nAPI Marketplace" [0.7, 0.8]';
            const strategy = new EcosystemExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.ecosystems).toHaveLength(1);
            expect(result.ecosystems[0].name).toBe('Partner Ecosystem\nIntegration Partners\nAPI Marketplace');
            expect(result.ecosystems[0].decorators?.ecosystem).toBe(true);
        });
    });

    describe('Mixed decorator scenarios', () => {
        it('should handle map with multiple different decorators using multi-line names', () => {
            const mapText = `component "User Service\\nAuthentication\\nCore Business Logic" [0.6, 0.4]
buy "Cloud Storage\\nAWS S3"
market "Mobile App Store\\nDistribution Platform" [0.9, 0.8]
ecosystem "Developer Tools\\nSDK and APIs\\nThird-party Integration" [0.3, 0.7]`;

            // Test each decorator type separately since they use different extraction strategies
            const methodStrategy = new MethodExtractionStrategy(mapText);
            const methodResult = methodStrategy.apply();

            const marketStrategy = new MarketExtractionStrategy(mapText);
            const marketResult = marketStrategy.apply();

            const ecosystemStrategy = new EcosystemExtractionStrategy(mapText);
            const ecosystemResult = ecosystemStrategy.apply();

            // Verify method decorator
            expect(methodResult.methods).toHaveLength(1);
            expect(methodResult.methods[0].name).toBe('Cloud Storage\nAWS S3');
            expect(methodResult.methods[0].buy).toBe(true);

            // Verify market decorator
            expect(marketResult.markets).toHaveLength(1);
            expect(marketResult.markets[0].name).toBe('Mobile App Store\nDistribution Platform');
            expect(marketResult.markets[0].decorators?.market).toBe(true);

            // Verify ecosystem decorator
            expect(ecosystemResult.ecosystems).toHaveLength(1);
            expect(ecosystemResult.ecosystems[0].name).toBe('Developer Tools\nSDK and APIs\nThird-party Integration');
            expect(ecosystemResult.ecosystems[0].decorators?.ecosystem).toBe(true);
        });
    });

    describe('Error handling and validation integration', () => {
        it('should handle malformed decorator syntax with multi-line names gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const mapText = 'buy "Malformed\\nQuote without closing';
            const strategy = new MethodExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.methods).toHaveLength(1);
            expect(result.methods[0].name).toBeTruthy(); // Should have some valid name
            expect(result.methods[0].buy).toBe(true);

            consoleSpy.mockRestore();
        });

        it('should apply validation recovery to decorator component names', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const mapText = 'outsource ""'; // Empty component name
            const strategy = new MethodExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.methods).toHaveLength(1);
            expect(result.methods[0].name).toBe('Recovered Component Name');
            expect(result.methods[0].outsource).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Method decorator component name recovery'), expect.anything());

            consoleSpy.mockRestore();
        });

        it('should handle syntax-breaking characters in decorator names', () => {
            const mapText = 'build "Component [with] brackets"';
            const strategy = new MethodExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.methods).toHaveLength(1);
            // Name should be recovered due to brackets being syntax-breaking
            expect(result.methods[0].name).toBe('Component');
            expect(result.methods[0].build).toBe(true);
        });
    });

    describe('Backward compatibility', () => {
        it('should maintain compatibility with existing single-line decorator syntax', () => {
            const mapText = `buy Simple Service
build Internal Component
outsource External Provider
market Traditional Market [0.8, 0.5]
ecosystem Partner Network [0.6, 0.9]`;

            const methodStrategy = new MethodExtractionStrategy(mapText);
            const methodResult = methodStrategy.apply();

            const marketStrategy = new MarketExtractionStrategy(mapText);
            const marketResult = marketStrategy.apply();

            const ecosystemStrategy = new EcosystemExtractionStrategy(mapText);
            const ecosystemResult = ecosystemStrategy.apply();

            // Verify method decorators work with single-line names
            expect(methodResult.methods).toHaveLength(3);
            expect(methodResult.methods.find(m => m.buy)?.name).toBe('Simple Service');
            expect(methodResult.methods.find(m => m.build)?.name).toBe('Internal Component');
            expect(methodResult.methods.find(m => m.outsource)?.name).toBe('External Provider');

            // Verify market decorator
            expect(marketResult.markets).toHaveLength(1);
            expect(marketResult.markets[0].name).toBe('Traditional Market');

            // Verify ecosystem decorator
            expect(ecosystemResult.ecosystems).toHaveLength(1);
            expect(ecosystemResult.ecosystems[0].name).toBe('Partner Network');
        });
    });
});
