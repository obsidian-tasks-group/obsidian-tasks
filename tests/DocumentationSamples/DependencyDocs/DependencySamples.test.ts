/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import { StatusConfiguration, StatusType } from '../../../src/Statuses/StatusConfiguration';
import { StatusRegistry } from '../../../src/Statuses/StatusRegistry';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import type { Filter } from '../../../src/Query/Filter/Filter';
import { parseFilter } from '../../../src/Query/FilterParser';
import { SampleTasks } from '../../TestingTools/SampleTasks';
import { booleanToEmoji } from '../../TestingTools/FilterTestHelpers';

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

        verifyAll('Visualise dependency-related filters on Task, for a collection of tasks', tasks, (task) => {
            let result = task.toFileLineString() + '\n';
            filters.forEach((filter) => {
                const matches = filter!.filterFunction(task, searchInfo);
                result += `    ${filter?.instruction}
        ${booleanToEmoji(matches)}\n`;
            });
            return result;
        });
    });
});
