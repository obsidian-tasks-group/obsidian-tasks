/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { StatusConfiguration, StatusType } from '../../../src/Statuses/StatusConfiguration';
import { StatusRegistry } from '../../../src/Statuses/StatusRegistry';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import { parseFilter } from '../../../src/Query/FilterParser';
import { SampleTasks } from '../../TestingTools/SampleTasks';
import { booleanToEmoji } from '../../TestingTools/FilterTestHelpers';
import { MarkdownTable } from '../../../src/lib/MarkdownTable';
import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdown';
import { addBackticks } from '../../Scripting/ScriptingTestHelpers';

window.moment = moment;

function makeFilters() {
    const instructions = [
        //
        'is blocking',
        'is blocked',
    ];
    return instructions.map((instruction) => {
        return parseFilter(instruction)!.filter!;
    });
}

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
        const filters = makeFilters();
        const searchInfo = SearchInfo.fromAllTasks(tasks);

        const columnNames = ['Task'];
        filters.forEach((filter) => columnNames.push(addBackticks(filter.instruction)));
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
