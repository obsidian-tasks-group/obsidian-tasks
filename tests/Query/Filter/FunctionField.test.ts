/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { FunctionField } from '../../../src/Query/Filter/FunctionField';
import { Status } from '../../../src/Status';
import { Priority } from '../../../src/Task';
import {
    toGroupTaskFromBuilder,
    toGroupTaskUsingSearchInfo,
    toGroupTaskWithPath,
} from '../../CustomMatchers/CustomMatchersForGrouping';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import type { Task } from '../../../src/Task';

window.moment = moment;

// -----------------------------------------------------------------------------------------------------------------
// Filtering
// -----------------------------------------------------------------------------------------------------------------

describe('FunctionField - filtering', () => {
    const functionField = new FunctionField();

    it('filter by function - with valid query of Task property', () => {
        const filter = functionField.createFilterOrErrorMessage('filter by function task.description.length > 5');
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithDescription('123456');
        expect(filter).not.toMatchTaskWithDescription('12345');
        expect(filter).not.toMatchTaskWithDescription('1234');
    });

    it('filter by function - with valid query of Query property', () => {
        const tasksInSameFileAsQuery = functionField.createFilterOrErrorMessage(
            'filter by function task.file.path === query.file.path',
        );
        expect(tasksInSameFileAsQuery).toBeValid();
        const queryFilePath = '/a/b/query.md';

        const taskInQueryFile: Task = new TaskBuilder().path(queryFilePath).build();
        const taskNotInQueryFile: Task = new TaskBuilder().path('some other path.md').build();
        const searchInfo = new SearchInfo(queryFilePath, [taskInQueryFile, taskNotInQueryFile]);

        expect(tasksInSameFileAsQuery.filterFunction!(taskInQueryFile, searchInfo)).toEqual(true);
        expect(tasksInSameFileAsQuery.filterFunction!(taskNotInQueryFile, searchInfo)).toEqual(false);
    });

    it('filter by function - should report syntax errors via FilterOrErrorMessage', () => {
        const instructionWithExtraClosingParen = 'filter by function task.status.name.toUpperCase())';
        const filter = functionField.createFilterOrErrorMessage(instructionWithExtraClosingParen);
        expect(filter).not.toBeValid();
        expect(filter.error).toEqual(
            'Error: Failed parsing expression "task.status.name.toUpperCase())".\nThe error message was:\n    "SyntaxError: Unexpected token \')\'"',
        );
    });

    it('filter by function - should report searching errors via exception', () => {
        // Arrange
        const instructionWithExtraClosingParen = 'filter by function task.wibble';
        const filter = functionField.createFilterOrErrorMessage(instructionWithExtraClosingParen);

        // Assert
        expect(filter).toBeValid();
        const t = () => {
            const task = new TaskBuilder().build();
            filter.filterFunction!(task, SearchInfo.fromAllTasks([task]));
        };
        expect(t).toThrow(Error);
        expect(t).toThrowError('filtering function must return true or false. This returned "undefined".');
    });

    it('filter by function - explanation should honour original case', () => {
        const filter = functionField.createFilterOrErrorMessage('filter by FUNCTION task.isRecurring');
        expect(filter).toHaveExplanation('filter by FUNCTION task.isRecurring');
    });
});

// -----------------------------------------------------------------------------------------------------------------
// Sorting
// -----------------------------------------------------------------------------------------------------------------

describe('FunctionField - sorting', () => {
    it('should not support sorting', () => {
        const functionField = new FunctionField();
        expect(functionField.supportsSorting()).toEqual(false);
    });
});

// -----------------------------------------------------------------------------------------------------------------
// Grouping
// -----------------------------------------------------------------------------------------------------------------

afterEach(() => {
    jest.useRealTimers();
});

function createGrouper(line: string) {
    const grouper = new FunctionField().createGrouperFromLine(line);
    expect(grouper).not.toBeNull();
    return grouper;
}

describe('FunctionField - grouping - basics', () => {
    it('should support grouping', () => {
        const field = new FunctionField();
        expect(field.supportsGrouping()).toEqual(true);
    });

    it('should parse "group by function" line', () => {
        // Arrange
        const field = new FunctionField();
        const instruction = 'group by function task.path.startsWith("journal/") ? "journal/" : task.path';

        // Assert
        const grouper = field.createGrouperFromLine(instruction);
        expect(grouper).not.toBeNull();
        expect(grouper?.reverse).toEqual(false);
    });

    it('should parse "group by function reverse" line', () => {
        // Arrange
        const field = new FunctionField();
        const instruction = 'group by function reverse task.path.startsWith("journal/") ? "journal/" : task.path';

        // Assert
        const grouper = field.createGrouperFromLine(instruction);
        expect(grouper).not.toBeNull();
        expect(grouper?.reverse).toEqual(true);
    });
});

