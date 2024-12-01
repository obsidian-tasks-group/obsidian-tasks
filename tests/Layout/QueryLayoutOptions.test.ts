import { QueryLayoutOptions, parseQueryShowHideOptions } from '../../src/Layout/QueryLayoutOptions';

describe('parsing query show/hide layout options', () => {
    function parseOptionAndCheck(options: QueryLayoutOptions, option: string, hide: boolean) {
        const success = parseQueryShowHideOptions(options, option, hide);
        expect(success).toEqual(true);
    }

    const testCases: [string, keyof QueryLayoutOptions, boolean][] = [
        // Alphabetical order
        ['backlink', 'hideBacklinks', false],
        ['edit button', 'hideEditButton', false],
        ['postpone button', 'hidePostponeButton', false],
        ['task count', 'hideTaskCount', false],
        ['tree', 'hideTree', true],
        ['urgency', 'hideUrgency', true],
    ];

    it.each(testCases)('should parse "%s" option', (option, property, hiddenByDefault) => {
        const options = new QueryLayoutOptions();
        expect(options[property]).toBe(hiddenByDefault);

        parseOptionAndCheck(options, option, !hiddenByDefault);
        expect(options[property]).toEqual(!hiddenByDefault);

        parseOptionAndCheck(options, option, hiddenByDefault);
        expect(options[property]).toEqual(hiddenByDefault);
    });
});
