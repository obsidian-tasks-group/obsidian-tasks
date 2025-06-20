/**
 * @jest-environment jsdom
 */
import { getSettings, isFeatureEnabled, resetSettings, toggleFeature, updateSettings } from '../../src/Config/Settings';
import { defaultPresets } from '../../src/Query/Presets/Presets';

beforeEach(() => {
    resetSettings();
});

afterEach(() => {
    resetSettings();
});

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

describe('resetSettings behaviour', () => {
    it('should reset a setting to default values', () => {
        expect(getSettings().setCancelledDate).toEqual(true);

        updateSettings({ setCancelledDate: false });
        expect(getSettings().setCancelledDate).toEqual(false);

        resetSettings();
        expect(getSettings().setCancelledDate).toEqual(true);
    });

    it('should completely remove properties not in defaultSettings', () => {
        // Arrange: Add an extra property that isn't in defaultSettings
        updateSettings({
            extraProperty: 'should be removed',
        } as any);

        // Verify the extra property exists
        const settingsBeforeReset = getSettings();
        expect((settingsBeforeReset as any).extraProperty).toBe('should be removed');

        // Act: Reset settings
        const resetResult = resetSettings();

        // Assert: Extra property should be completely gone
        expect((resetResult as any).extraProperty).toBeUndefined();
    });
});

describe('settings migration', () => {
    it('should migrate "includes" to "presets" when loading old settings', () => {
        // Arrange: Create settings with old 'includes' property
        const oldSettings = {
            includes: {
                'my-preset': 'some query value',
                'another-preset': 'another query',
            },
            globalQuery: 'test query',
        };

        // Act: Update settings with the old structure
        updateSettings(oldSettings);
        const currentSettings = getSettings();

        // Assert: Verify migration happened correctly
        expect(currentSettings.presets).toEqual({
            'my-preset': 'some query value',
            'another-preset': 'another query',
        });
        expect((currentSettings as any).includes).toBeUndefined();
        expect(currentSettings.globalQuery).toBe('test query');
    });

    it('should not migrate when "presets" already exists', () => {
        // Arrange: Settings with both old and new properties
        const settingsWithBothProperties = {
            includes: {
                'old-preset': 'old value',
            },
            presets: {
                'new-preset': 'new value',
            },
        };

        // Act
        updateSettings(settingsWithBothProperties);
        const currentSettings = getSettings();

        // Assert: Should keep the new "presets" and ignore "includes"
        expect(currentSettings.presets).toEqual({
            'new-preset': 'new value',
        });
        expect(currentSettings.presets).not.toEqual({
            'old-preset': 'old value',
        });
    });

    it('should handle empty includes migration', () => {
        // Arrange: Settings with empty includes
        const settingsWithEmptyIncludes = {
            includes: {},
            globalQuery: 'test',
        };

        // Act
        updateSettings(settingsWithEmptyIncludes);
        const currentSettings = getSettings();

        // Assert
        expect(currentSettings.presets).toEqual({});
        expect((currentSettings as any).includes).toBeUndefined();
    });

    it('should handle settings without includes property', () => {
        // Arrange: Normal settings without includes
        const normalSettings = {
            globalQuery: 'test query',
            globalFilter: 'test filter',
        };

        // Act
        updateSettings(normalSettings);
        const currentSettings = getSettings();

        // Assert: Should work normally without any migration
        expect(currentSettings.globalQuery).toBe('test query');
        expect(currentSettings.globalFilter).toBe('test filter');
        // presets should be the default empty object
        expect(currentSettings.presets).toEqual(defaultPresets);
    });
});
