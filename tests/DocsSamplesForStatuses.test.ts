import { Options } from 'approvals/lib/Core/Options';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';

import { StatusRegistry } from '../src/StatusRegistry';
import { Status } from '../src/Status';
import type { Task } from '../src/Task';
import * as StatusSettingsHelpers from '../src/Config/StatusSettingsHelpers';
import { StatusConfiguration, StatusType } from '../src/StatusConfiguration';
import type { FilterOrErrorMessage } from '../src/Query/Filter/Filter';
import * as FilterParser from '../src/Query/FilterParser';
import { Group } from '../src/Query/Group';
import { StatusNameField } from '../src/Query/Filter/StatusNameField';
import { StatusTypeField } from '../src/Query/Filter/StatusTypeField';
import type { StatusCollection } from '../src/StatusCollection';
import { TaskBuilder } from './TestingTools/TaskBuilder';

class MarkdownTable {
    private columnNames: string[];
    private _markdown = '';

    constructor(columnNames: string[]) {
        this.columnNames = columnNames;
        this.addTitleRow();
    }

    get markdown(): string {
        return this._markdown;
    }

    private addTitleRow() {
        let titles = '|';
        let divider = '|';
        this.columnNames.forEach((s) => {
            titles += ` ${s} |`;
            divider += ' ----- |';
        });

        this._markdown += `${titles}\n`;
        this._markdown += `${divider}\n`;
    }

    public addRow(cells: string[]) {
        let row = '|';
        cells.forEach((s) => {
            row += ` ${s} |`;
        });
        this._markdown += `${row}\n`;
    }

    public verify() {
        let output = '<!-- placeholder to force blank line before table -->\n\n';
        output += this.markdown;
        output += '\n\n<!-- placeholder to force blank line after table -->\n';
        let options = new Options();
        options = options.forFile().withFileExtention('md');
        verify(output, options);
    }
}

function getPrintableSymbol(symbol: string) {
    const result = symbol !== ' ' ? symbol : 'space';
    return '`' + result + '`';
}

function verifyStatusesAsMarkdownTable(statuses: Status[]) {
    const table = new MarkdownTable([
        'Status Character',
        'Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name`',
        'Next Status Character',
        'Status Type<br>`status.type is...`<br>`sort by status.type`<br>`group by status.type`',
        'Needs Custom Styling',
    ]);

    for (const status of statuses) {
        const statusCharacter = getPrintableSymbol(status.symbol);
        const nextStatusCharacter = getPrintableSymbol(status.nextStatusSymbol);
        const type = getPrintableSymbol(status.type);
        const needsCustomStyling = status.symbol !== ' ' && status.symbol !== 'x' ? 'Yes' : 'No';
        table.addRow([statusCharacter, status.name, nextStatusCharacter, type, needsCustomStyling]);
    }
    table.verify();
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
        verifyStatusesAsMarkdownTable(new StatusRegistry().registeredStatuses);
    });

    it('minimal-supported-statuses', () => {
        const importedStatuses = StatusSettingsHelpers.minimalSupportedStatuses();
        verifyStatusesAsMarkdownTable(constructStatuses(importedStatuses));
    });

    it('its-theme-supported-statuses', () => {
        const importedStatuses = StatusSettingsHelpers.itsSupportedStatuses();
        verifyStatusesAsMarkdownTable(constructStatuses(importedStatuses));
    });

    it('important-cycle', () => {
        const importantCycle: StatusCollection = [
            ['!', 'Important', 'D', 'TODO'],
            ['D', 'Doing - Important', 'X', 'IN_PROGRESS'],
            ['X', 'Done - Important', '!', 'DONE'],
        ];
        verifyStatusesAsMarkdownTable(constructStatuses(importantCycle));
    });
});

function verifyTransitionsAsMarkdownTable(statuses: Status[]) {
    const columnNames: string[] = ['Operation'];
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

    filterAllStatuses(FilterParser.parseFilter('done')!);
    filterAllStatuses(FilterParser.parseFilter('not done')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes todo')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is TODO')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes in progress')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is IN_PROGRESS')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes done')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is DONE')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes cancelled')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is CANCELLED')!);
    filterAllStatuses(FilterParser.parseFilter('status.type is NON_TASK')!);

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

    table.verify();
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
