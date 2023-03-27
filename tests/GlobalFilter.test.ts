import { resetSettings, updateSettings } from '../src/Config/Settings';
import { GlobalFilter } from '../src/Config/GlobalFilter';

describe('Global Filter tests', () => {
    afterEach(() => {
        GlobalFilter.reset();
    });

    it('Should provide Global Filter with the default value with get()', () => {
        // Arrange
        const defaultValue = '';

        // Assert
        expect(GlobalFilter.get()).toEqual(defaultValue);
    });

    it('Should set new Global Filter', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.get()).toEqual(testValue);
    });

    it('Should reset the Global Filter', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const defaultValue = '';
        GlobalFilter.set(testValue);
        GlobalFilter.reset();

        // Assert
        expect(GlobalFilter.get()).toEqual(defaultValue);
    });

    it('Should indicate empty Global Filter by default', () => {
        // Assert
        expect(GlobalFilter.isEmpty()).toEqual(true);
    });

    it('Should indicate non-empty Global Filter after setting one', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.isEmpty()).toEqual(false);
    });

    it('Should match a string with Global Filter', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testString = 'This is a string with newGlobalFilter inside';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.includedIn(testString)).toEqual(true);
    });

    it('Should not match a string without Global Filter', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testString = 'This is a string without Global Filter';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.includedIn(testString)).toEqual(false);
    });

    it('Should remove Global Filter from the beginning of a string', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with GF at the end newGlobalFilter';
        const testStringAfter = 'This is a string with GF at the end';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter from the end of a string', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'newGlobalFilter This is a string with GF at the beginning';
        const testStringAfter = 'This is a string with GF at the beginning';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter in the middle of a string', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with newGlobalFilter GF in the middle';
        // Note the 2 spaces where the 'newGlobalFilter' was
        const testStringAfter = 'This is a string with  GF in the middle';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should not remove Global Filter from a string with default settings', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with GF at the end newGlobalFilter';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeAsSubstringFromDependingOnSettings(testStringBefore)).toEqual(testStringBefore);
    });

    it('Should not remove Global Filter from a string with default settings', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with GF at the end newGlobalFilter';
        const testStringAfter = 'This is a string with GF at the end';
        GlobalFilter.set(testValue);
        updateSettings({ removeGlobalFilter: true });

        // Assert
        expect(GlobalFilter.removeAsSubstringFromDependingOnSettings(testStringBefore)).toEqual(testStringAfter);

        // Cleanup
        resetSettings();
    });
});
