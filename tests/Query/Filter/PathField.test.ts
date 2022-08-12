import { PathField } from '../../../src/Query/Filter/PathField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';

function testTaskFilterForTaskWithPath(
    filter: FilterOrErrorMessage,
    path: string,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.path(path), expected);
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchTaskWithPath(path: string): R;
            toBeValid(): R;
        }

        interface Expect {
            toMatchTaskWithPath(path: string): any;
            toBeValid(): any;
        }

        interface InverseAsymmetricMatchers {
            toMatchTaskWithPath(path: string): any;
            toBeValid(): any;
        }
    }
}

export function toBeValid(filter: FilterOrErrorMessage) {
    if (filter.filter === undefined) {
        return {
            message: () =>
                'unexpected null filter: check your instruction matches your filter class',
            pass: false,
        };
    }

    if (filter.error !== undefined) {
        return {
            message: () =>
                'unexpected error message in filter: check your instruction matches your filter class',
            pass: false,
        };
    }

    return {
        message: () => 'filter is unexpectedly valid',
        pass: true,
    };
}

export function toMatchTaskWithPath(
    filter: FilterOrErrorMessage,
    path: string,
) {
    const builder = new TaskBuilder();
    const task = builder.path(path).build();

    const matches = filter.filter!(task);
    if (!matches) {
        return {
            message: () => `unexpected failure to match task: ${path}`,
            pass: false,
        };
    }

    return {
        message: () => `filter should not have matched task: ${path}`,
        pass: true,
    };
}

expect.extend({
    toMatchTaskWithPath,
});

expect.extend({
    toBeValid,
});

describe('path', () => {
    it('by path (includes)', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage(
            'path includes some/path',
        );

        // Assert
        testTaskFilterForTaskWithPath(filter, '', false);
        testTaskFilterForTaskWithPath(filter, '/some/path/file.md', true);
        testTaskFilterForTaskWithPath(filter, '/SoMe/PaTh/file.md', true);
        testTaskFilterForTaskWithPath(filter, '/other/path/file.md', false);
    });

    it('by path (does not include)', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage(
            'path does not include some/path',
        );

        // Assert
        testTaskFilterForTaskWithPath(filter, '', true);
        testTaskFilterForTaskWithPath(filter, '/some/path/file.md', false);
        testTaskFilterForTaskWithPath(filter, '/other/path/file.md', true);
    });

    it('by path (regex matches)', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage(
            'path regex matches /w.bble/',
        );

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithPath('/some/path/wibble.md');
        expect(filter).toMatchTaskWithPath('/some/path/wobble.md');
        expect(filter).not.toMatchTaskWithPath('');
        expect(filter).not.toMatchTaskWithPath('/some/path/WobblE.md'); // confirm case-sensitive
        expect(filter).not.toMatchTaskWithPath('/other/path/file.md');
    });

    it('by path (regex matches) with flags', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage(
            'path regex matches /w.bble/i',
        );

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithPath('/some/path/wibble.md');
        expect(filter).toMatchTaskWithPath('/some/path/wobble.md');
        expect(filter).not.toMatchTaskWithPath('');
        expect(filter).toMatchTaskWithPath('/some/path/WobblE.md'); // confirm case-insensitive (flag)
        expect(filter).not.toMatchTaskWithPath('/other/path/file.md');
    });

    it('by path (regex does not match)', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage(
            'path regex does not match /w.bble/',
        );

        // Assert
        expect(filter).toBeValid();
        expect(filter).not.toMatchTaskWithPath('/some/path/wibble.md');
        expect(filter).not.toMatchTaskWithPath('/some/path/wobble.md');
        expect(filter).toMatchTaskWithPath('');
        expect(filter).toMatchTaskWithPath('/some/path/WobblE.md'); // confirm case-sensitive
        expect(filter).toMatchTaskWithPath('/other/path/file.md');
    });
});
