import { BacklinkField } from '../../../src/Query/Filter/BacklinkField';
import { fromLine } from '../../TestHelpers';

describe('backlink', () => {
    it('should provide the backlink', () => {
        const field = new BacklinkField();

        expect(field.value(fromLine({ line: '- [ ] do' }))).toStrictEqual('Unknown Location');
        expect(field.value(fromLine({ line: '- [ ] do', path: 'folder/file.md' }))).toStrictEqual('file');
        expect(field.value(fromLine({ line: '- [ ] do', path: 'a_b/_c_d_/_fi_le_.md' }))).toStrictEqual('_fi_le_');
        expect(field.value(fromLine({ line: '- [ ] do', path: 'file.md', precedingHeader: 'topic' }))).toStrictEqual(
            'file > topic',
        );
        expect(
            field.value(fromLine({ line: '- [ ] do', path: 'fi_le.md', precedingHeader: 'topic _ita_' })),
        ).toStrictEqual('fi_le > topic _ita_');
    });
});

describe('backlink', () => {
    it('should not support filtering', () => {
        // Arrange
        const field = new BacklinkField();

        // Assert
        expect(field.createFilterOrErrorMessage('backlink includes heading > filename')).not.toBeValid();
        expect(field.canCreateFilterForLine('backlink includes heading > filename')).toEqual(false);
    });
});

describe('grouping by backlink', () => {
    it('supports grouping methods correctly', () => {
        expect(new BacklinkField()).toSupportGroupingWithProperty('backlink');
    });

    it.each([
        // no location supplied
        ['', 'heading', ['Unknown Location']],

        // no heading supplied
        ['a/b/c.md', null, ['c']],

        // File and heading, nominal case
        ['a/b/c.md', 'heading', ['c > heading']],

        // If file name and heading are identical, avoid duplication ('c > c')
        ['a/b/c.md', 'c', ['c']],

        // If file name and heading are identical, avoid duplication, even if there are underscores in the file name
        ['a_b_c.md', 'a_b_c', ['a\\_b\\_c']],

        // Underscores in file name component are escaped
        ['a/b/_c_.md', null, ['\\_c\\_']],

        // But underscores in the heading component are not
        ['a/b/_c_.md', 'heading _italic text_', ['\\_c\\_ > heading _italic text_']],
    ])(
        'path "%s" and heading "%s" should have groups: %s',
        (path: string, heading: string | null, groups: string[]) => {
            // Arrange
            const grouper = new BacklinkField().createGrouper().grouper;
            const t = '- [ ] xyz';

            // Assert
            expect(grouper(fromLine({ line: t, path: path, precedingHeader: heading }))).toEqual(groups);
        },
    );
});
