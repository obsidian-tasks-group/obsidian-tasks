import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';

import { Status } from '../src/Status';
import type { Task } from '../src/Task';
import { StatusConfiguration, StatusType } from '../src/StatusConfiguration';
import type { FilterOrErrorMessage } from '../src/Query/Filter/Filter';
import * as FilterParser from '../src/Query/FilterParser';
import { Group } from '../src/Query/Group';
import { StatusNameField } from '../src/Query/Filter/StatusNameField';
import { StatusTypeField } from '../src/Query/Filter/StatusTypeField';
import type { StatusCollection, StatusCollectionEntry } from '../src/StatusCollection';
import * as Themes from '../src/Config/Themes';
import { StatusValidator } from '../src/StatusValidator';
import { TaskBuilder } from './TestingTools/TaskBuilder';
import { MarkdownTable, verifyMarkdownForDocs } from './TestingTools/VerifyMarkdownTable';

function getPrintableSymbol(symbol: string) {
    const result = symbol !== ' ' ? symbol : 'space';
    return '`' + result + '`';
}

function verifyStatusesAsMarkdownTable(statuses: Status[], showQueryInstructions: boolean) {
    let statusName = 'Status Name';
    let statusType = 'Status Type';
    if (showQueryInstructions) {
        statusName += '<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name`';
        statusType += '<br>`status.type is...`<br>`sort by status.type`<br>`group by status.type`';
    }
    const table = new MarkdownTable([
        'Status Symbol',
        'Next Status Symbol',
        statusName,
        statusType,
        'Needs Custom Styling',
    ]);

    for (const status of statuses) {
        const statusCharacter = getPrintableSymbol(status.symbol);
        const nextStatusCharacter = getPrintableSymbol(status.nextStatusSymbol);
        const type = getPrintableSymbol(status.type);
        const needsCustomStyling = status.symbol !== ' ' && status.symbol !== 'x' ? 'Yes' : 'No';
        table.addRow([statusCharacter, nextStatusCharacter, status.name, type, needsCustomStyling]);
    }
    table.verifyForDocs();
}

function verifyStatusesAsTasksList(statuses: Status[]) {
    let markdown = '';
    for (const status of statuses) {
        const statusCharacter = getPrintableSymbol(status.symbol);
        markdown += `- [${status.symbol}] #task ${statusCharacter} ${status.name}\n`;
    }
    verifyMarkdownForDocs(markdown);
}

function verifyStatusesAsTasksText(statuses: Status[]) {
    let markdown = '';
    for (const status of statuses) {
        const statusCharacter = getPrintableSymbol(status.symbol);
        markdown += `- [${status.symbol}] #task ${statusCharacter} ${status.name}\n`;
    }
    verify(markdown);
}

function constructStatuses(importedStatuses: StatusCollection) {
    const statuses: Status[] = [];
    importedStatuses.forEach((importedStatus) => {
        statuses.push(Status.createFromImportedValue(importedStatus));
    });
    return statuses;
}

describe('DefaultStatuses', () => {
    // These "test" write out a markdown representation of the default task statuses,
    // for embedding in the user docs.
    it('core-statuses', () => {
        verifyStatusesAsMarkdownTable([Status.makeTodo(), Status.makeDone()], true);
    });

    it('custom-statuses', () => {
        verifyStatusesAsMarkdownTable([Status.makeInProgress(), Status.makeCancelled()], true);
    });

    it('important-cycle', () => {
        const importantCycle: StatusCollection = [
            ['!', 'Important', 'D', 'TODO'],
            ['D', 'Doing - Important', 'X', 'IN_PROGRESS'],
            ['X', 'Done - Important', '!', 'DONE'],
        ];
        verifyStatusesAsMarkdownTable(constructStatuses(importantCycle), false);
    });

    it('todo-in_progress-done', () => {
        const importantCycle: StatusCollection = [
            [' ', 'Todo', '/', 'TODO'],
            ['/', 'In Progress', 'x', 'IN_PROGRESS'],
            ['x', 'Done', ' ', 'DONE'],
        ];
        verifyStatusesAsMarkdownTable(constructStatuses(importantCycle), false);
    });

    it('pro-con-cycle', () => {
        const importantCycle: StatusCollection = [
            ['P', 'Pro', 'C', 'NON_TASK'],
            ['C', 'Con', 'P', 'NON_TASK'],
        ];
        verifyStatusesAsMarkdownTable(constructStatuses(importantCycle), false);
    });

    it('toggle-does-nothing', () => {
        const importantCycle: StatusCollection = [
            ['b', 'Bookmark', 'b', 'NON_TASK'],
            ['E', 'Example', 'E', 'NON_TASK'],
            ['I', 'Information', 'I', 'NON_TASK'],
            ['P', 'Paraphrase', 'P', 'NON_TASK'],
            ['Q', 'Quote', 'Q', 'NON_TASK'],
        ];
        verifyStatusesAsMarkdownTable(constructStatuses(importantCycle), false);
    });
});

