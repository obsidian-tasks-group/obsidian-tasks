/**
 * @jest-environment jsdom
 */
import { Feature } from '../../src/Config/Feature';

describe('feature-usage', () => {
    it('load current features', () => {
        const currentFeatures = Feature.values;

        expect(currentFeatures.length).toBeGreaterThan(0);
    });

    it('load current feature states', () => {
        for (const flag in Feature.settingsFlags) {
            expect(Feature.settingsFlags[flag]).not.toBeNull();
        }
    });

    it('load and validate enabled by default', () => {
        const name = 'INTERNAL_TESTING_ENABLED_BY_DEFAULT';

        expect(Feature.settingsFlags[name]).toBe(true);
        expect(Feature.fromString(name).enabledByDefault).toBe(true);
    });

    it('load and validate feature properties', () => {
        const name = 'INTERNAL_TESTING_ENABLED_BY_DEFAULT';
        const feature = Feature.fromString(name);

        expect(feature.internalName).toBe(name);
        expect(feature.index).toBe(9999);
        expect(feature.description).toBe('Description');
        expect(feature.displayName).toBe('Test Item. Used to validate the Feature Framework.');
        expect(feature.enabledByDefault).toBe(true);
        expect(feature.stable).toBe(false);
    });

    it('load and access invalid feature name', () => {
        function getFeature() {
            const name = 'INVALID_FEATURE_NAME';
            Feature.fromString(name);
        }

        expect(getFeature).toThrowError('Illegal argument passed');
        expect(getFeature).toThrowError(RangeError);
    });
});
