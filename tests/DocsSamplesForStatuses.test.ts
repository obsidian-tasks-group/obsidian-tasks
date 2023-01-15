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
import { TaskBuilder } from './TestingTools/TaskBuilder';

function getPrintableIndicator(indicator: string) {
    const result = indicator !== ' ' ? indicator : 'space';
    return '`' + result + '`';
}

function verifyStatusesAsMarkdownTable(statuses: Status[]) {
    let commandsTable = '<!-- placeholder to force blank line before table -->\n\n';
    commandsTable +=
        '| Status Character    | Status Name | Next Status Character | Status Type | Needs Custom Styling |\n';
    commandsTable +=
        '| ------------------- | ----------- | --------------------- | ----------- | -------------------- |\n';
    for (const status of statuses) {
        const statusCharacter = getPrintableIndicator(status.indicator);
        const nextStatusCharacter = getPrintableIndicator(status.nextStatusIndicator);
        const type = getPrintableIndicator(status.type);
        const needsCustomStyling = status.indicator !== ' ' && status.indicator !== 'x' ? 'Yes' : 'No';
        commandsTable += `| ${statusCharacter} | ${status.name} | ${nextStatusCharacter} | ${type} | ${needsCustomStyling} |\n`;
    }
    commandsTable += '\n\n<!-- placeholder to force blank line after table -->\n';
    let options = new Options();
    options = options.forFile().withFileExtention('md');
    verify(commandsTable, options);
}

function constructStatuses(importedStatuses: Array<[string, string, string]>) {
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
        const importantCycle: Array<[string, string, string]> = [
            ['!', 'Important', 'D'],
            ['D', 'Doing - Important', 'X'],
            ['X', 'Done - Important', '!'],
        ];
        verifyStatusesAsMarkdownTable(constructStatuses(importantCycle));
    });
});

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
        let titles = '| ';
        let divider = '| ';
        this.columnNames.forEach((s) => {
            titles += ` ${s} |`;
            divider += ' ----- |';
        });

        this._markdown += `${titles}\n`;
        this._markdown += `${divider}\n`;
    }
}

function verifyTransitionsAsMarkdownTable(statuses: Status[]) {
    let commandsTable = '<!-- placeholder to force blank line before table -->\n\n';

    const columnNames: string[] = ['Operation'];

    statuses.forEach((s) => {
        const title = s.type;
        columnNames.push(title);
    });

    const table = new MarkdownTable(columnNames);
    commandsTable += table.markdown;

    const tasks: Task[] = [];
    {
        let row = '| ';
        row += ' Example Task | ';
        statuses.forEach((s) => {
            const task = new TaskBuilder().status(s).description('demo').build();
            tasks.push(task);
            row += ` \`${task!.toFileLineString()}\` |`;
        });
        commandsTable += `${row}\n`;
    }

    function filterAllStatuses(filter: FilterOrErrorMessage) {
        let row = '| ';
        row += ` Matches \`${filter!.instruction}\` | `;
        tasks.forEach((task) => {
            const matchedText = filter!.filter?.filterFunction(task) ? 'YES' : 'no';
            row += ` ${matchedText} |`;
        });
        commandsTable += `${row}\n`;
    }

    filterAllStatuses(FilterParser.parseFilter('done')!);
    filterAllStatuses(FilterParser.parseFilter('not done')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes todo')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes in progress')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes done')!);
    filterAllStatuses(FilterParser.parseFilter('status.name includes cancelled')!);

    {
        let row = '| ';
        row += ' Name for `group by status` | ';
        tasks.forEach((task) => {
            const groupNamesForTask = Group.getGroupNamesForTask('status', task);
            const names = groupNamesForTask.join(',');
            row += ` ${names} |`;
        });
        commandsTable += `${row}\n`;
    }

    commandsTable += '\n\n<!-- placeholder to force blank line after table -->\n';
    let options = new Options();
    options = options.forFile().withFileExtention('md');
    verify(commandsTable, options);
}

describe('Status Transitions', () => {
    it('status-types', () => {
        const statuses = [
            Status.makeTodo(),
            Status.makeInProgress(),
            Status.makeDone(),
            Status.makeCancelled(),
            new Status(new StatusConfiguration('~', 'Non Task', ' ', false, StatusType.NON_TASK)),
        ];
        verifyTransitionsAsMarkdownTable(statuses);
    });
});
