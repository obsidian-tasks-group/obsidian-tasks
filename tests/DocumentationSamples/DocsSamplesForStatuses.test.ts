import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';

import { StatusField } from '../../src/Query/Filter/StatusField';
import { Status } from '../../src/Status';
import type { Task } from '../../src/Task';
import { StatusConfiguration, StatusType } from '../../src/StatusConfiguration';
import type { FilterOrErrorMessage } from '../../src/Query/Filter/FilterOrErrorMessage';
import * as FilterParser from '../../src/Query/FilterParser';
import { StatusNameField } from '../../src/Query/Filter/StatusNameField';
import { StatusTypeField } from '../../src/Query/Filter/StatusTypeField';
import type { StatusCollection, StatusCollectionEntry } from '../../src/StatusCollection';
import * as Themes from '../../src/Config/Themes';
import { StatusValidator } from '../../src/StatusValidator';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdown';
import { StatusRegistry } from '../../src/StatusRegistry';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { SearchInfo } from '../../src/Query/SearchInfo';
import type { GrouperFunction } from '../../src/Query/Grouper';
import { MarkdownTable } from '../../src/lib/MarkdownTable';
import { getPrintableSymbol } from '../../src/StatusRegistryReport';

function verifyStatusesAsMarkdownTable(statuses: Status[], showQueryInstructions: boolean) {
    // Note: There is very similar code in tabulateStatusSettings() in StatusRegistryReport.ts.
    //       Maybe try unifying the common code one day?
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
    verifyMarkdownForDocs(table.markdown);
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

function verifyStatusesInMultipleFormats(statuses: Status[], showQueryInstructions: boolean) {
    verifyStatusesAsMarkdownTable(statuses, showQueryInstructions);
    verifyStatusesAsMermaidDiagram(statuses);
}

function verifyStatusesAsMermaidDiagramImpl(statuses: Status[], detailed: boolean, extensionWithoutDot: string) {
    // Set the registry up to exactly match the supplied statuses
    const registry = new StatusRegistry();
    registry.set(statuses);

    const markdown = registry.mermaidDiagram(detailed);
    verifyWithFileExtension(markdown, extensionWithoutDot);
}

function verifyStatusesAsMermaidDiagram(statuses: Status[]) {
    verifyStatusesAsMermaidDiagramImpl(statuses, false, 'mermaid.md');
}

function verifyStatusesAsDetailedMermaidDiagram(statuses: Status[]) {
    verifyStatusesAsMermaidDiagramImpl(statuses, true, 'detailed.mermaid.md');
}

describe('DefaultStatuses', () => {
    // These "test" write out a markdown representation of the default task statuses,
    // for embedding in the user docs.
    it('core-statuses', () => {
        verifyStatusesInMultipleFormats([Status.makeTodo(), Status.makeDone()], true);
    });

    it('custom-statuses', () => {
        verifyStatusesInMultipleFormats([Status.makeInProgress(), Status.makeCancelled()], true);
    });

    it('important-cycle', () => {
        const importantCycle: StatusCollection = [
            ['!', 'Important', 'D', 'TODO'],
            ['D', 'Doing - Important', 'X', 'IN_PROGRESS'],
            ['X', 'Done - Important', '!', 'DONE'],
        ];
        verifyStatusesInMultipleFormats(constructStatuses(importantCycle), false);
    });

    it('todo-in_progress-done', () => {
        const importantCycle: StatusCollection = [
            [' ', 'Todo', '/', 'TODO'],
            ['/', 'In Progress', 'x', 'IN_PROGRESS'],
            ['x', 'Done', ' ', 'DONE'],
        ];
        verifyStatusesInMultipleFormats(constructStatuses(importantCycle), false);
        verifyStatusesAsDetailedMermaidDiagram(constructStatuses(importantCycle));
    });

    it('pro-con-cycle', () => {
        const importantCycle: StatusCollection = [
            ['P', 'Pro', 'C', 'NON_TASK'],
            ['C', 'Con', 'P', 'NON_TASK'],
        ];
        verifyStatusesInMultipleFormats(constructStatuses(importantCycle), false);
        verifyStatusesAsDetailedMermaidDiagram(constructStatuses(importantCycle));
    });

    it('toggle-does-nothing', () => {
        const importantCycle: StatusCollection = [
            ['b', 'Bookmark', 'b', 'NON_TASK'],
            ['E', 'Example', 'E', 'NON_TASK'],
            ['I', 'Information', 'I', 'NON_TASK'],
            ['P', 'Paraphrase', 'P', 'NON_TASK'],
            ['Q', 'Quote', 'Q', 'NON_TASK'],
        ];
        verifyStatusesInMultipleFormats(constructStatuses(importantCycle), false);
    });

    it('done-toggles-to-cancelled', () => {
        // See issue #2089.
        // DONE is followed by CANCELLED, which currently causes unexpected behaviour in recurrent tasks.
        // This uses the 4 default statuses, and just customises their order.
        const statuses: StatusCollection = [
            [' ', 'Todo', '/', 'TODO'],
            ['x', 'Done', '-', 'DONE'],
            ['/', 'In Progress', 'x', 'IN_PROGRESS'],
            ['-', 'Cancelled', ' ', 'CANCELLED'],
        ];
        verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
    });

    it('done-toggles-to-cancelled-with-unconventional-symbols', () => {
        // See issue #2304.
        // DONE is followed by CANCELLED, which currently causes unexpected behaviour in recurrent tasks.
        // This doesn't follow the standard convention of 'x' means DONE. It has 'x' means CANCELLED.
        const statuses: StatusCollection = [
            [' ', 'Todo', '*', 'TODO'],
            ['*', 'Done', 'x', 'DONE'],
            ['x', 'Cancelled', ' ', 'CANCELLED'],
        ];
        verifyStatusesAsDetailedMermaidDiagram(constructStatuses(statuses));
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
        ['LYT Mode', Themes.lytModeSupportedStatuses()],
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
            verifyStatusesInMultipleFormats(constructStatuses(statuses), true);
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
        const searchInfo = SearchInfo.fromAllTasks(tasks);
        tasks.forEach((task) => {
            const matchedText = filter!.filter?.filterFunction(task, searchInfo) ? 'YES' : 'no';
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

    function showGroupNamesForAllTasks(groupName: string, grouperFunction: GrouperFunction) {
        const cells: string[] = ['Name for `group by ' + groupName + '`'];
        tasks.forEach((task) => {
            const groupNamesForTask = grouperFunction(task, SearchInfo.fromAllTasks([task]));
            const names = groupNamesForTask.join(',');
            cells.push(names);
        });
        table.addRow(cells);
    }

    showGroupNamesForAllTasks('status', new StatusField().createNormalGrouper().grouper);
    showGroupNamesForAllTasks('status.type', new StatusTypeField().createNormalGrouper().grouper);
    showGroupNamesForAllTasks('status.name', new StatusNameField().createNormalGrouper().grouper);

    verifyMarkdownForDocs(table.markdown);
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
