import { GlobalFilter } from '../src/Config/GlobalFilter';
import { resetSettings, updateSettings } from '../src/Config/Settings';

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
        const testValue = '#important';
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
        GlobalFilter.set('#task');

        // Assert
        expect(GlobalFilter.includedIn('Important #task inside')).toEqual(true);
    });

    it('Should not match a string without Global Filter', () => {
        // Arrange
        GlobalFilter.set('testValue');

        // Assert
        expect(GlobalFilter.includedIn('Without Global Filter')).toEqual(false);
    });

    it('Should remove Global Filter from the beginning of a string', () => {
        // Arrange
        const testValue = '#end';
        const testStringBefore = 'Important thing to do #end';
        const testStringAfter = 'Important thing to do';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter from the end of a string', () => {
        // Arrange
        const testValue = '#beginning';
        const testStringBefore = '#beginning another important thing';
        const testStringAfter = 'another important thing';
        GlobalFilter.set(testValue);

        // Assert
        expect(GlobalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter in the middle of a string', () => {
        // Arrange
        const testValue = '#middle';
        const testStringBefore = 'With the GF in the #middle of the string';
        // Note the 2 spaces where the 'newGlobalFilter' was
        const testStringAfter = 'With the GF in the  of the string';
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
        GlobalFilter.set('todo');
        updateSettings({ removeGlobalFilter: false });

        // Assert
        expect(GlobalFilter.removeAsSubstringFromDependingOnSettings('This is absolutely todo')).toEqual(
            'This is absolutely todo',
        );
    });

    it('Should remove Global Filter from a string when Setting is set to true', () => {
        // Arrange
        GlobalFilter.set('todo');
        updateSettings({ removeGlobalFilter: true });

        // Assert
        expect(GlobalFilter.removeAsSubstringFromDependingOnSettings('This is absolutely todo')).toEqual(
            'This is absolutely',
        );
    });
});

describe('check removal of the global filter', () => {
    afterEach(() => {
        GlobalFilter.reset();
    });

    type GlobalFilterRemovalExpectation = {
        globalFilter: string;
        inputDescription: string;
        expectedDescription: string;
    };

    test.each<GlobalFilterRemovalExpectation>([
        {
            globalFilter: '#task',
            inputDescription: '#task this is a very simple task',
            expectedDescription: 'this is a very simple task',
        },
        {
            globalFilter: '',
            inputDescription: '#task this is a very simple task',
            expectedDescription: '#task this is a very simple task',
        },
        {
            globalFilter: '🞋',
            inputDescription: 'task with emoji 🞋 global filter',
            expectedDescription: 'task with emoji global filter',
        },
        {
            globalFilter: '#t',
            inputDescription: 'task with #t global filter in the middle',
            expectedDescription: 'task with global filter in the middle',
        },
        {
            globalFilter: '#t',
            inputDescription: 'task with global filter in the end #t',
            expectedDescription: 'task with global filter in the end',
        },
        {
            globalFilter: '#t',
            inputDescription: 'task #t with #t several global #t filters #t',
            // Trailing spaces present after the first removal
            expectedDescription: 'task with  several global  filters',
        },
        {
            globalFilter: '#t',
            inputDescription: 'task with global filter in the end and some spaces  #t  ',
            expectedDescription: 'task with global filter in the end and some spaces',
        },
        {
            globalFilter: '#complex/global/filter',
            inputDescription: 'task with #complex/global/filter in the middle',
            expectedDescription: 'task with in the middle',
        },
        {
            globalFilter: '#task',
            inputDescription: 'task with an extension of the global filter #task/with/extension',
            expectedDescription: 'task with an extension of the global filter #task/with/extension',
        },
        {
            globalFilter: '#t',
            inputDescription: 'task with #t multiple global filters #t',
            expectedDescription: 'task with multiple global filters',
        },
        {
            globalFilter: '#t',
            inputDescription: '#t', // confirm behaviour when the description is empty
            expectedDescription: '',
        },
        {
            globalFilter: '#t',
            inputDescription: '#t #t',
            // Wrong behaviour - the expected should be empty
            expectedDescription: '#t',
        },
        {
            globalFilter: '#t',
            inputDescription: '#t #t #t',
            // Wrong behaviour - the expected should be empty
            expectedDescription: '#t',
        },
        {
            globalFilter: '#t',
            inputDescription: '#t #t #t #t',
            // Wrong behaviour - the expected should be empty
            expectedDescription: '#t #t',
        },
        {
            globalFilter: '#t',
            inputDescription: '#t #t #t #t #t',
            // Wrong behaviour - the expected should be empty
            expectedDescription: '#t #t',
        },
        {
            globalFilter: 'some',
            inputDescription: 'some', // confirm behaviour when the description is empty
            expectedDescription: '',
        },
        {
            globalFilter: 'some',
            inputDescription: 'some some',
            // Wrong behaviour - the expected should be empty
            expectedDescription: 'some',
        },
        {
            globalFilter: 'some',
            inputDescription: 'some some some',
            // Wrong behaviour - the expected should be empty
            expectedDescription: 'some',
        },
        {
            globalFilter: 'some',
            inputDescription: 'some some some some',
            // Wrong behaviour - the expected should be empty
            expectedDescription: 'some some',
        },
        {
            globalFilter: 'some',
            inputDescription: 'some some some some some',
            // Wrong behaviour - the expected should be empty
            expectedDescription: 'some some',
        },
    ])(
        'should parse "$inputDescription" and extract "$expectedDescription"',
        ({ globalFilter, inputDescription, expectedDescription }) => {
            // Arrange
            GlobalFilter.set(globalFilter);

            // Assert
            expect(GlobalFilter.removeAsWordFrom(inputDescription)).toEqual(expectedDescription);
        },
    );
});

