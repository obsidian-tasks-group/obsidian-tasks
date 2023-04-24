import { PathField } from '../../../src/Query/Filter/PathField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { fromLine } from '../../TestHelpers';

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

describe('invalid unescaped slash should give helpful error text and not search', () => {
    const filterWithUnescapedSlashes = new PathField().createFilterOrErrorMessage(
        String.raw`path regex matches /a/b/c/d/`,
    );

    // This test demonstrates the issue logged in
    // https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1037
    //      'Work out how to prevent `path regex matches /a/b/c/d/` from
    //       confusingly only searching `path regex matches /a/`.
    // All these tests are marked as 'failing' because the code currently accepts
    // an invalid search.
    it.failing('should not be valid', () => {
        expect(filterWithUnescapedSlashes).not.toBeValid();
    });

    it.failing('should have a meaningful error message', () => {
        // The error message does not have to be exactly this.
        // The main thing is that it should convey what the user needs to do
        // to fix the expression.
        expect(filterWithUnescapedSlashes.error).toEqual(
            'An unescaped delimiter must be escaped; in most languages with a backslash (\\)',
        );
    });

    it.failing('should not match a subset of requested path', () => {
        // Once the issue is fixed, and filterWithUnescapedSlashes is not valid,
        // this test should be deleted.
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
        const grouper = new PathField().createGrouper().grouper;

        // Assert
        expect(grouper(fromLine({ line: taskLine, path: path }))).toEqual(groups);
    });
});
