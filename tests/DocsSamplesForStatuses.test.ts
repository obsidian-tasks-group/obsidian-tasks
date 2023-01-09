import { Options } from 'approvals/lib/Core/Options';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';

import { StatusRegistry } from '../src/StatusRegistry';
import type { Status } from '../src/Status';

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

describe('DefaultStatuses', () => {
    it('markdown-table', () => {
        // This "test" writes out a markdown representation of the default task statuses,
        // for embedding in the user docs.
        verifyStatusesAsMarkdownTable(new StatusRegistry().registeredStatuses);
    });
});