describe('FunctionField - grouping - error-handling', () => {
    it('should throw in grouper()', () => {
        // It's not possible to create a GrouperFunction without a line,
        // so grouper() method needs to throw and report it cannot work.
        const field = new FunctionField();
        const t = () => {
            field.grouper();
        };
        expect(t).toThrow(Error);
    });

    it('should give a meaningful error for invalid syntax', () => {
        const line = 'group by function hello';
        const grouper = createGrouper(line);
        toGroupTaskWithPath(grouper, 'journal/a/b.md', [
            'Error: Failed calculating expression "hello".\nThe error message was:\n    "ReferenceError: hello is not defined"',
        ]);
    });

    it('should give a meaningful error for unknown task field', () => {
        const line = 'group by function task.nonExistentField';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder(), [
            'Error: Failed calculating expression "task.nonExistentField". The error message was: Cannot read properties of undefined (reading \'toString\')',
        ]);
    });
});

describe('FunctionField - grouping return types', () => {
    const expressionsAndResults = [
        ['"hello"', ['hello']],
        ['""', ['']],
        ['[]', []],
        ['"" || "No value"', ['No value']],
        ['false', ['false']],
        ['true', ['true']],
        ['1', ['1']],
        ['0', ['0']],
        ['0 || "No value"', ['No value']],
        ['1.0765456', ['1.0765456']],
        ['1.0765456.toFixed(3)', ['1.077']],
        ['["heading1", "heading2"]', ['heading1', 'heading2']], // return two headings, indicating that this task should be displayed twice, once in each heading
        ['[1, 2]', ['1', '2']], // return two headings, that need to be converted to strings
        ['null', []],
        ['null || "No value"', ['No value']],
        [
            'undefined',
            [
                'Error: Failed calculating expression "undefined". The error message was: Cannot read properties of undefined (reading \'toString\')',
            ],
        ],
        ['undefined || "No value"', ['No value']],
        [
            // Should allow manual escaping of markdown
            String.raw`"I _am_ not _italic_".replaceAll("_", "\\_")`,
            [String.raw`I \_am\_ not \_italic\_`],
        ],
    ];

    it.each(expressionsAndResults)("expression: '%s'", (expression: any, result: any) => {
        const line = `group by function ${expression}`;
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder(), result);
    });
});

describe('FunctionField - grouping - example functions', () => {
    it('should display booleans in a meaningful way', () => {
        const line = "group by function task.status.symbol === '/'";
        const grouper = createGrouper(line);
        toGroupTaskWithPath(grouper, 'journal/a/b.md', ['false']);
    });

    it('using root and path', () => {
        // Note: This will change to task.file.path
        const line = 'group by function task.path.startsWith("journal/") ? "journal/" : task.path';
        const grouper = createGrouper(line);

        toGroupTaskWithPath(grouper, 'journal/a/b.md', ['journal/']);
        toGroupTaskWithPath(grouper, 'hello/world/from-me.md', ['hello/world/from-me.md']);
        toGroupTaskWithPath(grouper, 'file-in-root-folder.md', ['file-in-root-folder.md']);
    });

    it('using path stripping folder', () => {
        const line = 'group by function task.path.replace("some/prefix/", "")';
        const grouper = createGrouper(line);

        toGroupTaskWithPath(grouper, 'a/b/c.md', ['a/b/c.md']);
    });

    it('group by priority', () => {
        const line = 'group by function task.priority';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().priority(Priority.Highest), ['0']);
    });

    it('group by status symbol', () => {
        // A single space as the character in a heading is not useful, so replace with something displayable:
        const line = 'group by function task.status.symbol.replace(" ", "space")';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().status(Status.makeCancelled()), ['-']);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().status(Status.makeTodo()), ['space']);
    });

    it('group by status nextStatusSymbol', () => {
        const line = 'group by function task.status.nextStatusSymbol.replace(" ", "space")';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().status(Status.makeInProgress()), ['x']);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().status(Status.makeDone()), ['space']);
    });

    it('group by using number', () => {
        const line = 'group by function task.description.length';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().description('#task Hello'), ['11']);
    });

    it('group by using string literal', () => {
        const line = 'group by function reverse "Description length: " + task.description.length';
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().description('#task Hello'), ['Description length: 11']);
    });

    it('group by a selected tag', () => {
        const line = "group by function task.tags.find((tag) => tag.includes('#context/'))";
        const grouper = createGrouper(line);
        toGroupTaskFromBuilder(grouper, new TaskBuilder().tags(['#context/pc_home', '#topic/sys_admin']), [
            '#context/pc_home',
        ]);
    });

    it('group by a query property', () => {
        const line = 'group by function query.file.filename';
        const grouper = createGrouper(line);
        const task = new TaskBuilder().build();
        toGroupTaskUsingSearchInfo(grouper, task, new SearchInfo('queries/query file.md', [task]), ['query file.md']);
    });
});
