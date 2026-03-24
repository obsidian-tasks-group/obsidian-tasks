import {
    type FirstDayOfWeekOption,
    LOCALE_DEFAULT,
    WEEKDAY_ORDER,
    getFirstDayOfWeekValue,
} from '../../src/Config/FirstDayOfWeek';

describe('getFirstDayOfWeekValue', () => {
    describe('explicit weekday settings', () => {
        it.each([
            { weekday: 'sunday', expectedValue: 0 },
            { weekday: 'monday', expectedValue: 1 },
            { weekday: 'tuesday', expectedValue: 2 },
            { weekday: 'wednesday', expectedValue: 3 },
            { weekday: 'thursday', expectedValue: 4 },
            { weekday: 'friday', expectedValue: 5 },
            { weekday: 'saturday', expectedValue: 6 },
        ])('$weekday should return $expectedValue', ({ weekday, expectedValue }) => {
            expect(getFirstDayOfWeekValue(weekday as FirstDayOfWeekOption)).toBe(expectedValue);
        });
    });

    describe('locale-default setting', () => {
        it('should return a value between 0 and 6', () => {
            const value = getFirstDayOfWeekValue(LOCALE_DEFAULT);
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(6);
        });

        it('should never return 7', () => {
            // This was the bug - it was returning 7 for Sunday locales
            const value = getFirstDayOfWeekValue(LOCALE_DEFAULT);
            expect(value).not.toBe(7);
        });

        // Test with mocked Intl.Locale
        it.each([
            { localeValue: 7, expectedValue: 0, day: 'Sunday' },
            { localeValue: 1, expectedValue: 1, day: 'Monday' },
            { localeValue: 2, expectedValue: 2, day: 'Tuesday' },
            { localeValue: 3, expectedValue: 3, day: 'Wednesday' },
            { localeValue: 4, expectedValue: 4, day: 'Thursday' },
            { localeValue: 5, expectedValue: 5, day: 'Friday' },
            { localeValue: 6, expectedValue: 6, day: 'Saturday' },
        ])(
            'should convert Intl.Locale firstDay $localeValue to $expectedValue ($day)',
            ({ localeValue, expectedValue }) => {
                // Mock Intl.Locale to return specific firstDay value
                const mockLocale = jest.fn().mockImplementation(() => ({
                    weekInfo: { firstDay: localeValue },
                }));

                jest.spyOn(global.Intl, 'Locale').mockImplementation(mockLocale as any);

                expect(getFirstDayOfWeekValue(LOCALE_DEFAULT)).toBe(expectedValue);

                // Cleanup
                jest.restoreAllMocks();
            },
        );
    });

    describe('return value range', () => {
        it.each([LOCALE_DEFAULT, ...WEEKDAY_ORDER])('setting "%s" should return a value between 0-6', (setting) => {
            const value = getFirstDayOfWeekValue(setting as any);
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(6);
        });
    });
});
