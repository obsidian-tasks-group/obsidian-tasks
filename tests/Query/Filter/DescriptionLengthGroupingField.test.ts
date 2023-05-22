import { DescriptionLengthGroupingfield } from '../../../src/Query/Filter/DescriptionLengthGroupingField';
import { fromLine } from '../../TestHelpers';
import { TaskGroups } from '../../../src/Query/TaskGroups';

describe('test a Field class that supports grouping without sorting', () => {
    it('should create the grouper', () => {
        const grouper = new DescriptionLengthGroupingfield().createNormalGrouper();
        expect(grouper).toBeDefined();
    });

    it('should group in default (alphabetical) order', () => {
        const tasks = [
            fromLine({ line: '- [ ] descrip' }),
            fromLine({ line: '- [ ] desc' }),
            fromLine({ line: '- [ ] description' }),
            fromLine({ line: '- [ ] d' }),
        ];
        const grouper = [new DescriptionLengthGroupingfield().createNormalGrouper()];
        const groups = new TaskGroups(grouper, tasks);

        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - description length

            Group names: [1]
            #### [description length] 1
            - [ ] d

            ---

            Group names: [4]
            #### [description length] 4
            - [ ] desc

            ---

            Group names: [7]
            #### [description length] 7
            - [ ] descrip

            ---

            Group names: [11]
            #### [description length] 11
            - [ ] description

            ---

            4 tasks
            "
        `);
    });
});
