/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { FunctionField } from '../../../src/Query/Filter/FunctionField';
import type { Grouper } from '../../../src/Query/Grouper';
import { Status } from '../../../src/Status';
import type { Task } from '../../../src/Task';
import { Priority } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

window.moment = moment;

// -----------------------------------------------------------------------------------------------------------------
// Filtering
// -----------------------------------------------------------------------------------------------------------------

describe('FunctionField - filtering', () => {
    it('should not parse line', () => {
        const functionField = new FunctionField();
        const filterOrErrorMessage = functionField.createFilterOrErrorMessage('hello world');
        expect(filterOrErrorMessage).not.toBeValid();
        expect(filterOrErrorMessage.error).toStrictEqual('Searching by custom function not yet implemented');
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

function toGroupTask(grouper: Grouper | null, task: Task, expectedGroupNames: string[]) {
    if (grouper === undefined) {
        return {
            message: () => 'unexpected null grouper: check your instruction matches your filter class.',
            pass: false,
        };
    }

    expect(grouper!.grouper(task)).toEqual(expectedGroupNames);
}

function toGroupTaskFromBuilder(grouper: Grouper | null, taskBuilder: TaskBuilder, expectedGroupNames: string[]) {
    const task = taskBuilder.build();
    toGroupTask(grouper, task, expectedGroupNames);
}

function toGroupTaskWithPath(grouper: Grouper | null, path: string, expectedGroupNames: string[]) {
    const taskBuilder = new TaskBuilder().path(path);
    toGroupTaskFromBuilder(grouper, taskBuilder, expectedGroupNames);
}

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
});

describe('FunctionField - grouping - example functions', () => {
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
});
