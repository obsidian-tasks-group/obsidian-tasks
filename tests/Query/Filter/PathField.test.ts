import { PathField } from '../../../src/Query/Filter/PathField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { fromLine } from '../../TestingTools/TestHelpers';
import { SampleTasks } from '../../TestingTools/SampleTasks';

function testTaskFilterForTaskWithPath(filter: FilterOrErrorMessage, path: string, expected: boolean) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.path(path), expected);
}

describe('path', () => {
    it('by path (includes)', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage('path includes some/path');

        // Assert
        testTaskFilterForTaskWithPath(filter, '', false);
        testTaskFilterForTaskWithPath(filter, '/some/path/file.md', true);
        testTaskFilterForTaskWithPath(filter, '/SoMe/PaTh/file.md', true);
        testTaskFilterForTaskWithPath(filter, '/other/path/file.md', false);
    });

    it('by path (does not include)', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage('path does not include some/path');

        // Assert
        testTaskFilterForTaskWithPath(filter, '', true);
        testTaskFilterForTaskWithPath(filter, '/some/path/file.md', false);
        testTaskFilterForTaskWithPath(filter, '/other/path/file.md', true);
    });

    it('by path (regex matches)', () => {
        // Arrange
        const filter = new PathField().createFilterOrErrorMessage(String.raw`path regex matches /w.bble/`);

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
        const filter = new PathField().createFilterOrErrorMessage(String.raw`path regex matches /w.bble/i`);

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
        const filter = new PathField().createFilterOrErrorMessage(String.raw`path regex does not match /w.bble/`);

        // Assert
        expect(filter).toBeValid();
        expect(filter).not.toMatchTaskWithPath('/some/path/wibble.md');
        expect(filter).not.toMatchTaskWithPath('/some/path/wobble.md');
        expect(filter).toMatchTaskWithPath('');
        expect(filter).toMatchTaskWithPath('/some/path/WobblE.md'); // confirm case-sensitive
        expect(filter).toMatchTaskWithPath('/other/path/file.md');
    });
});

describe('should use whole path with un-escaped slashes in query', () => {
    const filterWithUnescapedSlashes = new PathField().createFilterOrErrorMessage(
        String.raw`path regex matches /a/b/c/d/`,
    );

    it('should escape forward slashes in query automatically', () => {
        expect(filterWithUnescapedSlashes).toBeValid();
        expect(filterWithUnescapedSlashes).toHaveExplanation("using regex:     'a\\/b\\/c\\/d' with no flags");
    });

    it('should match the requested path', () => {
        expect(filterWithUnescapedSlashes).toMatchTaskWithPath('/a/b/c/d/e.md');
        expect(filterWithUnescapedSlashes).not.toMatchTaskWithPath('/a/b.md');
    });
});

describe('sorting by path', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new PathField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // Helper function to create a task with a given path
    function with_path(path: string) {
        return fromLine({ line: '- [ ] x', path: path });
    }

    it('sort by path', () => {
        // Arrange
        const sorter = new PathField().createNormalSorter();

        // Assert
        expectTaskComparesEqual(sorter, with_path('a/b.md'), with_path('a/b.md'));
        expectTaskComparesBefore(sorter, with_path('a/b.md'), with_path('c/d.md'));

        // Ignores case if strings differ
        expectTaskComparesBefore(sorter, with_path('aaaa/bbbb.md'), with_path('CCCC/DDDD.md'));
        expectTaskComparesBefore(sorter, with_path('AAAA/BBBB.md'), with_path('cccc/dddd.md'));
        expectTaskComparesBefore(sorter, with_path('aaaa/bbbb.md'), with_path('AAAA/BBBB.md'));

        // Beginning with numbers
        expectTaskComparesBefore(sorter, with_path('c/1.md'), with_path('c/9.md'));
        expectTaskComparesBefore(sorter, with_path('c/9.md'), with_path('c/11.md'));
    });

    it('sort by path reverse', () => {
        // Single example just to prove reverse works.
        // (There's no need to repeat all the examples above)
        const sorter = new PathField().createReverseSorter();
        expectTaskComparesAfter(sorter, with_path('a/b.md'), with_path('c/d.md'));
    });
});

describe('grouping by path', () => {
    it('supports grouping methods correctly', () => {
        expect(new PathField()).toSupportGroupingWithProperty('path');
    });

    it.each([
        // the file extension is removed
        ['- [ ] a', 'a/b/c.md', ['a/b/c']],
        // underscores in paths are escaped
        ['- [ ] a', '_a_/b/_c_.md', ['\\_a\\_/b/\\_c\\_']],
        // backslashes are escaped. (this artificial example is to test escaping)
        ['- [ ] a', 'a\\b\\c.md', ['a\\\\b\\\\c']],
    ])('task "%s" with path "%s" should have groups: %s', (taskLine: string, path: string, groups: string[]) => {
        // Arrange
        const grouper = new PathField().createNormalGrouper();

        // Assert
        const tasks = [fromLine({ line: taskLine, path: path })];
        expect({ grouper, tasks }).groupHeadingsToBe(groups);
    });

    it('should sort groups for PathField', () => {
        // Arrange
        const tasks = SampleTasks.withAllRootsPathsHeadings();
        const grouper = new PathField().createNormalGrouper();

        // Assert
        expect({ grouper, tasks }).groupHeadingsToBe([
            // Why there is no path for empty path?
            'a/b',
            'a/b/\\_c\\_',
            'a/b/c',
            'a/d/c',
            'a\\_b\\_c',
            'e/d/c',
        ]);
    });
});
