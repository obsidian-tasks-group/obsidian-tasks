import { resetSettings, updateSettings } from '../src/Config/Settings';
import { GlobalFilter } from '../src/Config/GlobalFilter';

describe('Global Filter tests', () => {
    afterEach(() => {
        GlobalFilter.reset();
    });

    it('Should provide Global Filter with the default value with get()', () => {
        expect(GlobalFilter.get()).toEqual('');
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
        GlobalFilter.set(testValue);
        GlobalFilter.reset();

        // Assert
        expect(GlobalFilter.get()).toEqual('');
    });

    it('Should indicate empty Global Filter by default', () => {
        // Assert
        expect(GlobalFilter.isEmpty()).toEqual(true);
    });

    it('Should indicate non-empty Global Filter after setting one', () => {
        // Arrange
        GlobalFilter.set('newGlobalFilter');

        // Assert
        expect(GlobalFilter.isEmpty()).toEqual(false);
    });

    it('Should match a string with Global Filter', () => {
        // Arrange
        GlobalFilter.set('newGlobalFilter');

        // Assert
        expect(GlobalFilter.includedIn('newGlobalFilter inside')).toEqual(true);
    });

    it('Should not match a string without Global Filter', () => {
        // Arrange
        GlobalFilter.set('testValue');

        // Assert
        expect(GlobalFilter.includedIn('Without Global Filter')).toEqual(false);
    });

    it('Should remove Global Filter from the beginning of a string', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'GF at the end newGlobalFilter';
        const testStringAfter = 'GF at the end';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter from the end of a string', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'newGlobalFilter GF at the beginning';
        const testStringAfter = 'GF at the beginning';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter in the middle of a string', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'GF newGlobalFilter in the middle';
        // Note the 2 spaces where the 'newGlobalFilter' was
        const testStringAfter = 'GF  in the middle';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });
});

describe('Global Filter tests with Remove Global Filter Setting', () => {
    afterEach(() => {
        GlobalFilter.reset();
        resetSettings();
    });

    it('Should remove Global Filter from a string when Setting is set to false', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'GF at the end newGlobalFilter';
        GlobalFilter.set(testValue);
        updateSettings({ removeGlobalFilter: false });

        // Assert
        expect(GlobalFilter.removeAsSubstringFromDependingOnSettings(testStringBefore)).toEqual(testStringBefore);
    });

    it('Should remove Global Filter from a string when Setting is set to true', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'GF at the end newGlobalFilter';
        const testStringAfter = 'GF at the end';
        GlobalFilter.set(testValue);
        updateSettings({ removeGlobalFilter: true });

        // Assert
        expect(GlobalFilter.removeAsSubstringFromDependingOnSettings(testStringBefore)).toEqual(testStringAfter);
    });
});
