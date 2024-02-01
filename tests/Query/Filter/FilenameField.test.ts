import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { FilenameField } from '../../../src/Query/Filter/FilenameField';
import * as CustomMatchersForSorting from '../../CustomMatchers/CustomMatchersForSorting';
import { fromLine } from '../../TestingTools/TestHelpers';
import { SampleTasks } from '../../TestingTools/SampleTasks';

describe('filename', () => {
    it('should provide access to the file name with extension', () => {
        const pathField = new FilenameField();

        const builder = new TaskBuilder();

        expect(pathField.value(builder.path('').build())).toStrictEqual('');

        expect(pathField.value(builder.path('file in root.md').build())).toStrictEqual('file in root.md');

        expect(pathField.value(builder.path('directory name/file in sub-directory.md').build())).toStrictEqual(
            'file in sub-directory.md',
        );
    });
});

describe('filename', () => {
    // Note: We don't need to check all behaviours that are implemented in the base class.
    // These are minimal tests to confirm that the filters are correctly wired up,
    // to guard against possible future coding errors.

    it('by filename (includes)', () => {
        // Arrange
        const filter = new FilenameField().createFilterOrErrorMessage('filename includes search_text');

        // Assert
        expect(filter).toBeValid();
        expect(filter).not.toMatchTaskWithPath('');
        expect(filter).toMatchTaskWithPath('/some/path/SeArch_Text.md');
        expect(filter).not.toMatchTaskWithPath('/other/search_text/file.md'); // Ignores text in folder names
    });

    it('by filename (does not include)', () => {
        // Arrange
        const filter = new FilenameField().createFilterOrErrorMessage('filename does not include search_text');

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithPath('');
        expect(filter).toMatchTaskWithPath('/other/search_text/file.md'); // Ignores text in folder names
        expect(filter).not.toMatchTaskWithPath('/SoMe/PaTh/SeArcH_Text.md');
    });

    it('by filename (regex matches)', () => {
        // Arrange
        const filter = new FilenameField().createFilterOrErrorMessage(String.raw`filename regex matches /w.bble/`);

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithPath('/some/path/wibble.md');
        expect(filter).not.toMatchTaskWithPath('/some/wibble/filename.md');
    });

    it('by filename (regex does not match)', () => {
        // Arrange
        const filter = new FilenameField().createFilterOrErrorMessage(
            String.raw`filename regex does not match /w.bble/`,
        );

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithPath('/some/wobble/path name.md');
        expect(filter).not.toMatchTaskWithPath('/some/path/wibble.md');
    });
});

describe('sorting by filename', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new FilenameField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // Helper function to create a task with a given path
    function with_path(path: string) {
        return new TaskBuilder().path(path).build();
    }

    it('sort by filename', () => {
        // Arrange
        const sorter = new FilenameField().createNormalSorter();

        // Assert
        CustomMatchersForSorting.expectTaskComparesEqual(
            sorter,
            with_path('some path/filename.md'), // Only sorts file name - ignores folders (which differ)
            with_path('other path/filename.md'),
        );
        // Beginning with numbers
        CustomMatchersForSorting.expectTaskComparesBefore(sorter, with_path('c/1.md'), with_path('c/9.md'));
        CustomMatchersForSorting.expectTaskComparesBefore(sorter, with_path('c/9.md'), with_path('c/11.md'));
    });

    it('sort by filename reverse', () => {
        // Single example just to prove reverse works.
        // (There's no need to repeat all the examples above)
        const sorter = new FilenameField().createReverseSorter();
        CustomMatchersForSorting.expectTaskComparesAfter(sorter, with_path('a/b.md'), with_path('c/d.md'));
    });
});

describe('grouping by filename', () => {
    it('supports grouping methods correctly', () => {
        expect(new FilenameField()).toSupportGroupingWithProperty('filename');
    });

    it.each([
        ['- [ ] a', 'a/b/c.md', ['[[c]]']],
        // underscores in links shall not be escaped
        ['- [ ] a', 'a/b/_c_.md', ['[[_c_]]']],
    ])('task "%s" with path "%s" should have groups: %s', (taskLine: string, path: string, groups: string[]) => {
        // Arrange
        const grouper = new FilenameField().createNormalGrouper();

        // Assert
        const tasks = [fromLine({ line: taskLine, path: path })];
        expect({ grouper, tasks }).groupHeadingsToBe(groups);
    });

    it('should sort groups for FilenameField', () => {
        // Arrange
        const tasks = SampleTasks.withAllRootsPathsHeadings();
        const grouper = new FilenameField().createNormalGrouper();

        // Assert
        expect({ grouper, tasks }).groupHeadingsToBe(['[[_c_]]', '[[a_b_c]]', '[[b]]', '[[c]]', 'Unknown Location']);
    });
});
