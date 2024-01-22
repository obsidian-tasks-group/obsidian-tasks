import { GlobalFilter } from '../../src/Config/GlobalFilter';

describe('Global Filter tests', () => {
    it('getInstance() should return the same object', () => {
        const globalFilter1 = GlobalFilter.getInstance();
        const globalFilter2 = GlobalFilter.getInstance();

        expect(Object.is(globalFilter1, globalFilter2)).toEqual(true);
    });

    it('Should provide Global Filter with the default value with get()', () => {
        const globalFilter = new GlobalFilter();
        expect(globalFilter.get()).toEqual('');
    });

    it('Should set new Global Filter', () => {
        // Arrange
        const testValue = 'newGlobalFilter';
        const globalFilter = new GlobalFilter();

        // Act
        globalFilter.set(testValue);

        // Assert
        expect(globalFilter.get()).toEqual(testValue);
    });

    it('Should allow independent values for independent instances', () => {
        // Arrange
        const globalFilter1 = new GlobalFilter();
        const globalFilter2 = new GlobalFilter();

        // Act
        globalFilter1.set('1');
        globalFilter2.set('2');

        // Assert
        expect(globalFilter1.get()).toEqual('1');
        expect(globalFilter2.get()).toEqual('2');
    });

    it('Should reset the Global Filter', () => {
        // Arrange
        const testValue = '#important';
        const globalFilter = new GlobalFilter();
        globalFilter.set(testValue);

        // Act
        globalFilter.reset();

        // Assert
        expect(globalFilter.get()).toEqual('');
    });

    it('Should indicate empty Global Filter by default', () => {
        // Assert
        const globalFilter = new GlobalFilter();
        expect(globalFilter.isEmpty()).toEqual(true);
    });

    it('Should indicate non-empty Global Filter after setting one', () => {
        // Arrange
        const globalFilter = new GlobalFilter();
        globalFilter.set('newGlobalFilter');

        // Assert
        expect(globalFilter.isEmpty()).toEqual(false);
    });

    it('Should match a string with Global Filter', () => {
        // Arrange
        const globalFilter = new GlobalFilter();
        globalFilter.set('#task');

        // Assert
        expect(globalFilter.includedIn('Important #task inside')).toEqual(true);
    });

    it('Should check equality correctly', () => {
        // Arrange
        const globalFilter = new GlobalFilter();
        globalFilter.set('#task');

        // Assert
        expect(globalFilter.equals('#task')).toEqual(true);
        expect(globalFilter.equals('#tasks')).toEqual(false);
        expect(globalFilter.equals('#TODO')).toEqual(false);
    });

    it('Should not match a string without Global Filter', () => {
        // Arrange
        const globalFilter = new GlobalFilter();
        globalFilter.set('testValue');

        // Assert
        expect(globalFilter.includedIn('Without Global Filter')).toEqual(false);
    });

    it('Should control whether to remove the global filter from displayed tasks', () => {
        const globalFilter = new GlobalFilter();

        globalFilter.setRemoveGlobalFilter(false);
        expect(globalFilter.getRemoveGlobalFilter()).toEqual(false);

        globalFilter.setRemoveGlobalFilter(true);
        expect(globalFilter.getRemoveGlobalFilter()).toEqual(true);
    });

    it('Should remove Global Filter from the beginning of a string', () => {
        // Arrange
        const testValue = '#end';
        const testStringBefore = 'Important thing to do #end';
        const testStringAfter = 'Important thing to do';
        const globalFilter = new GlobalFilter();
        globalFilter.set(testValue);

        // Assert
        expect(globalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter from the end of a string', () => {
        // Arrange
        const testValue = '#beginning';
        const testStringBefore = '#beginning another important thing';
        const testStringAfter = 'another important thing';
        const globalFilter = new GlobalFilter();
        globalFilter.set(testValue);

        // Assert
        expect(globalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });

    it('Should remove Global Filter in the middle of a string', () => {
        // Arrange
        const testValue = '#middle';
        const testStringBefore = 'With the GF in the #middle of the string';
        // Note the 2 spaces where the 'newGlobalFilter' was
        const testStringAfter = 'With the GF in the  of the string';
        const globalFilter = new GlobalFilter();
        globalFilter.set(testValue);

        // Assert
        expect(globalFilter.removeAsSubstringFrom(testStringBefore)).toEqual(testStringAfter);
    });
});

describe('Global Filter tests with Remove Global Filter Setting', () => {
    it('Should remove Global Filter from a string when Setting is set to false', () => {
        // Arrange
        const globalFilter = new GlobalFilter();
        globalFilter.set('todo');
        globalFilter.setRemoveGlobalFilter(false);

        // Assert
        expect(globalFilter.removeAsWordFromDependingOnSettings('This is absolutely todo')).toEqual(
            'This is absolutely todo',
        );
    });

    it('Should remove Global Filter from a string when Setting is set to true', () => {
        // Arrange
        const globalFilter = new GlobalFilter();
        globalFilter.set('todo');
        globalFilter.setRemoveGlobalFilter(true);

        // Assert
        expect(globalFilter.removeAsWordFromDependingOnSettings('This is absolutely todo')).toEqual(
            'This is absolutely',
        );
    });

    it.each([
        // Global Filter is a tag
        ['#task', '#task/stage at the beginning'],
        ['#task', 'in the #task/stage middle'],
        ['#task', 'at the end #task/stage'],

        // Global Filter is not a tag
        ['TODO', 'TODO/maybe at the beginning'],
        ['TODO', 'in the TODO/maybe middle'],
        ['TODO', 'at the end TODO/maybe'],
    ])(
        'should not remove Global Filter (%s) if it is in a substring for a task "- [ ] %s"',
        async (globalFilterValue: string, description: string) => {
            const globalFilter = new GlobalFilter();
            globalFilter.setRemoveGlobalFilter(true);
            globalFilter.set(globalFilterValue);

            expect(globalFilter.removeAsWordFrom(description)).toEqual(description);
        },
    );
});

describe('check removal of the global filter', () => {
    type GlobalFilterRemovalExpectation = {
        globalFilterValue: string;
        inputDescription: string;
        expectedDescription: string;
    };

    test.each<GlobalFilterRemovalExpectation>([
        {
            globalFilterValue: '#task',
            inputDescription: '#task this is a very simple task',
            expectedDescription: 'this is a very simple task',
        },
        {
            globalFilterValue: '',
            inputDescription: '#task this is a very simple task',
            expectedDescription: '#task this is a very simple task',
        },
        {
            globalFilterValue: '🞋',
            inputDescription: 'task with emoji 🞋 global filter',
            expectedDescription: 'task with emoji global filter',
        },
        {
            globalFilterValue: '#t',
            inputDescription: 'task with #t global filter in the middle',
            expectedDescription: 'task with global filter in the middle',
        },
        {
            globalFilterValue: '#t',
            inputDescription: 'task with global filter in the end #t',
            expectedDescription: 'task with global filter in the end',
        },
        {
            globalFilterValue: '#t',
            inputDescription: 'task #t with #t several global #t filters #t',
            // Trailing spaces present after the first removal
            expectedDescription: 'task with  several global  filters',
        },
        {
            globalFilterValue: '#t',
            inputDescription: 'task with global filter in the end and some spaces  #t  ',
            expectedDescription: 'task with global filter in the end and some spaces',
        },
        {
            globalFilterValue: '#complex/global/filter',
            inputDescription: 'task with #complex/global/filter in the middle',
            expectedDescription: 'task with in the middle',
        },
        {
            globalFilterValue: '#task',
            inputDescription: 'task with an extension of the global filter #task/with/extension',
            expectedDescription: 'task with an extension of the global filter #task/with/extension',
        },
        {
            globalFilterValue: '#t',
            inputDescription: 'task with #t multiple global filters #t',
            expectedDescription: 'task with multiple global filters',
        },
        {
            globalFilterValue: '#t',
            inputDescription: '#t', // confirm behaviour when the description is empty
            expectedDescription: '',
        },
        {
            globalFilterValue: '#t',
            inputDescription: '#t #t',
            // Wrong behaviour - the expected should be empty
            expectedDescription: '#t',
        },
        {
            globalFilterValue: '#t',
            inputDescription: '#t #t #t',
            // Wrong behaviour - the expected should be empty
            expectedDescription: '#t',
        },
        {
            globalFilterValue: '#t',
            inputDescription: '#t #t #t #t',
            // Wrong behaviour - the expected should be empty
            expectedDescription: '#t #t',
        },
        {
            globalFilterValue: '#t',
            inputDescription: '#t #t #t #t #t',
            // Wrong behaviour - the expected should be empty
            expectedDescription: '#t #t',
        },
        {
            globalFilterValue: 'some',
            inputDescription: 'some', // confirm behaviour when the description is empty
            expectedDescription: '',
        },
        {
            globalFilterValue: 'some',
            inputDescription: 'some some',
            // Wrong behaviour - the expected should be empty
            expectedDescription: 'some',
        },
        {
            globalFilterValue: 'some',
            inputDescription: 'some some some',
            // Wrong behaviour - the expected should be empty
            expectedDescription: 'some',
        },
        {
            globalFilterValue: 'some',
            inputDescription: 'some some some some',
            // Wrong behaviour - the expected should be empty
            expectedDescription: 'some some',
        },
        {
            globalFilterValue: 'some',
            inputDescription: 'some some some some some',
            // Wrong behaviour - the expected should be empty
            expectedDescription: 'some some',
        },
    ])(
        'should parse "$inputDescription" and extract "$expectedDescription"',
        ({ globalFilterValue, inputDescription, expectedDescription }) => {
            // Arrange
            const globalFilter = new GlobalFilter();
            globalFilter.set(globalFilterValue);

            // Assert
            expect(globalFilter.removeAsWordFrom(inputDescription)).toEqual(expectedDescription);
        },
    );
});

describe('check removal of the global filter exhaustively', () => {
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
    ])('should parse global filter "%s" edge cases correctly', (globalFilterValue) => {
        // Arrange
        const globalFilter = new GlobalFilter();
        globalFilter.set(globalFilterValue);

        // global filter removed at beginning, middle and end
        let inputDescription = `${globalFilterValue} 1 ${globalFilterValue} 2 ${globalFilterValue}`;
        let expectedDescription = '1 2';
        expect(globalFilter.removeAsWordFrom(inputDescription)).toEqual(expectedDescription);

        // global filter not removed if non-empty non-tag characters before or after it
        inputDescription = `${globalFilterValue}x 1 x${globalFilterValue} ${globalFilterValue}x 2 x${globalFilterValue}`;
        expectedDescription = `${globalFilterValue}x 1 x${globalFilterValue} ${globalFilterValue}x 2 x${globalFilterValue}`;
        expect(globalFilter.removeAsWordFrom(inputDescription)).toEqual(expectedDescription);

        // global filter not removed if non-empty sub-tag characters after it.
        // Include at least one occurrence of global filter, so we don't pass by luck.
        inputDescription = `${globalFilterValue}/x 1 x${globalFilterValue} ${globalFilterValue}/x 2 ${globalFilterValue} ${globalFilterValue}/x`;
        expectedDescription = `${globalFilterValue}/x 1 x${globalFilterValue} ${globalFilterValue}/x 2 ${globalFilterValue}/x`;
        expect(globalFilter.removeAsWordFrom(inputDescription)).toEqual(expectedDescription);
    });
});

describe('GlobalFilter.prepend() tests', () => {
    it('Should prepend Global Filter', () => {
        const globalFilterValue = 'awesome';
        const description = 'blossom';

        const globalFilter = new GlobalFilter();
        globalFilter.set(globalFilterValue);
        expect(globalFilter.prependTo(description)).toEqual(`${globalFilterValue} ${description}`);
    });

    it('Should prepend not prepend empty Global Filter', () => {
        // Note that an empty space is currently prepended in case the Global Filter is empty
        // Not fixing this for now in a refactoring PR
        const globalFilter = new GlobalFilter();
        expect(globalFilter.prependTo('description')).toEqual(' description');
    });
});
