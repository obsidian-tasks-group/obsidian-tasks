import { FolderField } from '../../../src/Query/Filter/FolderField';
import { fromLine } from '../../TestHelpers';

describe('folder', () => {
    it('should provide access to the file name with extension', () => {
        const field = new FolderField();

        expect(field.value(fromLine({ line: '- [ ] do' }))).toStrictEqual('/');
        expect(field.value(fromLine({ line: '- [ ] do', path: 'outside/inside/file.md' }))).toStrictEqual(
            'outside/inside/',
        );
        expect(field.value(fromLine({ line: '- [ ] do', path: 'a_b/_c_d_/file.md' }))).toStrictEqual('a_b/_c_d_/');
    });
});

describe('grouping by folder', () => {
    it('supports grouping methods correctly', () => {
        const field = new FolderField();
        expect(field.supportsGrouping()).toEqual(true);

        const fieldGrouper = field.createGrouper();
        expect(fieldGrouper.property).toEqual('folder');
    });

    it.each([
        ['- [ ] a', 'a/b/c.md', ['a/b/']],
        // underscores in folder names are escaped
        ['- [ ] a', 'a/_b_/c.md', ['a/\\_b\\_/']],
        // file in root of vault:
        ['- [ ] a', 'a.md', ['/']],
    ])('task "%s" with path "%s" should have groups: %s', (taskLine: string, path: string, groups: string[]) => {
        // Arrange
        const grouper = new FolderField().createGrouper().grouper;

        // Assert
        expect(grouper(fromLine({ line: taskLine, path: path }))).toEqual(groups);
    });
});
