import { resetSettings, updateSettings } from '../src/Config/Settings';
import { GlobalFilter } from '../src/Config/GlobalFilter';

describe('Global Filter tests', () => {
    afterEach(() => {
        resetSettings();
    });

    it('Should provide Global Filter with the default value with get()', () => {
        // Arrange
        const globalFilter = GlobalFilter.get();

        // Assert
        expect(globalFilter).toBeDefined();
        expect(globalFilter).toEqual('');
    });

    it('Should provide Global Filter value & length with get() after set()', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        GlobalFilter.set(testValue);
        const globalFilter = GlobalFilter.get();

        // Assert
        expect(globalFilter).toBeDefined();
        expect(globalFilter).toEqual(testValue);
    });

    it('Should match a string with Global Filter', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testString = 'This is a string with newGlobalFilter inside';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.matches(testString)).toEqual(true);
    });

    it('Should not match a string without Global Filter', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testString = 'This is a string without Global Filter';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.matches(testString)).toEqual(false);
    });

    it('Should remove Global Filter from the beginning of a string', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with GF at the end newGlobalFilter';
        const testStringAfter = 'This is a string with GF at the end';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter from the end of a string', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'newGlobalFilter This is a string with GF at the beginning';
        const testStringAfter = 'This is a string with GF at the beginning';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeFrom(testStringBefore)).toEqual(testStringAfter);
    });

    // it('Should remove Global Filter from the middle of a string', () => {});
    // Not supported

    it('Should not remove Global Filter from a string with default settings', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with GF at the end newGlobalFilter';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeFromDependingOnSettings(testStringBefore)).toEqual(testStringBefore);
    });

    it('Should not remove Global Filter from a string with default settings', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with GF at the end newGlobalFilter';
        const testStringAfter = 'This is a string with GF at the end';
        GlobalFilter.set(testValue);
        updateSettings({ removeGlobalFilter: true });

        // Assert
        expect(GlobalFilter.removeFromDependingOnSettings(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should set new Global Filter in Settings', () => {
        const testValue = 'newGlobalFilter';
        GlobalFilter.set(testValue);

        expect(GlobalFilter.get()).toBeDefined();
        expect(GlobalFilter.get()).toEqual(testValue);
    });

    it('Should reset the Global Filter in Settings', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        GlobalFilter.set(testValue);
        resetSettings();

        // Assert
        expect(GlobalFilter.get()).toBeDefined();
        expect(GlobalFilter.get()).toEqual('');
    });
});
