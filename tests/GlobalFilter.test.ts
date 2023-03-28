import type { Moment } from 'moment';
import { Task } from '../src/Task';
import { TaskLocation } from '../src/TaskLocation';
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

function constructTaskFromLine(line: string, path: string = 'file.md', fallbackDate: Moment | null = null) {
    return Task.fromLine({
        line,
        taskLocation: TaskLocation.fromUnknownPosition(path),
        fallbackDate,
    });
}

describe('check removal of the global filter', () => {
    afterEach(() => {
        GlobalFilter.reset();
    });

    type GlobalFilterRemovalExpectation = {
        globalFilter: string;
        markdownTask: string;
        expectedDescription: string;
    };

    test.each<GlobalFilterRemovalExpectation>([
        {
            globalFilter: '#task',
            markdownTask: '- [ ] #task this is a very simple task',
            expectedDescription: 'this is a very simple task',
        },
        {
            globalFilter: '',
            markdownTask: '- [ ] #task this is a very simple task',
            expectedDescription: '#task this is a very simple task',
        },
        {
            globalFilter: '🞋',
            markdownTask: '- [ ] task with emoji 🞋 global filter',
            expectedDescription: 'task with emoji global filter',
        },
        {
            globalFilter: '#t',
            markdownTask: '- [ ] task with #t global filter in the middle',
            expectedDescription: 'task with global filter in the middle',
        },
        {
            globalFilter: '#t',
            markdownTask: '- [ ] task with global filter in the end #t',
            expectedDescription: 'task with global filter in the end',
        },
        {
            globalFilter: '#t',
            markdownTask: '- [ ] task with global filter in the end and some spaces  #t  ',
            expectedDescription: 'task with global filter in the end and some spaces',
        },
        {
            globalFilter: '#complex/global/filter',
            markdownTask: '- [ ] task with #complex/global/filter in the middle',
            expectedDescription: 'task with in the middle',
        },
        {
            globalFilter: '#task',
            markdownTask: '- [ ] task with an extension of the global filter #task/with/extension',
            expectedDescription: 'task with an extension of the global filter #task/with/extension',
        },
        {
            globalFilter: '#t',
            markdownTask: '- [ ] task with #t multiple global filters #t',
            expectedDescription: 'task with multiple global filters',
        },
        {
            globalFilter: '#t',
            markdownTask: '- [ ] #t', // confirm behaviour when the description is empty
            expectedDescription: '',
        },
    ])(
        'should parse "$markdownTask" and extract "$expectedDescription"',
        ({ globalFilter, markdownTask, expectedDescription }) => {
            // Arrange
            GlobalFilter.set(globalFilter);

            // Act
            const task = constructTaskFromLine(markdownTask);

            // Assert
            expect(task).not.toBeNull();
            expect(GlobalFilter.removeAsWordFrom(task!.description)).toEqual(expectedDescription);
        },
    );
});

describe('check removal of the global filter exhaustively', () => {
    afterEach(() => {
        GlobalFilter.reset();
    });

    type GlobalFilterRemoval = {
        globalFilter: string;
    };

    function checkDescription(markdownLine: string, expectedDescription: string) {
        const task = constructTaskFromLine(markdownLine);

        // Assert
        expect(task).not.toBeNull();
        expect(GlobalFilter.removeAsWordFrom(task!.description)).toEqual(expectedDescription);
    }

    test.each<GlobalFilterRemoval>([
        {
            globalFilter: '#t',
        },
        // The characters listed below are the ones that are - or were - escaped by
        // Task.escapeRegExp().
        // See the developer.mozilla.org reference in that method.
        // This test validates the escaping of each of those characters.
        {
            globalFilter: '.',
        },
        {
            globalFilter: '*',
        },
        {
            globalFilter: '+',
        },
        {
            globalFilter: '?',
        },
        {
            globalFilter: '^',
        },
        {
            // Failed attempt at creating a failing test for when = was not escaped.
            // When I make Task.escapeRegExp() escape =, I get:
            // Invalid regular expression: /(^|\s)hello\=world($|\s)/: Invalid escape
            globalFilter: 'hello=world',
        },
        {
            // Failed attempt at creating a failing test for when ! was not escaped.
            // When I make Task.escapeRegExp() escape !, I get:
            // Invalid regular expression: /(^|\s)hello\!world($|\s)/: Invalid escape
            globalFilter: 'hello!world',
        },
        {
            // Failed attempt at creating a failing test for when : was not escaped.
            // When I make Task.escapeRegExp() escape :, I get:
            // Invalid regular expression: /(^|\s)hello\:world($|\s)/: Invalid escape
            globalFilter: 'hello:world',
        },
        {
            globalFilter: '$',
        },
        {
            globalFilter: '{',
        },
        {
            globalFilter: '}',
        },
        {
            globalFilter: '(',
        },
        {
            globalFilter: ')',
        },
        {
            globalFilter: '|',
        },
        {
            globalFilter: '[',
        },
        {
            globalFilter: ']',
        },
        {
            // Failed attempt at creating a failing test for when / was not escaped
            globalFilter: '///',
        },
        {
            globalFilter: '\\',
        },
    ])('should parse global filter "$globalFilter" edge cases correctly', ({ globalFilter }) => {
        // Arrange
        GlobalFilter.set(globalFilter);

        // Act

        // global filter removed at beginning, middle and end
        let markdownLine = `- [ ] ${globalFilter} 1 ${globalFilter} 2 ${globalFilter}`;
        let expectedDescription = '1 2';
        checkDescription(markdownLine, expectedDescription);

        // global filter not removed if non-empty non-tag characters before or after it
        markdownLine = `- [ ] ${globalFilter}x 1 x${globalFilter} ${globalFilter}x 2 x${globalFilter}`;
        expectedDescription = `${globalFilter}x 1 x${globalFilter} ${globalFilter}x 2 x${globalFilter}`;
        checkDescription(markdownLine, expectedDescription);

        // global filter not removed if non-empty sub-tag characters after it.
        // Include at least one occurrence of global filter, so we don't pass by luck.
        markdownLine = `- [ ] ${globalFilter}/x 1 x${globalFilter} ${globalFilter}/x 2 ${globalFilter} ${globalFilter}/x`;
        expectedDescription = `${globalFilter}/x 1 x${globalFilter} ${globalFilter}/x 2 ${globalFilter}/x`;
        checkDescription(markdownLine, expectedDescription);
    });
});
