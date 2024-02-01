import { RootField } from '../../../src/Query/Filter/RootField';
import { fromLine } from '../../TestingTools/TestHelpers';
import { SampleTasks } from '../../TestingTools/SampleTasks';

describe('root', () => {
    it('should provide access to root folder name with trailing slash', () => {
        const field = new RootField();

        const line = '- [ ] do';
        expect(field.value(fromLine({ line: line }))).toStrictEqual('/');
        expect(field.value(fromLine({ line: line, path: 'outside/inside/A.md' }))).toStrictEqual('outside/');
        expect(field.value(fromLine({ line: line, path: 'a_b/_c_d_/B.md' }))).toStrictEqual('a_b/');
        expect(field.value(fromLine({ line: line, path: '/root/SeArch_Text/search_text.md' }))).toStrictEqual('root/');
    });
});

describe('root', () => {
    // Note: We don't need to check all behaviours that are implemented in the base class.
    // These are minimal tests to confirm that the filters are correctly wired up,
    // to guard against possible future coding errors.

    it('filter by root (includes)', () => {
        // Arrange
        const filter = new RootField().createFilterOrErrorMessage('root includes search_text');

        // Assert
        expect(filter).toBeValid();
        expect(filter).not.toMatchTaskWithPath('');
        expect(filter).toMatchTaskWithPath('/SeArch_Text/some folder name/some file name.md');
        expect(filter).not.toMatchTaskWithPath('/some root folder/SeArch_Text/search_text.md'); // Ignores text in child folder names
        expect(filter).not.toMatchTaskWithPath('/some root folder/folder/search_text.md'); // Ignores text in file names
    });
});

describe('grouping by root', () => {
    it('supports grouping methods correctly', () => {
        expect(new RootField()).toSupportGroupingWithProperty('root');
    });

    it.each([
        ['- [ ] a', 'a/b/c.md', ['a/']],
        // underscores in root folder names are escaped
        ['- [ ] a', '_g_/h/i.md', ['\\_g\\_/']],
        // Windows path
        ['- [ ] a', 'a\\b\\c.md', ['a/']],
        // file in root of vault:
        ['- [ ] a', 'a.md', ['/']],
    ])('task "%s" with path "%s" should have groups: %s', (taskLine: string, path: string, groups: string[]) => {
        // Arrange
        const grouper = new RootField().createNormalGrouper();

        // Assert
        const tasks = [fromLine({ line: taskLine, path: path })];
        expect({ grouper, tasks }).groupHeadingsToBe(groups);
    });

    it('should sort groups for FilenameField', () => {
        // Arrange
        const tasks = SampleTasks.withAllRootsPathsHeadings();
        const grouper = new RootField().createNormalGrouper();

        // Assert
        expect({ grouper, tasks }).groupHeadingsToBe(['/', 'a/', 'e/']);
    });
});
