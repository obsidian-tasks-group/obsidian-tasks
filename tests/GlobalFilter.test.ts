import { resetSettings, updateSettings } from '../src/Config/Settings';
import { GlobalFilter, getGlobalFilter } from '../src/Config/GlobalFilter';

describe('Global Filter tests', () => {
    afterEach(() => {
        resetSettings();
    });

    it('Should provide Global Filter object with the default value', () => {
        const globalFilter = getGlobalFilter();
        expect(globalFilter).toBeDefined();
        expect(globalFilter.value).toEqual('');
    });

    it('Should provide Global Filter value & length after constructor', () => {
        const testValue = 'newGlobalFilter';
        const globalFilter = new GlobalFilter(testValue);
        expect(globalFilter).toBeDefined();
        expect(globalFilter.value).toEqual(testValue);
        expect(globalFilter.length).toEqual(testValue.length);
    });

    it('Should match a string with Global Filter', () => {
        const testValue = 'newGlobalFilter';
        const testString = 'This is a string with newGlobalFilter inside';
        const globalFilter = new GlobalFilter(testValue);
        expect(globalFilter.matches(testString)).toEqual(true);
    });

    it('Should not match a string without Global Filter', () => {
        const testValue = 'newGlobalFilter';
        const testString = 'This is a string without Global Filter';
        const globalFilter = new GlobalFilter(testValue);
        expect(globalFilter.matches(testString)).toEqual(false);
    });

    it('Should remove Global Filter from the beginning of a string', () => {
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with GF at the end newGlobalFilter';
        const testStringAfter = 'This is a string with GF at the end';
        const globalFilter = new GlobalFilter(testValue);
        expect(globalFilter.removeFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter from the end of a string', () => {
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'newGlobalFilter This is a string with GF at the beginning';
        const testStringAfter = 'This is a string with GF at the beginning';
        const globalFilter = new GlobalFilter(testValue);
        expect(globalFilter.removeFrom(testStringBefore)).toEqual(testStringAfter);
    });

    // it('Should remove Global Filter from the middle of a string', () => {});
    // Not supported

    it('Should not remove Global Filter from a string with default settings', () => {
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with GF at the end newGlobalFilter';
        const globalFilter = new GlobalFilter(testValue);
        expect(globalFilter.removeFromDependingOnSettings(testStringBefore)).toEqual(testStringBefore);
    });

    it('Should not remove Global Filter from a string with default settings', () => {
        const testValue = 'newGlobalFilter';
        const testStringBefore = 'This is a string with GF at the end newGlobalFilter';
        const testStringAfter = 'This is a string with GF at the end';
        const globalFilter = new GlobalFilter(testValue);
        updateSettings({ removeGlobalFilter: true });
        expect(globalFilter.removeFromDependingOnSettings(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should set new Global Filter in Settings', () => {
        const testValue = 'newGlobalFilter';
        updateSettings({ globalFilter: new GlobalFilter(testValue) });

        const globalFilter = getGlobalFilter();
        expect(globalFilter).toBeDefined();
        expect(globalFilter.value).toEqual(testValue);
    });

    it('Should reset the Global Filter in Settings', () => {
        const testValue = 'newGlobalFilter';
        updateSettings({ globalFilter: new GlobalFilter(testValue) });

        resetSettings();

        const globalFilter = getGlobalFilter();
        expect(globalFilter).toBeDefined();
        expect(globalFilter.value).toEqual('');
    });
});
