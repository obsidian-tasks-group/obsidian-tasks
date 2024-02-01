/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { StatusConfiguration, StatusType } from '../../../src/Statuses/StatusConfiguration';
import { StatusRegistry } from '../../../src/Statuses/StatusRegistry';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import type { Filter } from '../../../src/Query/Filter/Filter';
import { parseFilter } from '../../../src/Query/FilterParser';
import { SampleTasks } from '../../TestingTools/SampleTasks';
import { booleanToEmoji } from '../../TestingTools/FilterTestHelpers';
import { MarkdownTable } from '../../../src/lib/MarkdownTable';
import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdown';
import { addBackticks } from '../../Scripting/ScriptingTestHelpers';

window.moment = moment;

describe('blocking and blocked filters', () => {
    beforeEach(() => {
        const nonTaskStatus = new StatusConfiguration('Q', 'Question', 'A', true, StatusType.NON_TASK);
        StatusRegistry.getInstance().add(nonTaskStatus);
    });

    afterEach(() => {
        StatusRegistry.getInstance().resetToDefaultStatuses();
    });

    it('blocking and blocked', () => {
        const tasks = SampleTasks.withWideSelectionOfDependencyScenarios();
        const instructions = [
            //
            'is blocking',
            'is blocked',
        ];
        const filters: Filter[] = instructions.map((instruction) => {
            return parseFilter(instruction)!.filter!;
        });
        const searchInfo = SearchInfo.fromAllTasks(tasks);

        const columnNames = ['Task'];
        instructions.forEach((instruction) => columnNames.push(addBackticks(instruction)));
        const table = new MarkdownTable(columnNames);

        tasks.forEach((task) => {
            const newRow = [addBackticks(task.toFileLineString())];
            filters.forEach((filter) => {
                const matches = filter!.filterFunction(task, searchInfo);
                newRow.push(booleanToEmoji(matches));
            });
            table.addRow(newRow);
        });
        verifyMarkdownForDocs(table.markdown);
    });
});
