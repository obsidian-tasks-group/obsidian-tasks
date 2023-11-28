/**
 * @jest-environment jsdom
 */
import { getSettings, isFeatureEnabled, toggleFeature, updateSettings } from '../../src/Config/Settings';

describe('settings-usage', () => {
    it('load default settings and validate features', () => {
        const currentSettings = getSettings();

        expect(Object.entries(currentSettings.features).length).toBeGreaterThan(0);
        expect(currentSettings.features['INTERNAL_TESTING_ENABLED_BY_DEFAULT']).toBe(true);
    });

    it('returns true if feature enabled', () => {
        const currentSettings = isFeatureEnabled('INTERNAL_TESTING_ENABLED_BY_DEFAULT');

        expect(currentSettings).toBe(true);
    });

    it('toggles a feature', () => {
        const updatedFeatures = toggleFeature('INTERNAL_TESTING_ENABLED_BY_DEFAULT', false);
        expect(updatedFeatures['INTERNAL_TESTING_ENABLED_BY_DEFAULT']).toBe(false);

        const currentSettings = getSettings();
        expect(currentSettings.features['INTERNAL_TESTING_ENABLED_BY_DEFAULT']).toBe(false);
    });

    it('should add new logging options to settings', () => {
        // Arrange:
        // Simulate the user have run an earlier version of Tasks with few logging options:
        const initialLoggingOptions = {
            minLevels: {
                '': 'info',
                tasks: 'info',
            },
        };
        updateSettings({ loggingOptions: initialLoggingOptions });

        // Act:
        // getSettings() has responsibility for adding any new/missing settings:
        const loggingOptions = getSettings();

        // Assert:
        expect(loggingOptions.loggingOptions.minLevels['tasks.Query']).toBeDefined();
    });
});
