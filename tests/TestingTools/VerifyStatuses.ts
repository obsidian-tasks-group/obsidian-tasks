import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import type { Status } from '../../src/Statuses/Status';
import { MarkdownTable } from '../../src/lib/MarkdownTable';
import type { Task } from '../../src/Task/Task';
import type { FilterOrErrorMessage } from '../../src/Query/Filter/FilterOrErrorMessage';
import { SearchInfo } from '../../src/Query/SearchInfo';
import * as FilterParser from '../../src/Query/FilterParser';
import type { GrouperFunction } from '../../src/Query/Group/Grouper';
import { StatusField } from '../../src/Query/Filter/StatusField';
import { StatusTypeField } from '../../src/Query/Filter/StatusTypeField';
import { StatusNameField } from '../../src/Query/Filter/StatusNameField';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import { getPrintableSymbol } from '../../src/Statuses/StatusSettingsReport';
import { TaskBuilder } from './TaskBuilder';
import { verifyMarkdownForDocs } from './VerifyMarkdown';
import { verifyWithFileExtension } from './ApprovalTestHelpers';

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

export function verifyStatusesAsTasksList(statuses: Status[]) {
    let markdown = '';
    for (const status of statuses) {
        const statusCharacter = getPrintableSymbol(status.symbol);
        markdown += `- [${status.symbol}] #task ${statusCharacter} ${status.name}\n`;
    }
    verifyMarkdownForDocs(markdown);
}

export function verifyStatusesAsTasksText(statuses: Status[]) {
    let markdown = '';
    for (const status of statuses) {
        const statusCharacter = getPrintableSymbol(status.symbol);
        markdown += `- [${status.symbol}] #task ${statusCharacter} ${status.name}\n`;
    }
    verify(markdown);
}

export function verifyStatusesInMultipleFormats(statuses: Status[], showQueryInstructions: boolean) {
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

export function verifyStatusesAsDetailedMermaidDiagram(statuses: Status[]) {
    verifyStatusesAsMermaidDiagramImpl(statuses, true, 'detailed.mermaid.md');
}

export function verifyTransitionsAsMarkdownTable(statuses: Status[]) {
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
