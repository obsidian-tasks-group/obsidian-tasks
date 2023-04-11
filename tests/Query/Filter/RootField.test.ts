import { RootField } from '../../../src/Query/Filter/RootField';
import { fromLine } from '../../TestHelpers';

describe('folder', () => {
    it('should provide access to the file name with extension', () => {
        const rootField = new RootField();

        expect(rootField.value(fromLine({ line: '- [ ] do' }))).toStrictEqual('/');
        expect(rootField.value(fromLine({ line: '- [ ] do', path: 'outside/inside/' }))).toStrictEqual('outside/');
        expect(rootField.value(fromLine({ line: '- [ ] do', path: 'a_b/_c_d_/' }))).toStrictEqual('a\\_b/');
    });
});

describe('grouping by root', () => {
    it('supports grouping methods correctly', () => {
        const field = new RootField();
        expect(field.supportsGrouping()).toEqual(true);
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
        const grouper = new RootField().createGrouper().grouper;

        // Assert
        expect(grouper(fromLine({ line: taskLine, path: path }))).toEqual(groups);
    });
});