describe('check removal of the global filter exhaustively', () => {
    afterEach(() => {
        GlobalFilter.reset();
    });

    test.each<string>([
        '#t',
        // The characters listed below are the ones that are - or were - escaped by
        // RegExpTools.escapeRegExp().
        // See the developer.mozilla.org reference in that method.
        // This test validates the escaping of each of those characters.
        '.',
        '*',
        '+',
        '?',
        '^',
        // Failed attempt at creating a failing test for when = was not escaped.
        // When I make RegExpTools.escapeRegExp() escape =, I get:
        // Invalid regular expression: /(^|\s)hello\=world($|\s)/: Invalid escape
        'hello=world',
        // Failed attempt at creating a failing test for when ! was not escaped.
        // When I make RegExpTools.escapeRegExp() escape !, I get:
        // Invalid regular expression: /(^|\s)hello\!world($|\s)/: Invalid escape
        'hello!world',
        // Failed attempt at creating a failing test for when : was not escaped.
        // When I make RegExpTools.escapeRegExp() escape :, I get:
        // Invalid regular expression: /(^|\s)hello\:world($|\s)/: Invalid escape
        'hello:world',
        '$',
        '{',
        '}',
        '(',
        ')',
        '|',
        '[',
        ']',
        // Failed attempt at creating a failing test for when / was not escaped
        '///',
        '\\',
    ])('should parse global filter "%s" edge cases correctly', (globalFilter) => {
        // Arrange
        GlobalFilter.set(globalFilter);

        // global filter removed at beginning, middle and end
        let inputDescription = `${globalFilter} 1 ${globalFilter} 2 ${globalFilter}`;
        let expectedDescription = '1 2';
        expect(GlobalFilter.removeAsWordFrom(inputDescription)).toEqual(expectedDescription);

        // global filter not removed if non-empty non-tag characters before or after it
        inputDescription = `${globalFilter}x 1 x${globalFilter} ${globalFilter}x 2 x${globalFilter}`;
        expectedDescription = `${globalFilter}x 1 x${globalFilter} ${globalFilter}x 2 x${globalFilter}`;
        expect(GlobalFilter.removeAsWordFrom(inputDescription)).toEqual(expectedDescription);

        // global filter not removed if non-empty sub-tag characters after it.
        // Include at least one occurrence of global filter, so we don't pass by luck.
        inputDescription = `${globalFilter}/x 1 x${globalFilter} ${globalFilter}/x 2 ${globalFilter} ${globalFilter}/x`;
        expectedDescription = `${globalFilter}/x 1 x${globalFilter} ${globalFilter}/x 2 ${globalFilter}/x`;
        expect(GlobalFilter.removeAsWordFrom(inputDescription)).toEqual(expectedDescription);
    });
});

describe('GlobalFilter.prepend() tests', () => {
    afterEach(() => {
        GlobalFilter.reset();
    });

    it('Should prepend Global Filter', () => {
        const globalFilter = 'awesome';
        const description = 'blossom';

        GlobalFilter.set(globalFilter);
        expect(GlobalFilter.prependTo(description)).toEqual(`${globalFilter} ${description}`);
    });

    it('Should prepend not prepend empty Global Filter', () => {
        // Note that an empty space is currently prepended in case the Global Filter is empty
        // Not fixing this for now in a refactoring PR
        expect(GlobalFilter.prependTo('description')).toEqual(' description');
    });
});
