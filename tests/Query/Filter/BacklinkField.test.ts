import { BacklinkField } from '../../../src/Query/Filter/BacklinkField';
import { fromLine } from '../../TestingTools/TestHelpers';
import { SampleTasks } from '../../TestingTools/SampleTasks';

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
        ['a/b/c.md', null, ['[[c]]']],

        // File and heading, nominal case
        ['a/b/c.md', 'heading', ['[[c#heading|c > heading]]']],

        // If file name and heading are identical, allow duplication ('c > c'), in order to link to correct section
        ['a/b/c.md', 'c', ['[[c#c|c > c]]']],

        // If file name and heading are identical, allow duplication, even if there are underscores in the file name
        ['a_b_c.md', 'a_b_c', ['[[a_b_c#a_b_c|a_b_c > a_b_c]]']],

        // Underscores in filename component are not escaped
        ['a/b/_c_.md', null, ['[[_c_]]']],

        // Underscores in the heading component are not escaped either
        ['a/b/_c_.md', 'heading _italic text_', ['[[_c_#heading _italic text_|_c_ > heading _italic text_]]']],
    ])(
        'path "%s" and heading "%s" should have groups: %s',
        (path: string, heading: string | null, groups: string[]) => {
            // Arrange
            const grouper = new BacklinkField().createNormalGrouper();
            const t = '- [ ] xyz';

            // Assert
            const tasks = [fromLine({ line: t, path: path, precedingHeader: heading })];
            expect({ grouper, tasks }).groupHeadingsToBe(groups);
        },
    );

    it('should sort groups for BacklinkField', () => {
        // Arrange
        const tasks = SampleTasks.withAllRootsPathsHeadings();
        const grouper = new BacklinkField().createNormalGrouper();

        // Assert
        expect({ grouper, tasks }).groupHeadingsToBe([
            '[[_c_]]',
            '[[_c_#heading _italic text_|_c_ > heading _italic text_]]',
            '[[a_b_c#a_b_c|a_b_c > a_b_c]]',
            '[[b]]',
            '[[c]]',
            '[[c#c|c > c]]',
            '[[c#heading|c > heading]]',
            'Unknown Location',
        ]);
    });
});
