import { Options } from 'approvals/lib/Core/Options';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';

import { StatusRegistry } from '../src/StatusRegistry';
import { Status } from '../src/Status';
import { StatusConfiguration } from '../src/StatusConfiguration';
import * as StatusSettingsHelpers from '../src/Config/StatusSettingsHelpers';

function getPrintableIndicator(indicator: string) {
    const result = indicator !== ' ' ? indicator : 'space';
    return '`' + result + '`';
}

function verifyStatusesAsMarkdownTable(statuses: Status[]) {
    let commandsTable = '<!-- placeholder to force blank line before table -->\n\n';
    commandsTable += '| Status Character    | Status Name | Next Status Character | Needs Custom Styling |\n';
    commandsTable += '| ------------------- | ----------- | --------------------- | -------------------- |\n';
    for (const status of statuses) {
        const statusCharacter = getPrintableIndicator(status.indicator);
        const nextStatusCharacter = getPrintableIndicator(status.nextStatusIndicator);
        const needsCustomStyling = status.indicator !== ' ' && status.indicator !== 'x' ? 'Yes' : 'No';
        commandsTable += `| ${statusCharacter} | ${status.name} | ${nextStatusCharacter} | ${needsCustomStyling} |\n`;
    }
    commandsTable += '\n\n<!-- placeholder to force blank line after table -->\n';
    let options = new Options();
    options = options.forFile().withFileExtention('md');
    verify(commandsTable, options);
}

function constructStatuses(importedStatuses: Array<[string, string, string]>) {
    const statuses: Status[] = [];
    importedStatuses.forEach((importedStatus) => {
        statuses.push(
            new Status(new StatusConfiguration(importedStatus[0], importedStatus[1], importedStatus[2], false)),
        );
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