describe('Theme', () => {
    type NamedTheme = [string, StatusCollection];
    const themes: NamedTheme[] = [
        // Alphabetical order by name:
        ['AnuPpuccin', Themes.anuppuccinSupportedStatuses()],
        ['Aura', Themes.auraSupportedStatuses()],
        ['Ebullientworks', Themes.ebullientworksSupportedStatuses()],
        ['ITS', Themes.itsSupportedStatuses()],
        ['Minimal', Themes.minimalSupportedStatuses()],
        ['Things', Themes.thingsSupportedStatuses()],
    ];

    describe.each(themes)('%s', (_: string, statuses: StatusCollection) => {
        it.each(statuses)('Validate status: "%s", "%s", "%s", "%s"', (symbol, name, nextSymbol, type) => {
            const statusValidator = new StatusValidator();
            const entry: StatusCollectionEntry = [symbol, name, nextSymbol, type];
            expect(statusValidator.validateStatusCollectionEntry(entry)).toEqual([]);
        });

        it('Table', () => {
            verifyStatusesAsMarkdownTable(constructStatuses(statuses), true);
        });

        it('Tasks', () => {
            verifyStatusesAsTasksList(constructStatuses(statuses));
        });

        it('Text', () => {
            verifyStatusesAsTasksText(constructStatuses(statuses));
        });
    });
});

function verifyTransitionsAsMarkdownTable(statuses: Status[]) {
    const columnNames: string[] = ['Operation and status.type'];
    statuses.forEach((s) => {
        const title = s.type;
        columnNames.push(title);
    });

    const table = new MarkdownTable(columnNames);

    const tasks: Task[] = [];
    {
        const cells: string[] = ['Example Task'];
        statuses.forEach((s) => {
            const task = new TaskBuilder().status(s).description('demo').build();
            tasks.push(task);
            cells.push('`' + task!.toFileLineString() + '`');
        });
        table.addRow(cells);
    }

    function filterAllStatuses(filter: FilterOrErrorMessage) {
        const cells: string[] = [`Matches \`${filter!.instruction}\``];
        tasks.forEach((task) => {
            const matchedText = filter!.filter?.filterFunction(task) ? 'YES' : 'no';
            cells.push(matchedText);
        });
        table.addRow(cells);
    }

    filterAllStatuses(FilterParser.parseFilter('not done')!);
    filterAllStatuses(FilterParser.parseFilter('done')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is TODO')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is IN_PROGRESS')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is DONE')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is CANCELLED')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is NON_TASK')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes todo')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes in progress')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes done')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes cancelled')!);

    function showGroupNamesForAllTasks(groupName: string, grouperFunction: (task: Task) => string[]) {
        const cells: string[] = ['Name for `group by ' + groupName + '`'];
        tasks.forEach((task) => {
            const groupNamesForTask = grouperFunction(task);
            const names = groupNamesForTask.join(',');
            cells.push(names);
        });
        table.addRow(cells);
    }

    showGroupNamesForAllTasks('status', Group.grouperForProperty('status'));
    showGroupNamesForAllTasks('status.type', new StatusTypeField().createGrouper().grouper);
    showGroupNamesForAllTasks('status.name', new StatusNameField().createGrouper().grouper);

    table.verifyForDocs();
}

describe('Status Transitions', () => {
    it('status-types', () => {
        const statuses = [
            Status.makeTodo(),
            Status.makeInProgress(),
            Status.makeDone(),
            Status.makeCancelled(),
            new Status(new StatusConfiguration('~', 'My custom status', ' ', false, StatusType.NON_TASK)),
        ];
        verifyTransitionsAsMarkdownTable(statuses);
    });
});
